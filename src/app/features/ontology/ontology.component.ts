/**
 * @apt-labs/features/ontology — OntologyComponent
 *
 * The ontology explorer. Every panel reads from @apt-labs/ontology — the
 * fifteen-family schema with canonical distinctions, standing ladder, and
 * productive-reality cycle.
 * Structural Emergence.
 */
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ObjectExplorerComponent } from './object-explorer.component';
import { CoordinationService } from '@apt-labs/shared/state';
import {
  FAMILY,
  FAMILY_LABELS,
  OPERATIONAL_CORE,
  CONTINUITY_LEARNING,
  VALUE_LEGITIMACY,
  CONTEXT,
  CANONICAL_DISTINCTIONS,
  PRODUCTIVE_REALITY_CYCLE,
  EVIDENCE_STANDING,
  EVIDENCE_STANDING_LABELS,
  MATURITY,
  MATURITY_LABELS,
  RELATIONSHIP_KIND,
  type Family,
} from '@apt-labs/ontology';

@Component({
  selector: 'app-ontology',
  standalone: true,
  imports: [RouterLink, ObjectExplorerComponent],
  template: `
    <div class="onto" data-module="ontology">
      <div class="onto-pagehead">
        <h1 class="onto-h1">The ontology</h1>
        <p class="onto-sub">
          The shared system of record, as a schema. Fifteen families, one productive-reality cycle,
          and a standing ladder that keeps evidence a named state — never a score.
        </p>
      </div>

      <app-object-explorer />

      <section class="onto-section">
        <h2 class="onto-section-title">The productive-reality cycle</h2>
        <p class="onto-section-note">
          One chain: intention to knowledge. Stages marked <span class="onto-gatechip">gated</span> are
          authority decisions — a person, not a mechanical step, must move them.
        </p>
        <div class="onto-cycle">
          @for (s of cycle; track s.key) {
            <li class="onto-cycle-step" [class.onto-cycle-step--gated]="s.authorityGated">
              <span class="onto-cycle-idx">{{ $index + 1 }}</span>
              <div class="onto-cycle-main">
                <span class="onto-cycle-label">{{ s.label }}</span>
                <span class="onto-cycle-family">{{ s.family }}</span>
                <span class="onto-cycle-note">{{ cycleNote(s) }}</span>
              </div>
            </li>
          }
        </div>
        </section>

        <section class="onto-section">
          <h2 class="onto-section-title">The fifteen families</h2>
          <p class="onto-section-note">
            {{ familyCount }} entity families, grouped by the role they play in the loop.
          </p>
          <div class="onto-groups">
            @for (g of familyGroups; track g.id) {
              <div class="onto-group">
                <h3 class="onto-group-label">{{ g.label }}</h3>
                <ul class="onto-group-list">
                  @for (f of g.families; track f) {
                    <li class="onto-family">
                      <span class="onto-family-name">{{ familyLabel(f) }}</span>
                      <span class="onto-family-key">{{ f }}</span>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </section>

        <section class="onto-section">
          <h2 class="onto-section-title">Standing × maturity</h2>
          <p class="onto-section-note">
            Evidence earns its place on a ladder of named states; it never collapses into a percentage.
          </p>
          <div class="onto-standmat">
            <div class="onto-ladder">
              <h3 class="onto-subhead">Evidence standing</h3>
              <ol class="onto-ladder-list">
                @for (s of standings; track s) {
                  <li class="onto-ladder-row">
                    <span class="onto-ladder-ord">{{ $index + 1 }}</span>
                    <span class="onto-ladder-name">{{ standingLabel(s) }}</span>
                  </li>
                }
              </ol>
            </div>
            <div class="onto-maturity">
              <h3 class="onto-subhead">Maturity</h3>
              <ul class="onto-maturity-list">
                @for (m of maturities; track m) {
                  <li class="onto-maturity-row">{{ maturityLabel(m) }}</li>
                }
              </ul>
            </div>
          </div>
        </section>

        <section class="onto-section">
          <h2 class="onto-section-title">Canonical distinctions</h2>
          <p class="onto-section-note">
            The lines the record refuses to blur — enforced in the schema and every surface.
          </p>
          <div class="onto-distinctions">
            @for (d of distinctions; track d) {
              <span class="onto-dist">{{ d }}</span>
            }
          </div>
        </section>

        <section class="onto-section onto-section--live">
          <h2 class="onto-section-title">Riding this schema right now</h2>
          <p class="onto-section-note">
            The spine is live. This is the schema with the record on top of it — one action here ripples
            across every other surface.
          </p>
          <div class="onto-live">
            <div class="onto-live-cell">
              <span class="onto-live-num">{{ live().total }}</span>
              <span class="onto-live-cap">needs on the record</span>
            </div>
            <div class="onto-live-cell">
              <span class="onto-live-num">{{ live().delivered }}</span>
              <span class="onto-live-cap">delivered</span>
            </div>
            <div class="onto-live-cell">
              <span class="onto-live-num">{{ live().evidence }}</span>
              <span class="onto-live-cap">evidence items sealed</span>
            </div>
            <div class="onto-live-cell">
              <span class="onto-live-num">{{ relationKindCount }}</span>
              <span class="onto-live-cap">relationship kinds</span>
            </div>
          </div>
          <a [routerLink]="['/workspace', 'records']" class="onto-live-link">Open the record →</a>
        </section>
      </div>
  `,
  styles: [
    `
    .onto {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .onto-pagehead { display: flex; flex-direction: column; gap: var(--apt-space-3); margin-bottom: var(--apt-space-10); padding-left: var(--apt-space-10); }
    .onto-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-3); line-height: 1.05; letter-spacing: -0.02em; }
    .onto-sub { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; max-width: 74ch; line-height: var(--apt-line-relaxed); }

    .onto-section { margin-bottom: var(--apt-space-10); }
    .onto-section-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0 0 var(--apt-space-2); }
    .onto-section-note { font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-space-5); max-width: 74ch; }
    .onto-gatechip { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.06em; color: var(--apt-module-accent, var(--apt-accent)); }

    .onto-cycle {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--apt-space-3);
      counter-reset: cycle;
    }
    .onto-cycle-step {
      display: flex;
      align-items: flex-start;
      gap: var(--apt-space-3);
      padding: var(--apt-space-4);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-page);
    }
    .onto-cycle-step--gated { border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-accent)) 40%, var(--apt-border)); }
    .onto-cycle-idx { font-family: var(--apt-font-mono); font-size: var(--apt-size-md); color: var(--apt-text-dim); flex: none; }
    .onto-cycle-step--gated .onto-cycle-idx { color: var(--apt-module-accent, var(--apt-accent)); }
    .onto-cycle-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .onto-cycle-label { font-size: var(--apt-size-md); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); }
    .onto-cycle-family { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }
    .onto-cycle-note { font-size: var(--apt-size-micro); color: var(--apt-text-muted); }

    .onto-groups { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--apt-space-4); }
    .onto-group { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); padding: var(--apt-space-5); }
    .onto-group-label { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); margin: 0 0 var(--apt-space-3); }
    .onto-group-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-space-2); }
    .onto-family { display: flex; align-items: baseline; justify-content: space-between; gap: var(--apt-space-3); }
    .onto-family-name { font-size: var(--apt-size-body); color: var(--apt-text-body); }
    .onto-family-key { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }

    .onto-standmat { display: grid; grid-template-columns: 1fr 1fr; gap: var(--apt-space-6); }
    .onto-subhead { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); margin: 0 0 var(--apt-space-3); }
    .onto-ladder-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-space-2); }
    .onto-ladder-row {
      display: flex;
      align-items: center;
      gap: var(--apt-space-3);
      padding: var(--apt-space-2) var(--apt-space-3);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-page);
    }
    .onto-ladder-ord { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }
    .onto-ladder-name { font-size: var(--apt-size-body); color: var(--apt-text-body); }
    .onto-maturity-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--apt-space-2); }
    .onto-maturity-row { font-size: var(--apt-size-body); color: var(--apt-text-body); padding: var(--apt-space-2) var(--apt-space-4); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); background: var(--apt-surface-page); }

    .onto-distinctions { display: flex; flex-wrap: wrap; gap: var(--apt-space-2); }
    .onto-dist { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-muted); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); padding: 3px 8px; }

    .onto-section--live { border-top: 1px solid var(--apt-border); padding-top: var(--apt-space-8); }
    .onto-live { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--apt-space-4); margin-bottom: var(--apt-space-5); }
    .onto-live-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--apt-space-5);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-md);
      background: var(--apt-surface-page);
    }
    .onto-live-num { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.02em; line-height: 1; }
    .onto-live-cap { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.06em; color: var(--apt-text-dim); }
    .onto-live-link { font-size: var(--apt-size-body); color: var(--apt-module-accent, var(--apt-accent)); text-decoration: none; }
    .onto-live-link:hover { text-decoration: underline; }

    @media (max-width: 900px) {
      .onto-cycle, .onto-groups, .onto-live { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .onto-standmat { grid-template-columns: 1fr; }
    }
    `,
  ],
})
export class OntologyComponent {
  private readonly coordination = inject(CoordinationService);

