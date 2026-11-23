/**
 * @apt-labs/features/intelligence — IntelligenceComponent
 *
 * Grounded intelligence: matching, patterns, learning, recommendations —
 * all derived from the shared system of record. No external data, no
 * autonomous action.
 */
import { Component, computed, inject } from '@angular/core';
import { OPERATIONAL_PILOTS } from '@apt-labs/domain';
import { CoordinationService } from '@apt-labs/shared/state';

const BOUNDARY_ITEMS = [
  { id: 'b-001', title: 'No financial forecast', note: 'The engine does not predict revenue, cost, or market value. Disclosed figures are what is on the roll — nothing more.' },
  { id: 'b-002', title: 'No capability scoring', note: 'Standing and verified claims are shown as named states. They are never averaged into a single numeric score.' },
  { id: 'b-003', title: 'No external data', note: 'All analysis is derived from the local record only. No third-party feeds, no live market data.' },
  { id: 'b-004', title: 'No autonomous action', note: 'Recommendations require a human to file, accept, or reject. The engine never writes to the roll on its own.' },
] as const;

@Component({
  selector: 'app-intelligence',
  standalone: true,
  template: `
    <div class="intel" data-module="intelligence">
      <div class="intel-pagehead">
        <p class="intel-eyebrow">WORKSPACE · INTELLIGENCE</p>
        <h1 class="intel-h1">What the record says</h1>
        <p class="intel-sub">
          Derived patterns, learning outputs, and recommendations — every finding points back to the
          evidence on the roll. No external data. No autonomous action.
        </p>
      </div>

      <div class="intel-forecast">
        @for (p of pilots(); track p.id) {
          <div class="intel-lane">
            <div class="intel-lane-head">
              <span class="intel-lane-label">{{ p.label }}</span>
              <span class="intel-lane-gate">Stage {{ p.stage }}</span>
            </div>
            <div class="intel-lane-bar">
              <div class="intel-lane-fill" [style.width.%]="(p.stage / 7) * 100"></div>
            </div>
            <div class="intel-lane-meta">
              <span class="intel-lane-meta-item">{{ p.workItems }} work items</span>
              <span class="intel-lane-meta-item">{{ p.capitalCommitted ? p.capitalCommitted.toLocaleString('en-KE') + ' ' + p.currency : 'Undisclosed' }}</span>
            </div>
          </div>
        }
      </div>

      <div class="intel-panels">
        <section class="intel-panel">
          <h2 class="intel-panel-title">Matching</h2>
          <p class="intel-panel-note">Capability claims and open needs, off the live record.</p>
          <ul class="intel-list">
            @for (line of matchingLines(); track line) {
              <li class="intel-list-item">{{ line }}</li>
            }
          </ul>
        </section>

        <section class="intel-panel">
          <h2 class="intel-panel-title">Patterns</h2>
          <p class="intel-panel-note">Findings derived from the roll. Each finding links to the evidence that supports it.</p>
          <div class="intel-list">
            @for (pat of patterns(); track pat.id) {
              <div class="intel-pattern" [class.intel-pattern--positive]="pat.severity === 'positive'">
                <span class="intel-pattern-sev [pat.severity === 'high' ? 'intel-pattern-sev--high' : '']">{{ pat.severity }}</span>
                <div class="intel-pattern-main">
                  <span class="intel-pattern-text">{{ pat.finding }}</span>
                  <span class="intel-pattern-trend">Trend: {{ pat.trend }}</span>
                </div>
              </div>
            }
          </div>
        </section>

        <section class="intel-panel">
          <h2 class="intel-panel-title">Learning</h2>
          <p class="intel-panel-note">Distilled knowledge from delivered undertakings. Standing is a named state, never a score.</p>
          <div class="intel-list">
            @for (l of learning(); track l.id) {
              <div class="intel-learning">
                <div class="intel-learning-head">
                  <span class="intel-learning-title">{{ l.title }}</span>
                  <span class="intel-learning-confidence">{{ l.standing }}</span>
                </div>
                <span class="intel-learning-source">{{ l.source }}</span>
              </div>
            }
            @if (learning().length === 0) {
              <p class="intel-empty">Nothing distilled yet — no undertaking has settled.</p>
            }
          </div>
        </section>
      </div>

      <div class="intel-recs">
        <h2 class="intel-recs-title">Recommendations</h2>
        <p class="intel-recs-lede">
          Each recommendation requires human review. The engine proposes; it does not act.
        </p>
        <div class="intel-recs-grid">
          @for (r of recommendations(); track r.id) {
            <article class="intel-rec">
              <div class="intel-rec-head">
                <span class="intel-rec-pilot">Pilot: {{ pilotLabel(r.pilot) }}</span>
              </div>
              <p class="intel-rec-text">{{ r.text }}</p>
              <div class="intel-rec-basis">
                <span class="intel-rec-basis-label">Basis</span>
                <span class="intel-rec-basis-text">{{ r.basis }}</span>
              </div>
              <div class="intel-rec-actions">
                <button class="intel-rec-accept">Accept & file</button>
                <button class="intel-rec-reject">Reject</button>
              </div>
            </article>
          }
          @if (recommendations().length === 0) {
            <p class="intel-empty">No open recommendations — the record is settled.</p>
          }
        </div>
      </div>

      <div class="intel-boundaries">
        <h2 class="intel-boundaries-title">What the engine will not do</h2>
        <div class="intel-boundaries-grid">
          @for (b of BOUNDARIES; track b.id) {
            <div class="intel-boundary">
              <span class="intel-boundary-num">{{ b.id.slice(4) }}</span>
              <h3 class="intel-boundary-title">{{ b.title }}</h3>
              <p class="intel-boundary-note">{{ b.note }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .intel { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }

    .intel-pagehead { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s10); }
    .intel-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0; text-transform: uppercase; }
    .intel-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); letter-spacing: -0.022em; line-height: 1.05; }
    .intel-sub { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-height-relaxed); }

    .intel-forecast { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s7); margin-bottom: var(--apt-spacing-s10); }
    .intel-lane { display: grid; grid-template-columns: 200px 1fr auto; align-items: center; gap: var(--apt-spacing-s4); margin-bottom: var(--apt-spacing-s5); }
    .intel-lane:last-child { margin-bottom: 0; }
    .intel-lane-head { display: flex; flex-direction: column; gap: 2px; }
    .intel-lane-label { font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); }
    .intel-lane-gate { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
    .intel-lane-bar { height: 4px; background: var(--apt-surface-raised); border-radius: var(--apt-radius-r0); overflow: hidden; }
    .intel-lane-fill { height: 100%; background: var(--apt-module-accent, var(--apt-color-brand-primary)); border-radius: var(--apt-radius-r0); transition: width var(--apt-animation-fast); }
    .intel-lane-meta { display: flex; gap: var(--apt-spacing-s4); }
    .intel-lane-meta-item { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); white-space: nowrap; }

    .intel-panels { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--apt-spacing-s6); margin-bottom: var(--apt-spacing-s10); }
    .intel-panel { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s6) var(--apt-spacing-s7); }
    .intel-panel-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); }
    .intel-panel-note { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s5); max-width: 72ch; }
    .intel-list { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
    .intel-list-item { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-body); padding-left: var(--apt-spacing-s4); border-left: 2px solid var(--apt-border); }
    .intel-pattern { display: flex; align-items: flex-start; gap: var(--apt-spacing-s3); }
    .intel-pattern--positive { border-left: 2px solid var(--apt-color-brand-primary); }
    .intel-pattern-sev { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.06em; border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 1px 5px; color: var(--apt-text-muted); flex: none; margin-top: 1px; }
    .intel-pattern-sev--high { color: var(--apt-color-error-base, #b91c1c); border-color: color-mix(in srgb, var(--apt-color-error-base, #b91c1c) 40%, var(--apt-border)); }
    .intel-pattern-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .intel-pattern-text { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-body); line-height: 1.4; }
    .intel-pattern-trend { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); }

    .intel-learning { display: flex; flex-direction: column; gap: var(--apt-spacing-s2); padding: var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-raised); }
    .intel-learning-head { display: flex; align-items: center; justify-content: space-between; gap: var(--apt-spacing-s3); }
    .intel-learning-title { font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); }
    .intel-learning-confidence { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.04em; color: var(--apt-text-dim); }
    .intel-learning-source { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }

    .intel-empty { color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); padding: var(--apt-spacing-s3); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-r1); }

    .intel-recs { margin-bottom: var(--apt-spacing-s10); }
    .intel-recs-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s2); }
    .intel-recs-lede { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s6); max-width: 72ch; }
    .intel-recs-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--apt-spacing-s5); }
    .intel-rec { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s6); display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
    .intel-rec-head { }
    .intel-rec-pilot { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
    .intel-rec-text { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0; }
    .intel-rec-basis { display: flex; flex-direction: column; gap: 2px; }
    .intel-rec-basis-label { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
    .intel-rec-basis-text { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); line-height: var(--apt-line-height-relaxed); }
    .intel-rec-actions { display: flex; gap: var(--apt-spacing-s3); margin-top: auto; }
    .intel-rec-accept { flex: 1; padding: var(--apt-spacing-s3) var(--apt-spacing-s5); background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border: 0; border-radius: var(--apt-radius-r1); font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); cursor: pointer; }
    .intel-rec-reject { flex: 1; padding: var(--apt-spacing-s3) var(--apt-spacing-s5); background: transparent; color: var(--apt-text-muted); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); font-size: var(--apt-font-size-body-sm); cursor: pointer; }
    .intel-rec-reject:hover { border-color: var(--apt-text-muted); color: var(--apt-text-body); }

    .intel-boundaries { border-top: 1px solid var(--apt-border); padding-top: var(--apt-spacing-s8); }
    .intel-boundaries-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s6); }
    .intel-boundaries-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--apt-spacing-s5); }
    .intel-boundary { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s5); }
    .intel-boundary-num { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-body-md); color: var(--apt-text-dim); }
    .intel-boundary-title { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: var(--apt-spacing-s2) 0; }
    .intel-boundary-note { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; }

    @media (max-width: 900px) {
      .intel-panels { grid-template-columns: 1fr; }
      .intel-recs-grid { grid-template-columns: 1fr; }
      .intel-boundaries-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .intel-lane { grid-template-columns: 1fr; gap: var(--apt-spacing-s2); }
    }
    `,
  ],
})
export class IntelligenceComponent {
  private readonly coordination = inject(CoordinationService);

