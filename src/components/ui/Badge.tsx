import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badge = cva(
  'inline-flex items-center gap-space-1 rounded-pill border px-space-2 py-space-1 text-step--2 font-medium',
  {
    variants: {
      variant: {
        default: 'border-border bg-bg-subtle text-text-muted',
        canon: 'border-state-canon bg-state-canon-wash text-state-canon',
        forest: 'border-forest bg-forest-pale text-forest',
        lilac: 'border-lilac bg-lilac-pale text-lilac',
        peach: 'border-peach bg-peach-pale text-peach',
        sage: 'border-sage bg-sage-pale text-sage',
        accent: 'border-accent bg-accent-wash text-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badge> {
  children?: any;
  className?: string;
}

export function Badge({ children, className, variant, ...props }: BadgeProps) {
  return <span className={cn(badge({ variant, className }))} {...props}>{children}</span>;
}
