import { DifficultyLevel } from '../config/progression.js';
import type { Assignment } from '../domain/assignments.js';

export type { Assignment };

export type CompletionKind =
  | 'daily'
  | 'task'
  | 'clear'
  | 'event'
  | 'eventClear'
  | 'exam';

export interface CompletionEntry {
  key: string;
  kind: CompletionKind;
  questId: string;
  packageId?: string;
  dateKey: string;
  completedAt: string; // ISO string
  xp: number;
  category: string;
  difficulty: DifficultyLevel;
  locationId?: string;
  dueAt?: string;
  onTime?: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'locked';

export interface ActiveTaskState {
  startedAt: string; // ISO string
  dueAt?: string;
  elapsedSeconds?: number; // total accumulated seconds (starts at 0)
  isPaused?: boolean; // whether the quest timer is paused
  lastResumedAt?: string; // ISO string when timer was last started or unpaused
  isReplay?: boolean; // whether this task is being replayed
}


export interface UserProfile {
  nickname: string;
  characterId: string;
  createdAt: string;
  motionPreference: 'system' | 'reduced' | 'full';
  characterScale?: number;
  characterOffsetX?: number;
  characterOffsetY?: number;
}

export interface OrderItem {
  packageId: string;
  title: string;
  price: number;
}

export interface Order {
  id: string; // SL-YYYYMMDD-XXXX
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'card' | 'wallet' | 'bank';
  createdAt: string;
  characterName: string;
}

export interface CustomGearItem {
  id: string;
  name: string;
  slot: GearSlot;
  imageBlobUrl?: string; // transient in memory, stored in IndexedDB as blob
  scale: number;
  offsetX: number;
  offsetY: number;
  flipX: boolean;
  targetCharacterId?: string; // if empty, applies to all
  createdAt: string;
}

export interface CustomCharacterDef {
  id: string;
  displayName: string;
  tagline: string;
  description?: string; // Mô tả / bio / tiểu sử nhân vật
  idleSrc: string; // Blob URL or path to 2D pixel GIF/PNG
  rewardSrc?: string;
  pixelArt: boolean;
  createdAt: string;
}

export type GearSlot =
  | 'head'
  | 'face'
  | 'body'
  | 'legs'
  | 'feet'
  | 'back'
  | 'handheld'
  | 'accessory';

export type CosmeticSlot =
  | 'backdrop'
  | 'frame'
  | 'aura'
  | 'companion'
  | 'title'
  | 'nameplate';

export interface ExamHistoryEntry {
  id: string;
  examId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
  completedAt: string;
  wrongQuestionIds: string[];
}

export interface PersonalExamGoal {
  id: string;
  title: string;
  examDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'characters_unlocked' | 'quest_completed' | 'level_up' | 'achievement_unlocked' | 'packages_unlocked' | 'cosmetic_unlocked';
  title: string;
  message: string;
  xpEarned?: number;
  level?: number;
  achievementId?: string;
  cosmeticId?: string;
  characterIds?: string[];
  packageIds?: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface CourseSlot {
  id: string;
  name: string;
  code: string;
  day: DayOfWeek;
  startPeriod: number;
  endPeriod: number;
  room: string;
  lecturer: string;
  color?: string;
  createdAt?: string;
}

export interface GameState {
  schemaVersion: number;
  profile: UserProfile;
  completions: CompletionEntry[];
  activeTasks: Record<string, ActiveTaskState>; // key is questId/taskId
  abandonedPackages: string[]; // package IDs currently left (paused)
  unlockedPackages: string[]; // package IDs owned via demo orders
  unlockedAchievements: string[]; // achievement IDs already unlocked
  equippedCosmetics: Partial<Record<CosmeticSlot, string>>;
  equippedGear: Record<string, Partial<Record<GearSlot, string>>>; // characterId -> { slot -> gearId }
  seenCosmetics: string[];
  seenGear: string[];
  customGearMeta: CustomGearItem[];
  equippedCustomGearIds?: string[]; // IDs of custom gear items currently worn
  customCharacters?: CustomCharacterDef[];
  examHistory: ExamHistoryEntry[];
  personalExams: PersonalExamGoal[];
  timetable: CourseSlot[];
  assignments?: Assignment[];
  lastLocationId: string;
  cart: string[]; // package IDs (or 'combo_full_party')
  appliedCoupon: string | null;
  orders: Order[];
  contactMessages: ContactMessage[];
}

