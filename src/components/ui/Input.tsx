import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'preact/compat';

const input = cva(
  'w-full border border-border rounded-radius-3 p-space-2 px-space-3 bg-bg-elev text-fg transition-fast placeholder:text-muted disabled:bg-bg-subtle disabled:cursor-not-allowed'
);

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof input> {}

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(input(), className)} {...props} />;
}
