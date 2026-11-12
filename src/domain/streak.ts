import { CompletionEntry } from '../store/types.js';
import { getYesterdayKey, getDaysDifference } from './dates.js';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  todayCompletedCount: number;
  hasCompletedToday: boolean;
  activeDaysCount: number;
}

export function calculateStreak(
  completions: CompletionEntry[],
  todayKey: string
): StreakResult {
  // Filter completions for daily quests only
  const dailyCompletions = completions.filter(c => c.kind === 'daily');

  const todayCompletedCount = dailyCompletions.filter(c => c.dateKey === todayKey).length;
  const hasCompletedToday = todayCompletedCount > 0;

  // Set of unique dateKeys
  const uniqueDates = Array.from(new Set(dailyCompletions.map(c => c.dateKey))).sort();
  const activeDaysCount = uniqueDates.length;

  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      todayCompletedCount: 0,
      hasCompletedToday: false,
      activeDaysCount: 0,
    };
  }

  // Calculate longest streak across entire history
  let longestStreak = 0;
  let currentRun = 0;
  let prevDateKey: string | null = null;

  for (const dKey of uniqueDates) {
    if (!prevDateKey) {
      currentRun = 1;
    } else {
      const diff = getDaysDifference(dKey, prevDateKey);
      if (diff === 1) {
        currentRun += 1;
      } else if (diff > 1) {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    prevDateKey = dKey;
  }

  // Calculate current streak
  // If user completed today, streak ends at today.
  // If user didn't complete today, but completed yesterday, streak is maintained ending at yesterday.
  // Otherwise current streak is 0.
  const dateSet = new Set(uniqueDates);
  const yesterdayKey = getYesterdayKey(todayKey);

  let startCheckKey: string | null = null;
  if (dateSet.has(todayKey)) {
    startCheckKey = todayKey;
  } else if (dateSet.has(yesterdayKey)) {
    startCheckKey = yesterdayKey;
  }

  let currentStreak = 0;
  if (startCheckKey) {
    let checkKey: string = startCheckKey;
    while (dateSet.has(checkKey)) {
      currentStreak += 1;
      checkKey = getYesterdayKey(checkKey);
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    todayCompletedCount,
    hasCompletedToday,
    activeDaysCount,
  };
}
