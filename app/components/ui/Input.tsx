'use client';
import { forwardRef, InputHTMLAttributes, LabelHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, iconLeft, iconRight, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[var(--text-xs)] font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-[var(--space-1)]">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              `
                w-full h-[var(--input-height)]
                bg-[var(--input-bg)] border border-[var(--input-border)]
                rounded-[var(--input-radius)]
                px-[var(--input-padding-x)]
                text-[var(--input-fg)] placeholder-[var(--input-placeholder)]
                font-[var(--font-sans)] text-[var(--text-sm)]
                transition-[border-color,box-shadow] duration-[var(--duration-fast)]
                focus:outline-none focus:border-[var(--input-border-focus)] focus:ring-2 focus:ring-[var(--accent-ring)]
                disabled:opacity-50 disabled:cursor-not-allowed
              `,
              iconLeft && 'pl-10',
              iconRight && 'pr-10',
              error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[rgba(239,68,68,0.3)]',
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-[var(--space-1)] text-[var(--text-xs)] text-[var(--danger)]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';