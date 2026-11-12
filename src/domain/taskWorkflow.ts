import type { ActiveTaskState, GameState } from '../store/types.js';
export function hasStartedTask(state: Pick<GameState,'activeTasks'>, id: string, now = new Date()): boolean {
  const anchor = Date.parse(state.activeTasks[id]?.startedAt || '');
  return Number.isFinite(anchor) && anchor <= now.getTime();
}
export function getElapsedTaskSeconds(active?: ActiveTaskState, now = new Date()): number {
  if (!active) return 0;
  const saved = Math.max(0, active.elapsedSeconds || 0);
  if (active.isPaused) return saved;
  const anchor = Date.parse(active.lastResumedAt || active.startedAt);
  return Number.isFinite(anchor) ? saved + Math.max(0, Math.floor((now.getTime()-anchor)/1000)) : saved;
}
export function formatTaskTime(seconds: number): string {
  const hours = Math.floor(seconds/3600);
  return [...(hours ? [hours] : []), Math.floor(seconds%3600/60), Math.floor(seconds%60)].map(n=>String(n).padStart(2,'0')).join(':');
}
