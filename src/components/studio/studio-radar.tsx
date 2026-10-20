'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, GraduationCap, Layers3, ScrollText, Search } from 'lucide-react';

import { resolveActions } from '@/lib/workbench/derive';
import {
  recordKey,
  recordStatusLabel,
  recordSubtitle,
  recordTitle,
  sourceStatusText,
  type StudioRecord,
  type StudioRecordKind,
} from '@/lib/workbench/types';
import type { StudioDataset } from '@/lib/workbench/dataset';
import type { StudioDerivation } from '@/lib/workbench/derive';
import type { WorkspaceLane } from '@/lib/workspace';

const lanes: Array<{ key: WorkspaceLane; label: string; hint: string; icon: typeof Layers3 }> = [
  { key: 'assets', label: 'Assets', hint: 'Capital & execution', icon: Layers3 },
  { key: 'commons', label: 'Commons', hint: 'People & opportunity', icon: BriefcaseBusiness },
  { key: 'roll', label: 'Roll', hint: 'Proof & capability', icon: ScrollText },
];

// `?view=` is a scope on the radar, not a page switch. The three lanes keep
// their meaning so existing links and `isWorkspaceLane` stay valid.
const laneKinds: Record<WorkspaceLane, StudioRecordKind[]> = {
  assets: ['asset', 'capital_intent'],
  commons: ['role', 'application'],
  roll: ['roll', 'capability_badge'],
};

const facetLabels: Record<StudioRecordKind, string> = {
  asset: 'Asset',
  role: 'Role',
  application: 'Application',
  roll: 'Roll proof',
  capital_intent: 'Capital intent',
  capability_badge: 'Capability proof',
};

function statusOf(record: StudioRecord): string {
  return recordStatusLabel(record);
}

