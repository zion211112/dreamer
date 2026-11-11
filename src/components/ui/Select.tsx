import type { SelectHTMLAttributes } from 'preact/compat';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
  return <select className={className} {...props} />;
}
