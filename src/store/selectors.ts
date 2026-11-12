import { GameState, ActiveTaskState } from './types.js';
import { calculateLevelFromXp, getLevelProgress, LevelProgress } from '../domain/progression.js';
import { calculateStreak, StreakResult } from '../domain/streak.js';
import { getDateKey } from '../domain/dates.js';
import { DAILY_QUESTS, DailyQuestDef } from '../data/dailyQuests.js';
import { isDailyQuestCompleted } from '../domain/quests.js';
import { QUEST_PACKAGES, QuestPackageDef } from '../data/questPackages.js';
import { isTaskCompleted, isPackageCleared } from '../domain/packages.js';
import { evaluateAchievements, AchievementProgress } from '../domain/achievements.js';
import { getUnlockedCosmetics } from '../domain/cosmetics.js';
import { CosmeticDef } from '../data/cosmetics.js';
import { calculateCart, CartCalculationResult } from '../domain/cart.js';
import { getEventsStatus, ActiveEventStatus } from '../domain/events.js';
import { getAllLocationsMastery, LocationMasteryStatus } from '../domain/locations.js';

export function selectTotalXp(state: GameState): number {
  return state.completions.reduce((sum, c) => sum + (c.xp || 0), 0);
}

export function selectLevelProgress(state: GameState): LevelProgress {
  const xp = selectTotalXp(state);
  return getLevelProgress(xp);
}

export function selectStreak(state: GameState, now: Date = new Date()): StreakResult {
  const todayKey = getDateKey(now);
  return calculateStreak(state.completions, todayKey);
}

export interface DailyQuestStatusItem {
  quest: DailyQuestDef;
  isCompleted: boolean;
  activeState?: ActiveTaskState;
}

export function selectDailyQuestsStatus(state: GameState, now: Date = new Date()): {
  items: DailyQuestStatusItem[];
  completedCount: number;
  totalCount: number;
  remainingXpToday: number;
} {
  const dateKey = getDateKey(now);
  let completedCount = 0;
  let remainingXpToday = 0;

  const items: DailyQuestStatusItem[] = DAILY_QUESTS.map(quest => {
    const isCompleted = isDailyQuestCompleted(state.completions, quest.id, dateKey);
    if (isCompleted) {
      completedCount += 1;
    } else {
      remainingXpToday += quest.xp;
    }

    return {
      quest,
      isCompleted,
      activeState: state.activeTasks[quest.id],
    };
  });

  return {
    items,
    completedCount,
    totalCount: DAILY_QUESTS.length,
    remainingXpToday,
  };
}

export interface PackageStatusItem {
  pkg: QuestPackageDef;
  isOwned: boolean;
  isAbandoned: boolean;
  isCompleted: boolean;
  completedTasksCount: number;
  totalTasksCount: number;
  progressPercent: number;
  xpEarnedSoFar: number;
}

export function selectPackagesStatus(state: GameState): PackageStatusItem[] {
  return QUEST_PACKAGES.map(pkg => {
    const isOwned = state.unlockedPackages.includes(pkg.id);
    const isAbandoned = state.abandonedPackages.includes(pkg.id);
    const isCompleted = isPackageCleared(state.completions, pkg.id);

    let completedTasksCount = 0;
    let xpEarnedSoFar = 0;

    for (const t of pkg.tasks) {
      if (isTaskCompleted(state.completions, t.id)) {
        completedTasksCount += 1;
        xpEarnedSoFar += t.xp;
      }
    }

    if (isCompleted) {
      xpEarnedSoFar += pkg.clearBonusXp;
    }

    const totalTasksCount = pkg.tasks.length;
    const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    return {
      pkg,
      isOwned,
      isAbandoned,
      isCompleted,
      completedTasksCount,
      totalTasksCount,
      progressPercent,
      xpEarnedSoFar,
    };
  });
}

export function selectAchievementProgress(state: GameState, now: Date = new Date()): AchievementProgress[] {
  const { progressList } = evaluateAchievements(state, now);
  return progressList;
}

export function selectUnlockedCosmetics(state: GameState, now: Date = new Date()): CosmeticDef[] {
  return getUnlockedCosmetics(state, now);
}

export function selectCartCalculations(state: GameState): CartCalculationResult {
  return calculateCart(state.cart, state.unlockedPackages, state.appliedCoupon);
}

export function selectActiveEvents(state: GameState, now: Date = new Date()): ActiveEventStatus[] {
  return getEventsStatus(state, now);
}

export function selectLocationsMastery(state: GameState, now: Date = new Date()): LocationMasteryStatus[] {
  return getAllLocationsMastery(state, now);
}
