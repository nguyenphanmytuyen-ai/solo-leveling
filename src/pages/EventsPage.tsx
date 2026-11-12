import { TaskWorkflowControls } from '../components/game/TaskWorkflowControls.js';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../store/GameContext.js';
import { selectActiveEvents } from '../store/selectors.js';
import { EXAMS } from '../data/exams/index.js';
import { ExamDef, ExamQuestion } from '../data/exams/types.js';
import { PersonalExamGoal } from '../store/types.js';
import { pickExamQuestions, calculateExamHearts, gradeExamSession, deleteExamSchedule } from '../domain/exams.js';
import { saveStateToStorageImmediate } from '../store/persistence.js';
import { CharacterSprite } from '../components/game/CharacterSprite.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { DifficultyBadge } from '../components/ui/Badge.js';

import {
  CalendarCheck2,
  Swords,
  Calendar,
  Heart,
  Clock,
  Check,
  AlertCircle,
  Trophy,
  Sparkles,
  ChevronRight,
  Trash2,
  Plus,
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch, now } = useGame();

  const currentTab = searchParams.get('tab') || 'events';

  const setTab = (tab: string) => {
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  };

  const activeEvents = selectActiveEvents(state, now);

  // Exam Arena State
  const [selectedExam, setSelectedExam] = useState<ExamDef | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [hearts, setHearts] = useState(4);
  const [bossHp, setBossHp] = useState(1000);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timerSec, setTimerSec] = useState(30);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
  const [examResult, setExamResult] = useState<any | null>(null);

  // Personal Exam Goal state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [goalError, setGoalError] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<PersonalExamGoal | null>(null);

  const confirmDeleteExam = () => {
    if (!examToDelete) return;
    const examId = examToDelete.id;
    // 1. Dispatch action to state
    dispatch({ type: 'REMOVE_PERSONAL_EXAM', payload: { id: examId } });
    // 2. Immediately persist to localStorage to guarantee synchronization
    const updatedExams = deleteExamSchedule(state.personalExams, examId);
    saveStateToStorageImmediate({
      ...state,
      personalExams: updatedExams,
    });
    // 3. Clear modal
    setExamToDelete(null);
  };


  // Keyboard shortcut listener (keys 1, 2, 3, 4) during exam
  useEffect(() => {
    if (!isExamActive || isQuestionAnswered || examResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 4) {
        handleAnswer(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExamActive, isQuestionAnswered, examResult, currentQIndex, examQuestions]);

  // Exam 30-second timer countdown
  useEffect(() => {
    if (!isExamActive || isQuestionAnswered || examResult) return;

    const timer = setInterval(() => {
      setTimerSec(prev => {
        if (prev <= 1) {
          // Timeout counts as incorrect answer
          handleAnswer(-1);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamActive, isQuestionAnswered, examResult, currentQIndex]);

  const startExam = (exam: ExamDef) => {
    const questions = pickExamQuestions(exam, 10);
    const initialHearts = calculateExamHearts(10, exam.passPercentage);
    setSelectedExam(exam);
    setExamQuestions(questions);
    setCurrentQIndex(0);
    setHearts(initialHearts);
    setBossHp(exam.bossHp);
    setUserAnswers({});
    setTimerSec(exam.timeLimitSecPerQuestion);
    setIsQuestionAnswered(false);
    setExamResult(null);
    setIsExamActive(true);
  };

  const handleAnswer = (optionIndex: number) => {
    if (isQuestionAnswered || !selectedExam) return;

    const currentQ = examQuestions[currentQIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;

    const updatedAnswers = { ...userAnswers, [currentQ.id]: optionIndex };
    setUserAnswers(updatedAnswers);
    setIsQuestionAnswered(true);

    if (isCorrect) {
      setBossHp(prev => Math.max(0, prev - Math.round(selectedExam.bossHp / 10)));
    } else {
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      if (nextHearts <= 0) {
        // Game Over early!
        setTimeout(() => {
          finishExam(updatedAnswers);
        }, 1200);
        return;
      }
    }
  };

  const nextQuestion = () => {
    if (!selectedExam) return;
    if (currentQIndex + 1 < examQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
      setIsQuestionAnswered(false);
      setTimerSec(selectedExam.timeLimitSecPerQuestion);
    } else {
      finishExam(userAnswers);
    }
  };

  const finishExam = (finalAnswers: Record<string, number>) => {
    if (!selectedExam) return;
    const result = gradeExamSession(state, selectedExam, finalAnswers, examQuestions, now);
    dispatch({
      type: 'RECORD_EXAM_RESULT',
      payload: {
        historyEntry: result.historyEntry,
        addedCompletions: result.addedCompletions,
        notifications: result.notifications,
      },
    });
    setExamResult(result);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) {
      setGoalError('Vui lòng nhập tên kỳ thi/môn học.');
      return;
    }
    if (!newGoalDate) {
      setGoalError('Vui lòng chọn ngày thi.');
      return;
    }
    dispatch({
      type: 'ADD_PERSONAL_EXAM',
      payload: { title: newGoalTitle.trim(), examDate: newGoalDate },
    });
    setNewGoalTitle('');
    setNewGoalDate('');
    setGoalError(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-100 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-amber-400" />
            <span>Sự Kiện & Đấu Trường Thi Cử</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Nhiệm vụ theo mùa giải, boss battle ôn thi và lịch trình học thuật cá nhân
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#161B40] border border-slate-700/60 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'events', label: 'Sự Kiện Mùa', icon: Calendar },
            { id: 'exams', label: 'Đấu Trường Thi', icon: Swords },
            { id: 'schedule', label: 'Lịch Thi Của Tôi', icon: CalendarCheck2 },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                  currentTab === t.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Seasonal Events */}
      {currentTab === 'events' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEvents.map(({ event, isActive, daysRemaining, completedTaskIds, isCleared, progressPercent }) => (
              <Card
                key={event.id}
                variant={isActive ? 'gold' : 'surface'}
                className="p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase font-pixel px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isActive ? `Đang diễn ra • Còn ${daysRemaining} ngày` : 'Sắp diễn ra'}
                      </span>
                      {isCleared && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-pixel">
                          CLEARED
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold font-heading text-lg text-slate-100 mt-2">
                      {event.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold font-pixel text-amber-400 shrink-0">
                    +{event.clearBonusXp} XP Bonus
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {event.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400 font-pixel">
                    <span>Tiến độ sự kiện</span>
                    <span>{completedTaskIds.length}/{event.tasks.length} ({progressPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tasks inside this event */}
                <div className="space-y-2 pt-2 border-t border-slate-700/60">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Nhiệm vụ sự kiện:
                  </div>
                  {event.tasks.map(t => {
                    const isDone = completedTaskIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`event-workflow-card p-3 rounded-xl border flex flex-col gap-3 text-xs ${
                          isDone
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                            : 'bg-[#0F132E] border-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            {isDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{t.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{t.condition}</p>
                        </div>

                        {isActive && <TaskWorkflowControls title={t.name} completed={isDone} active={state.activeTasks[t.id]} onStart={() => dispatch({type:'START_TASK',payload:{questId:t.id}})} onComplete={() => dispatch({type:'COMPLETE_EVENT_TASK',payload:{eventId:event.id,taskId:t.id}})} />}

                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Exam Arena */}
      {currentTab === 'exams' && (
        <div className="space-y-6">
          {!isExamActive ? (
            /* Exam Selection Grid */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Lưu ý:</strong> Đề ôn tập trắc nghiệm mô phỏng mang tính tham khảo tự học, không phải đề thi chính thức của trường. Mỗi kỳ thi gồm 10 câu ngẫu nhiên, đạt 70% để vượt qua và nhận thưởng XP!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXAMS.map(exam => {
                  const passKey = `exam:${exam.id}:pass`;
                  const isPassed = state.completions.some(c => c.key === passKey);
                  const perfectKey = `exam:${exam.id}:perfect`;
                  const isPerfect = state.completions.some(c => c.key === perfectKey);

                  const historyForExam = state.examHistory.filter(h => h.examId === exam.id);
                  const bestRun = historyForExam.reduce((best, cur) => (cur.score > (best?.score || 0) ? cur : best), historyForExam[0]);

                  return (
                    <Card key={exam.id} variant="surface" className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-violet-300 uppercase font-pixel">
                              {exam.category}
                            </span>
                            {isPassed && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-pixel">
                                PASSED ({bestRun?.grade || 'C'})
                              </span>
                            )}
                            {isPerfect && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-pixel">
                                PERFECT S
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold font-heading text-lg text-slate-100 mt-1">
                            {exam.title}
                          </h3>
                        </div>

                        <span className="text-xs font-bold text-amber-400 font-pixel shrink-0">
                          +50 XP
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {exam.shortDesc}
                      </p>

                      <div className="p-3 rounded-xl bg-[#0F132E] border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400">Trùm bảo vệ:</span> <strong>{exam.bossName}</strong>
                        </div>
                        <div className="text-[11px] text-slate-400 font-pixel">
                          10 câu • 30s/câu • Đạt 70%
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400">
                          Đã thi: <strong className="text-slate-200">{historyForExam.length} lần</strong>
                        </span>
                        <Button
                          variant={isPassed ? 'secondary' : 'gold'}
                          icon={<Swords className="w-4 h-4" />}
                          onClick={() => startExam(exam)}
                        >
                          {isPassed ? 'Thi lại cải thiện' : 'Vào Đấu Trường'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : examResult ? (
            /* Results Screen */
            <Card variant="gold" className="p-6 text-center space-y-6 max-w-lg mx-auto">
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl font-black font-pixel text-amber-400">
                  {examResult.historyEntry.grade}
                </div>
                <h2 className="text-2xl font-black font-heading text-slate-100">
                  {examResult.historyEntry.passed ? 'CHIẾN THẮNG TRÙM CUỐI!' : 'THẤT BẠI TRONG ĐẤU TRƯỜNG'}
                </h2>
                <p className="text-sm text-slate-300">
                  Điểm số: <strong className="text-amber-400">{examResult.historyEntry.score}/{examResult.historyEntry.totalQuestions} ({examResult.historyEntry.percentage}%)</strong>
                </p>
              </div>

              {examResult.addedCompletions.length > 0 && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-pixel">
                  Thưởng lần đầu: +{examResult.addedCompletions.reduce((s: any, c: any) => s + c.xp, 0)} XP đã ghi vào sổ cái!
                </div>
              )}

              {/* Review wrong answers */}
              {examResult.historyEntry.wrongQuestionIds.length > 0 && (
                <div className="text-left space-y-3 pt-3 border-t border-slate-700/60 max-h-60 overflow-y-auto">
                  <div className="text-xs font-bold uppercase text-slate-400">
                    Xem lại câu trả lời chưa đúng:
                  </div>
                  {examQuestions
                    .filter(q => examResult.historyEntry.wrongQuestionIds.includes(q.id))
                    .map(q => (
                      <div key={q.id} className="p-3 rounded-xl bg-[#0F132E] border border-slate-800 text-xs space-y-1">
                        <div className="font-bold text-slate-200">{q.question}</div>
                        <div className="text-emerald-400 font-semibold">
                          Đáp án đúng: {q.options[q.correctIndex]}
                        </div>
                        <div className="text-slate-400 text-[11px]">{q.explanation}</div>
                      </div>
                    ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setIsExamActive(false)}>
                  Rời Đấu Trường
                </Button>
                {selectedExam && (
                  <Button variant="gold" fullWidth onClick={() => startExam(selectedExam)}>
                    Thi Lại
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            /* Live Boss Battle Quiz Screen */
            selectedExam && (
              <div className="space-y-5 max-w-2xl mx-auto">
                {/* Boss Battle HUD */}
                <div className="p-4 rounded-2xl bg-[#161B40] border border-slate-700 flex items-center justify-between gap-4">
                  {/* Player HP / Hearts */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-500/50 flex items-center justify-center">
                      <CharacterSprite characterId={state.profile.characterId} scale={0.7} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-pixel">Người Chơi</div>
                      <div className="flex gap-1 text-rose-500 text-sm">
                        {Array.from({ length: Math.max(0, hearts) }).map((_, i) => (
                          <Heart key={i} className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 30-sec Timer */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0F132E] border-2 border-amber-400 flex items-center justify-center font-pixel text-sm font-bold text-amber-300">
                      {timerSec}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5">Giây</span>
                  </div>

                  {/* Boss Info & HP */}
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="text-[10px] text-amber-400 font-pixel">{selectedExam.bossName}</div>
                      <div className="text-xs font-bold text-slate-200">Máu: {bossHp} HP</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-xl">
                      👹
                    </div>
                  </div>
                </div>

                {/* Question Card */}
                {examQuestions[currentQIndex] && (
                  <Card variant="surface" className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-pixel">
                      <span>CÂU {currentQIndex + 1} / {examQuestions.length}</span>
                      <span>Chủ đề: {examQuestions[currentQIndex].topic}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-100 font-heading leading-relaxed">
                      {examQuestions[currentQIndex].question}
                    </h3>

                    {/* Options (1-4) */}
                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                      {examQuestions[currentQIndex].options.map((option, idx) => {
                        const isChosen = userAnswers[examQuestions[currentQIndex].id] === idx;
                        const isCorrectOption = idx === examQuestions[currentQIndex].correctIndex;

                        let btnStyle = 'bg-[#0F132E] border-slate-700/80 text-slate-200 hover:border-violet-500';
                        if (isQuestionAnswered) {
                          if (isCorrectOption) {
                            btnStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold';
                          } else if (isChosen) {
                            btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                          } else {
                            btnStyle = 'bg-[#0F132E] border-slate-800 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAnswer(idx)}
                            disabled={isQuestionAnswered}
                            className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-black/40 border border-slate-600 flex items-center justify-center font-pixel text-xs shrink-0">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation feedback */}
                    {isQuestionAnswered && (
                      <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/40 text-xs text-slate-200 space-y-1 animate-fade-in">
                        <div className="font-bold text-amber-300">Giải thích:</div>
                        <div>{examQuestions[currentQIndex].explanation}</div>
                      </div>
                    )}

                    {/* Next Button */}
                    {isQuestionAnswered && (
                      <div className="pt-2">
                        <Button variant="primary" fullWidth onClick={nextQuestion}>
                          {currentQIndex + 1 < examQuestions.length ? 'Câu Tiếp Theo' : 'Xem Kết Quả Trận Đấu'}
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Tab 3: Personal Exam Goals */}
      {currentTab === 'schedule' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Add Goal Form */}
          <Card variant="surface" className="p-5 space-y-4">
            <h3 className="font-bold font-heading text-base text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Thêm Môn Thi Sắp Tới</span>
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  placeholder="Tên môn thi (VD: Vi Tích Phân 1, Python...)"
                  maxLength={40}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0F132E] border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={e => setNewGoalDate(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0F132E] border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {goalError && <p className="text-xs text-rose-400 font-medium">{goalError}</p>}

              <Button variant="gold" size="sm" type="submit" fullWidth>
                Lưu Lịch Thi (Đếm Ngược)
              </Button>
            </form>
          </Card>

          {/* List of goals */}
          <div className="space-y-3">
            <h3 className="font-bold font-heading text-sm text-slate-300">
              Danh Sách Lịch Thi Của Bạn ({state.personalExams.length}/10)
            </h3>

            {state.personalExams.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center rounded-xl bg-[#161B40]/40 border border-slate-800">
                Chưa có lịch thi nào được lưu. Hãy thêm môn thi sắp tới để nhận nhắc nhở ôn luyện!
              </p>
            ) : (
              state.personalExams.map(goal => {
                const targetDate = new Date(goal.examDate);
                const diffTime = targetDate.getTime() - now.getTime();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft >= 0 && daysLeft <= 7;

                return (
                  <Card
                    key={goal.id}
                    variant={isUrgent ? 'gold' : 'surface'}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-100">{goal.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Ngày thi: {goal.examDate} •{' '}
                        {daysLeft > 0 ? (
                          <strong className={isUrgent ? 'text-amber-400 font-pixel' : 'text-slate-300 font-pixel'}>
                            Còn {daysLeft} ngày
                          </strong>
                        ) : daysLeft === 0 ? (
                          <strong className="text-rose-400 font-pixel">HÔM NAY!</strong>
                        ) : (
                          <span className="text-slate-500">Đã qua</span>
                        )}
                      </div>
                      {isUrgent && (
                        <p className="text-[11px] text-amber-300 mt-1">
                          ⚡ Còn dưới 7 ngày! Đừng quên ghé Đấu trường thi để luyện đề giữ phong độ nhé!
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isUrgent && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setTab('exams')}
                        >
                          Luyện đề
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => setExamToDelete(goal)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title={`Xóa lịch thi ${goal.title}`}
                        aria-label={`Xóa lịch thi ${goal.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal (replaces browser confirm) */}
      <Modal
        isOpen={Boolean(examToDelete)}
        onClose={() => setExamToDelete(null)}
        title="Xác Nhận Xóa Lịch Thi"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-200 leading-relaxed">
            Bạn có chắc chắn muốn xóa lịch thi môn{' '}
            <strong className="text-amber-300 font-bold">{examToDelete?.title}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-[#0F132E] border border-slate-700/80 text-xs text-slate-300 space-y-1.5">
            <div>
              <span className="text-slate-400">Ngày thi: </span>
              <strong className="text-slate-100 font-pixel">{examToDelete?.examDate}</strong>
            </div>
            <div className="text-[11px] text-rose-400 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Dữ liệu lịch thi này sẽ được xóa hoàn toàn khỏi hệ thống lưu trữ ngay lập tức.</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-700/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExamToDelete(null)}
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDeleteExam}
            >
              Xác Nhận Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

