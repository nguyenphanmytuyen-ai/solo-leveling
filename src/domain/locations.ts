import { CAMPUS_LOCATIONS, LocationDef } from '../data/locations.js';
import { GameState } from '../store/types.js';
import { getLocationLevel } from '../config/progression.js';
import { DAILY_QUESTS } from '../data/dailyQuests.js';
import { getDateKey } from './dates.js';
import { isDailyQuestCompleted } from './quests.js';

export interface LocationMasteryStatus {
  location: LocationDef;
  xpEarned: number;
  level: number;
  completedTasksCount: number;
  dailyQuestsToday: number;
  dailyQuestsDoneToday: number;
}

export function getLocationMastery(
  state: GameState,
  locationId: string,
  now: Date = new Date()
): LocationMasteryStatus | undefined {
  const loc = CAMPUS_LOCATIONS.find(l => l.id === locationId);
  if (!loc) return undefined;

  const locCompletions = state.completions.filter(c => c.locationId === locationId);
  const xpEarned = locCompletions.reduce((sum, c) => sum + c.xp, 0);
  const level = getLocationLevel(xpEarned);

  const dateKey = getDateKey(now);
  const locationDailies = DAILY_QUESTS.filter(q => q.locationId === locationId);
  const doneToday = locationDailies.filter(q => isDailyQuestCompleted(state.completions, q.id, dateKey)).length;

  return {
    location: loc,
    xpEarned,
    level,
    completedTasksCount: locCompletions.length,
    dailyQuestsToday: locationDailies.length,
    dailyQuestsDoneToday: doneToday,
  };
}

export function getAllLocationsMastery(state: GameState, now: Date = new Date()): LocationMasteryStatus[] {
  return CAMPUS_LOCATIONS.map(loc => getLocationMastery(state, loc.id, now)!);
}

/**
 * Finds the "Hot Spot" location: location with the most uncompleted Daily Quests today.
 */
export function getCampusHotspot(state: GameState, now: Date = new Date()): LocationDef {
  const masteries = getAllLocationsMastery(state, now);
  let bestLoc = masteries[0].location;
  let maxUnfinished = -1;

  for (const m of masteries) {
    const unfinished = m.dailyQuestsToday - m.dailyQuestsDoneToday;
    if (unfinished > maxUnfinished) {
      maxUnfinished = unfinished;
      bestLoc = m.location;
    }
  }

  return bestLoc;
}
