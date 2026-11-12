import React, { createContext, useContext, useEffect, useReducer, useState, useRef, useCallback } from 'react';
import { GameState, NotificationItem } from './types.js';
import { Action, gameReducer } from './reducer.js';
import { loadStateFromStorage, saveStateToStorage, cancelPendingStateSave, STORAGE_KEY } from './persistence.js';
import { getMsUntilNextMidnight } from '../domain/dates.js';
import { getGearBlob, getCharBlob } from './indexedDb.js';

interface GameContextValue {
  state: GameState;
  focusTaskId: string | null;
  closeFocus: () => void;
  dispatch: (action: Action) => void;
  notifications: NotificationItem[];
  currentNotification: NotificationItem | null;
  dismissNotification: () => void;
  isCelebrating: boolean;
  triggerCelebration: (durationMs?: number) => void;
  now: Date;
  // DEV-only time travel helper
  advanceDateByDays?: (days: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

interface InternalStoreState {
  gameState: GameState;
  notifications: NotificationItem[];
}

type InternalAction = Action | { type: '__DISMISS_NOTIFICATION' } | { type: '__SYNC_STATE'; state: GameState };

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dayOffsetDays, setDayOffsetDays] = useState<number>(0);
  const dayOffsetRef = useRef(0);
  dayOffsetRef.current = dayOffsetDays;

  const getLiveNow = useCallback(() => {
    const d = new Date();
    if (dayOffsetRef.current !== 0) {
      d.setDate(d.getDate() + dayOffsetRef.current);
    }
    return d;
  }, []);

  const [now, setNow] = useState<Date>(() => getLiveNow());

  const [store, rawDispatch] = useReducer(
    (prevState: InternalStoreState, action: InternalAction): InternalStoreState => {
      if (action.type === '__SYNC_STATE') return { ...prevState, gameState: action.state };
      if (action.type === '__DISMISS_NOTIFICATION') {
        return {
          ...prevState,
          notifications: prevState.notifications.slice(1),
        };
      }
      const actionNow = getLiveNow();
      const { state: nextState, notificationsQueue } = gameReducer(prevState.gameState, action, actionNow);
      return {
        gameState: nextState,
        notifications: notificationsQueue.length > 0 ? [...prevState.notifications, ...notificationsQueue] : prevState.notifications,
      };
    },
    null,
    () => ({
      gameState: loadStateFromStorage(),
      notifications: [],
    })
  );

  const state = store.gameState;
  const notifications = store.notifications;
  const [isCelebrating, setIsCelebrating] = useState(false);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger 5-second victory celebration
  const triggerCelebration = useCallback((durationMs: number = 5000) => {
    setIsCelebrating(true);
    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
    }
    celebrationTimerRef.current = setTimeout(() => {
      setIsCelebrating(false);
    }, durationMs);
  }, []);

  const incomingStateRef = useRef<GameState | null>(null);
  const hasMountedSaveRef = useRef(false);
  // Do not echo a storage update back into other tabs or rewrite state on mount.
  useEffect(() => {
    if (!hasMountedSaveRef.current) { hasMountedSaveRef.current = true; return; }
    if (incomingStateRef.current === state) { incomingStateRef.current = null; return; }
    saveStateToStorage(state);
  }, [state]);

  // Sync across tabs via window storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (!parsed?.profile || !Array.isArray(parsed.completions)) return;
          cancelPendingStateSave();
          const remoteState = loadStateFromStorage();
          incomingStateRef.current = remoteState;
          rawDispatch({ type: '__SYNC_STATE', state: remoteState });
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Hydrate custom gear and character blobs from IndexedDB
  useEffect(() => {
    let isMounted = true;
    const hydrateBlobs = async () => {
      let changed = false;
      if (state.customGearMeta?.length) {
        for (const item of state.customGearMeta) {
          if (!item.imageBlobUrl || item.imageBlobUrl.startsWith('blob:')) {
            const blob = await getGearBlob(item.id);
            if (blob && isMounted) {
              item.imageBlobUrl = URL.createObjectURL(blob);
              changed = true;
            }
          }
        }
      }
      if (state.customCharacters?.length) {
        for (const char of state.customCharacters) {
          if (!char.idleSrc || char.idleSrc.startsWith('blob:')) {
            const blob = await getCharBlob(char.id);
            if (blob && isMounted) {
              char.idleSrc = URL.createObjectURL(blob);
              changed = true;
            }
          }
        }
      }
      if (changed && isMounted) {
        rawDispatch({ type: 'SET_PROFILE', payload: {} });
      }
    };
    hydrateBlobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Midnight rollover watcher & focus/visibilitychange watcher
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const scheduleMidnightRefresh = () => {
      const ms = getMsUntilNextMidnight();
      timerId = setTimeout(() => {
        setNow(new Date());
        scheduleMidnightRefresh();
      }, ms);
    };

    scheduleMidnightRefresh();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setNow(new Date());
      }
    };

    const handleFocus = () => {
      setNow(new Date());
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const celebratedNotificationsRef = useRef(new Set<string>());
  useEffect(() => {
    const fresh = notifications.filter(item => item.type === 'quest_completed' && !celebratedNotificationsRef.current.has(item.id));
    fresh.forEach(item => celebratedNotificationsRef.current.add(item.id));
    if (fresh.length) triggerCelebration(5000);
  }, [notifications, triggerCelebration]);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const closeFocus = useCallback(() => setFocusTaskId(null), []);
  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);
    if (action.type === 'START_TASK' || action.type === 'RESUME_TASK') setFocusTaskId(action.payload.questId);
  }, []);

  const currentNotification = notifications[0] || null;

  const dismissNotification = useCallback(() => {
    rawDispatch({ type: '__DISMISS_NOTIFICATION' });
  }, []);

  // DEV-only date advancement
  const advanceDateByDays = useCallback((days: number) => {
    setDayOffsetDays(prev => {
      const next = prev + days;
      dayOffsetRef.current = next;
      const d = new Date();
      d.setDate(d.getDate() + next);
      setNow(d);
      return next;
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        focusTaskId,
        closeFocus,
        dispatch,
        notifications,
        currentNotification,
        dismissNotification,
        isCelebrating,
        triggerCelebration,
        now,
        advanceDateByDays: import.meta.env.DEV ? advanceDateByDays : undefined,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
