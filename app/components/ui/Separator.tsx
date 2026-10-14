'use client';
import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Separator = ({ className, orientation = 'horizontal', ...props }: SeparatorProps) => (
  <div
    className={clsx(`
      bg-[var(--border)]
      ${orientation === 'horizontal' ? 'h-[1px] w-full' : 'w-[1px] h-full'}
    `, className)}
    role="separator"
    {...props}
  />
);