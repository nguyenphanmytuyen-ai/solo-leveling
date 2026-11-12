import { hasStartedTask } from './taskWorkflow.js';
import { CAMPUS_EVENTS, SeasonEventDef, EventTaskDef } from '../data/events.js';
import { GameState, CompletionEntry, NotificationItem } from '../store/types.js';
import { getDateKey } from './dates.js';

export interface ActiveEventStatus {
  event: SeasonEventDef;
  isActive: boolean;
  occurrenceKey: string;
  daysRemaining: number;
  completedTaskIds: string[];
  isCleared: boolean;
  progressPercent: number;
}

export function getEventDedupKey(eventId: string, occurrenceKey: string, taskId: string): string {
  return `${eventId}@${occurrenceKey}:${taskId}`;
}

export function getEventClearDedupKey(eventId: string, occurrenceKey: string): string {
  return `eventClear:${eventId}@${occurrenceKey}`;
}

export function getEventsStatus(state: GameState, now: Date = new Date()): ActiveEventStatus[] {
  return CAMPUS_EVENTS.map(event => {
    const { active, occurrenceKey, daysRemaining } = event.isActive(now, state.profile.createdAt);

    const completedTaskIds: string[] = [];
    for (const task of event.tasks) {
      const taskKey = getEventDedupKey(event.id, occurrenceKey, task.id);
      if (state.completions.some(c => c.key === taskKey)) {
        completedTaskIds.push(task.id);
      }
    }

    const clearKey = getEventClearDedupKey(event.id, occurrenceKey);
    const isCleared = state.completions.some(c => c.key === clearKey);

    const totalTasks = event.tasks.length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTaskIds.length / totalTasks) * 100) : 0;

    return {
      event,
      isActive: active,
      occurrenceKey,
      daysRemaining,
      completedTaskIds,
      isCleared,
      progressPercent,
    };
  });
}

export interface CompleteEventTaskResult {
  nextCompletions: CompletionEntry[];
  addedEntries: CompletionEntry[];
  notifications: NotificationItem[];
}

export function completeEventTask(
  state: GameState,
  eventId: string,
  taskId: string,
  now: Date = new Date()
): CompleteEventTaskResult {
  if (!hasStartedTask(state, taskId, now)) return { nextCompletions: state.completions, addedEntries: [], notifications: [] };
  const event = CAMPUS_EVENTS.find(e => e.id === eventId);
  if (!event) return { nextCompletions: state.completions, addedEntries: [], notifications: [] };

  const task = event.tasks.find(t => t.id === taskId);
  if (!task) return { nextCompletions: state.completions, addedEntries: [], notifications: [] };

  const { active, occurrenceKey } = event.isActive(now, state.profile.createdAt);
  if (!active) {
    return { nextCompletions: state.completions, addedEntries: [], notifications: [] };
  }

  const targetKey = getEventDedupKey(eventId, occurrenceKey, taskId);
  if (state.completions.some(c => c.key === targetKey)) {
    return { nextCompletions: state.completions, addedEntries: [], notifications: [] };
  }

  const dateKey = getDateKey(now);
  const entry: CompletionEntry = {
    key: targetKey,
    kind: 'event',
    questId: taskId,
    dateKey,
    completedAt: now.toISOString(),
    xp: task.xp,
    category: 'Sự kiện và Thi',
    difficulty: task.difficulty,
    locationId: task.locationId,
    onTime: true,
  };

  const addedEntries: CompletionEntry[] = [entry];
  const notifications: NotificationItem[] = [
    {
      id: `ev-task-${Date.now()}`,
      type: 'quest_completed',
      title: 'NHIỆM VỤ SỰ KIỆN HOÀN THÀNH!',
      message: `Bạn đã xong "${task.name}" trong ${event.title} (+${task.xp} XP).`,
      xpEarned: task.xp,
    },
  ];

  // Check if this completes all tasks of this event occurrence
  const allCurrentKeys = new Set(state.completions.map(c => c.key));
  allCurrentKeys.add(targetKey);

  const allDone = event.tasks.every(t => allCurrentKeys.has(getEventDedupKey(eventId, occurrenceKey, t.id)));
  const clearKey = getEventClearDedupKey(eventId, occurrenceKey);

  if (allDone && !state.completions.some(c => c.key === clearKey)) {
    const clearEntry: CompletionEntry = {
      key: clearKey,
      kind: 'eventClear',
      questId: clearKey,
      dateKey,
      completedAt: now.toISOString(),
      xp: event.clearBonusXp,
      category: 'Sự kiện và Thi',
      difficulty: 'Hard',
      locationId: 'event-hall',
      onTime: true,
    };
    addedEntries.push(clearEntry);

    notifications.push({
      id: `ev-clear-${Date.now()}`,
      type: 'quest_completed',
      title: 'EVENT CLEAR BONUS!',
      message: `Xuất sắc! Bạn đã vượt qua toàn bộ sự kiện "${event.title}" (+${event.clearBonusXp} XP)!`,
      xpEarned: event.clearBonusXp,
    });
  }

  return {
    nextCompletions: [...state.completions, ...addedEntries],
    addedEntries,
    notifications,
  };
}
