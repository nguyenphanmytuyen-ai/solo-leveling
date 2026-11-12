import { TaskWorkflowControls } from '../components/game/TaskWorkflowControls.js';
import { getPersonalTasksForToday, getWeeklyCompletedCount } from '../domain/dashboard.js';
import { AssignmentManager } from '../components/game/AssignmentManager.js';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../store/GameContext.js';
import {
  selectLevelProgress,
  selectStreak,
  selectTotalXp,
  selectDailyQuestsStatus,
  selectPackagesStatus,
  selectAchievementProgress,
  selectActiveEvents,
} from '../store/selectors.js';
import { getCampusHotspot } from '../domain/locations.js';
import { CharacterStage } from '../components/game/CharacterStage.js';
import { QuestCard } from '../components/game/QuestCard.js';
import { QuestDetailModal } from '../components/game/QuestDetailModal.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { CharacterAdjustModal } from '../components/game/CharacterAdjustModal.js';
import charactersData from '../data/characters.json' with { type: 'json' };
import {
  Flame,
  Trophy,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight,
  Play,
  Check,
  Calendar,
  SlidersHorizontal,
  Zap,
  CheckCircle2,
  LockKeyhole,
  Unlock,
  ArrowUpRight,
  ChevronDown,
  Clock3,
  Shirt,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { state, dispatch, now } = useGame();
  const levelProg = selectLevelProgress(state);
  const streak = selectStreak(state, now);
  const totalXp = selectTotalXp(state);
  const dailyStatus = selectDailyQuestsStatus(state, now);
  const packagesStatus = selectPackagesStatus(state);
  const achievements = selectAchievementProgress(state, now);
  const activeEvents = selectActiveEvents(state, now);
  const hotspot = getCampusHotspot(state, now);

  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const personalTasks = getPersonalTasksForToday(state, now);
  const todayCompleted = dailyStatus.completedCount + personalTasks.filter(task => task.completed).length;
  const todayTotal = dailyStatus.totalCount + personalTasks.length;
  const todayPercent = todayTotal ? Math.round(todayCompleted / todayTotal * 100) : 0;
  const weeklyCompleted = getWeeklyCompletedCount(state, now);
  const companion = state.customCharacters?.find(c => c.id === state.profile.characterId)
    || charactersData.find(c => c.id === state.profile.characterId) || charactersData[0];
  const priorityQuests = [...dailyStatus.items].sort((a, b) =>
    Number(a.isCompleted) - Number(b.isCompleted) || Number(Boolean(b.activeState)) - Number(Boolean(a.activeState))
  );
  const dateLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);

  // Active / owned packages
  const activePackages = packagesStatus.filter(p => p.isOwned && !p.isAbandoned);
  // Recent unlocked achievements or near completion (>= 50%)
  const recentAchievements = achievements
    .filter(a => a.isUnlocked || a.currentProgress / a.maxProgress >= 0.5)
    .slice(0, 3);

  // Top running active event
  const runningEvent = activeEvents.find(e => e.isActive);

  return (
    <div className="dashboard space-y-6 sm:space-y-7">
      <section className="today-focus" aria-label="Tiến độ công việc hôm nay">
        <div className="today-topline"><span className="overview-eyebrow">TỔNG QUAN · {dateLabel}</span><Link to="/play/wardrobe" className="today-companion" aria-label={`Xem nhân vật ${companion.displayName}, ${totalXp} XP`}><CharacterStage size="mini" /><span>{totalXp.toLocaleString('vi-VN')}<small> XP</small></span></Link></div>
        <h1>Chào {state.profile.nickname || 'bạn'} <span>✦</span></h1>
        <p className="today-message">Từng việc nhỏ, một ngày tốt hơn.</p>
        <div className="today-progress-caption"><strong>Hôm nay bạn đã xong {todayCompleted}/{todayTotal} nhiệm vụ</strong><span aria-live="polite">{todayPercent}%</span></div>
        <div className="today-progress-track" role="progressbar" aria-label="Tiến độ nhiệm vụ hôm nay" aria-valuemin={0} aria-valuemax={todayTotal || 1} aria-valuenow={todayCompleted}><div style={{ width: `${todayPercent}%` }} /></div>
        <p className="today-encouragement">{todayCompleted === todayTotal ? 'Bạn đã làm rất tốt hôm nay. Dành chút thời gian cho bản thân nhé.' : `Còn ${todayTotal - todayCompleted} việc. Chọn một việc và bắt đầu nhé.`}</p>
      </section>

      {/* Main Grid: Daily Quests vs Your Questlines */}
      <div className="overview-content-grid grid grid-cols-1 gap-6">
        {/* Daily Quests Section */}
        <div className="today-tasks space-y-4">
          <div className="task-section-heading flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-violet-400" />
                <span>Việc cần làm hôm nay</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ưu tiên việc quan trọng, hoàn thành từng bước.
              </p>
            </div>

            <Link to="/play/quests" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center">
              Xem toàn bộ <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <AssignmentManager createOnly />
          {personalTasks.length > 0 && <div className="personal-priority-list" aria-label="Nhiệm vụ cá nhân hôm nay">{personalTasks.map(task => (
            <article key={task.id} className={`overview-quest-row ${task.completed ? 'is-complete' : ''}`}>
              <div className="overview-quest-main">
                <span className="task-state-icon" aria-hidden="true">{task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock3 className="w-5 h-5" />}</span>
                <div className="personal-task-copy"><span className="quest-category-label">{task.isUrgent ? 'QUAN TRỌNG · ' : ''}{task.subject}</span><strong>{task.title}</strong>{task.deadline && <span className="quest-condition">Hạn: {new Date(task.deadline).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</span>}</div>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${task.completed ? 'text-emerald-300' : 'text-slate-600'}`} />
              </div>
              <TaskWorkflowControls title={task.title} completed={task.completed} active={state.activeTasks[task.id]} onStart={() => dispatch({type:'START_TASK',payload:{questId:task.id}})} onComplete={() => dispatch({type:'COMPLETE_ASSIGNMENT',payload:{id:task.id}})} onReopen={() => dispatch({type:'TOGGLE_ASSIGNMENT',payload:{id:task.id}})} />
            </article>
          ))}</div>}
          <div className="overview-quest-list">
            {priorityQuests.map(item => {
              const status = item.activeState ? 'in_progress' : item.isCompleted ? 'completed' : 'todo';
              return (
                <article key={item.quest.id} className={`overview-quest-row ${item.isCompleted ? 'is-complete' : ''}`}>
                  <div className="overview-quest-main">
                    <span className="task-state-icon" aria-hidden="true">{item.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock3 className="w-5 h-5" />}</span>
                    <button type="button" className="overview-quest-title" aria-label={`Xem nhiệm vụ ${item.quest.name}`} onClick={() => setSelectedQuest({ ...item.quest, status, activeTaskState: item.activeState })}>
                      <span className="quest-category-label">{item.quest.category}{status === 'in_progress' && <span className="quest-running"><Clock3 className="w-3 h-3" />{item.activeState?.isPaused ? 'Tạm dừng' : 'Đang làm'}</span>}</span>
                      <strong>{item.quest.name}</strong>
                      <span className="quest-condition">{item.quest.condition}</span>
                    </button>
                    <span className="overview-quest-reward">{item.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-3.5 h-3.5" />}<span>+{item.quest.xp} XP</span></span>
                  </div>
                  <TaskWorkflowControls title={item.quest.name} completed={item.isCompleted} active={item.activeState} onStart={() => dispatch({type:'START_TASK',payload:{questId:item.quest.id}})} onComplete={() => dispatch({type:'COMPLETE_DAILY_QUEST',payload:{questId:item.quest.id}})} />
                  <details className="overview-quest-options">
                    <summary>Chi tiết &amp; bộ đếm thời gian<ChevronDown className="w-3.5 h-3.5" /></summary>
                    <QuestCard
                  id={item.quest.id}
                  name={item.quest.name}
                  description={item.quest.description}
                  category={item.quest.category}
                  difficulty={item.quest.difficulty}
                  xp={item.quest.xp}
                  status={status}
                  startedAt={item.activeState?.startedAt}
                  dueAt={item.activeState?.dueAt}
                  activeTaskState={item.activeState}
                  onClickDetail={() =>
                    setSelectedQuest({
                      id: item.quest.id,
                      name: item.quest.name,
                      description: item.quest.description,
                      condition: item.quest.condition,
                      category: item.quest.category,
                      difficulty: item.quest.difficulty,
                      xp: item.quest.xp,
                      locationId: item.quest.locationId,
                      status,
                      activeTaskState: item.activeState,
                    })
                  }
                  onStart={() =>
                    dispatch({
                      type: 'START_TASK',
                      payload: { questId: item.quest.id },
                    })
                  }
                  onReplay={() =>
                    dispatch({
                      type: 'START_TASK',
                      payload: { questId: item.quest.id },
                    })
                  }
                  onPause={
                    status === 'in_progress' && !item.activeState?.isPaused
                      ? (elapsed) =>
                          dispatch({
                            type: 'PAUSE_TASK',
                            payload: { questId: item.quest.id, elapsedSeconds: elapsed },
                          })
                      : undefined
                  }
                  onResume={
                    status === 'in_progress' && item.activeState?.isPaused
                      ? () =>
                          dispatch({
                            type: 'RESUME_TASK',
                            payload: { questId: item.quest.id },
                          })
                      : undefined
                  }
                  onResetTimer={
                    status === 'in_progress'
                      ? () =>
                          dispatch({
                            type: 'RESET_TASK_TIMER',
                            payload: { questId: item.quest.id },
                          })
                      : undefined
                  }
                  onAbandon={
                    status === 'in_progress'
                      ? () =>
                          dispatch({
                            type: 'ABANDON_TASK',
                            payload: { questId: item.quest.id },
                          })
                      : undefined
                  }
                  onComplete={
                    status === 'in_progress'
                      ? () =>
                          dispatch({
                            type: 'COMPLETE_DAILY_QUEST',
                            payload: { questId: item.quest.id },
                          })
                      : undefined
                  }
                    />
                  </details>
                </article>
              );
            })}
          </div>
        </div>

        <section className="growth-stats" aria-label="Thống kê phát triển bản thân">
          <h2>Nhìn lại sự tiến bộ</h2>
          <div className="growth-card"><span className="growth-icon"><Flame className="w-5 h-5" /></span><div><span>Chuỗi ngày kỷ luật</span><strong>{streak.currentStreak} <small>ngày liên tiếp</small></strong></div><p>Kỷ lục {streak.longestStreak} ngày</p></div>
          <div className="growth-card"><span className="growth-icon"><CheckCircle2 className="w-5 h-5" /></span><div><span>Việc hoàn thành trong tuần</span><strong>{weeklyCompleted} <small>công việc</small></strong></div><p>Từ thứ Hai đến hôm nay</p></div>
          <div className="growth-card"><span className="growth-icon"><Sparkles className="w-5 h-5" /></span><div><span>Cấp độ hiện tại</span><strong>Level {levelProg.level}</strong></div><p>{levelProg.title}</p><div className="growth-level-track" role="progressbar" aria-label="Tiến trình lên cấp" aria-valuemin={0} aria-valuemax={100} aria-valuenow={levelProg.progressPercent}><div style={{ width: `${levelProg.progressPercent}%` }} /></div><span className="growth-xp">{levelProg.isMaxLevel ? 'Đã đạt cấp độ tối đa' : `${levelProg.xpInCurrentLevel}/${levelProg.xpRequiredForNextLevel} XP ở cấp hiện tại`}</span></div>
        </section>

        {/* Your Questlines (Active packages) */}
        <div className="overview-support space-y-5">
      {/* Hot Spot Banner: "Hôm nay nên ghé đâu?" */}
      <Card variant="surface" className="p-4 bg-gradient-to-r from-[#161B40] via-[#1E1B4B] to-[#161B40] border-cyan-500/30">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 animate-pulse">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-pixel flex items-center gap-1.5">
                <span>Hôm Nay Nên Ghé Đâu?</span>
              </div>
              <div className="text-sm font-bold text-slate-100">
                {hotspot.name} ({hotspot.recommendedTime})
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {hotspot.lore}
              </p>
            </div>
          </div>

          <Link to={`/play/map?loc=${hotspot.id}`}>
            <Button variant="cyan" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              Ghé thăm ngay
            </Button>
          </Link>
        </div>
      </Card>

      {/* Running Event Banner if active */}
      {runningEvent && (
        <Card variant="glow" className="p-4 border-amber-500/40 bg-gradient-to-r from-[#20163B] to-[#161B40]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase font-pixel tracking-wider">
                  Sự Kiện Đang Diễn Ra (Còn {runningEvent.daysRemaining} ngày)
                </div>
                <div className="text-sm font-bold text-slate-100">
                  {runningEvent.event.title}
                </div>
                <div className="text-xs text-slate-300">
                  Tiến độ: {runningEvent.completedTaskIds.length}/{runningEvent.event.tasks.length} nhiệm vụ (+{runningEvent.event.clearBonusXp} XP bonus)
                </div>
              </div>
            </div>

            <Link to="/play/events">
              <Button variant="gold" size="sm">
                Tham gia sự kiện
              </Button>
            </Link>
          </div>
        </Card>
      )}


          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Gói Quest Đang Chơi</span>
              </h2>
              <p className="text-xs text-slate-400">
                {activePackages.length} chuỗi nhiệm vụ đang kích hoạt
              </p>
            </div>

            <Link to="/packages" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center">
              Khám phá thêm <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {activePackages.length === 0 ? (
            <Card variant="surface" className="p-8 text-center space-y-3 border-dashed border-slate-700">
              <div className="w-12 h-12 mx-auto rounded-full bg-violet-950/60 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                Bạn chưa mở khóa chuỗi nhiệm vụ nào
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Mở khóa các gói nhiệm vụ như Master Python, Gym Rat, AI HCMUS-ER để bắt đầu lộ trình thăng hạng kỹ năng!
              </p>
              <Link to="/packages" className="inline-block pt-2">
                <Button variant="primary" size="sm">
                  Khám Phá Quest Packages
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {activePackages.map(p => (
                <Card key={p.pkg.id} variant="surface" className="p-4 border-l-4" style={{ borderLeftColor: p.pkg.color }}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 font-heading">
                        {p.pkg.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {p.pkg.shortDescription}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 font-pixel">
                      {p.completedTasksCount}/{p.totalTasksCount}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: p.pkg.color,
                        width: `${p.progressPercent}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Đã nhận: <strong className="text-violet-300">{p.xpEarnedSoFar} XP</strong>
                    </span>
                    <Link to={`/packages/${p.pkg.id}`}>
                      <Button variant="secondary" size="sm">
                        {p.isCompleted ? 'Xem lại' : 'Tiếp tục chuỗi'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Achievements Teaser */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold font-heading text-slate-200 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Thành Tựu Đang Chinh Phục</span>
              </h3>
              <Link to="/play/achievements" className="text-xs text-slate-400 hover:text-slate-200">
                Tất cả (17)
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {recentAchievements.map(a => (
                <div
                  key={a.achievement.id}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                    a.isUnlocked
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-[#161B40]/60 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold line-clamp-1">{a.achievement.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Tiến độ: {a.currentProgress}/{a.maxProgress}
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${a.isUnlocked ? 'bg-amber-400' : 'bg-violet-500'}`}
                      style={{ width: `${Math.round((a.currentProgress / a.maxProgress) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quest Detail Modal */}
      {(() => {
        const activeTaskState = selectedQuest ? state.activeTasks[selectedQuest.id] : undefined;
        const isCompleted = selectedQuest ? dailyStatus.items.some(item => item.quest.id === selectedQuest.id && item.isCompleted) : false;
        let status = selectedQuest?.status;
        if (activeTaskState) {
          status = 'in_progress';
        } else if (isCompleted) {
          status = 'completed';
        } else if (status === 'in_progress') {
          status = 'todo';
        }

        const liveQuest = selectedQuest ? {
          ...selectedQuest,
          status,
          activeTaskState,
        } : null;

        return (
          <QuestDetailModal
            isOpen={Boolean(selectedQuest)}
            onClose={() => setSelectedQuest(null)}
            quest={liveQuest}
            onStart={() => {
              if (selectedQuest) {
                dispatch({ type: 'START_TASK', payload: { questId: selectedQuest.id } });
              }
            }}
            onPause={(elapsed) => {
              if (selectedQuest) {
                dispatch({ type: 'PAUSE_TASK', payload: { questId: selectedQuest.id, elapsedSeconds: elapsed } });
              }
            }}
            onResume={() => {
              if (selectedQuest) {
                dispatch({ type: 'RESUME_TASK', payload: { questId: selectedQuest.id } });
              }
            }}
            onAbandon={() => {
              if (selectedQuest) {
                dispatch({ type: 'ABANDON_TASK', payload: { questId: selectedQuest.id } });
              }
            }}
            onComplete={() => {
              if (selectedQuest) {
                dispatch({ type: 'COMPLETE_DAILY_QUEST', payload: { questId: selectedQuest.id } });
              }
            }}
          />
        );
      })()}

      {/* Character Adjust Modal */}
      <CharacterAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
      />
    </div>
  );
};
