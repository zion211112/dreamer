import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const label = cva(
  'inline-block font-medium text-step--2 tracking-[0.12em]',
  {
    variants: {
      variant: {
        default: 'text-text-muted',
        canon: 'text-state-canon',
        forest: 'text-forest',
        lilac: 'text-lilac',
        peach: 'text-peach',
        sage: 'text-sage',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface LabelProps extends VariantProps<typeof label> {
  children?: any;
  className?: string;
}

export function Label({ children, className, variant }: LabelProps) {
  return <span className={cn(label({ variant }), className)}>{children}</span>;
}
