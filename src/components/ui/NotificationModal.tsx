import characters from '../../data/characters.json' with { type: 'json' };
import React from 'react';
import { useGame } from '../../store/GameContext.js';
import { Button } from './Button.js';
import { Sparkles, Trophy, Award, ArrowUpRight } from 'lucide-react';
import { ACHIEVEMENTS } from '../../data/achievements.js';

export const NotificationModal: React.FC = () => {
  const { currentNotification, dismissNotification } = useGame();

  if (!currentNotification) return null;

  const renderContent = () => {
    switch (currentNotification.type) {
      case 'characters_unlocked':
        return (
          <div className="text-center py-4 space-y-5 character-unlock-notice">
            <Sparkles className="w-10 h-10 text-violet-300 mx-auto" />
            <h2 className="text-xl font-bold text-white">{currentNotification.title}</h2>
            <div className="flex items-center justify-center gap-4">
              {characters.filter(c => currentNotification.characterIds?.includes(c.id)).map(c => (
                <div key={c.id} className="rounded-2xl bg-violet-500/10 border border-violet-400/40 p-3">
                  <img src={`${import.meta.env.BASE_URL}${c.idle.src}`} alt={c.displayName} className="w-20 h-24 object-contain pixelated" />
                  <p className="text-sm font-semibold text-violet-200 mt-2">{c.displayName}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{currentNotification.message}</p>
            <Button variant="primary" fullWidth onClick={dismissNotification}>Tuyệt vời!</Button>
          </div>
        );
      case 'level_up':
        return (
          <div className="text-center py-4 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 p-1 flex items-center justify-center animate-bounce">
              <div className="w-full h-full bg-[#0A0E27] rounded-full flex flex-col items-center justify-center border-2 border-amber-300">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Level</span>
                <span className="text-3xl font-black text-white font-pixel">{currentNotification.level}</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black font-heading text-amber-400 tracking-wider drop-shadow-md">
                LEVEL UP!
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Bạn đã nâng cấp sức mạnh và mở khóa thêm nhiều đặc quyền mới!
              </p>
            </div>

            <Button variant="gold" fullWidth onClick={dismissNotification}>
              Tuyệt Vời! Tiếp Tục Lên Cấp
            </Button>
          </div>
        );

      case 'achievement_unlocked': {
        const ach = ACHIEVEMENTS.find(a => a.id === currentNotification.achievementId);
        return (
          <div className="text-center py-4 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#1E1B4B] border-2 border-amber-400/80 p-2 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Thành Tựu Mới</span>
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-100">
                {ach ? ach.title : currentNotification.title}
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                {ach ? ach.description : currentNotification.message}
              </p>
            </div>

            <Button variant="primary" fullWidth onClick={dismissNotification}>
              Đã Nhận Thành Tựu
            </Button>
          </div>
        );
      }

      default:
        return (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold font-heading text-slate-100">
                {currentNotification.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {currentNotification.message}
              </p>
              {currentNotification.xpEarned && (
                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold font-pixel text-sm">
                  +{currentNotification.xpEarned} XP
                </div>
              )}
            </div>

            <Button variant="primary" fullWidth onClick={dismissNotification}>
              Tiếp tục
            </Button>
          </div>
        );
    }
  };

  return (
    <div
      className="xp-notification-layer fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="xp-notification-sheet w-full max-w-sm bg-[#161B40] border border-violet-500/50 rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        {/* Glow corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">{renderContent()}</div>
      </div>
    </div>
  );
};
