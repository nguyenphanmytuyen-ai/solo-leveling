import characters from '../data/characters.json' with { type: 'json' };
import type { GameState } from '../store/types.js';

// Add future groups by setting each character's requiredXp in characters.json.
export const DEFAULT_ADVANCED_CHARACTER_XP = 100;
export const STARTER_CHARACTER_ID = 'hero';

export function getCharacterRequiredXp(characterId: string): number {
  return characters.find(c => c.id === characterId)?.requiredXp ?? DEFAULT_ADVANCED_CHARACTER_XP;
}

export function getCharacterXp(state: Pick<GameState, 'completions'>): number {
  return Math.max(0, state.completions.reduce((sum, entry) => sum + entry.xp, 0));
}

export function canSelectCharacter(state: Pick<GameState, 'completions' | 'customCharacters'>, characterId: string): boolean {
  const exists = characters.some(c => c.id === characterId);
  return Boolean(exists) && getCharacterXp(state) >= getCharacterRequiredXp(characterId);
}

export function getNewCharacterUnlocks(previousXp: number, nextXp: number) {
  const thresholds = [...new Set(characters.map(c => c.requiredXp))].sort((a, b) => a - b);
  return thresholds.filter(xp => xp > 0 && previousXp < xp && nextXp >= xp).map(xp => ({
    xp,
    characters: characters.filter(c => c.requiredXp === xp),
  }));
}

export function ensureSelectableCharacter<T extends GameState>(state: T): T {
  if (canSelectCharacter(state, state.profile.characterId)) return state;
  return { ...state, profile: { ...state.profile, characterId: STARTER_CHARACTER_ID } };
}
