'use client';
import { useState, useRef, useEffect, Fragment, cloneElement } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export interface DropdownProps {
  trigger: ReactElement;
  content: ReactNode;
  align?: 'left' | 'right';
  offset?: number;
}

export function Dropdown({ trigger, content, align = 'right', offset = 4 }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
      if (e.key === 'Tab') { e.preventDefault(); focusNext(contentRef.current); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (contentRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const dropdownContent = (
    <div
      ref={contentRef}
      className={clsx(`
        fixed z-50 min-w-[var(--dropdown-min-w)]
        bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)]
        rounded-[var(--radius-lg)] shadow-[var(--dropdown-shadow)]
        p-[var(--dropdown-padding)] animate-slide-in
      `)}
      role="menu"
    >
      {content}
    </div>
  );

  const triggerWithRef = cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e: ReactMouseEvent) => { e.stopPropagation(); setOpen(v => !v); },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });

  return (
    <Fragment>
      {triggerWithRef}
      {open && createPortal(dropdownContent, document.body)}
    </Fragment>
  );
}

function focusNext(container: HTMLElement | null) {
  const focusable = container?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable?.length) return;
  const current = document.activeElement as HTMLElement;
  const index = Array.from(focusable).findIndex(el => el === current);
  const next = focusable[(index + 1) % focusable.length];
  next?.focus();
}