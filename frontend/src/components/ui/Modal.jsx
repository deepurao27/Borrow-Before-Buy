import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div
        className={twMerge(
          clsx(
            'relative w-full bg-white dark:bg-paper-cardDark rounded-2xl shadow-paperHover border border-paper-sand dark:border-paper-sandDark p-6 z-10 animate-in fade-in zoom-in-95 duration-150',
            maxWidth,
            className
          )
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-paper-sand dark:border-paper-sandDark mb-5">
          <h3 className="text-xl font-bold text-ink dark:text-ink-dark font-serif">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-muted dark:text-ink-darkMuted hover:text-ink dark:hover:text-ink-dark hover:bg-paper-sand/40 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
