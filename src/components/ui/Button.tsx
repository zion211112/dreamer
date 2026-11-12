import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'preact/compat';

const button = cva(
  'inline-flex items-center justify-center gap-space-2 border border-border rounded-radius-3 font-medium text-step--1 leading-1.4 whitespace-nowrap transition-fast cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-state-canon border-state-canon text-fg-strong hover:bg-state-canon-wash',
        ghost: 'bg-transparent border-border text-muted hover:bg-bg-subtle',
        steel: 'bg-water border-water text-fg hover:bg-water-pale',
        brass: 'bg-warn border-warn text-fg-strong hover:bg-warn-bg',
        oxide: 'bg-danger border-danger text-fg hover:bg-danger-pale',
      },
      size: {
        sm: 'px-space-1 py-space-1 text-step--2',
        md: 'px-space-2 py-space-3 text-step--1',
        lg: 'px-space-3 py-space-4 text-step-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size, className }))} {...props} />;
}
