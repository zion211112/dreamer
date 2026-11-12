import { cn } from '@/lib/utils';
import type { ComponentChildren } from 'preact';

interface TableSurfaceProps {
  children?: ComponentChildren;
  className?: string;
}

export function Table({ children, className }: TableSurfaceProps) {
  return (
    <div className={cn('overflow-auto overflow-x-auto', className)}>
      <table className="w-full border-collapse border border-border text-text text-step--1">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: TableSurfaceProps) {
  return <thead className={cn(className)}>{children}</thead>;
}

export function TableBody({ children, className }: TableSurfaceProps) {
  return <tbody className={cn(className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableSurfaceProps) {
  return <tr className={cn('border-b border-border', className)}>{children}</tr>;
}

export function TableHead({ children, className }: TableSurfaceProps) {
  return (
    <th
      className={cn(
        'p-space-3 text-left text-text-muted font-medium text-step--2 border-b border-border bg-bg-subtle',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: TableSurfaceProps) {
  return (
    <td className={cn('p-space-3 text-left text-fg text-step--1 border-b border-hairline', className)}>
      {children}
    </td>
  );
}
