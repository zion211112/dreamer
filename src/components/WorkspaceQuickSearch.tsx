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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = filterWorkspaceDestinations(query, destinations);

  useEffect(() => {
    const dialog = dialogRef.current;
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
        setOpen(true);
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

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
        ref={dialogRef}
      >
        <div className="workspace-quick-search-panel">
          <header className="workspace-quick-search-heading">
            <div>
              <span className="workspace-quick-search-eyebrow">WORKSPACE NAVIGATION</span>
              <h2 id="workspace-quick-search-title">Find a module or task</h2>
            </div>
            <button aria-label="Close search" className="workspace-quick-search-close" onClick={close} type="button">
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <label className="workspace-quick-search-field">
            <span className="visually-hidden">Search implemented modules and tasks</span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m12.5 12.5 4 4" />
            </svg>
            <input
              autoComplete="off"
              onInput={event => setQuery(event.currentTarget.value)}
              placeholder="Search modules and tasks"
              ref={inputRef}
              type="search"
              value={query}
            />
            <kbd>ESC</kbd>
          </label>
          <nav aria-label="Search destinations" className="workspace-quick-search-results">
            {results.length ? (
              <ul>
                {results.map(destination => (
                  <li key={destination.id}>
                    <Link href={destination.href} onClick={close}>
                      <span>
                        <strong>{destination.label}</strong>
                        <small>{destination.module}</small>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p role="status">No modules or tasks match “{query.trim()}”.</p>
            )}
          </nav>
          <p className="workspace-quick-search-note">Search opens implemented views; records stay within their module.</p>
        </div>
      </dialog>
    </>
  );
}
