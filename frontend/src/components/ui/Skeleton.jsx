import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse rounded-md bg-paper-sand/60 dark:bg-paper-sandDark/50',
          className
        )
      )}
      {...props}
    />
  );
};
