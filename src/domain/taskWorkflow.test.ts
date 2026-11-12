import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultState } from '../store/persistence.ts';
import { gameReducer } from '../store/reducer.ts';
import { completeDailyQuest } from './quests.ts';
import { completePackageTask } from './packages.ts';
import { completeEventTask } from './events.ts';
import { hasStartedTask,getElapsedTaskSeconds,formatTaskTime } from './taskWorkflow.ts';
import { selectTotalXp,selectDailyQuestsStatus } from '../store/selectors.ts';
import { QUEST_PACKAGES } from '../data/questPackages.ts';
import { CAMPUS_EVENTS } from '../data/events.ts';
const now=new Date('2026-11-12T12:00:00Z'), later=new Date(now.getTime()+65000), questId='daily-morning-spawn';
const start=(state=getDefaultState())=>gameReducer(state,{type:'START_TASK',payload:{questId}},now).state;
test('Daily completion before Start cannot award XP or emit success',()=>{
 const state=getDefaultState(), r=gameReducer(state,{type:'COMPLETE_DAILY_QUEST',payload:{questId}},now);
 assert.strictEqual(r.state,state); assert.deepEqual(r.notificationsQueue,[]); assert.equal(completeDailyQuest(state,questId,now).addedEntry,null); assert.equal(selectDailyQuestsStatus(r.state,now).completedCount,0);
});
test('Start has no reward; Finish awards XP once and consumes its timer',()=>{
 const state=start();assert.equal(selectTotalXp(state),0);assert.equal(selectDailyQuestsStatus(state,now).completedCount,0);assert.equal(getElapsedTaskSeconds(state.activeTasks[questId],later),65);
 const r=gameReducer(state,{type:'COMPLETE_DAILY_QUEST',payload:{questId}},later);assert.equal(selectTotalXp(r.state),10);assert.equal(selectDailyQuestsStatus(r.state,later).completedCount,1);assert.equal(r.state.activeTasks[questId],undefined);assert.ok(r.notificationsQueue.some(n=>n.type==='quest_completed'));
 const duplicate=gameReducer(r.state,{type:'COMPLETE_DAILY_QUEST',payload:{questId}},later);assert.equal(selectTotalXp(duplicate.state),10);assert.deepEqual(duplicate.notificationsQueue,[]);
});
test('Repeated Start cannot reset an active timer',()=>{const state=start();const r=gameReducer(state,{type:'START_TASK',payload:{questId}},later);assert.strictEqual(r.state,state);assert.equal(getElapsedTaskSeconds(r.state.activeTasks[questId],later),65)});
test('Pause, resume and reload preserve elapsed time',()=>{
 let state=gameReducer(start(),{type:'PAUSE_TASK',payload:{questId}},later).state;
 assert.equal(getElapsedTaskSeconds(state.activeTasks[questId],new Date(later.getTime()+10000)),65);
 const resumed=new Date(later.getTime()+10000);state=gameReducer(state,{type:'RESUME_TASK',payload:{questId}},resumed).state;
 assert.equal(getElapsedTaskSeconds(JSON.parse(JSON.stringify(state)).activeTasks[questId],new Date(resumed.getTime()+5000)),70);assert.equal(formatTaskTime(70),'01:10');assert.equal(formatTaskTime(3661),'01:01:01');
});
test('Malformed and future Start timestamps cannot authorize completion',()=>{for(const startedAt of ['', 'invalid',later.toISOString()]){const state={...getDefaultState(),activeTasks:{[questId]:{startedAt}}};assert.equal(hasStartedTask(state,questId,now),false);assert.deepEqual(gameReducer(state,{type:'COMPLETE_DAILY_QUEST',payload:{questId}},now).notificationsQueue,[])}});
const assignment={id:'personal',title:'Đọc sách',subject:'Cá nhân',deadline:'2026-11-12T23:59',description:'',completed:true,createdAt:now.toISOString()};
test('Personal tasks cannot bypass Start through add, edit, import or toggle',()=>{
 const state=gameReducer(getDefaultState(),{type:'ADD_ASSIGNMENT',payload:{assignment}},now).state;assert.equal(state.assignments?.[0].completed,false);
 assert.equal(gameReducer(state,{type:'UPDATE_ASSIGNMENT',payload:{assignment}},now).state.assignments?.[0].completed,false);
 assert.equal(gameReducer(state,{type:'TOGGLE_ASSIGNMENT',payload:{id:'personal'}},now).state.assignments?.[0].completed,false);
 assert.equal(gameReducer(getDefaultState(),{type:'SET_ASSIGNMENTS',payload:{assignments:[assignment]}},now).state.assignments?.[0].completed,false);
});
test('Personal Finish requires Start, updates progress and celebrates once',()=>{
 const initial={...getDefaultState(),assignments:[{...assignment,completed:false}]};assert.equal(gameReducer(initial,{type:'COMPLETE_ASSIGNMENT',payload:{id:'personal'}},now).state.assignments?.[0].completed,false);
 const state=gameReducer(initial,{type:'START_TASK',payload:{questId:'personal'}},now).state;
 const r=gameReducer(state,{type:'COMPLETE_ASSIGNMENT',payload:{id:'personal'}},later);assert.equal(r.state.assignments?.[0].completed,true);assert.equal(r.state.assignments?.[0].completedAt,later.toISOString());assert.equal(r.state.activeTasks.personal,undefined);assert.ok(r.notificationsQueue.some(n=>n.type==='quest_completed'));assert.deepEqual(gameReducer(r.state,{type:'COMPLETE_ASSIGNMENT',payload:{id:'personal'}},later).notificationsQueue,[]);
});
test('Package and event task domain functions also reject completion without Start',()=>{
 const state=getDefaultState(),pkg=QUEST_PACKAGES[0],event=CAMPUS_EVENTS[0];assert.equal(completePackageTask(state,pkg.id,pkg.tasks[0].id,now).addedEntries.length,0);assert.equal(completeEventTask(state,event.id,event.tasks[0].id,now).addedEntries.length,0);
});
