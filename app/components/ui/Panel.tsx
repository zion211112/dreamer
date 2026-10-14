'use client';
import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 1 | 2 | 3 | 4;
  padded?: boolean;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, elevation = 1, padded = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(`
        bg-[var(--panel-bg)] border border-[var(--panel-border)]
        rounded-[var(--panel-radius)]
        shadow-[var(--shadow-${elevation})]
        ${padded ? 'p-[var(--panel-padding)]' : ''}
      `, className)}
      {...props}
    >
      {children}
    </div>
  )
);
Panel.displayName = 'Panel';