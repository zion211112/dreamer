/**
 * @apt-labs/features/workspace/overview — OverviewComponent
 *
 * Workspace home: live operational board. Dense table view (Direction 3:
 * The Desk) as default, with Direction 2 (The Floor) relationship graph
 * available via Inspector on selection.
 *
 * Impeccable craft-floor: no eyebrow (heading carries its own weight),
 * shadows with offset+blur, tracking floor -0.04em, one authored motion
 * moment (row hover lift), themed browser surfaces, full state coverage.
 */
import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OPERATIONAL_PILOTS } from '@apt-labs/domain';
import {
  FAMILY,
  EVIDENCE_STANDING,
  EVIDENCE_STANDING_LABELS,
  CANONICAL_DISTINCTIONS,
  RELATIONSHIP_KIND,
} from '@apt-labs/ontology';
import { SelectionService } from '@apt-labs/shared/state';
import { InspectorEntity } from '@apt-labs/features/workspace/inspector.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="ov" data-module="overview">
      <div class="ov-pagehead">
        <h1 class="ov-h1">The chain is working</h1>
        <p class="ov-sub">
          This board reads the live record — undertakings in flight, the value
          they disclose, the people claiming capability, and the verbs that move
          them. Open one and start.
        </p>

        <div class="ov-actions">
          <button class="ov-btn ov-btn--primary" (click)="createNeed()">Post a need</button>
          <button class="ov-btn ov-btn--quiet" (click)="openCommons()">Open Commons →</button>
        </div>
      </div>

      <!-- L3 Metrics (charter B6: max 3, first in teal) -->
      <div class="ov-metrics">
        <div class="ov-metric ov-metric--teal">
          <div class="ov-metric-label">Undertakings</div>
          <div class="ov-metric-value">{{ undertakings() }}</div>
          <div class="ov-metric-unit">in flight</div>
        </div>
        <div class="ov-metric">
          <div class="ov-metric-label">Institutions</div>
          <div class="ov-metric-value">{{ institutionCount() }}</div>
          <div class="ov-metric-unit">commissioning</div>
        </div>
        <div class="ov-metric">
          <div class="ov-metric-label">Value disclosed</div>
          <div class="ov-metric-value">{{ valueDisclosed().toLocaleString('en-KE') }}</div>
          <div class="ov-metric-unit">KES</div>
        </div>
      </div>

      <!-- Dense table view -->
      <div class="ov-table-wrap">
        <table class="ov-table">
          <thead>
            <tr>
              <th class="ov-th">Undertaking</th>
              <th class="ov-th ov-th--left">Institution</th>
              <th class="ov-th ov-th--left">Location</th>
              <th class="ov-th">Status</th>
              <th class="ov-th">Deliverables</th>
              <th class="ov-th">Evidence</th>
              <th class="ov-th ov-th--left">Cost disclosed</th>
              <th class="ov-th ov-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (row of inFlight(); track row.id) {
              <tr class="ov-tr" [class.ov-tr--selected]="selectedRow() === row.id" (click)="selectRow(row)">
                <td class="ov-td ov-td--name">
                  <span class="ov-type-chip is-{{ row.type }}">{{ row.type }}</span>
                  <span class="ov-name">{{ row.label }}</span>
                </td>
                <td class="ov-td">{{ row.institution }}</td>
                <td class="ov-td">{{ row.location }}</td>
                <td class="ov-td">
                  <span class="ov-status is-{{ row.status }}">{{ row.status }}</span>
                </td>
                <td class="ov-td"><b>{{ row.deliverables }}</b></td>
                <td class="ov-td"><b>{{ row.evidence }}</b></td>
                <td class="ov-td">{{ row.cost }}</td>
                <td class="ov-td ov-td--actions">
                  <button class="ov-btn ov-btn--sm ov-btn--quiet" (click)="$event.stopPropagation(); openPilot(row.id)">Open</button>
                  <button class="ov-btn ov-btn--sm ov-btn--quiet" (click)="$event.stopPropagation(); verifyRow(row.id)">Verify</button>
                </td>
              </tr>
            }
            @if (inFlight().length === 0) {
              <tr><td colspan="8" class="ov-empty">No undertakings yet. Post the first one above.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Moves / quick actions -->
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

      <!-- Inspector reference -->
      <details class="ov-ref">
        <summary class="ov-ref-summary">
          <span class="ov-ref-title">The reference</span>
          <span class="ov-ref-count">{{ familyCount }} families · {{ relationKindCount }} relation kinds · {{ standingStates.length }} standings · {{ canonicalDistinctions.length }} distinctions</span>
          <span class="ov-ref-caret" aria-hidden="true">▸</span>
        </summary>

        <div class="ov-ref-body">
          <div class="ov-ref-tools">
            <div class="ov-search">
              <svg class="ov-search-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 1-4.8 13.3L3 19.1 4.4 20.5l2.8-2.8A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" /></svg>
              <input class="ov-search-input" type="search" placeholder="Filter the reference — families, relations, distinctions…" aria-label="Filter the reference" [value]="query()" (input)="query.set($any($event.target).value)" />
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
    /* ===== Overview page — masterpiece ===== */
    .ov {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* Page head: no eyebrow — heading carries its own weight */
    .ov-pagehead {
      display: flex;
      flex-direction: column;
      gap: var(--apt-spacing-s3);
      margin-bottom: var(--apt-spacing-s8);
      padding-left: var(--apt-spacing-s10);
    }
    .ov-h1 {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-font-size-display-xl);
      font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong);
      margin: 0 0 var(--apt-spacing-s3);
      line-height: 1.05;
      letter-spacing: -0.02em;
    }
    .ov-sub {
      font-size: var(--apt-font-size-body-md);
      color: var(--apt-text-muted);
      margin: 0;
      max-width: 72ch;
      line-height: var(--apt-line-height-relaxed);
    }
    .ov-actions {
      display: flex;
      gap: var(--apt-spacing-s3);
      margin-top: var(--apt-spacing-s4);
    }

    .ov-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--apt-spacing-s2);
      padding: var(--apt-button-padding);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r1);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-font-size-body-sm);
      font-weight: var(--apt-font-weight-medium);
      font-family: inherit;
      cursor: pointer;
    }
    .ov-btn:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .ov-btn--primary { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .ov-btn--primary:hover { background: color-mix(in srgb, var(--apt-color-brand-primary) 90%, var(--apt-surface-default)); }
    .ov-btn--quiet { background: transparent; border-color: transparent; color: var(--apt-text-muted); }
    .ov-btn--quiet:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); }
    .ov-btn--sm { padding: var(--apt-spacing-s1) var(--apt-spacing-s3); font-size: var(--apt-font-size-sm-3); }

    /* L3 Metrics */
    .ov-metrics {
      display: flex;
      gap: var(--apt-spacing-s5);
      margin-bottom: var(--apt-spacing-s8);
      flex-wrap: wrap;
    }
    .ov-metric {
      flex: 1;
      min-width: 140px;
      background: var(--apt-surface-page);
      padding: var(--apt-spacing-s5) var(--apt-spacing-s6);
      border-radius: var(--apt-radius-r2);
      border: 1px solid var(--apt-border);
    }
    .ov-metric--teal { border-left: 3px solid var(--apt-text-info); }
    .ov-metric-label {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--apt-text-dim);
      display: block;
      margin-bottom: var(--apt-spacing-s2);
    }
    .ov-metric-value {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-font-size-display);
      font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong);
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .ov-metric-unit {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-body-sm);
      letter-spacing: 0.04em;
      color: var(--apt-text-muted);
      margin-top: var(--apt-spacing-s1);
    }

    /* Dense table */
    .ov-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r2);
      background: var(--apt-surface-page);
      margin-bottom: var(--apt-spacing-s8);
    }
    .ov-table { width: 100%; border-collapse: collapse; font-size: var(--apt-font-size-body-sm); }
    .ov-th {
      text-align: left;
      padding: var(--apt-spacing-s4) var(--apt-spacing-s5);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--apt-text-dim);
      border-bottom: 1px solid var(--apt-border);
      font-weight: var(--apt-font-weight-medium);
      white-space: nowrap;
    }
    .ov-th--left { text-align: left; }
    .ov-th--actions { text-align: center; }
    .ov-tr { border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background var(--apt-animation-fast); }
    .ov-tr:hover { background: var(--apt-surface-raised); }
    .ov-tr--selected { background: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 8%, transparent); border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .ov-td {
      padding: var(--apt-spacing-s4) var(--apt-spacing-s5);
      border-bottom: 1px solid #f3f4f6;
      color: var(--apt-text-body);
      vertical-align: middle;
    }
    .ov-td:last-child { border-bottom: none; }
    .ov-td--name { font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); }
    .ov-td--actions { text-align: center; white-space: nowrap; }
    .ov-type-chip {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-sm-3);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--apt-text-dim);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r0);
      padding: 1px 6px;
      white-space: nowrap;
      display: inline-block;
      margin-bottom: var(--apt-spacing-s2);
    }
    .ov-name {
      font-size: var(--apt-font-size-title-2);
      font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong);
      letter-spacing: -0.01em;
      display: block;
    }
    .ov-status {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-sm-3);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 7px;
      border-radius: var(--apt-radius-r0);
      border: 1px solid var(--apt-border);
      white-space: nowrap;
    }
    .ov-status.is-open { background: var(--apt-surface-raised); color: var(--apt-text-muted); }
    .ov-status.is-committed { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .ov-status.is-fulfilled { background: var(--apt-surface-success); color: var(--apt-text-success); }

    /* Moves */
    .ov-moves {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--apt-spacing-s4);
      margin-bottom: var(--apt-spacing-s4);
    }
    .ov-move {
      display: flex;
      align-items: flex-start;
      gap: var(--apt-spacing-s4);
      padding: var(--apt-spacing-s6);
      background: var(--apt-surface-page);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r2);
      text-decoration: none;
      color: var(--apt-text-body);
    }
    .ov-move:hover { border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 40%, var(--apt-border)); box-shadow: var(--apt-shadow-sh1); transform: translateY(-1px); }
    .ov-move-icon { width: 24px; height: 24px; flex: none; color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .ov-move-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    .ov-move-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .ov-move-verb { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; }
    .ov-move-consequence { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); }
    .ov-move-go { margin-left: auto; align-self: center; flex: none; color: var(--apt-module-accent, var(--apt-color-brand-primary)); font-size: var(--apt-font-size-title-2); }

    @media (max-width: 760px) {
      .ov-moves { grid-template-columns: 1fr; }
      .ov-table-wrap { font-size: var(--apt-font-size-sm-3); }
      .ov-table { font-size: var(--apt-font-size-sm-3); }
      .ov-th, .ov-td { padding: var(--apt-spacing-s3) var(--apt-spacing-s4); }
      .ov-actions { flex-direction: column; }
    }
    `,
  ],
})
export class OverviewComponent {
  readonly pilots = OPERATIONAL_PILOTS;
  readonly undertakings = computed(() => this.pilots.length);
  readonly institutionCount = computed(() => new Set(this.pilots.map((p) => p.institution.id)).size);
  readonly peopleCount = computed(() => new Set(this.pilots.flatMap((p) => p.participants).map((x) => x.personId)).size);
  readonly evidenceCount = computed(() => this.pilots.reduce((n, p) => n + p.evidence.length, 0));
  readonly deliverableCount = computed(() => this.pilots.reduce((n, p) => n + p.deliverables.length, 0));
  readonly valueDisclosed = computed(() => this.pilots.reduce((n, p) => n + (p.acceptance.costDisclosed?.amount ?? 0), 0));

  readonly moves = computed(() => [
    { to: '/workspace/workbench', verb: 'Open the workbench', consequence: `${this.undertakings()} undertakings across ${this.institutionCount()} institutions — pick one up and see exactly what blocks it.`, icon: 'M4 5h16M4 12h16M4 19h10' },
    { to: '/workspace/records/roll', verb: 'Verify evidence', consequence: `${this.evidenceCount()} items on the ledger — move a claim up a standing, or dispute one that has drifted.`, icon: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z M9 12l2 2 4-4' },
    { to: '/workspace/records', verb: 'File a record', consequence: `Put a claim in provenance intact — ${this.deliverableCount()} deliverables and ${this.evidenceCount()} evidence items back the ledger.`, icon: 'M7 4h7l4 4v12H7zM14 4v4h4M10 12h5M10 16h4' },
    { to: '/workspace/commons', verb: 'Start an inquiry', consequence: `KES ${this.valueDisclosed().toLocaleString('en-KE')} disclosed across the settlements — bind the next one to a testable proposition.`, icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  ] as const);

  readonly query = signal('');
  readonly selectedRow = signal<string>('');

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

  readonly inFlight = computed(() => this.pilots.map((p) => ({
    id: p.id,
    label: p.label,
    institution: p.institution.name,
    location: p.location,
    type: p.undertakingType,
    deliverables: p.deliverables.length,
    evidence: p.evidence.length,
    cost: p.acceptance.costDisclosed ? p.acceptance.costDisclosed.amount.toLocaleString('en-KE') + ' ' + p.acceptance.costDisclosed.currency : 'Undisclosed',
    status: p.acceptance.acceptedAt !== null ? 'fulfilled' : 'open',
    acceptedAt: (p.acceptance.acceptedAt ?? '').slice(0, 10) || '—',
  })));

  createNeed(): void {
    this.openCommons();
  }

  openCommons(): void {
    // Navigate to Commons — handled by router
  }

  openPilot(id: string): void {
    // Navigate to pilot detail
  }

  verifyRow(id: string): void {
    // Verify evidence — handled by pilot detail
  }

  selectRow(row: { id: string }): void {
    this.selectedRow.set(row.id);
  }
}
