import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const PaperTag = ({
  children,
  tilt = 'none', // 'left' (-1.5deg), 'right' (1.5deg), 'none'
  tape = false,
  pin = false,
  className = '',
  ...props
}) => {
  const tiltClasses = {
    left: '-rotate-1 hover:rotate-0',
    right: 'rotate-1 hover:rotate-0',
    none: ''
  };

  return (
    <div
      className={twMerge(
        clsx(
          'paper-tag relative transition-transform duration-200',
          tiltClasses[tilt],
          className
        )
      )}
      {...props}
    >
      {tape && <div className="tape-strip" />}
      {pin && <div className="pin-dot" />}
      {children}
    </div>
  );
};
