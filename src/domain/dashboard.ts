import type { GameState } from '../store/types.js';
import { getDateKey } from './dates.js';

export function getPersonalTasksForToday(state: GameState, now: Date) {
  const today = getDateKey(now);
  return (state.assignments || []).filter(task => {
    if (task.completed) return Boolean((task.completedAt || task.updatedAt) && getDateKey(new Date((task.completedAt || task.updatedAt)!)) === today);
    return !task.deadline || task.deadline.slice(0, 10) <= today;
  }).sort((a, b) => Number(a.completed) - Number(b.completed)
    || Number(Boolean(b.isUrgent)) - Number(Boolean(a.isUrgent))
    || (a.deadline || '9999').localeCompare(b.deadline || '9999'));
}

export function getWeeklyCompletedCount(state: GameState, now: Date): number {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const start = getDateKey(monday);
  const end = getDateKey(now);
  const withinWeek = (date?: string) => {
    if (!date) return false;
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return false;
    const key = getDateKey(parsed);
    return key >= start && key <= end;
  };
  const tasks = new Set(state.completions.filter(c => c.kind !== 'clear' && c.kind !== 'eventClear' && withinWeek(c.completedAt)).map(c => c.key));
  return tasks.size + (state.assignments || []).filter(task => task.completed && withinWeek(task.completedAt || task.updatedAt)).length;
}
