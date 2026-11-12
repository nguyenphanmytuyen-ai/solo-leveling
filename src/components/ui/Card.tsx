import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'elevated' | 'glow' | 'gold' | 'interactive';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'ui-card relative rounded-2xl border transition-all duration-200 overflow-hidden';

  const variantStyles = {
    surface: 'bg-[#161B40]/80 border-slate-700/50 backdrop-blur-sm shadow-xl',
    elevated: 'bg-[#1F2656] border-slate-600/60 shadow-2xl',
    glow: 'bg-[#161B40]/90 border-violet-500/40 rpg-border-glow shadow-violet-950/40',
    gold: 'bg-gradient-to-b from-[#2A1D0B] to-[#161B40] border-amber-400/60 rpg-border-gold shadow-amber-950/30',
    interactive:
      'bg-[#161B40]/80 border-slate-700/50 hover:border-violet-500/60 hover:bg-[#1A204C] cursor-pointer shadow-lg hover:shadow-violet-950/30 hover:-translate-y-0.5',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
