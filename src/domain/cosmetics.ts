import { COSMETICS, CosmeticDef } from '../data/cosmetics.js';
import { GameState, NotificationItem } from '../store/types.js';
import { calculateStreak } from './streak.js';
import { getDateKey } from './dates.js';
import { calculateLevelFromXp } from './progression.js';
import { getLocationLevel } from '../config/progression.js';

export function isCosmeticUnlocked(
  cosmetic: CosmeticDef,
  state: GameState,
  now: Date = new Date()
): boolean {
  const cond = cosmetic.unlock;
  if (cond.type === 'starter') return true;

  const totalXp = state.completions.reduce((sum, c) => sum + c.xp, 0);
  const currentLevel = calculateLevelFromXp(totalXp);
  const todayKey = getDateKey(now);
  const streakResult = calculateStreak(state.completions, todayKey);

  switch (cond.type) {
    case 'level':
      return currentLevel >= cond.level;

    case 'achievement':
      return state.unlockedAchievements.includes(cond.achievementId);

    case 'packageClear':
      return state.completions.some(c => c.key === `clear:${cond.packageId}`);

    case 'streak':
      return streakResult.longestStreak >= cond.days;

    case 'locationMastery': {
      const locXp = state.completions
        .filter(c => c.locationId === cond.locationId)
        .reduce((sum, c) => sum + c.xp, 0);
      return getLocationLevel(locXp) >= cond.level;
    }

    default:
      return false;
  }
}

export function getUnlockedCosmetics(state: GameState, now: Date = new Date()): CosmeticDef[] {
  return COSMETICS.filter(c => isCosmeticUnlocked(c, state, now));
}

export function evaluateNewCosmetics(
  prevUnlockedIds: Set<string>,
  state: GameState,
  now: Date = new Date()
): { newlyUnlocked: CosmeticDef[]; notifications: NotificationItem[] } {
  const currentlyUnlocked = getUnlockedCosmetics(state, now);
  const newlyUnlocked: CosmeticDef[] = [];
  const notifications: NotificationItem[] = [];

  for (const cos of currentlyUnlocked) {
    if (!prevUnlockedIds.has(cos.id)) {
      newlyUnlocked.push(cos);
      notifications.push({
        id: `cosmetic-${cos.id}-${Date.now()}`,
        type: 'cosmetic_unlocked',
        title: 'NGOẠI TRANG MỚI!',
        message: `Bạn đã mở khóa "${cos.name}" (${cos.rarity}). Trang bị ngay trong Tủ đồ!`,
        cosmeticId: cos.id,
      });
    }
  }

  return { newlyUnlocked, notifications };
}
