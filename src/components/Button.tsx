import { ComponentChildren } from 'preact';

interface ButtonProps {
  children: ComponentChildren;
  variant?: 'primary' | 'ghost' | 'steel' | 'brass' | 'oxide';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  style?: Record<string, string>;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  style = {},
}: ButtonProps) {
  const baseStyles: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-3)',
    fontSize: 'var(--step--1)',
    fontWeight: '500',
    lineHeight: '1.4',
    whiteSpace: 'nowrap',
    transition: 'all var(--fast)',
    ...style,
  };

  const variantStyles: Record<string, Record<string, string>> = {
    primary: {
      background: 'var(--terrain)',
      borderColor: 'var(--terrain)',
      color: 'var(--paper)',
    },
    ghost: {
      background: 'transparent',
      borderColor: 'var(--border)',
      color: 'var(--text-muted)',
    },
    steel: {
      background: 'var(--steel)',
      borderColor: 'var(--steel)',
      color: 'var(--paper)',
    },
    brass: {
      background: 'var(--brass)',
      borderColor: 'var(--brass)',
      color: 'var(--ink-strong)',
    },
    oxide: {
      background: 'var(--oxide)',
      borderColor: 'var(--oxide)',
      color: 'var(--paper)',
    },
  };

  const sizeStyles: Record<string, Record<string, string>> = {
    sm: { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--step--2)' },
    md: { padding: 'var(--space-2) var(--space-3)' },
    lg: { padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--step-0)' },
  };

  const combinedStyle = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    opacity: disabled ? '0.4' : '1',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <button
      type={type}
      className={`btn ${className}`}
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
