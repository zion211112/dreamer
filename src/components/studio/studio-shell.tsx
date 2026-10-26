'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert } from 'lucide-react';

import { StudioInspector } from './studio-inspector';
import { StudioRadar } from './studio-radar';
import { StudioSurface } from './studio-surface';
import { recordTitle } from '@/lib/workbench/types';
import type { StudioDataset } from '@/lib/workbench/dataset';
import type { StudioDerivation } from '@/lib/workbench/derive';
import type { WorkspaceLane } from '@/lib/workspace';

export interface StudioShellProps {
  dataset: StudioDataset;
  derivation: StudioDerivation;
  contextKey: string;
  view: WorkspaceLane;
}

export function studioHref(
  contextKey: string,
  view: WorkspaceLane,
  focus: string | null,
): string {
  const params = new URLSearchParams();
  if (contextKey) params.set('context', contextKey);
  if (view) params.set('view', view);
  if (focus) params.set('focus', focus);
  const query = params.toString();
  return query ? `/workspace?${query}` : '/workspace';
}

export function StudioShell({ dataset, derivation, contextKey, view }: StudioShellProps) {
  const router = useRouter();

  const goToFocus = useCallback(
    (focus: string | null) => {
      router.push(studioHref(contextKey, view, focus));
    },
    [contextKey, router, view],
  );

  const focusTitle = derivation.focusedRecord
    ? recordTitle(derivation.focusedRecord)
    : derivation.focusedQueue
      ? derivation.focusedQueue.title
      : 'Choose where to start';

  return (
    <div className="studio-body">
      <div className="studio-masthead">
        <div className="studio-masthead-title">
          <p className="eyebrow"><span className="signal-dot" /> APT-LABS / NETWORK STUDIO</p>
          <h1>Where the work moves.</h1>
        </div>
        <div className="studio-masthead-facts">
          <div>
            <span>ACTIVE CONTEXT</span>
            <strong>{derivation.contextLabel}</strong>
            <small>{dataset.principal.email ?? 'Signed in'}</small>
          </div>
          <div>
            <span>ACTIVE FOCUS</span>
            <strong>{focusTitle}</strong>
            <small>{derivation.nextStep ?? 'Select a record to see what is permitted.'}</small>
          </div>
        </div>
      </div>

      {dataset.principal.localMode && (
        <div className="studio-alert" role="status">
          <CircleAlert aria-hidden="true" size={15} />
          Local development identity. It opens this Studio for this browser only. It is not a verified account and grants no school, crew or publishing permission.
        </div>
      )}

      {dataset.invalidContext && (
        <div className="studio-alert" role="status">
          <CircleAlert aria-hidden="true" size={15} />
          {dataset.principal.configured
            ? 'That context is no longer available to this account. Showing your default verified context.'
            : 'Workspace contexts are unavailable until sign-in is configured. Showing the public preview.'}
        </div>
      )}

      <div className="studio-grid">
        <StudioRadar
          contextKey={contextKey}
          dataset={dataset}
          derivation={derivation}
          onFocus={goToFocus}
          view={view}
        />
        <StudioSurface
          dataset={dataset}
          derivation={derivation}
          onFocus={goToFocus}
        />
        <StudioInspector
          dataset={dataset}
          derivation={derivation}
          onFocus={goToFocus}
        />
      </div>

      <footer className="page-footer">
        <span>APT-LABS / NETWORK STUDIO</span>
        <span>Server permissions decide every action. The Studio only shows what the server returned.</span>
      </footer>
    </div>
  );
}

