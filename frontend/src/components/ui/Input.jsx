import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  className = '',
  containerClassName = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className={twMerge('w-full space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-xs font-semibold text-ink dark:text-ink-dark uppercase tracking-wider">
          {label} {required && <span className="text-terracotta">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-paper-cardDark border border-paper-sand dark:border-paper-sandDark text-ink dark:text-ink-dark placeholder:text-ink-light dark:placeholder:text-ink-darkMuted transition-colors duration-150',
            'focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none',
            error && 'border-brick focus:border-brick focus:ring-brick',
            className
          )
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-brick font-medium mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-ink-muted dark:text-ink-darkMuted mt-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
