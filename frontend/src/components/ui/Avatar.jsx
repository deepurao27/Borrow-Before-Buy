import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Avatar = ({
  name = 'Student',
  size = 'md', // sm, md, lg, xl
  className = ''
}) => {
  const getInitials = (n) => {
    if (!n) return 'S';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getBgColor = (n) => {
    const colors = [
      'bg-terracotta text-white',
      'bg-marigold text-ink',
      'bg-sage text-white',
      'bg-ink text-paper-light dark:bg-ink-muted'
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizes = {
    sm: 'w-7 h-7 text-xs font-semibold',
    md: 'w-9 h-9 text-sm font-bold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-xl font-bold'
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-full flex items-center justify-center shrink-0 select-none shadow-sm border-2 border-white dark:border-paper-cardDark',
          getBgColor(name),
          sizes[size],
          className
        )
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
