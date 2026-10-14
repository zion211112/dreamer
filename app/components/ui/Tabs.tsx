'use client';
import { useState, useRef, Children, isValidElement, cloneElement } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject, ReactElement } from 'react';
import { clsx } from 'clsx';

export interface TabsProps { defaultValue?: string; value?: string; onChange?: (v: string) => void; children: ReactNode; className?: string; }
export interface TabListProps { children: ReactNode; className?: string; }
export interface TabProps { value: string; children: ReactNode; disabled?: boolean; className?: string; }
export interface TabPanelProps { value: string; children: ReactNode; className?: string; }

export function Tabs({ defaultValue, value, onChange, children, className }: TabsProps) {
  const [activeValue, setActiveValue] = useState(value || defaultValue || '');
  const tabsRef = useRef<HTMLDivElement>(null);
  const controlled = value !== undefined;

  const handleChange = (val: string) => { if (!controlled) setActiveValue(val); onChange?.(val); };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    const tabs = tabsRef.current?.querySelectorAll('[role="tab"]:not([disabled])');
    if (!tabs?.length) return;
    const current = Array.from(tabs).findIndex(t => t === document.activeElement);
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next !== current) { e.preventDefault(); (tabs[next] as HTMLElement).focus(); handleChange(tabs[next].getAttribute('data-value')!); }
  };

  return (
    <div className={clsx(className)} onKeyDown={handleKeyDown}>
      {Children.map(children, child => {
        if (!isValidElement(child)) return child;
        if (child.type === TabList) return cloneElement(child as ReactElement<{ tabsRef: RefObject<HTMLDivElement>; activeValue: string; onChange: (v: string) => void; controlled: boolean }>, { tabsRef, activeValue, onChange: handleChange, controlled });
        if (child.type === TabPanel) return cloneElement(child as ReactElement<{ activeValue: string }>, { activeValue });
        return child;
      })}
    </div>
  );
}

export function TabList({ children, className, tabsRef, activeValue, onChange }: TabListProps & { tabsRef: RefObject<HTMLDivElement>; activeValue: string; onChange: (v: string) => void }) {
  return (
    <div ref={tabsRef} role="tablist" className={clsx('flex gap-1 border-b border-[var(--border)]', className)}>
      {Children.map(children, child => {
        if (!isValidElement(child) || child.type !== Tab) return child;
        return cloneElement(child as ReactElement<{ activeValue: string; onChange: (v: string) => void }>, { activeValue, onChange });
      })}
    </div>
  );
}

export function Tab({ value, children, disabled, className, activeValue, onChange }: TabProps & { activeValue: string; onChange: (v: string) => void }) {
  const isActive = value === activeValue;
  return (
    <button role="tab" aria-selected={isActive} aria-controls={`panel-${value}`} id={`tab-${value}`} data-value={value} disabled={disabled} tabIndex={isActive ? 0 : -1} onClick={() => !disabled && onChange(value)} className={clsx(`px-4 py-2 text-[var(--text-sm)] font-medium border-b-2 -mb-px transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${isActive ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-[var(--fg-muted)] border-transparent hover:text-[var(--fg)]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`, className)}>{children}</button>
  );
}

export function TabPanel({ value, children, className, activeValue }: TabPanelProps & { activeValue: string }) {
  if (value !== activeValue) return null;
  return <div role="tabpanel" id={`panel-${value}`} className={clsx('py-4', className)}>{children}</div>;
}