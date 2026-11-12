import { ACHIEVEMENTS, AchievementDef } from '../data/achievements.js';
import { GameState, NotificationItem } from '../store/types.js';
import { calculateStreak } from './streak.js';
import { getDateKey } from './dates.js';

export interface AchievementProgress {
  achievement: AchievementDef;
  currentProgress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export function evaluateAchievements(
  state: GameState,
  now: Date = new Date()
): {
  progressList: AchievementProgress[];
  newlyUnlockedIds: string[];
  notifications: NotificationItem[];
} {
  const todayKey = getDateKey(now);
  const streakResult = calculateStreak(state.completions, todayKey);
  const currentlyUnlocked = new Set(state.unlockedAchievements);
  const newlyUnlockedIds: string[] = [];
  const notifications: NotificationItem[] = [];

  const progressList: AchievementProgress[] = ACHIEVEMENTS.map(ach => {
    let current = 0;

    switch (ach.id) {
      case 'first-step':
        current = state.completions.length >= 1 ? 1 : 0;
        break;

      case 'academic-weapon':
        current = state.completions.filter(c => c.category === 'Academic').length;
        break;

      case 'deadline-dodger':
        current = state.completions.filter(c => c.onTime === true && c.dueAt).length;
        break;

      case 'main-character-energy':
        current = state.completions.filter(
          c => c.category === 'Personal Growth' || c.category === 'Social Life' || c.category === 'Lifestyle & Social Life'
        ).length;
        break;

      case 'rise-and-grind':
        current = state.completions.some(c => c.kind === 'daily') ? 1 : 0;
        break;

      case 'daily-npc-no-more':
        current = state.completions.filter(c => c.kind === 'daily').length;
        break;

      case 'consistency-plot-twist':
        current = streakResult.longestStreak;
        break;

      case 'touch-grass-literally':
        current = state.completions.some(c => c.packageId === 'pkg-touch-grass') ? 1 : 0;
        break;

      case 'productive-ish': {
        // Find maximum daily completions on any single day
        const dayCounts = new Map<string, number>();
        for (const c of state.completions) {
          if (c.kind === 'daily') {
            dayCounts.set(c.dateKey, (dayCounts.get(c.dateKey) || 0) + 1);
          }
        }
        current = Array.from(dayCounts.values()).reduce((max, cnt) => Math.max(max, cnt), 0);
        break;
      }

      case 'bug-hunter':
        current = state.completions.some(c => c.questId === 'py-06') ? 1 : 0;
        break;

      case 'academic-comeback':
        current = state.completions.some(c => c.questId === 'ai-07') ? 1 : 0;
        break;

      case 'quest-collector':
        current = state.unlockedPackages.length;
        break;

      case 'early-investor':
        current = state.orders.length >= 1 ? 1 : 0;
        break;

      case 'exam-survivor':
        current = state.completions.some(c => c.key?.startsWith('exam:') && c.key?.endsWith(':pass')) ? 1 : 0;
        break;

      case 'perfect-score':
        current = state.completions.some(c => c.key?.startsWith('exam:') && c.key?.endsWith(':perfect')) ? 1 : 0;
        break;

      case 'event-hunter': {
        const uniqueEventTasks = new Set(
          state.completions.filter(c => c.kind === 'event').map(c => c.questId)
        );
        current = uniqueEventTasks.size;
        break;
      }

      case 'campus-regular': {
        const uniqueLocations = new Set(
          state.completions.filter(c => c.locationId).map(c => c.locationId)
        );
        current = uniqueLocations.size;
        break;
      }

      default:
        current = 0;
    }

    const isUnlocked = currentlyUnlocked.has(ach.id) || current >= ach.maxProgress;

    if (isUnlocked && !currentlyUnlocked.has(ach.id)) {
      newlyUnlockedIds.push(ach.id);
      notifications.push({
        id: `ach-${ach.id}-${Date.now()}`,
        type: 'achievement_unlocked',
        title: 'THÀNH TỰU MỞ KHÓA!',
        message: `Chúc mừng bạn đã mở khóa thành tựu "${ach.title}"!`,
        achievementId: ach.id,
      });
    }

    return {
      achievement: ach,
      currentProgress: Math.min(current, ach.maxProgress),
      maxProgress: ach.maxProgress,
      isUnlocked,
    };
  });

  return {
    progressList,
    newlyUnlockedIds,
    notifications,
  };
}
