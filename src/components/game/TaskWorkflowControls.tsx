import React, { useEffect, useState } from 'react';
import { Play, Check, CheckCircle2, Clock3, RotateCcw } from 'lucide-react';
import { useGame } from '../../store/GameContext.js';
import type { ActiveTaskState } from '../../store/types.js';
import { getElapsedTaskSeconds, formatTaskTime } from '../../domain/taskWorkflow.js';
interface Props { title:string; completed:boolean; active?:ActiveTaskState; onStart:()=>void; onComplete:()=>void; onReopen?:()=>void; }
export const TaskWorkflowControls: React.FC<Props> = ({title,completed,active,onStart,onComplete,onReopen}) => {
  const { dispatch, state } = useGame();
  const [elapsed,setElapsed] = useState(()=>getElapsedTaskSeconds(active));
  useEffect(()=>{
    const tick=()=>setElapsed(getElapsedTaskSeconds(active)); tick();
    if(!active || active.isPaused) return;
    const timer=setInterval(tick,250); return ()=>clearInterval(timer);
  },[active?.startedAt,active?.lastResumedAt,active?.elapsedSeconds,active?.isPaused]);
  return <div className={`task-workflow-controls ${active ? 'is-running' : completed ? 'is-finished' : 'is-idle'}`}>
    <div className="task-workflow-state">{active ? <><span className={`focus-indicator ${active.isPaused?'is-paused':''}`} /><span>{active.isPaused?'Tạm dừng':'Đang thực hiện'}</span><span role="timer" aria-label={`Thời gian ${title}`} className="task-live-clock">{formatTaskTime(elapsed)}</span></> : completed ? <><CheckCircle2 className="w-4 h-4" /><span>Đã hoàn thành</span></> : <><Clock3 className="w-4 h-4" /><span>Chưa bắt đầu</span></>}</div>
    {active?.isPaused ? <button type="button" className="task-workflow-action task-start" onClick={() => { const id=Object.keys(state.activeTasks).find(id=>state.activeTasks[id]===active); if(id) dispatch({type:'RESUME_TASK',payload:{questId:id}}); }}><Play className="w-4 h-4" />Tiếp tục</button> : active ? <button type="button" className="task-workflow-action task-finish" aria-label={`Hoàn thành ${title}`} onClick={onComplete}><Check className="w-4 h-4" />Hoàn thành</button> : !completed ? <button type="button" className="task-workflow-action task-start" aria-label={`Bắt đầu ${title}`} onClick={onStart}><Play className="w-4 h-4" />Bắt đầu</button> : onReopen ? <button type="button" className="task-workflow-reopen" onClick={onReopen}><RotateCcw className="w-4 h-4" />Làm lại</button> : null}
  </div>;
};
