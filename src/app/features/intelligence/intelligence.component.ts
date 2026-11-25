/**
 * @apt-labs/features/intelligence — IntelligenceComponent
 *
 * Intelligence surfaces stay empty unless backed by connected records and
 * grounded analysis. No external data or autonomous action.
 * Structural Emergence.
 */
import { Component, computed, inject } from '@angular/core';
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
        <h1 class="intel-h1">What the record says</h1>
        <p class="intel-sub">
          Intelligence is not connected to shared records in this local demo. No findings, forecasts, or recommendations are available.
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
        @if (pilots().length === 0) {
          <p class="intel-empty">No connected undertaking records to analyze.</p>
        }
      </div>

      <div class="intel-panels">
        <section class="intel-panel">
          <h2 class="intel-panel-title">Matching</h2>
          <p class="intel-panel-note">Matching is unavailable until needs and capability records are connected.</p>
          <ul class="intel-list">
            @for (line of matchingLines(); track line) {
              <li class="intel-list-item">{{ line }}</li>
            }
            @if (matchingLines().length === 0) { <li class="intel-empty">No connected needs or capability records.</li> }
          </ul>
        </section>

        <section class="intel-panel">
          <h2 class="intel-panel-title">Patterns</h2>
          <p class="intel-panel-note">No connected analytic record or evidence-backed finding is available.</p>
          <div class="intel-list">
            @for (pat of patterns(); track pat.id) {
              <div class="intel-pattern" [class.intel-pattern--positive]="pat.severity === 'positive'">
                <span class="intel-pattern-sev" [class.intel-pattern-sev--high]="pat.severity === 'high'">{{ pat.severity }}</span>
                <div class="intel-pattern-main">
                  <span class="intel-pattern-text">{{ pat.finding }}</span>
                  <span class="intel-pattern-trend">Trend: {{ pat.trend }}</span>
                </div>
              </div>
            }
            @if (patterns().length === 0) { <p class="intel-empty">No evidence-backed patterns to report.</p> }
          </div>
        </section>

        <section class="intel-panel">
          <h2 class="intel-panel-title">Learning</h2>
          <p class="intel-panel-note">Knowledge records are separate from reported outcomes. Standing is a named state, never a score.</p>
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
              <p class="intel-empty">No independently created knowledge records are available.</p>
            }
          </div>
        </section>
      </div>

      <div class="intel-recs">
        <h2 class="intel-recs-title">Recommendations</h2>
        <p class="intel-recs-lede">
          AI recommendations are not decisions. No recommendations are available in this local demo.
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
                <button class="intel-rec-accept">Accept &amp; file</button>
                <button class="intel-rec-reject">Reject</button>
              </div>
            </article>
          }
          @if (recommendations().length === 0) {
            <p class="intel-empty">No recommendations are available; the record is not connected to an analysis engine.</p>
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
    .intel {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .intel-pagehead { display: flex; flex-direction: column; gap: var(--apt-space-3); margin-bottom: var(--apt-space-10); padding-left: var(--apt-space-10); }
    .intel-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-3); line-height: 1.05; letter-spacing: -0.02em; }
    .intel-sub { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-relaxed); }

    .intel-forecast { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); padding: var(--apt-space-7); margin-bottom: var(--apt-space-10); }
    .intel-lane { display: grid; grid-template-columns: 200px 1fr auto; align-items: center; gap: var(--apt-space-4); margin-bottom: var(--apt-space-5); }
    .intel-lane:last-child { margin-bottom: 0; }
    .intel-lane-head { display: flex; flex-direction: column; gap: 2px; }
    .intel-lane-label { font-size: var(--apt-size-md); font-weight: var(--apt-weight-medium); color: var(--apt-text-strong); }
    .intel-lane-gate { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
    .intel-lane-bar { height: 4px; background: var(--apt-surface-raised); border-radius: var(--apt-button-radius); overflow: hidden; }
    .intel-lane-fill { height: 100%; background: var(--apt-module-accent, var(--apt-accent)); border-radius: var(--apt-button-radius); transition: width var(--apt-motion-fast); }
    .intel-lane-meta { display: flex; gap: var(--apt-space-4); }
    .intel-lane-meta-item { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-muted); white-space: nowrap; }

    .intel-panels { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--apt-space-6); margin-bottom: var(--apt-space-10); }
    .intel-panel { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); padding: var(--apt-space-6) var(--apt-space-7); }
    .intel-panel-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-3); }
    .intel-panel-note { font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-space-5); max-width: 72ch; }
    .intel-list { display: flex; flex-direction: column; gap: var(--apt-space-3); }
    .intel-list-item { font-size: var(--apt-size-body); color: var(--apt-text-body); padding-left: var(--apt-space-4); border-left: 2px solid var(--apt-border); }
    .intel-pattern { display: flex; align-items: flex-start; gap: var(--apt-space-3); }
    .intel-pattern--positive { border-left: 2px solid var(--apt-accent); }
    .intel-pattern-sev { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.06em; border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); padding: 1px 6px; color: var(--apt-text-muted); flex: none; margin-top: 1px; }
    .intel-pattern-sev--high { color: var(--apt-text-danger); border-color: color-mix(in srgb, var(--apt-text-danger) 40%, var(--apt-border)); }
    .intel-pattern-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .intel-pattern-text { font-size: var(--apt-size-body); color: var(--apt-text-body); line-height: 1.4; }
    .intel-pattern-trend { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }

    .intel-learning { display: flex; flex-direction: column; gap: var(--apt-space-2); padding: var(--apt-space-4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-raised); }
    .intel-learning-head { display: flex; align-items: center; justify-content: space-between; gap: var(--apt-space-3); }
    .intel-learning-title { font-size: var(--apt-size-md); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); }
    .intel-learning-confidence { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.04em; color: var(--apt-text-dim); }
    .intel-learning-source { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-muted); }

    .intel-empty { color: var(--apt-text-muted); font-size: var(--apt-size-body); padding: var(--apt-space-3); border: 1px dashed var(--apt-border); border-radius: var(--apt-button-radius); }

    .intel-recs { margin-bottom: var(--apt-space-10); }
    .intel-recs-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-2); }
    .intel-recs-lede { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0 0 var(--apt-space-6); max-width: 72ch; }
    .intel-recs-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--apt-space-5); }
    .intel-rec { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); padding: var(--apt-space-6); display: flex; flex-direction: column; gap: var(--apt-space-3); }
    .intel-rec-head { }
    .intel-rec-pilot { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
    .intel-rec-text { font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0; }
    .intel-rec-basis { display: flex; flex-direction: column; gap: 2px; }
    .intel-rec-basis-label { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
    .intel-rec-basis-text { font-size: var(--apt-size-body); color: var(--apt-text-muted); line-height: var(--apt-line-relaxed); }
    .intel-rec-actions { display: flex; gap: var(--apt-space-3); margin-top: auto; }
    .intel-rec-accept { flex: 1; padding: var(--apt-space-3) var(--apt-space-5); background: var(--apt-module-accent, var(--apt-accent)); color: var(--apt-action-on-accent); border: 0; border-radius: var(--apt-button-radius); font-size: var(--apt-size-body); font-weight: var(--apt-weight-medium); cursor: pointer; }
    .intel-rec-reject { flex: 1; padding: var(--apt-space-3) var(--apt-space-5); background: transparent; color: var(--apt-text-muted); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); font-size: var(--apt-size-body); cursor: pointer; }
    .intel-rec-reject:hover { border-color: var(--apt-text-muted); color: var(--apt-text-body); }

    .intel-boundaries { border-top: 1px solid var(--apt-border); padding-top: var(--apt-space-8); }
    .intel-boundaries-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-6); }
    .intel-boundaries-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--apt-space-5); }
    .intel-boundary { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); padding: var(--apt-space-5); }
    .intel-boundary-num { font-family: var(--apt-font-mono); font-size: var(--apt-size-md); color: var(--apt-text-dim); }
    .intel-boundary-title { font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: var(--apt-space-2) 0; }
    .intel-boundary-note { font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0; }

    @media (max-width: 900px) {
      .intel-panels { grid-template-columns: 1fr; }
      .intel-recs-grid { grid-template-columns: 1fr; }
      .intel-boundaries-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .intel-lane { grid-template-columns: 1fr; gap: var(--apt-space-2); }
    }
    `,
  ],
})
export class IntelligenceComponent {
  private readonly coordination = inject(CoordinationService);

  readonly BOUNDARIES = BOUNDARY_ITEMS;

  readonly pilots = computed<{
    id: string;
    label: string;
    stage: number;
    workItems: number;
    capitalCommitted: number | null;
    currency: string;
  }[]>(() => []);

  readonly matchingLines = computed(() => {
    const needs = this.coordination.needs();
    if (needs.length === 0) return [];
    const open = needs.filter((n) => n.status === 'open').length;
    const providers = new Set(needs.filter((n) => n.status !== 'open').map((n) => n.providerActorId).filter(Boolean)).size;
    return [`${open} open need${open === 1 ? '' : 's'} · ${providers} provider${providers === 1 ? '' : 's'} on the record`];
  });

  readonly patterns = computed<{ id: string; finding: string; severity: string; trend: string }[]>(() => []);

  readonly learning = computed<{ id: string; title: string; source: string; standing: string }[]>(() => []);

  readonly recommendations = computed(() => [] as { id: string; pilot: string; text: string; basis: string; action: string }[]);

  readonly institutionName = (id: string | null): string => {
    if (!id) return '—';
    return this.coordination.institutions.get(id) ?? id;
  };

  readonly pilotLabel = (id: string): string =>
    this.coordination.needs().find((n) => n.needId === id)?.label ?? id;
}