export function StudioRadar({
  contextKey,
  dataset,
  derivation,
  onFocus,
  view,
}: {
  contextKey: string;
  dataset: StudioDataset;
  derivation: StudioDerivation;
  onFocus: (focus: string | null) => void;
  view: WorkspaceLane;
}) {
  const [query, setQuery] = useState('');
  const [facet, setFacet] = useState<StudioRecordKind | 'all'>('all');

  const kinds = laneKinds[view];
  const scoped = useMemo(
    () => dataset.records.filter(record => kinds.includes(record.kind)),
    [dataset.records, kinds],
  );

  const facets = useMemo(() => {
    const present = new Set(scoped.map(record => record.kind));
    return kinds.filter(kind => present.has(kind));
  }, [kinds, scoped]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return scoped.filter(record => {
      if (facet !== 'all' && record.kind !== facet) return false;
      if (!needle) return true;
      return [recordTitle(record), recordSubtitle(record), statusOf(record)]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [facet, query, scoped]);

  const laneHref = (lane: WorkspaceLane) => {
    const params = new URLSearchParams();
    if (contextKey) params.set('context', contextKey);
    params.set('view', lane);
    // Changing the scope of the radar does not move the focus.
    if (derivation.focus.key) params.set('focus', derivation.focus.key);
    return `/workspace?${params.toString()}`;
  };

  return (
    <aside className="studio-left" aria-label="Workbench navigation and radar">
      <nav className="studio-lanes" aria-label="Radar scope">
        {lanes.map(lane => {
          const Icon = lane.icon;
          return (
            <Link
              aria-current={view === lane.key ? 'page' : undefined}
              className={`studio-lane ${view === lane.key ? 'active' : ''}`}
              href={laneHref(lane.key)}
              key={lane.key}
            >
              <Icon aria-hidden="true" size={15} />
              <span><strong>{lane.label}</strong><small>{lane.hint}</small></span>
            </Link>
          );
        })}
      </nav>

      <section className="studio-panel" aria-labelledby="studio-queues-title">
        <h2 className="studio-panel-title" id="studio-queues-title">Task queues</h2>
        <ul className="studio-queue-list">
          {derivation.queues.map(queue => {
            const active = derivation.focus.key === `queue:${queue.id}`;
            return (
              <li key={queue.id}>
                <button
                  aria-current={active ? 'true' : undefined}
                  className={`studio-queue ${active ? 'active' : ''}`}
                  onClick={() => onFocus(`queue:${queue.id}`)}
                  type="button"
                >
                  <span className="studio-queue-count">{queue.recordKeys.length}</span>
                  <span className="studio-queue-copy">
                    <strong>{queue.title}</strong>
                    <small>{queue.hint}</small>
                  </span>
                </button>
                {queue.recordKeys.length === 0 && (
                  <p className="studio-queue-empty">{queue.emptyTitle}. {queue.emptyReason}</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="studio-panel" aria-labelledby="studio-radar-title">
        <h2 className="studio-panel-title" id="studio-radar-title">Opportunity radar</h2>
        <div className="studio-search">
          <Search aria-hidden="true" size={14} />
          <input
            aria-label="Search records"
            onChange={event => setQuery(event.target.value)}
            placeholder="Search records"
            type="search"
            value={query}
          />
        </div>
        <div className="studio-facets" role="group" aria-label="Filter by record type">
          <button
            aria-pressed={facet === 'all'}
            className={`studio-facet ${facet === 'all' ? 'active' : ''}`}
            onClick={() => setFacet('all')}
            type="button"
          >
            All
          </button>
          {facets.map(kind => (
            <button
              aria-pressed={facet === kind}
              className={`studio-facet ${facet === kind ? 'active' : ''}`}
              key={kind}
              onClick={() => setFacet(kind)}
              type="button"
            >
              {facetLabels[kind]}
            </button>
          ))}
        </div>
        <p className="studio-count">
          {results.length} record{results.length === 1 ? '' : 's'} in the {view} scope
        </p>
        {results.length === 0 ? (
          <div className="studio-empty">
            <p className="eyebrow">NO MATCHING RECORD</p>
            <p>
              {scoped.length === 0
                ? 'This scope holds no records for your account. Switch scope or open a queue.'
                : 'No record in this scope matches that search.'}
            </p>
          </div>
        ) : (
          <ul className="studio-results">
            {results.map(record => {
              const key = recordKey(record.kind, record.id);
              const actions = resolveActions(dataset, record);
              const primary = actions.find(action => action.available);
              return (
                <li key={key}>
                  <button
                    aria-current={derivation.focus.key === key ? 'true' : undefined}
                    className={`studio-result ${derivation.focus.key === key ? 'active' : ''}`}
                    onClick={() => onFocus(key)}
                    type="button"
                  >
                    <span className="studio-result-top">
                      <span className="studio-result-kind">{facetLabels[record.kind]}</span>
                      <span className="studio-result-status">{statusOf(record)}</span>
                    </span>
                    <strong>{recordTitle(record)}</strong>
                    <small>{recordSubtitle(record)}</small>
                    {primary && <span className="studio-result-action">{primary.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {view === 'commons' && (
        <section className="studio-panel" aria-labelledby="studio-commons-title">
          <h2 className="studio-panel-title" id="studio-commons-title">Commons activity</h2>
          {dataset.sources.commonsPosts.status === 'unavailable' ? (
            <p className="studio-queue-empty">{dataset.sources.commonsPosts.error}</p>
          ) : dataset.sources.commonsPosts.error ? (
            <p className="studio-source-errors">{dataset.sources.commonsPosts.error}</p>
          ) : dataset.sources.commonsPosts.data.length === 0 ? (
            <p className="studio-queue-empty">There are no published Commons updates yet. Asset-linked open roles remain available in the work board.</p>
          ) : (
            <ul className="studio-commons-feed">
              {dataset.sources.commonsPosts.data.slice(0, 5).map(post => (
                <li key={post.id}>
                  <span className="studio-commons-meta">
                    {post.post_kind === 'poll' ? 'ADVISORY POLL' : 'FIELD NOTE'}
                  </span>
                  <Link href={`/commons/${post.id}`}>{post.title}</Link>
                  <small>{post.author_name}</small>
                </li>
              ))}
            </ul>
          )}
          <Link className="studio-quick-link" href="/commons">
            <ScrollText aria-hidden="true" size={14} />
            <span>Commons archive<small>Moderated field notes</small></span>
            <ArrowUpRight aria-hidden="true" size={13} />
          </Link>
        </section>
      )}

      <section className="studio-panel" aria-labelledby="studio-sources-title">
        <h2 className="studio-panel-title" id="studio-sources-title">Data sources</h2>
        <ul className="studio-source-list">
          {Object.entries(dataset.sources).map(([key, source]) => (
            <li key={key}>
              <span className={`studio-source-dot studio-source-${source.status}`} aria-hidden="true" />
              <span className="studio-source-copy">
                <strong>{source.label}</strong>
                <small>{sourceStatusText(source.status)}</small>
              </span>
            </li>
          ))}
        </ul>
        {Object.values(dataset.sources).some(source => source.error) && (
          <ul className="studio-source-errors">
            {Object.values(dataset.sources)
              .filter(source => source.error)
              .map(source => (
                <li key={source.label}>{source.error}</li>
              ))}
          </ul>
        )}
      </section>

      <section className="studio-panel" aria-labelledby="studio-quick-title">
        <h2 className="studio-panel-title" id="studio-quick-title">Quick access</h2>
        <Link className="studio-quick-link" href="/commons/opportunities">
          <BriefcaseBusiness aria-hidden="true" size={14} />
          <span>Open roles<small>Asset-linked work</small></span>
          <ArrowUpRight aria-hidden="true" size={13} />
        </Link>
        <Link className="studio-quick-link" href="/tenders/school-console">
          <GraduationCap aria-hidden="true" size={14} />
          <span>School Console Asset<small>Asset 001 · local utility</small></span>
          <ArrowUpRight aria-hidden="true" size={13} />
        </Link>
        <Link className="studio-quick-link" href="/tenders">
          <Layers3 aria-hidden="true" size={14} />
          <span>Public Asset register<small>Published infrastructure</small></span>
          <ArrowRight aria-hidden="true" size={13} />
        </Link>
      </section>
    </aside>
  );
}