  readonly BOUNDARIES = BOUNDARY_ITEMS;

  readonly pilots = computed(() =>
    OPERATIONAL_PILOTS.map((p) => ({
      id: p.id,
      label: p.label,
      stage: Math.min(7, p.evidence.length + 3),
      capitalCommitted: p.acceptance.costDisclosed?.amount ?? null,
      currency: p.acceptance.costDisclosed?.currency ?? 'KES',
      workItems: p.deliverables.length,
    })),
  );

  readonly matchingLines = computed(() => {
    const needs = this.coordination.needs();
    const open = needs.filter((n) => n.status === 'open').length;
    const providers = new Set(needs.filter((n) => n.status !== 'open').map((n) => n.providerActorId).filter(Boolean)).size;
    const undisc = OPERATIONAL_PILOTS.filter((p) => p.acceptance.costDisclosed === null).length;
    const caps = new Set(OPERATIONAL_PILOTS.flatMap((p) => p.participants.flatMap((x) => x.capabilityClaims))).size;
    const lines = [`${open} open need${open === 1 ? '' : 's'} · ${providers} provider${providers === 1 ? '' : 's'} on the record`];
    lines.push(undisc ? `${undisc} undertaking held undisclosed — value not yet in the open` : 'All undertaking value disclosed to the record');
    lines.push(`${caps} distinct capability claims in play`);
    return lines;
  });

