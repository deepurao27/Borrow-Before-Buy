import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className = '',
  hover = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'paper-card p-6',
          hover && 'paper-card-hover',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
