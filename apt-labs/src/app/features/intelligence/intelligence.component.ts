import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

const PILOTS = [
  { id: 'pilot-001', label: 'Nairobi North Primary Repair', gate: 3, capitalCommitted: 45000, currency: 'KES', workItems: 5 },
  { id: 'pilot-002', label: 'Kisumu Co-op Solar Install', gate: 4, capitalCommitted: 120000, currency: 'KES', workItems: 8 },
  { id: 'pilot-003', label: 'Mombasa Community Hall', gate: 2, capitalCommitted: 89000, currency: 'KES', workItems: 3 },
  { id: 'pilot-004', label: 'Nakuru Lab Fabrication', gate: 5, capitalCommitted: 62000, currency: 'KES', workItems: 6 },
] as const;

const PATTERNS = [
  { id: 'pat-001', pilot: 'pilot-001', finding: 'Evidence verification consistently lags commitment by 4–7 days', severity: 'high', trend: 'worsening' },
  { id: 'pat-002', pilot: 'pilot-002', finding: 'Solar inverter orders from two suppliers have 68% part compatibility', severity: 'medium', trend: 'stable' },
  { id: 'pat-003', pilot: 'pilot-004', finding: 'CNC fabrication waste rate dropped 12% after Q1 methodology update', severity: 'positive', trend: 'improving' },
] as const;

const LEARNING = [
  {
    id: 'lr-001',
    title: 'Off-grid classroom sizing standard',
    source: 'Kisumu solar pilot, Gate 4',
    output: 'PV sizing heuristic updated for 30-student off-grid classrooms',
    confidence: 0.82,
  },
  {
    id: 'lr-002',
    title: 'Fabrication tolerance baseline',
    source: 'Nakuru Lab pilot, Gate 5',
    output: 'CNC tolerance spec v2 for public facility fabrication',
    confidence: 0.74,
  },
] as const;

const RECOMMENDATIONS = [
  {
    id: 'rec-001',
    pilot: 'pilot-001',
    text: 'Add 5-day buffer to evidence verification SLA for Nairobi North',
    basis: 'Pattern: evidence lag exceeds commitment by avg 6 days over last 3 cycles',
    action: 'Update gate criteria',
  },
  {
    id: 'rec-002',
    pilot: 'pilot-002',
    text: 'Standardise inverter part numbers across Kisumu and Mombasa',
    basis: '68% part compatibility across two suppliers; 32% mismatch causes rework',
    action: 'Merge part catalogues',
  },
] as const;

const BOUNDARY_ITEMS = [
  { id: 'b-001', title: 'No financial forecast', note: 'The engine does not predict revenue, cost, or market value. Disclosed figures are what is on the roll — nothing more.' },
  { id: 'b-002', title: 'No capability scoring', note: 'Standing and verified claims are shown as named states. They are never averaged into a single numeric score.' },
  { id: 'b-003', title: 'No external data', note: 'All analysis is derived from the local record only. No third-party feeds, no live market data.' },
  { id: 'b-004', title: 'No autonomous action', note: 'Recommendations require a human to file, accept, or reject. The engine never writes to the roll on its own.' },
] as const;

@Component({
  selector: 'app-intelligence',
  imports: [RouterLink],
  template: `
    <div class="intel" data-module="intelligence">
      <div class="intel-body">
        <main class="intel-main">
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
                  <span class="intel-lane-gate">Gate {{ p.gate }}</span>
                </div>
                <div class="intel-lane-bar">
                  <div class="intel-lane-fill" [style.width.%]="(p.gate / 7) * 100"></div>
                </div>
                <div class="intel-lane-meta">
                  <span class="intel-lane-meta-item">{{ p.workItems }} work items</span>
                  <span class="intel-lane-meta-item">{{ p.capitalCommitted.toLocaleString('en-KE') }} KES</span>
                </div>
              </div>
            }
          </div>

          <div class="intel-panels">
            <section class="intel-panel">
              <h2 class="intel-panel-title">Matching</h2>
              <p class="intel-panel-note">
                Capability claims matched to open needs. High-match pairs are surfaced in the commons.
              </p>
              <ul class="intel-list">
                <li class="intel-list-item">2 open needs matched to 5 active providers</li>
                <li class="intel-list-item">1 need has no provider — flagged as <span class="intel-flag">missing</span></li>
                <li class="intel-list-item">3 cross-pilot supplier relationships at 68% compatibility</li>
              </ul>
            </section>

            <section class="intel-panel">
              <h2 class="intel-panel-title">Patterns</h2>
              <p class="intel-panel-note">Findings derived from the roll. Each finding links to the evidence that supports it.</p>
              <div class="intel-list">
                @for (pat of patterns(); track pat.id) {
                  <div class="intel-pattern" [class.intel-pattern--positive]="pat.severity === 'positive'">
                    <span class="intel-pattern-sev" [class]="sevClass(pat.severity)">{{ pat.severity }}</span>
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
              <p class="intel-panel-note">Distilled knowledge outputs from completed pilots. Each is filed to the commons.</p>
              <div class="intel-list">
                @for (l of learning(); track l.id) {
                  <div class="intel-learning">
                    <div class="intel-learning-head">
                      <span class="intel-learning-title">{{ l.title }}</span>
                      <span class="intel-learning-confidence">{{ Math.round(l.confidence * 100) }}%</span>
                    </div>
                    <span class="intel-learning-source">{{ l.source }}</span>
                    <p class="intel-learning-output">{{ l.output }}</p>
                  </div>
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
                    <button class="intel-rec-accept">Accept &amp; file</button>
                    <button class="intel-rec-reject">Reject</button>
                  </div>
                </article>
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
        </main>
      </div>
    </div>
  `,
  styles: [
    `
.intel { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }
.intel-body { display: flex; flex: 1; min-height: 0; }
.intel-main { flex: 1; min-width: 0; padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22); max-width: 1180px; }
.intel-pagehead { margin-bottom: var(--apt-spacing-s10); }
.intel-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0 0 var(--apt-spacing-s2); }
.intel-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); letter-spacing: -0.022em; line-height: 1.05; color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); }
.intel-sub { font-size: var(--apt-font-size-body-md); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; max-width: 72ch; }
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
.intel-panel-note { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s5); }
.intel-list { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
.intel-list-item { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-body); padding-left: var(--apt-spacing-s4); border-left: 2px solid var(--apt-border); }
.intel-flag { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; color: var(--apt-color-error-base, #b91c1c); letter-spacing: 0.04em; }
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
.intel-learning-confidence { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); }
.intel-learning-source { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
.intel-learning-output { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); line-height: var(--apt-line-height-relaxed); margin: 0; }
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
  .intel-main { padding: var(--apt-spacing-s8); }
  .intel-panels { grid-template-columns: 1fr; }
  .intel-recs-grid { grid-template-columns: 1fr; }
  .intel-boundaries-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .intel-lane { grid-template-columns: 1fr; gap: var(--apt-spacing-s2); }
}
`,
  ],
})
export class IntelligenceComponent {
  readonly Math = Math;
  readonly BOUNDARIES = BOUNDARY_ITEMS;
  readonly pilots = signal(PILOTS);
  readonly patterns = signal(PATTERNS);
  readonly learning = signal(LEARNING);
  readonly recommendations = signal(RECOMMENDATIONS);

  readonly pilotLabel = (id: string) => {
    const p = PILOTS.find((x) => x.id === id);
    return p ? p.label : id;
  };

  readonly sevClass = (severity: string) => {
    if (severity === 'high') return 'intel-pattern-sev intel-pattern-sev--high';
    return 'intel-pattern-sev';
  };
}
