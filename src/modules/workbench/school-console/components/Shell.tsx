// src/modules/workbench/school-console/components/Shell.tsx
// Layout shell for the school-console module: sticky rail + top bar + work surface.
// Not the main app WorkspaceLayout — this module is nested under assets.
import type { ComponentChildren } from 'preact';

interface ShellProps {
  title: string;
  rail: ComponentChildren;
  children: ComponentChildren;
  backHref?: string;
  localLabel?: string;
}

export function Shell({
  title,
  rail,
  children,
  backHref = '/workspace/institutions',
  localLabel = 'Local, not synced',
}: ShellProps) {
  return (
    <div className="sc-shell">
      <header className="sc-topbar">
        {backHref && (
          <a className="sc-back-link" href={backHref}>
            <span aria-hidden="true">←</span> Institutions / Assets
          </a>
        )}
        <h1 className="sc-heading">{title}</h1>
        <div className="sc-local-status">
          <span className="sc-local-mark" aria-hidden="true"></span>
          <span>{localLabel}</span>
        </div>
      </header>

      <div className="sc-workspace">
        <nav className="sc-rail" aria-label="Console tools">
          <div className="sc-rail-inner">{rail}</div>
        </nav>

        <main className="sc-surface">{children}</main>
      </div>
    </div>
  );
}
