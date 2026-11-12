import { updateAssignment, toggleAssignment } from './assignments.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultState } from '../store/persistence.ts';
import { getPersonalTasksForToday, getWeeklyCompletedCount } from './dashboard.ts';
import { gameReducer } from '../store/reducer.ts';
import type { CompletionEntry, Assignment } from '../store/types.ts';
const now = new Date('2026-11-12T12:00:00');
function task(id: string, deadline: string, changes: Partial<Assignment> = {}): Assignment {
  return { id, title:id, subject:'Cá nhân', deadline, description:'', completed:false, createdAt:'2026-11-12T08:00:00', ...changes };
}
function entry(key: string, completedAt: string, kind: CompletionEntry['kind'] = 'daily'): CompletionEntry {
  return { key, questId:key, completedAt, dateKey:completedAt.slice(0,10), kind, xp:10, category:'Daily Life', difficulty:'Easy' };
}
test('Weekly completed work uses Monday through today, excludes XP bonuses and duplicate entries', () => {
  const state = getDefaultState();
  state.completions = [entry('sun','2026-11-08T12:00:00'), entry('mon','2026-11-09T12:00:00'), entry('today','2026-11-12T09:00:00'), entry('today','2026-11-12T09:00:00'), entry('future','2026-11-13T09:00:00'), entry('bonus','2026-11-12T09:00:00','clear'), entry('eventbonus','2026-11-12T09:00:00','eventClear')];
  state.assignments = [task('done','2026-11-12T23:59',{completed:true,updatedAt:'2026-11-12T10:00:00'}), task('pending','2026-11-12T23:59'), task('unknown','2026-11-12T23:59',{completed:true})];
  assert.equal(getWeeklyCompletedCount(state,now),3);
});
test('Today includes overdue and due personal tasks, and work completed today; future and older completions stay out', () => {
  const state = getDefaultState();
  state.assignments = [task('future','2026-11-13T23:59'),task('today','2026-11-12T23:59'), task('overdue','2026-11-10T23:59',{isUrgent:true}),task('done','2026-11-01T23:59',{completed:true,updatedAt:'2026-11-12T10:00:00'}),task('old','2026-11-01T23:59',{completed:true,updatedAt:'2026-11-11T10:00:00'})];
  assert.deepEqual(getPersonalTasksForToday(state,now).map(t=>t.id),['overdue','today','done']);
});
test('Task added from Overview uses the shared assignment store and does not change XP or character access', () => {
  const state=getDefaultState();
  const result=gameReducer(state,{type:'ADD_ASSIGNMENT',payload:{assignment:task('new','2026-11-12T23:59')}},now);
  assert.equal(getPersonalTasksForToday(result.state,now)[0].id,'new');
  assert.deepEqual(result.state.completions,[]);
  assert.equal(result.state.profile.characterId,'hero');
});

test('Editing completed work preserves its completion date; reopening clears it', () => {
  const original = task('done', '2026-11-12T23:59', { completed:true, completedAt:'2026-11-08T10:00:00', updatedAt:'2026-11-08T10:00:00' });
  const edited = updateAssignment([original], { ...original, title:'Tên mới' });
  assert.equal(edited[0].completedAt, '2026-11-08T10:00:00');
  const state = { ...getDefaultState(), assignments:edited };
  assert.equal(getWeeklyCompletedCount(state, now), 0);
  assert.equal(toggleAssignment(edited, 'done')[0].completedAt, undefined);
});