  readonly patterns = computed(() => {
    const ev = OPERATIONAL_PILOTS.flatMap((p) => p.evidence);
    const pub = ev.filter((e) => e.layer === 'public').length;
    const restr = ev.filter((e) => e.layer === 'restricted').length;
    const rows: { id: string; finding: string; severity: string; trend: string }[] = [
      { id: 'pat-ev', finding: `${pub} of ${ev.length} evidence items are public; ${restr} sit under rights terms`, severity: 'positive', trend: 'stable' },
    ];
    const un = OPERATIONAL_PILOTS.filter((p) => p.acceptance.costDisclosed === null);
    if (un.length) rows.push({ id: 'pat-undisc', finding: `${un.length} undertaking holds value undisclosed (${un.map((p) => p.label).join(', ')})`, severity: 'medium', trend: 'stable' });
    const open = this.coordination.needs().filter((n) => n.status === 'open');
    if (open.length) rows.push({ id: 'pat-open', finding: `${open.length} open need${open.length > 1 ? 's' : ''} still have no provider`, severity: 'high', trend: 'open' });
    const institutions = new Set(OPERATIONAL_PILOTS.map((p) => p.institution.id)).size;
    const caps = new Set(OPERATIONAL_PILOTS.flatMap((p) => p.participants.flatMap((x) => x.capabilityClaims))).size;
    rows.push({ id: 'pat-caps', finding: `${caps} distinct capability claims across ${institutions} institutions`, severity: 'positive', trend: 'growing' });
    return rows;
  });

