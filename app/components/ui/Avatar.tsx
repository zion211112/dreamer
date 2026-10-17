'use client';
import { useState, HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs'|'sm'|'md'|'lg'|'xl';
  status?: 'online'|'away'|'busy'|'offline';
}

const sizes = {
  xs: 'w-6 h-6 text-[var(--text-xs)]',
  sm: 'w-8 h-8 text-[var(--text-sm)]',
  md: 'w-10 h-10 text-[var(--text-base)]',
  lg: 'w-12 h-12 text-[var(--text-lg)]',
  xl: 'w-16 h-16 text-[var(--text-xl)]',
};
const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};
const statusColors = {
  online: 'var(--success)',
  away: 'var(--warn)',
  busy: 'var(--danger)',
  offline: 'var(--fg-subtle)',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({ className, src, alt, fallback, size = 'md', status, ...props }, ref) => {
  const [error, setError] = useState(false);
  const initials = fallback || alt?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div ref={ref} className={clsx('relative inline-flex shrink-0 overflow-hidden rounded-full', sizes[size], className)} {...props}>
      {src && !error && <img src={src} alt={alt || ''} className="w-full h-full object-cover" onError={() => setError(true)} />}
      {!src || error ? <div className="w-full h-full bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] font-medium font-[var(--font-sans)]">{initials}</div> : null}
      {status && <span className={clsx('absolute bottom-0 right-0 rounded-full border-2 border-[var(--bg)]', statusSizes[size])} style={{ backgroundColor: statusColors[status] }} aria-label={status} />}
    </div>
  );
});
Avatar.displayName = 'Avatar';