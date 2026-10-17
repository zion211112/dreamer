'use client';
import { useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { Panel } from './Panel';
import { clsx } from 'clsx';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', full: 'max-w-4xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <Fragment>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Panel elevation={4} className={clsx(sizes[size], 'w-full max-h-[90vh] overflow-hidden animate-scale-in')}>
          {title && (
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h2 className="text-[var(--text-lg)] font-semibold">{title}</h2>
              <button onClick={onClose} className="text-[var(--fg-muted)] hover:text-[var(--fg)] p-1" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          )}
          <div className={clsx(title ? 'pt-0' : '')}>{children}</div>
        </Panel>
      </div>
    </Fragment>,
    document.body
  );
}