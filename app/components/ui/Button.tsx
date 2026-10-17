'use client';
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = `
      inline-flex items-center justify-center gap-[var(--btn-gap)]
      font-[var(--font-sans)] font-[var(--btn-weight)]
      rounded-[var(--btn-radius)]
      transition-[background-color,border-color,color,box-shadow,transform]
      duration-[var(--duration-fast)] ease-[var(--ease-out)]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
      disabled:opacity-50 disabled:cursor-not-allowed
      active:[transform:scale(0.98)]
    `;

    const variants = {
      primary: `
        bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]
        hover:bg-[var(--btn-primary-hover)]
        border border-transparent
      `,
      secondary: `
        bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)]
        hover:bg-[var(--btn-secondary-hover)]
        border border-[var(--border)]
      `,
      ghost: `
        bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-fg)]
        hover:bg-[var(--btn-ghost-hover)]
        border border-transparent
      `,
      danger: `
        bg-[var(--btn-danger-bg)] text-[var(--btn-danger-fg)]
        hover:bg-[var(--btn-danger-hover)]
        border border-transparent
      `,
    };

    const sizes = {
      sm: `h-[var(--btn-height-sm)] px-[var(--space-3)] text-[var(--text-xs)]`,
      md: `h-[var(--btn-height-md)] px-[var(--btn-padding-x)] text-[var(--text-sm)]`,
      lg: `h-[var(--btn-height-lg)] px-[var(--space-6)] text-[var(--text-base)]`,
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';