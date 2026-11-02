import { useEffect, useState } from 'preact/hooks';

interface ViewToggleProps {
  view: 'card' | 'table';
  onChange: (view: 'card' | 'table') => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className = '' }: ViewToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('networkViewMode') as 'card' | 'table' | null;
    if (saved && saved !== view) {
      onChange(saved);
    }
  }, [onChange, view]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('networkViewMode', view);
    }
  }, [view, mounted]);

  if (!mounted) {
    return (
      <div className={`net-view-toggle ${className}`} aria-hidden="true">
        <button aria-pressed="true" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        </button>
        <button aria-pressed="false" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`net-view-toggle ${className}`} role="radiogroup" aria-label="View mode">
      <button
        role="radio"
        aria-pressed={view === 'card'}
        onClick={() => onChange('card')}
        title="Card view"
        type="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        <span className="visually-hidden">Card view</span>
      </button>
      <button
        role="radio"
        aria-pressed={view === 'table'}
        onClick={() => onChange('table')}
        title="Table view"
        type="button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <span className="visually-hidden">Table view</span>
      </button>
    </div>
  );
}