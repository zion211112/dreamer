import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const card = cva(
  'border border-border rounded-radius-4 bg-bg-elev overflow-hidden shadow-1',
  {
    variants: {
      variant: {
        default: 'border border-border',
        subtle: 'border border-hairline shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps extends VariantProps<typeof card> {
  children?: any;
  className?: string;
}

export function Card({ children, className, variant, ...props }: CardProps) {
  return <div className={cn(card({ variant, className }))} {...props}>{children}</div>;
}

export function CardHead({ children, className }: { children?: any; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-space-3 p-space-3 px-space-4 border-b border-border bg-bg-subtle', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children?: any; className?: string }) {
  return <div className={cn('p-space-4', className)}>{children}</div>;
}

export function CardFoot({ children, className }: { children?: any; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-space-3 p-space-2 px-space-4 border-t border-border bg-bg-subtle text-step--1 text-muted', className)}>
      {children}
    </div>
  );
}
