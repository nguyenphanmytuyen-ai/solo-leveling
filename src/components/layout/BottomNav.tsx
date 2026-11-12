import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, UserRound } from 'lucide-react';
import { useGame } from '../../store/GameContext.js';
import { selectDailyQuestsStatus } from '../../store/selectors.js';

export const BottomNav: React.FC = () => {
  const { state, now } = useGame();
  const dailyStatus = selectDailyQuestsStatus(state, now);
  const uncompletedDailies = dailyStatus.totalCount - dailyStatus.completedCount;

  const navItems = [
    { to: '/play', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
    { to: '/play/quests', label: 'Nhiệm vụ', icon: Compass, badge: uncompletedDailies > 0 ? uncompletedDailies : undefined },
    { to: '/play/wardrobe', label: 'Nhân vật', icon: UserRound },
  ];

  return (
    <nav
      className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F132E]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Điều hướng chính di động"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 min-w-[56px] min-h-[48px] select-none transition-colors ${
                  isActive ? 'text-violet-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]' : ''}`} />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-violet-600 text-[10px] font-bold text-white font-pixel shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-1 font-medium tracking-tight">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
