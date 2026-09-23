import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'Nothing pinned here yet',
  description = 'Be the first to list or request something for your batch.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-paper-sand dark:border-paper-sandDark bg-paper-light/50 dark:bg-paper-dark/30 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-paper-sand/40 dark:bg-paper-sandDark/40 flex items-center justify-center text-terracotta dark:text-terracotta-light mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-ink dark:text-ink-dark font-serif mb-1">{title}</h3>
      <p className="text-sm text-ink-muted dark:text-ink-darkMuted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
