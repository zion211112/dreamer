import { useState, useEffect } from 'preact/hooks';

type ViewMode = 'card' | 'table';

interface RollViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  cardCount?: number;
  tableCount?: number;
}

export function RollViewToggle({ mode, onChange, cardCount, tableCount }: RollViewToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('rollViewMode') as ViewMode | null;
    if (saved && saved !== mode) onChange(saved);
  }, [mode, onChange]);

  const handleChange = (newMode: ViewMode) => {
    localStorage.setItem('rollViewMode', newMode);
    onChange(newMode);
  };

  if (!mounted) {
    return (
      <div className="roll-view-toggle" aria-hidden="true">
        <button disabled aria-label="Card view" title="Card view"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>
        <button disabled aria-label="Table view" title="Table view"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="9" y1="3" x2="9" y2="21"/></svg></button>
      </div>
    );
  }

  return (
    <div className="roll-view-toggle" role="group" aria-label="View mode">
      <button
        aria-pressed={mode === 'card'}
        aria-label={`Card view${cardCount !== undefined ? ` (${cardCount})` : ''}`}
        title="Card view"
        className={mode === 'card' ? 'active' : ''}
        onClick={() => handleChange('card')}
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
      <button
        aria-pressed={mode === 'table'}
        aria-label={`Table view${tableCount !== undefined ? ` (${tableCount})` : ''}`}
        title="Table view"
        className={mode === 'table' ? 'active' : ''}
        onClick={() => handleChange('table')}
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      </button>
    </div>
  );
}