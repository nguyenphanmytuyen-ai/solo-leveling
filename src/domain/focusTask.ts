import type { GameState } from '../store/types.js';
import type { Action } from '../store/reducer.js';
import { DAILY_QUESTS } from '../data/dailyQuests.js';
import { QUEST_PACKAGES } from '../data/questPackages.js';
import { CAMPUS_EVENTS } from '../data/events.js';
export function resolveFocusTask(state: GameState, id: string): { title: string; complete: Action } | null {
  const personal = state.assignments?.find(t => t.id === id);
  if (personal) return {title:personal.title,complete:{type:'COMPLETE_ASSIGNMENT',payload:{id}}};
  const daily = DAILY_QUESTS.find(t => t.id === id);
  if (daily) return {title:daily.name,complete:{type:'COMPLETE_DAILY_QUEST',payload:{questId:id}}};
  for (const pkg of QUEST_PACKAGES) { const task=pkg.tasks.find(t=>t.id===id); if(task) return {title:task.title,complete:{type:'COMPLETE_PACKAGE_TASK',payload:{packageId:pkg.id,taskId:id}}}; }
  for (const event of CAMPUS_EVENTS) { const task=event.tasks.find(t=>t.id===id); if(task) return {title:task.name,complete:{type:'COMPLETE_EVENT_TASK',payload:{eventId:event.id,taskId:id}}}; }
  return null;
}
