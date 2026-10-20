'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { layoutRelations } from '@/lib/workbench/derive';
import type { StudioDerivation } from '@/lib/workbench/derive';
import type { RelationLink } from '@/lib/workbench/types';

// The graph renderer is loaded only when it is asked for. The model and the
// list rendering never import it, so the accessible equivalent of the
// relations is always available and a renderer change touches one file.
const StudioRelationsGraph = dynamic(
  () => import('./studio-relations-graph').then(module => module.StudioRelationsGraph),
  { ssr: false, loading: () => <p className="studio-fine-print">Preparing the relations canvas…</p> },
);

export function StudioRelations({
  derivation,
  onFocus,
}: {
  derivation: StudioDerivation;
  onFocus: (focus: string | null) => void;
}) {
  const [mode, setMode] = useState<'graph' | 'list'>('graph');
  const links = derivation.relations.links;
  const positions = layoutRelations(derivation.relations);

  return (
    <div className="studio-relations">
      <div className="studio-relations-head">
        <p className="eyebrow">RELATIONS / PERSISTED LINKS ONLY</p>
        <div className="studio-relations-tabs" role="tablist" aria-label="Relations view">
          <button
            aria-selected={mode === 'graph'}
            className={mode === 'graph' ? 'active' : ''}
            onClick={() => setMode('graph')}
            role="tab"
            type="button"
          >
            Canvas
          </button>
          <button
            aria-selected={mode === 'list'}
            className={mode === 'list' ? 'active' : ''}
            onClick={() => setMode('list')}
            role="tab"
            type="button"
          >
            List
          </button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="studio-empty">
          <p className="eyebrow">NO PERSISTED RELATION</p>
          <p>
            This record has no stored relationship the server returned to you. The Studio shows persisted links only: a computed value never becomes an edge, and a link to another page is a link, not a relation.
          </p>
        </div>
      ) : mode === 'graph' ? (
        <StudioRelationsGraph
          links={links}
          onFocus={onFocus}
          positions={positions}
        />
      ) : (
        <RelationList links={links} onFocus={onFocus} />
      )}
    </div>
  );
}

function RelationList({
  links,
  onFocus,
}: {
  links: RelationLink[];
  onFocus: (focus: string | null) => void;
}) {
  return (
    <ul className="studio-relation-list">
      {links.map(link => {
        const selectable = link.node.kind !== 'blueprint' && link.node.kind !== 'crew';
        return (
          <li key={link.edge.id}>
            <span className="studio-relation-label">{link.edge.label}</span>
            {selectable ? (
              <button onClick={() => onFocus(link.node.key)} type="button">
                <strong>{link.node.title}</strong>
                <small>{link.node.subtitle}</small>
              </button>
            ) : (
              <span className="studio-relation-static">
                <strong>{link.node.title}</strong>
                <small>{link.node.subtitle}</small>
              </span>
            )}
            <span className="studio-relation-basis">
              {link.edge.category} · {link.edge.basis}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

