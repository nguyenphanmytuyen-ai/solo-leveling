import test from 'node:test';
import assert from 'node:assert/strict';
import { canSelectCharacter, ensureSelectableCharacter, getNewCharacterUnlocks } from './characterUnlocks.ts';
import { gameReducer } from '../store/reducer.ts';
import { getDefaultState, loadStateFromStorage, STORAGE_KEY } from '../store/persistence.ts';
import type { GameState } from '../store/types.ts';

function withXp(xp: number): GameState {
  return { ...getDefaultState(), completions: xp ? [{ key: 'earned-before', kind: 'daily', questId: 'prior', dateKey: '2026-11-11', completedAt: '2026-11-11T12:00:00Z', xp, category: 'Academic', difficulty: 'Normal' }] : [] };
}

test('Only Nam and Nữ are selectable at 0 and 99 XP; both advanced characters unlock at 100 XP', () => {
  for (const xp of [0, 99, 100, 101]) {
    const state = withXp(xp);
    assert.equal(canSelectCharacter(state, 'hero'), true);
    assert.equal(canSelectCharacter(state, 'scholar'), true);
    for (const id of ['boy2', 'girl2']) assert.equal(canSelectCharacter(state, id), xp >= 100);
    assert.equal(canSelectCharacter(state, 'unknown'), false);
  }
});

test('Reducer refuses locked characters and permits either starter and unlocked characters', () => {
  for (const xp of [0, 99, 100]) {
    for (const id of ['hero', 'scholar', 'boy2', 'girl2']) {
      const { state } = gameReducer(withXp(xp), { type: 'SET_PROFILE', payload: { characterId: id } });
      assert.equal(state.profile.characterId, xp < 100 && ['boy2', 'girl2'].includes(id) ? 'hero' : id);
    }
  }
});

test('Crossing 100 XP through a task announces the exact group once; replay and later actions do not repeat it', () => {
  const now = new Date('2026-11-12T12:00:00Z');
  const action = { type: 'COMPLETE_DAILY_QUEST' as const, payload: { questId: 'daily-morning-spawn' } };
  const started=gameReducer(withXp(90),{type:'START_TASK',payload:{questId:'daily-morning-spawn'}},now).state;
  const reached=gameReducer(started,action,now);
  const notifications = reached.notificationsQueue.filter(n => n.type === 'characters_unlocked');
  assert.equal(notifications.length, 1);
  assert.equal(reached.notificationsQueue[0].type, 'characters_unlocked');
  assert.equal(notifications[0].message, '🎉 Chúc mừng! Bạn đã đạt 100 XP và mở khóa Boy thể thao, Girl IT!');
  assert.deepEqual(notifications[0].characterIds, ['boy2', 'girl2']);
  for (const followup of [action, { type: 'SET_PROFILE' as const, payload: { nickname: 'Thành' } }]) {
    assert.equal(gameReducer(reached.state, followup, now).notificationsQueue.some(n => n.type === 'characters_unlocked'), false);
  }
});

test('Milestone detection handles overshoot and does not reannounce an already reached threshold', () => {
  assert.equal(getNewCharacterUnlocks(99, 124)[0].xp, 100);
  assert.deepEqual(getNewCharacterUnlocks(0, 99), []);
  assert.deepEqual(getNewCharacterUnlocks(100, 125), []);
  assert.deepEqual(getNewCharacterUnlocks(125, 125), []);
});

test('Reload preserves earned access and selected character; invalid locked selections fall back safely', () => {
  const state = withXp(100);
  state.profile.characterId = 'girl2';
  const saved = JSON.stringify(state);
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => key === STORAGE_KEY ? saved : null } });
  try {
    const restored = loadStateFromStorage();
    assert.equal(restored.profile.characterId, 'girl2');
    assert.equal(canSelectCharacter(restored, 'boy2'), true);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else delete (globalThis as any).window;
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage); else delete (globalThis as any).localStorage;
  }
  const locked = withXp(99);
  locked.profile.characterId = 'boy2';
  assert.equal(ensureSelectableCharacter(locked).profile.characterId, 'hero');
});

test('Only built-in characters are selectable, and resetting XP restores a starter', () => {
  const low = withXp(99);
  low.customCharacters = [{ id: 'custom-test', displayName: 'Custom', tagline: '', idleSrc: '', pixelArt: true, createdAt: '' }];
  assert.equal(canSelectCharacter(low, 'custom-test'), false);
  const high = { ...withXp(100), customCharacters: low.customCharacters };
  assert.equal(canSelectCharacter(high, 'custom-test'), false);
  high.profile.characterId = 'boy2';
  const reset = gameReducer(high, { type: 'RESET_DATA' });
  assert.equal(reset.state.profile.characterId, 'hero');
  assert.equal(canSelectCharacter(reset.state, 'boy2'), false);
});
