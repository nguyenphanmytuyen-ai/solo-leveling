/**
 * Progression & Game Rules Configuration
 */

export const MAX_LEVEL = 50;

export const XP_BY_DIFFICULTY = {
  Easy: 10,
  Normal: 25,
  Hard: 50,
  Boss: 100,
} as const;

export type DifficultyLevel = keyof typeof XP_BY_DIFFICULTY;

/**
 * Formula: Cumulative XP needed to reach Level L:
 * Total XP = 50 * L * (L - 1)
 * Level 1: 0
 * Level 2: 100
 * Level 3: 300
 * Level 4: 600
 * Level 5: 1000
 */
export function getRequiredXpForLevel(level: number): number {
  if (level <= 1) return 0;
  const l = Math.min(level, MAX_LEVEL);
  return 50 * l * (l - 1);
}

export interface LevelTier {
  minLevel: number;
  maxLevel: number;
  title: string;
  badge: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  { minLevel: 1, maxLevel: 4, title: 'Tân Binh Giảng Đường', badge: 'Novice' },
  { minLevel: 5, maxLevel: 9, title: 'Học Đồ Kỷ Luật', badge: 'Apprentice' },
  { minLevel: 10, maxLevel: 14, title: 'Thợ Săn Deadline', badge: 'Hunter' },
  { minLevel: 15, maxLevel: 19, title: 'Chiến Binh Học Thuật', badge: 'Warrior' },
  { minLevel: 20, maxLevel: 29, title: 'Bậc Thầy Đồ Án', badge: 'Master' },
  { minLevel: 30, maxLevel: 39, title: 'Hiệp Sĩ Cần Mẫn', badge: 'Knight' },
  { minLevel: 40, maxLevel: 49, title: 'Huyền Thoại Campus', badge: 'Legend' },
  { minLevel: 50, maxLevel: 999, title: 'Đấng Thượng Thừa Solo', badge: 'Monarch' },
];

export function getTierForLevel(level: number): LevelTier {
  return (
    LEVEL_TIERS.find(tier => level >= tier.minLevel && level <= tier.maxLevel) ||
    LEVEL_TIERS[0]
  );
}

/**
 * Location Mastery Levels: 1 to 5
 * Calculated from cumulative XP earned at that location using 50 * L * (L - 1)
 */
export function getLocationLevel(xp: number): number {
  for (let l = 5; l >= 1; l--) {
    if (xp >= 50 * l * (l - 1)) {
      return l;
    }
  }
  return 1;
}
