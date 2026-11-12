import { MAX_LEVEL, getRequiredXpForLevel, getTierForLevel } from '../config/progression.js';

export interface LevelProgress {
  level: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
  isMaxLevel: boolean;
  title: string;
}

export function calculateLevelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1;

  for (let l = MAX_LEVEL; l >= 1; l--) {
    if (totalXp >= getRequiredXpForLevel(l)) {
      return l;
    }
  }
  return 1;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, totalXp);
  const level = calculateLevelFromXp(safeXp);
  const tier = getTierForLevel(level);

  if (level >= MAX_LEVEL) {
    const currentLevelBase = getRequiredXpForLevel(MAX_LEVEL);
    return {
      level: MAX_LEVEL,
      totalXp: safeXp,
      xpInCurrentLevel: safeXp - currentLevelBase,
      xpRequiredForNextLevel: 0,
      progressPercent: 100,
      isMaxLevel: true,
      title: tier.title,
    };
  }

  const currentLevelBase = getRequiredXpForLevel(level);
  const nextLevelThreshold = getRequiredXpForLevel(level + 1);
  const xpNeeded = nextLevelThreshold - currentLevelBase;
  const xpInCurrent = safeXp - currentLevelBase;
  const percent = Math.min(100, Math.max(0, (xpInCurrent / xpNeeded) * 100));

  return {
    level,
    totalXp: safeXp,
    xpInCurrentLevel: xpInCurrent,
    xpRequiredForNextLevel: xpNeeded,
    progressPercent: Math.round(percent),
    isMaxLevel: false,
    title: tier.title,
  };
}