  readonly cycle = PRODUCTIVE_REALITY_CYCLE;

  readonly familyGroups = [
    { id: 'core', label: 'Operational core', families: OPERATIONAL_CORE },
    { id: 'continuity', label: 'Continuity & learning', families: CONTINUITY_LEARNING },
    { id: 'value', label: 'Value & legitimacy', families: VALUE_LEGITIMACY },
    { id: 'context', label: 'Context', families: CONTEXT },
  ];

  readonly familyCount = Object.values(FAMILY).length;
  readonly relationKindCount = Object.values(RELATIONSHIP_KIND).length;
  readonly distinctions = CANONICAL_DISTINCTIONS;
  readonly standings = Object.values(EVIDENCE_STANDING);
  readonly maturities = Object.values(MATURITY);

  readonly live = computed(() => {
    const counts = this.coordination.counts();
    const evidence = this.coordination.needs().reduce((sum, n) => sum + n.evidenceIds.length, 0);
    return { total: counts.total, delivered: counts.delivered, evidence };
  });

  readonly familyLabel = (f: Family): string => FAMILY_LABELS[f];
  readonly standingLabel = (s: (typeof EVIDENCE_STANDING)[keyof typeof EVIDENCE_STANDING]): string => EVIDENCE_STANDING_LABELS[s];
  readonly maturityLabel = (m: (typeof MATURITY)[keyof typeof MATURITY]): string => MATURITY_LABELS[m];

  readonly cycleNote = (s: { authorityGated: boolean; advancesBy?: string }): string => {
    if (s.authorityGated) return 'Gated — authority decision';
    if (s.advancesBy) return `advances by ${s.advancesBy}`;
    return '';
  };
}
