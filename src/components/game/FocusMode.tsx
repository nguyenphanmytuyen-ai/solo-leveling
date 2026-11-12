import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Pause, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../../store/GameContext.js';
import { resolveFocusTask } from '../../domain/focusTask.js';
import { formatTaskTime, getElapsedTaskSeconds } from '../../domain/taskWorkflow.js';

export const FocusMode: React.FC = () => {
  const {state, dispatch, focusTaskId, closeFocus} = useGame();
  const active = focusTaskId ? state.activeTasks[focusTaskId] : undefined;
  const task = focusTaskId ? resolveFocusTask(state, focusTaskId) : null;
  if (!active || active.isPaused || !task || !focusTaskId) return null;
  return <FocusSession key={focusTaskId} title={task.title} active={active}
    onComplete={() => {dispatch(task.complete); closeFocus();}}
    onPause={() => {dispatch({type:'PAUSE_TASK',payload:{questId:focusTaskId}}); closeFocus();}} />;
};

function FocusSession({title, active, onComplete, onPause}: {
  title:string; active: import('../../store/types.js').ActiveTaskState; onComplete:()=>void; onPause:()=>void;
}) {
  const [elapsed,setElapsed]=useState(()=>getElapsedTaskSeconds(active));
  const [muted,setMuted]=useState(true);
  const music=useRef<HTMLAudioElement>(null), dialog=useRef<HTMLDivElement>(null);
  const pauseRef=useRef(onPause); pauseRef.current=onPause;
  useEffect(()=>{const tick=()=>setElapsed(getElapsedTaskSeconds(active));tick();const timer=setInterval(tick,250);return()=>clearInterval(timer);},[active]);
  useEffect(()=>{
    const shell=document.querySelector<HTMLElement>('.app-shell');
    const previous=document.activeElement as HTMLElement|null;
    const oldOverflow=document.body.style.overflow;
    const wasInert=shell?.inert ?? false;
    if(shell) {shell.inert=true;shell.classList.add('focus-background');}
    document.body.style.overflow='hidden';
    dialog.current?.focus();
    const keydown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();pauseRef.current();}
      if(event.key==='Tab'){
        const buttons=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]);
        const first=buttons[0],last=buttons[buttons.length-1];
        if(event.shiftKey && (document.activeElement===first || document.activeElement===dialog.current)){event.preventDefault();last?.focus();}
        else if(!event.shiftKey && (document.activeElement===last || document.activeElement===dialog.current)){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',keydown);
    return()=>{document.removeEventListener('keydown',keydown);document.body.style.overflow=oldOverflow;if(shell){shell.inert=wasInert;shell.classList.remove('focus-background');}if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[]);
  const toggleSound=()=>{
    const next=!muted;
    const element=music.current;
    if(element){element.muted=next;void element.play().catch(()=>{element.muted=true;setMuted(true);});}
    setMuted(next);
  };
  return createPortal(<div className="focus-overlay">
    <div ref={dialog} className="focus-session" role="dialog" aria-modal="true" aria-labelledby="focus-task-title" tabIndex={-1}>
      <video className="focus-video" src="/assets/focus/study.mp4" poster="/assets/focus/study-poster.jpg" autoPlay loop muted playsInline preload="metadata" aria-hidden="true" />
      <audio ref={music} src="/assets/focus/ambient.m4a" loop muted={muted} preload="none" aria-hidden="true" />
      <div className="focus-video-shade" />
      <button type="button" className="focus-sound" onClick={toggleSound} aria-label={muted?'Bật âm thanh':'Tắt âm thanh'} aria-pressed={!muted}>{muted?<VolumeX size={20}/>:<Volume2 size={20}/>}</button>
      <div className="focus-content">
        <div className="focus-live" aria-hidden="true"><span/> TẬP TRUNG</div>
        <h1 id="focus-task-title">{title}</h1>
        <div className="focus-clock" role="timer" aria-label="Thời gian tập trung">{formatTaskTime(elapsed)}</div>
        <div className="focus-actions">
          <button type="button" className="focus-complete" onClick={onComplete}><Check size={21}/>Hoàn thành</button>
          <button type="button" className="focus-pause" onClick={onPause}><Pause size={19}/>Thoát / Tạm dừng</button>
        </div>
      </div>
    </div>
  </div>,document.body);
}
