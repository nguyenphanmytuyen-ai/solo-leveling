import React from 'react';
import { BRAND } from '../../config/brand.js';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSlogan = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl sm:text-3xl font-black',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* RPG Rune Emblem with Upward Arrow */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-[0_0_12px_rgba(124,58,237,0.7)]" fill="none">
          {/* Hexagonal Rune Shield */}
          <polygon
            points="24,3 43,14 43,34 24,45 5,34 5,14"
            fill="#161B40"
            stroke="#7C3AED"
            strokeWidth="2.5"
          />
          {/* Inner Cyan Rune Inlay */}
          <polygon
            points="24,8 38,16 38,32 24,40 10,32 10,16"
            fill="#0A0E27"
            stroke="#06B6D4"
            strokeWidth="1.2"
            opacity="0.8"
          />
          {/* Ascending Solo Levelling Arrow */}
          <path
            d="M24 13 L33 24 L27 24 L27 34 L21 34 L21 24 L15 24 Z"
            fill="url(#logoGradient)"
          />
          {/* Glowing Rune Core Point */}
          <circle cx="24" cy="13" r="2.5" fill="#FFFFFF" />
          <defs>
            <linearGradient id="logoGradient" x1="15" y1="34" x2="33" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" />
              <stop offset="0.5" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`tracking-wider uppercase font-heading bg-gradient-to-r from-violet-300 via-cyan-200 to-amber-300 bg-clip-text text-transparent ${textSizes[size]}`}>
          {BRAND.name}
        </div>
        {showSlogan && (
          <span className="text-[10px] sm:text-xs text-violet-400 font-medium tracking-widest uppercase">
            {BRAND.slogan}
          </span>
        )}
      </div>
    </div>
  );
};
