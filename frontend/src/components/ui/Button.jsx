import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({
  children,
  variant = 'primary', // primary (terracotta), secondary (sand/outline), accent (marigold), ghost, danger
  size = 'md',        // sm, md, lg
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-terracotta hover:bg-terracotta-hover text-white shadow-sm hover:shadow-paper',
    secondary: 'bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark hover:bg-paper-light dark:hover:bg-paper-dark/60',
    accent: 'bg-marigold hover:bg-marigold-hover text-ink font-semibold shadow-sm hover:shadow-paper',
    ghost: 'text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark hover:bg-paper-sand/40 dark:hover:bg-paper-sandDark/40',
    danger: 'bg-brick hover:bg-brick-dark text-white shadow-sm',
    sage: 'bg-sage hover:bg-sage-hover text-white shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
