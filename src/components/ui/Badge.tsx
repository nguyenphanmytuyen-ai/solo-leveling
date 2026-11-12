import React from 'react';
import { DifficultyLevel } from '../../config/progression.js';
import { CosmeticRarity } from '../../data/cosmetics.js';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export const DifficultyBadge: React.FC<{ difficulty: DifficultyLevel; className?: string }> = ({
  difficulty,
  className = '',
}) => {
  const configs = {
    Easy: {
      label: 'Easy',
      bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
      gem: '◆',
    },
    Normal: {
      label: 'Normal',
      bg: 'bg-blue-950/70 border-blue-500/50 text-blue-300',
      gem: '◆◆',
    },
    Hard: {
      label: 'Hard',
      bg: 'bg-orange-950/70 border-orange-500/50 text-orange-300',
      gem: '◆◆◆',
    },
    Boss: {
      label: 'Boss Dungeon',
      bg: 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      gem: '★ BOSS ★',
    },
  };

  const c = configs[difficulty] || configs.Normal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${c.bg} ${className}`}
    >
      <span className="text-[10px] opacity-80">{c.gem}</span>
      <span>{c.label}</span>
    </span>
  );
};

export const RarityBadge: React.FC<{ rarity: CosmeticRarity; className?: string }> = ({
  rarity,
  className = '',
}) => {
  const configs = {
    Common: {
      label: 'Phổ biến',
      gems: '◆',
      bg: 'bg-slate-800/80 border-slate-600 text-slate-300',
    },
    Rare: {
      label: 'Hiếm',
      gems: '◆◆',
      bg: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300',
    },
    Epic: {
      label: 'Sử thi',
      gems: '◆◆◆',
      bg: 'bg-purple-950/80 border-purple-500/60 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]',
    },
    Legendary: {
      label: 'Huyền thoại',
      gems: '◆◆◆◆',
      bg: 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    },
  };

  const c = configs[rarity] || configs.Common;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${c.bg} ${className}`}
    >
      <span className="text-amber-400 tracking-tighter">{c.gems}</span>
      <span>{c.label}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: 'todo' | 'in_progress' | 'completed' | 'locked' | 'overdue';
  className?: string;
}> = ({ status, className = '' }) => {
  const configs = {
    todo: { label: 'Chưa bắt đầu', style: 'bg-slate-800/60 border-slate-700 text-slate-400' },
    in_progress: { label: 'Đang thực hiện', style: 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse' },
    completed: { label: 'Đã hoàn thành', style: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' },
    locked: { label: 'Đang khóa', style: 'bg-rose-950/60 border-rose-800 text-rose-400' },
    overdue: { label: 'Quá hạn', style: 'bg-red-950/80 border-red-500 text-red-300 font-bold' },
  };

  const c = configs[status] || configs.todo;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${c.style} ${className}`}>
      {c.label}
    </span>
  );
};
