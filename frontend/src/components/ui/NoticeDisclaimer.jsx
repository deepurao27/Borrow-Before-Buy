import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const NoticeDisclaimer = ({
  variant = 'warning', // warning (marigold/terracotta), info (sand/sage)
  customText = null,
  className = ''
}) => {
  const defaultText = 'BBB never handles money. This amount is settled directly between the two of you.';

  return (
    <div
      role="note"
      className={twMerge(
        clsx(
          'flex items-start gap-2.5 p-3 rounded-lg text-xs leading-relaxed border transition-colors',
          variant === 'warning' && 'bg-marigold/10 dark:bg-marigold/15 border-marigold/30 text-ink dark:text-ink-dark',
          variant === 'info' && 'bg-sage/10 dark:bg-sage/15 border-sage/30 text-ink dark:text-ink-dark',
          className
        )
      )}
    >
      <ShieldCheck className="w-4 h-4 text-terracotta dark:text-terracotta-light shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold block mb-0.5 text-terracotta dark:text-terracotta-light">Offline Settlement Notice</span>
        <p className="text-ink-muted dark:text-ink-darkMuted font-medium">{customText || defaultText}</p>
      </div>
    </div>
  );
};
