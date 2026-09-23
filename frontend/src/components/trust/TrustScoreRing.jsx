import React from 'react';
import { ShieldCheck, Award, Sparkles, AlertTriangle, Shield } from 'lucide-react';
import { clsx } from 'clsx';

export const TrustScoreRing = ({
  score = 50,
  label = 'Trust Score',
  sublabel = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  showBadge = true
}) => {
  // Clamped 0-100
  const normalized = Math.min(100, Math.max(0, score));

  // Determine tier & aesthetic colors
  let tierName = 'Reliable Member';
  let strokeColor = '#2F5D50'; // Sage
  let textColor = 'text-sage';
  let bgColor = 'bg-sage/10';
  let borderColor = 'border-sage/30';
  let Icon = ShieldCheck;

  if (normalized >= 90) {
    tierName = 'Campus Hero';
    strokeColor = '#C85A32'; // Terracotta
    textColor = 'text-terracotta';
    bgColor = 'bg-terracotta/10';
    borderColor = 'border-terracotta/30';
    Icon = Sparkles;
  } else if (normalized >= 75) {
    tierName = 'Trusted Peer';
    strokeColor = '#2F5D50'; // Sage
    textColor = 'text-sage';
    bgColor = 'bg-sage/10';
    borderColor = 'border-sage/30';
    Icon = ShieldCheck;
  } else if (normalized >= 50) {
    tierName = 'Reliable Member';
    strokeColor = '#2A7F7E'; // Teal
    textColor = 'text-teal';
    bgColor = 'bg-teal/10';
    borderColor = 'border-teal/30';
    Icon = Shield;
  } else {
    tierName = 'Needs Attention';
    strokeColor = '#EAA83B'; // Marigold
    textColor = 'text-marigold-darker dark:text-marigold';
    bgColor = 'bg-marigold/10';
    borderColor = 'border-marigold/30';
    Icon = AlertTriangle;
  }

  // SVG Circular parameters
  const dimensions = size === 'lg' ? 120 : size === 'sm' ? 64 : 96;
  const strokeWidth = size === 'lg' ? 10 : size === 'sm' ? 6 : 8;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={dimensions}
          height={dimensions}
          className="transform -rotate-90 origin-center"
        >
          {/* Background Track */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-paper-sand dark:text-paper-sandDark fill-none"
          />
          {/* Active Animated Progress Arc */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="fill-none transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={clsx(
              'font-serif font-black tracking-tight leading-none',
              textColor,
              size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-2xl'
            )}
          >
            {normalized}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-ink-muted dark:text-ink-darkMuted font-bold mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Labels */}
      <span className="text-xs font-bold text-ink dark:text-ink-dark mt-2 font-serif">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-ink-muted dark:text-ink-darkMuted block">
          {sublabel}
        </span>
      )}

      {/* Tier Badge */}
      {showBadge && (
        <span
          className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-1.5',
            bgColor,
            borderColor,
            textColor
          )}
        >
          <Icon className="w-3 h-3" />
          {tierName}
        </span>
      )}
    </div>
  );
};
