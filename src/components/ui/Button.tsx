import type { ButtonHTMLAttributes } from 'preact/compat';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return <button className={className} {...props} />;
}
