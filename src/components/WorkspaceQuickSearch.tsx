import { useEffect, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter';
import {
  filterWorkspaceDestinations,
  type WorkspaceSearchDestination,
} from '../lib/workspace-search';

interface WorkspaceQuickSearchProps {
  destinations: readonly WorkspaceSearchDestination[];
}

export function WorkspaceQuickSearch({ destinations }: WorkspaceQuickSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = filterWorkspaceDestinations(query, destinations);

  useEffect(() => {
    const dialog = document.getElementById('workspace-quick-search') as HTMLDialogElement | null;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setQuery('');
        setHighlighted(0);
        setOpen(true);
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (!open) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlighted(prev => (prev + 1) % Math.max(results.length, 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlighted(prev => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const active = results[highlighted];
        if (active) {
          setOpen(false);
          const link = document.querySelector(`a[href="${active.href}"]`) as HTMLAnchorElement | null;
          link?.click();
        }
      }
    }

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [open, results, highlighted]);

  function close() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        aria-label="Search modules and tasks"
        aria-controls="workspace-quick-search"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="studio-search-trigger"
        onClick={() => {
          setQuery('');
          setHighlighted(0);
          setOpen(true);
        }}
        ref={triggerRef}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m12.5 12.5 4 4" />
        </svg>
        <span>Search</span>
        <kbd>Ctrl K</kbd>
      </button>
      <dialog
        aria-labelledby="workspace-quick-search-title"
        className="workspace-quick-search"
        id="workspace-quick-search"
        onCancel={event => {
          event.preventDefault();
          close();
        }}
        onClose={() => setOpen(false)}
        onClick={event => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
      >
        <div className="workspace-quick-search-panel">
          <header className="workspace-quick-search-heading">
            <div>
              <span className="workspace-quick-search-eyebrow">Workspace navigation</span>
              <h2 id="workspace-quick-search-title">Find a module</h2>
            </div>
            <button aria-label="Close search" className="workspace-quick-search-close" onClick={close} type="button">
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <label className="workspace-quick-search-field">
            <span className="visually-hidden">Search implemented modules</span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m12.5 12.5 4 4" />
            </svg>
            <input
              autoComplete="off"
              onInput={event => { setQuery(event.currentTarget.value); setHighlighted(0); }}
              placeholder="Search modules"
              ref={inputRef}
              type="search"
              value={query}
            />
            <kbd>ESC</kbd>
          </label>
          <nav aria-label="Search destinations" className="workspace-quick-search-results">
            {results.length ? (
              <ul>
                {results.map((destination, index) => (
                  <li key={destination.id}>
                    <Link
                      aria-current={index === highlighted ? 'page' : undefined}
                      className={`workspace-quick-search-result${index === highlighted ? ' is-active' : ''}`}
                      href={destination.href}
                      onClick={close}
                    >
                      <span className="workspace-quick-search-result-label">
                        <strong>{destination.label}</strong>
                        <small>{destination.module}</small>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p role="status">No modules match “{query.trim()}”.</p>
            )}
          </nav>
          <p className="workspace-quick-search-note">Search opens implemented views; records stay within their module.</p>
        </div>
      </dialog>
    </>
  );
}
