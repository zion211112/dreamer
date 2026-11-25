/**
 * @apt-labs/features/workspace/overview — OverviewComponent
 *
 * Workspace home: live operational board. Dense table view (Direction 3:
 * The Desk) as default, with Direction 2 (The Floor) relationship graph
 * available via Inspector on selection.
 * Structural Emergence.
 */
import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FAMILY,
  EVIDENCE_STANDING,
  EVIDENCE_STANDING_LABELS,
  CANONICAL_DISTINCTIONS,
  RELATIONSHIP_KIND,
} from '@apt-labs/ontology';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="ov" data-module="overview">
      <div class="ov-pagehead">
        <h1 class="ov-h1">Your capability record</h1>
        <p class="ov-sub">
          This local demo has no connected personal profile. Claims, evidence, and assessment remain distinct, and participation does not depend on having a credential.
        </p>

        <div class="ov-actions">
          <a class="ov-btn ov-btn--primary" [routerLink]="['/workspace', 'commons']">Explore Commons</a>
          <a class="ov-btn ov-btn--quiet" [routerLink]="['/workspace', 'network', 'capabilities']">Open capability reference →</a>
        </div>
      </div>

      <div class="ov-metrics" aria-label="Capability record status">
        <div class="ov-metric ov-metric--teal">
          <div class="ov-metric-label">Claims recorded</div>
          <div class="ov-metric-value">{{ capabilityCount() }}</div>
          <div class="ov-metric-unit">not a score</div>
        </div>
        <div class="ov-metric">
          <div class="ov-metric-label">Evidence references</div>
          <div class="ov-metric-value">{{ evidenceCount() }}</div>
          <div class="ov-metric-unit">none recorded</div>
        </div>
        <div class="ov-metric">
          <div class="ov-metric-label">Assessment</div>
          <div class="ov-metric-value">Not assessed</div>
          <div class="ov-metric-unit">no assessor recorded</div>
        </div>
      </div>

      <section class="ov-table-wrap" aria-labelledby="ov-capabilities-title">
        <h2 id="ov-capabilities-title" class="ov-section-title">Your capabilities</h2>
        <table class="ov-table">
          <caption class="ov-sr-only">Your capability claims and attached evidence</caption>
          <thead>
            <tr>
              <th class="ov-th" scope="col">Capability claim</th>
              <th class="ov-th ov-th--left" scope="col">Evidence</th>
              <th class="ov-th" scope="col">Standing</th>
              <th class="ov-th" scope="col">Visibility</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="4" class="ov-empty">No capability claims or evidence are recorded in this local demo.</td></tr>
          </tbody>
        </table>
      </section>

      <div class="ov-moves">
        @for (m of moves(); track m.to) {
          <a [routerLink]="m.to" class="ov-move">
            <span class="ov-move-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="m.icon" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <span class="ov-move-text">
              <span class="ov-move-verb">{{ m.verb }}</span>
              <span class="ov-move-consequence">{{ m.consequence }}</span>
            </span>
            <span class="ov-move-go" aria-hidden="true">→</span>
          </a>
        }
      </div>

      <details class="ov-ref">
        <summary class="ov-ref-summary">
          <h2 class="ov-ref-title">The reference</h2>
          <span class="ov-ref-count">{{ familyCount }} families · {{ relationKindCount }} relation kinds · {{ standingStates.length }} standings · {{ canonicalDistinctions.length }} distinctions</span>
          <span class="ov-ref-caret" aria-hidden="true">▸</span>
        </summary>

        <div class="ov-ref-body">
          <div class="ov-ref-tools">
            <div class="ov-search">
              <label class="ov-search-label" for="reference-filter">Filter the reference</label>
              <svg class="ov-search-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 1-4.8 13.3L3 19.1 4.4 20.5l2.8-2.8A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" /></svg>
              <input id="reference-filter" class="ov-search-input" type="search" placeholder="Families, relations, distinctions…" [value]="query()" (input)="query.set($any($event.target).value)" />
            </div>
            <a [routerLink]="['/workspace', 'intelligence']" class="ov-quiet">Open Intelligence →</a>
          </div>

          @if (noMatches()) {
            <p class="ov-empty">Nothing in the reference matches “{{ query() }}”. Clear the field to see the full structure.</p>
          }

          @for (g of visibleGroups(); track g.key) {
            <section [attr.id]="'group-' + g.key" class="ov-group" [attr.aria-labelledby]="'group-' + g.key + '-title'">
              <div class="ov-group-head">
                <h3 [attr.id]="'group-' + g.key + '-title'" class="ov-group-title">{{ g.label }}</h3>
                <span class="ov-group-count">{{ g.families.length }} families</span>
              </div>
              <p class="ov-group-note">{{ g.note }}</p>
              <ul class="ov-cards">
                @for (f of g.families; track f) {
                  <li class="ov-card" [style]="'--family-accent:' + familyAccent(f)">
                    <div class="ov-card-head">
                      <span class="ov-card-icon" aria-hidden="true">{{ familyIcon(f) }}</span>
                      <h4 class="ov-card-name">{{ familyLabels[f] }}</h4>
                    </div>
                    <p class="ov-card-rellead" aria-hidden="true">{{ (relations[f] ?? []).length }} defined relations</p>
                    <ul class="ov-chips">
                      @for (r of (relations[f] ?? []); track r) {
                        <li class="ov-chip">{{ r.replace(/_/g, ' ') }}</li>
                      }
                    </ul>
                  </li>
                }
              </ul>
            </section>
          }

          <section id="context" class="ov-context" aria-labelledby="context-title">
            <div class="ov-context-lead">
              <span class="ov-context-icon" aria-hidden="true">{{ familyIcon(contextFamily) }}</span>
              <div>
                <h3 id="context-title" class="ov-context-title">Context — {{ familyLabels[contextFamily] }}</h3>
                <p class="ov-context-note">
                  Not a fourth column. Every actor, resource and commitment above is situated somewhere,
                  and that situation is recorded rather than assumed.
                </p>
              </div>
            </div>
            <ul class="ov-chips">
              @for (r of (relations[contextFamily] ?? []); track r) {
                <li class="ov-chip">{{ r.replace(/_/g, ' ') }}</li>
              }
            </ul>
          </section>

          <section id="distinctions" class="ov-panel" aria-labelledby="distinctions-title">
            <div class="ov-panel-head">
              <h3 id="distinctions-title" class="ov-panel-title">What we refuse to collapse</h3>
              <span class="ov-panel-count">{{ visibleDistinctions().length }}</span>
            </div>
            <p class="ov-panel-note">
              Named distinctions are enforced in schema and surfaced in the interface. An interface
              that merges any two of these has stopped representing the domain.
            </p>
            <ul class="ov-distinctions">
              @for (d of visibleDistinctions(); track d) {
                <li class="ov-distinction">{{ d }}</li>
              }
            </ul>
          </section>

          <section id="standing" class="ov-panel" aria-labelledby="standing-title">
            <div class="ov-panel-head">
              <h3 id="standing-title" class="ov-panel-title">Standing, not a score</h3>
              <span class="ov-panel-count">{{ standingStates.length }}</span>
            </div>
            <p class="ov-panel-note">
              Seven states, held apart on purpose. They are shown side by side and never averaged into a
              single number, because a number gets quoted and the disagreement is the signal.
            </p>
            <ul class="ov-standing">
              @for (s of standingStates; track s) {
                <li class="ov-standing-item" [style]="'--standing-accent:' + standingAccent(s)">
                  <span class="ov-standing-swatch" aria-hidden="true"></span>
                  <span class="ov-standing-label">{{ standingLabels[s] }}</span>
                  <span class="ov-standing-meaning">{{ standingMeaning[s] }}</span>
                </li>
              }
            </ul>
          </section>
        </div>
      </details>
    </div>
  `,
  styles: [
    `
    :host { display: block; }
    .ov {
      --ov-text-muted: color-mix(in srgb, var(--apt-text-body) 46%, var(--apt-text-muted));
      --ov-text-dim: color-mix(in srgb, var(--apt-text-body) 58%, var(--apt-text-dim));
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .ov-ref-title {
      margin: 0;
      color: var(--apt-text-strong);
      font: var(--apt-weight-semibold) var(--apt-size-title)/var(--apt-line-tight) var(--apt-font-serif);
    }
    .ov-search {
      display: flex;
      align-items: center;
      gap: var(--apt-space-3);
      min-width: 0;
    }
    .ov-search-label {
      flex: 0 0 auto;
      color: var(--apt-text-body);
      font-size: var(--apt-size-sm);
      font-weight: var(--apt-weight-medium);
    }
    .ov-search-icon { width: 18px; height: 18px; flex: 0 0 auto; color: var(--apt-text-muted); }
    .ov-search-input {
      flex: 1 1 auto;
      min-width: 0;
      padding: var(--apt-space-2) var(--apt-space-3);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-input-radius);
      background: var(--apt-input-bg);
      color: var(--apt-text-body);
      font: inherit;
    }

    .ov-pagehead {
      display: flex;
      flex-direction: column;
      gap: var(--apt-space-3);
      margin-bottom: var(--apt-space-6);
    }
    .ov-h1 {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-size-display);
      font-weight: var(--apt-weight-semibold);
      color: var(--apt-text-strong);
      margin: 0 0 var(--apt-space-3);
      line-height: 1.05;
      letter-spacing: -0.02em;
    }
    .ov-sub {
      font-size: var(--apt-size-body);
      color: var(--ov-text-muted);
      margin: 0;
      max-width: 70ch;
      line-height: var(--apt-line-relaxed);
    }
    .ov-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--apt-space-3);
      margin-top: var(--apt-space-4);
    }

    .ov-btn {
      display: inline-flex;
      text-decoration: none;
      align-items: center;
      gap: var(--apt-space-2);
      padding: var(--apt-button-padding);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-button-font-size);
      font-weight: var(--apt-button-font-weight);
      font-family: inherit;
      cursor: pointer;
    }
    .ov-btn:hover { border-color: var(--apt-accent); }
    .ov-btn--primary { background: var(--apt-accent); color: var(--apt-action-on-accent); border-color: var(--apt-accent); }
    .ov-btn--primary:hover { background: color-mix(in srgb, var(--apt-accent) 90%, var(--apt-surface-default)); }
    .ov-btn--quiet { background: transparent; border-color: transparent; color: var(--ov-text-muted); }
    .ov-btn--quiet:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); }
    .ov-btn--sm { padding: var(--apt-space-1) var(--apt-space-3); font-size: var(--apt-size-sm); }

    .ov-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
      gap: var(--apt-space-4);
      margin-bottom: var(--apt-space-8);
    }
    @media (min-width: 761px) and (max-width: 900px) {
      .ov-metrics { grid-template-columns: 1fr; }
    }
    .ov-metric {
      background: var(--apt-surface-page);
      padding: var(--apt-space-5) var(--apt-space-6);
      border-radius: var(--apt-radius-md);
      border: 1px solid var(--apt-border);
    }
    .ov-metric--teal { border-color: color-mix(in srgb, var(--apt-text-info) 35%, var(--apt-border)); }
    .ov-metric-label {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ov-text-dim);
      display: block;
      margin-bottom: var(--apt-space-2);
    }
    .ov-metric-value {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-size-display);
      font-weight: var(--apt-weight-semibold);
      color: var(--apt-text-strong);
      line-height: 1;
      letter-spacing: -0.01em;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .ov-metric-unit {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-body);
      letter-spacing: 0.04em;
      color: var(--ov-text-muted);
      margin-top: var(--apt-space-1);
    }

    .ov-section-title { margin: 0; padding: var(--apt-space-5) var(--apt-space-6) 0; color: var(--apt-text-strong); font: var(--apt-weight-semibold) var(--apt-size-title)/var(--apt-line-tight) var(--apt-font-serif); }
    .ov-table-wrap {
      overflow-x: auto;
      max-width: 100%;
      overscroll-behavior-x: contain;
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-md);
      background: var(--apt-surface-page);
      margin-bottom: var(--apt-space-8);
    }
    .ov-table { width: 100%; min-width: 560px; table-layout: fixed; border-collapse: collapse; font-size: var(--apt-size-body); }
    .ov-table th:nth-child(1), .ov-table td:nth-child(1) { width: 38%; }
    .ov-table th:nth-child(2), .ov-table td:nth-child(2) { width: 30%; }
    .ov-table th:nth-child(3), .ov-table td:nth-child(3) { width: 16%; }
    .ov-table th:nth-child(4), .ov-table td:nth-child(4) { width: 16%; }
    .ov-table th:first-child, .ov-table td:first-child {
      position: sticky;
      left: 0;
      z-index: 1;
    }
    .ov-table th:first-child { background: var(--apt-surface-raised); }
    .ov-table td:first-child { background: var(--apt-surface-page); }
    .ov-tr:hover .ov-td:first-child { background: var(--apt-surface-raised); }
    .ov-tr--selected .ov-td:first-child { background: color-mix(in srgb, var(--apt-accent) 8%, var(--apt-surface-page)); }
    .ov-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .ov-th {
      text-align: left;
      padding: var(--apt-space-4) var(--apt-space-5);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ov-text-dim);
      border-bottom: 1px solid var(--apt-border);
      font-weight: var(--apt-weight-medium);
      white-space: nowrap;
    }
    .ov-th--left { text-align: left; }
    .ov-th--actions { text-align: center; }
    .ov-tr { border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background var(--apt-motion-fast); }
    .ov-tr:hover { background: var(--apt-surface-raised); }
    .ov-tr--selected { background: color-mix(in srgb, var(--apt-accent) 8%, transparent); border-left: 3px solid var(--apt-accent); }
    .ov-td {
      padding: var(--apt-space-4) var(--apt-space-5);
      border-bottom: 1px solid #f3f4f6;
      color: var(--apt-text-body);
      vertical-align: middle;
    }
    .ov-td:last-child { border-bottom: none; }
    .ov-td--name { font-weight: var(--apt-weight-medium); color: var(--apt-text-strong); }
    .ov-td--actions { text-align: center; white-space: nowrap; }
    .ov-td--actions .ov-btn + .ov-btn { margin-left: var(--apt-space-1); }
    .ov-type-chip {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--ov-text-dim);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      padding: 1px 6px;
      white-space: nowrap;
      display: inline-block;
      margin-bottom: var(--apt-space-2);
    }
    .ov-name {
      font-size: var(--apt-size-title);
      font-weight: var(--apt-weight-semibold);
      color: var(--apt-text-strong);
      letter-spacing: -0.01em;
      display: block;
    }
    .ov-status {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 7px;
      border-radius: var(--apt-button-radius);
      border: 1px solid var(--apt-border);
      white-space: nowrap;
    }
    .ov-status.is-open { background: var(--apt-surface-raised); color: var(--ov-text-muted); }
    .ov-status.is-committed { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .ov-status.is-fulfilled { background: var(--apt-surface-success); color: var(--apt-text-success); }

    .ov-moves {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--apt-space-4);
      margin-bottom: var(--apt-space-4);
    }
    .ov-move {
      display: flex;
      align-items: flex-start;
      gap: var(--apt-space-4);
      padding: var(--apt-space-6);
      background: var(--apt-surface-page);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-md);
      text-decoration: none;
      color: var(--apt-text-body);
    }
    .ov-move:hover { border-color: color-mix(in srgb, var(--apt-accent) 40%, var(--apt-border)); box-shadow: var(--apt-shadow-1); transform: translateY(-1px); }
    .ov-move-icon { width: 24px; height: 24px; flex: none; color: var(--apt-accent); }
    .ov-move-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    .ov-move-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .ov-move-verb { font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; }
    .ov-move-consequence { font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--ov-text-muted); }
    .ov-move-go { margin-left: auto; align-self: center; flex: none; color: var(--apt-accent); font-size: var(--apt-size-title); }

    @media (max-width: 760px) {
      .ov-moves { grid-template-columns: 1fr; }
      .ov-table-wrap { font-size: var(--apt-size-sm); }
      .ov-table { font-size: var(--apt-size-sm); }
      .ov-th, .ov-td { padding: var(--apt-space-3) var(--apt-space-4); }
      .ov-btn { min-height: 44px; }
    }
    `,
  ],
})
export class OverviewComponent {
  readonly capabilityCount = computed(() => 0);
  readonly evidenceCount = computed(() => 0);

  readonly moves = computed(() => [
    { to: '/workspace/network/capabilities', verb: 'Explore capability claims', consequence: 'See how claimed capability differs from evidence and independent assessment.', icon: 'M12 5v14M5 12h14' },
    { to: '/workspace/commons', verb: 'Explore opportunities', consequence: 'Browse published needs and decide whether one fits your interests.', icon: 'M4 6h16M4 12h10M4 18h7' },
    { to: '/workspace/workbench', verb: 'Open the workbench', consequence: 'Record work and deliverables when you are part of an undertaking.', icon: 'M3 10h18M3 10v10a4 4 0 004 4h10a4 4 0 004-4V10' },
    { to: '/workspace/records', verb: 'Review the record', consequence: 'See attributable records as they are created. Nothing is pre-filled here.', icon: 'M7 4h7l4 4v12H7zM14 4v4h4M10 12h5' },
  ] as const);

  readonly query = signal('');

  readonly familyCount = Object.keys(FAMILY).length;
  readonly relationKindCount = Object.keys(RELATIONSHIP_KIND).length;
  readonly standingStates = Object.values(EVIDENCE_STANDING);
  readonly standingLabels: Record<string, string> = EVIDENCE_STANDING_LABELS as unknown as Record<string, string>;
  readonly canonicalDistinctions = CANONICAL_DISTINCTIONS;

  readonly standingMeaning: Record<string, string> = {
    [EVIDENCE_STANDING.UNASSESSED]: 'Recorded, nobody has looked yet.',
    [EVIDENCE_STANDING.REPORTED]: 'Someone said so. No artefact behind it.',
    [EVIDENCE_STANDING.SUPPORTED]: 'Artefacts exist and were checked.',
    [EVIDENCE_STANDING.VERIFIED]: 'An authorised party confirmed it.',
    [EVIDENCE_STANDING.DISPUTED]: 'Challenged, and not yet resolved.',
    [EVIDENCE_STANDING.REJECTED]: 'Challenged, and found wanting.',
    [EVIDENCE_STANDING.EXPIRED]: 'Was true. The conditions moved.',
  };

  readonly familyLabels: Record<string, string> = {
    ACTOR: 'Actor', CAPABILITY: 'Capability', RESOURCE: 'Resource', PLACE: 'Place', INTENTION: 'Intention',
    COMMITMENT: 'Commitment', WORK: 'Work', ACTIVITY: 'Activity', EVENT: 'Event', OUTPUT_OUTCOME: 'Output/Outcome',
    EXCHANGE: 'Exchange', VALUE: 'Value', EVIDENCE: 'Evidence', KNOWLEDGE: 'Knowledge', GOVERNANCE: 'Governance',
  };

  readonly visibleGroups = computed(() => {
    const groups: { key: string; label: string; accent: string; families: string[]; note: string }[] = [
      { key: 'core', label: 'Operational core', accent: 'var(--apt-group-core)', families: ['ACTOR','CAPABILITY','RESOURCE','INTENTION','COMMITMENT','WORK'], note: 'Who acts, what they can do, what they hold, what they want, what they promise, what is done.' },
      { key: 'continuity', label: 'Continuity & learning', accent: 'var(--apt-group-continuity)', families: ['ACTIVITY','EVENT','OUTPUT_OUTCOME','EVIDENCE','KNOWLEDGE'], note: 'How work is carried out, what results, what can be shown, what is retained.' },
      { key: 'value', label: 'Value & legitimacy', accent: 'var(--apt-group-value)', families: ['EXCHANGE','VALUE','GOVERNANCE','PLACE'], note: 'What circulates between parties, and who had the standing to authorise it.' },
    ];
    const q = this.query();
    if (!q) return groups;
    const hay = (s: string[]) => s.join(' ').toLowerCase();
    return groups.map((g) => ({ ...g, families: g.families.filter((f) => hay([this.familyLabels[f] ?? f, f].concat(this.relations[f] ?? [])).includes(q)) })).filter((g) => g.families.length > 0);
  });

  readonly visibleDistinctions = computed(() => this.canonicalDistinctions.filter((d) => !this.query() || d.toLowerCase().includes(this.query())));

  readonly noMatches = computed(() => this.query().length > 0 && this.visibleGroups().length === 0 && this.visibleDistinctions().length === 0);

  private readonly relations: Record<string, string[]> = {
    ACTOR: ['AFFILIATED_WITH','ACTS_ON_BEHALF_OF'], CAPABILITY: ['HOLDS_CAPABILITY','OFFERS_CAPACITY','OPERATES'],
    RESOURCE: ['CONTROLS_RESOURCE','CUSTODIES','REQUIRES'], PLACE: ['LOCATED_AT'], INTENTION: ['RESPONDS_TO','DERIVED_FROM'],
    COMMITMENT: ['COMMITTED_TO','AUTHORIZED_BY','FULFILLS'], WORK: ['ASSIGNED_TO','USES','PRODUCES'],
    ACTIVITY: ['DEPENDS_ON','USES'], EVENT: ['OCCURS_IN','TIMES','TRIGGERS'],
    OUTPUT_OUTCOME: ['PRODUCES','DERIVED_FROM'], EXCHANGE: ['SETTLES','FUNDS'],
    VALUE: ['VALUED_AT','ALLOCATES','RECONCILES'],
    EVIDENCE: ['SUPPORTED_BY','VERIFIED_BY','ATTESTES'], KNOWLEDGE: ['DERIVED_FROM','CONTRIBUTES_TO'], GOVERNANCE: ['GOVERNED_BY','AUTHORIZED_BY'],
  };
  readonly contextFamily = 'PLACE';

  readonly familyIcon = (f: string) => {
    const m: Record<string, string> = { ACTOR:'A', CAPABILITY:'C', RESOURCE:'R', PLACE:'P', INTENTION:'I', COMMITMENT:'M', WORK:'W', ACTIVITY:'Y', EVENT:'T', OUTPUT_OUTCOME:'O', EXCHANGE:'X', VALUE:'$' , EVIDENCE:'E', KNOWLEDGE:'K', GOVERNANCE:'G' };
    return m[f] ?? '?';
  };

  readonly familyAccent = (f: string) => `var(--apt-family-${f.toLowerCase().replace('_outcome', '')}, var(--apt-module-accent))`;

  readonly standingAccent = (s: string) => `var(--apt-standing-${s}, var(--apt-module-accent))`;

  readonly inFlight = computed(() => []);

}
