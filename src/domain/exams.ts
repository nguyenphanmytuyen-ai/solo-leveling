import { ExamDef, ExamQuestion } from '../data/exams/types.js';
import { GameState, CompletionEntry, ExamHistoryEntry, NotificationItem, PersonalExamGoal } from '../store/types.js';

import { getDateKey } from './dates.js';
import { XP_BY_DIFFICULTY } from '../config/progression.js';

export function calculateExamHearts(totalQuestions: number, passPercentage: number = 70): number {
  const passThreshold = Math.ceil((totalQuestions * passPercentage) / 100);
  return Math.max(1, totalQuestions - passThreshold + 1);
}

export function pickExamQuestions(exam: ExamDef, count: number = 10, seed?: number): ExamQuestion[] {
  const copy = [...exam.questions];
  // Simple deterministic or random shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = seed !== undefined ? Math.floor(((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * (i + 1)) : Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export interface GradeExamResult {
  historyEntry: ExamHistoryEntry;
  addedCompletions: CompletionEntry[];
  notifications: NotificationItem[];
}

export function gradeExamSession(
  state: GameState,
  exam: ExamDef,
  userAnswers: Record<string, number>, // questionId -> chosenOptionIndex
  questions: ExamQuestion[],
  now: Date = new Date()
): GradeExamResult {
  let correctCount = 0;
  const wrongQuestionIds: string[] = [];

  for (const q of questions) {
    const chosen = userAnswers[q.id];
    if (chosen !== undefined && chosen === q.correctIndex) {
      correctCount += 1;
    } else {
      wrongQuestionIds.push(q.id);
    }
  }

  const total = questions.length;
  const percentage = Math.round((correctCount / total) * 100);
  const passed = percentage >= exam.passPercentage;

  let grade: ExamHistoryEntry['grade'] = 'F';
  if (percentage === 100) grade = 'S';
  else if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else grade = 'F';

  const historyEntry: ExamHistoryEntry = {
    id: `exam-run-${Date.now()}`,
    examId: exam.id,
    score: correctCount,
    totalQuestions: total,
    percentage,
    passed,
    grade,
    completedAt: now.toISOString(),
    wrongQuestionIds,
  };

  const addedCompletions: CompletionEntry[] = [];
  const notifications: NotificationItem[] = [];
  const dateKey = getDateKey(now);

  const passKey = `exam:${exam.id}:pass`;
  const perfectKey = `exam:${exam.id}:perfect`;

  const alreadyPassed = state.completions.some(c => c.key === passKey);
  const alreadyPerfect = state.completions.some(c => c.key === perfectKey);

  // Check first-time pass
  if (passed && !alreadyPassed) {
    const passEntry: CompletionEntry = {
      key: passKey,
      kind: 'exam',
      questId: passKey,
      dateKey,
      completedAt: now.toISOString(),
      xp: XP_BY_DIFFICULTY.Hard, // 50 XP
      category: 'Sự kiện và Thi',
      difficulty: 'Hard',
      locationId: 'event-hall',
      onTime: true,
    };
    addedCompletions.push(passEntry);

    notifications.push({
      id: `exam-pass-notif-${Date.now()}`,
      type: 'quest_completed',
      title: 'VƯỢT QUA KỲ THI!',
      message: `Bạn đã xuất sắc vượt qua "${exam.title}" với kết quả ${percentage}%! (+50 XP)`,
      xpEarned: XP_BY_DIFFICULTY.Hard,
    });
  }

  // Check first-time perfect score
  if (percentage === 100 && !alreadyPerfect) {
    const perfectEntry: CompletionEntry = {
      key: perfectKey,
      kind: 'exam',
      questId: perfectKey,
      dateKey,
      completedAt: now.toISOString(),
      xp: XP_BY_DIFFICULTY.Normal, // +25 XP
      category: 'Sự kiện và Thi',
      difficulty: 'Normal',
      locationId: 'event-hall',
      onTime: true,
    };
    addedCompletions.push(perfectEntry);

    notifications.push({
      id: `exam-perfect-notif-${Date.now()}`,
      type: 'quest_completed',
      title: 'ĐIỂM TUYỆT ĐỐI (HẠNG S)!',
      message: `Hoàn hảo! Đạt 100% điểm tuyệt đối trong "${exam.title}"! (+25 XP)`,
      xpEarned: XP_BY_DIFFICULTY.Normal,
    });
  }

  return {
    historyEntry,
    addedCompletions,
    notifications,
  };
}

export function deleteExamSchedule(
  personalExams: PersonalExamGoal[],
  id: string
): PersonalExamGoal[] {
  if (!Array.isArray(personalExams)) return [];
  return personalExams.filter(exam => exam.id !== id);
}

