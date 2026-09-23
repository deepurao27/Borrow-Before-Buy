import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TapeAccent = ({
  orientation = 'left', // left, right, center
  className = ''
}) => {
  const rotations = {
    left: '-rotate-tape-left',
    right: 'rotate-tape-right',
    center: 'rotate-0'
  };

  return (
    <div
      aria-hidden="true"
      className={twMerge(
        clsx(
          'w-16 h-4 bg-paper-sand/85 dark:bg-paper-sandDark/75 backdrop-blur-sm shadow-sm rounded-sm border border-white/50 dark:border-white/10 pointer-events-none',
          rotations[orientation],
          className
        )
      )}
    />
  );
};
