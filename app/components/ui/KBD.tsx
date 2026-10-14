'use client';
import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface KBDProps extends HTMLAttributes<HTMLElement> {}

export const KBD = ({ className, children, ...props }: KBDProps) => (
  <kbd
    className={clsx(`
      inline-flex items-center justify-center
      font-[var(--font-mono)] text-[var(--text-xs)] font-medium
      px-[var(--space-1.5)] py-[var(--space-0.5)]
      rounded-[var(--radius-sm)]
      bg-[var(--bg-hover)] border border-[var(--border)]
      text-[var(--fg-muted)]
      border-b-[2px] border-b-[var(--border-strong)]
    `, className)}
    {...props}
  >
    {children}
  </kbd>
);