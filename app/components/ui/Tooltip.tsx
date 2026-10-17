'use client';
import { useState, useRef, useEffect, Fragment, cloneElement } from 'react';
import type { ReactNode, ReactElement, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, position = 'top', delay = 200 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const show = () => { timeoutRef.current = setTimeout(() => setOpen(true), delay); };
  const hide = () => { clearTimeout(timeoutRef.current); setOpen(false); };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const tooltipContent = open ? createPortal(
    <div className={clsx(`fixed z-50 bg-[var(--tooltip-bg)] text-[var(--tooltip-fg)] text-[var(--text-xs)] px-[var(--space-2)] py-[var(--space-1.5)] rounded-[var(--tooltip-radius)] whitespace-nowrap shadow-[var(--shadow-3)] animate-fade-in`)} role="tooltip">{content}</div>,
    document.body
  ) : null;

  const childRef = useRef<HTMLElement>(null);
  const childWithEvents = cloneElement(children as ReactElement<any>, { ref: childRef, onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide });

  return <Fragment>{childWithEvents}{tooltipContent}</Fragment>;
}