  readonly learning = computed(() =>
    this.coordination.needs().filter((n) => n.status === 'fulfilled').map((n) => ({
      id: `lr-${n.needId}`,
      title: n.outcome ?? n.label,
      source: this.institutionName(n.providerActorId),
      standing: 'verified',
    })),
  );

  readonly recommendations = computed(() => {
    const recs: { id: string; pilot: string; text: string; basis: string; action: string }[] = [];
    const un = OPERATIONAL_PILOTS.filter((p) => p.acceptance.costDisclosed === null);
    for (const p of un) {
      recs.push({
        id: `rec-${p.id}`,
        pilot: p.id,
        text: `Disclose or formally cloak the cost of ${p.label}`,
        basis: 'Value is held off the record; transparent rule requires a named disclosure or an explicit cloak.',
        action: 'Set disclosure',
      });
    }
    const open = this.coordination.needs().filter((n) => n.status === 'open');
    for (const n of open) {
      recs.push({
        id: `rec-${n.needId}`,
        pilot: n.needId,
        text: `Assign a provider to “${n.label}”`,
        basis: n.requires.length ? `Requires ${n.requires.join(', ')} — no capability has answered it.` : 'No capability has answered it.',
        action: 'Match',
      });
    }
    if (recs.length === 0) {
      const first = OPERATIONAL_PILOTS[0];
      recs.push({
        id: 'rec-align',
        pilot: first.id,
        text: 'Align evidence standing across institutions',
        basis: 'Evidence items currently sit at mixed public and restricted standings.',
        action: 'Align standing',
      });
    }
    return recs;
  });

  readonly institutionName = (id: string | null): string => {
    if (!id) return '—';
    return this.coordination.institutions.get(id) ?? id;
  };

  readonly pilotLabel = (id: string): string =>
    OPERATIONAL_PILOTS.find((p) => p.id === id)?.label ?? this.coordination.needs().find((n) => n.needId === id)?.label ?? id;
}
