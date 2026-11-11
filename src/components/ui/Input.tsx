import type { InputHTMLAttributes } from 'preact/compat';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return <input className={className} {...props} />;
}
