import type { ComponentChildren } from 'preact';
import { Button as BaseButton } from '@/components/ui/Button';

interface ButtonProps {
  children: ComponentChildren;
  variant?: 'primary' | 'ghost' | 'steel' | 'brass' | 'oxide';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  return (
    <BaseButton variant={variant} size={size} className={className} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </BaseButton>
  );
}
