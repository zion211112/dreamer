/**
 * @apt-labs/features/reference — ReferenceComponent
 *
 * Reference: the shared vocabulary beneath the workspace. The object explorer
 * reads the server-backed studio registry; the schema, evidence standing and
 * authority sections read @apt-labs/ontology. Nothing here reports live
 * activity — status lives in Home, Workbench and Records.
 */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ObjectExplorerComponent } from '../ontology/object-explorer.component';
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
  COMMITMENT_LIFECYCLE_STATE,
  COMMITMENT_LIFECYCLE_LABELS,
  COMMITMENT_LIFECYCLE_TRANSITIONS,
  type CommitmentLifecycleState,
  type EvidenceStanding,
  type Family,
} from '@apt-labs/ontology';

const GOVERNANCE_TYPES: readonly { type: string; meaning: string }[] = [
  { type: 'Mandate', meaning: 'A granted scope to act — what a principal is authorised to do on behalf of others.' },
  { type: 'Identity', meaning: 'Who a party is, distinct from any single account that can stand in for them.' },
  { type: 'Membership', meaning: 'Belonging to a body — and the standing that confers, revocable and by the body.' },
  { type: 'Role', meaning: 'A named set of duties and powers; held, not owned, and separable from the person.' },
  { type: 'Permission', meaning: 'A specific thing one is allowed to do, granted by something broader than it.' },
  { type: 'Consent', meaning: 'What a person agreed to — withdrawable, and never the same as a permission.' },
  { type: 'Policy', meaning: 'The rule a community set; it binds its members before any single decision.' },
  { type: 'Jurisdiction', meaning: 'Whose words are final over a given matter or place.' },
  { type: 'DataClassification', meaning: 'Which layer of the record a fact may live in, by right.' },
] as const;

@Component({
  selector: 'app-reference',
  standalone: true,
  imports: [RouterLink, ObjectExplorerComponent],
  template: `
    <div class="onto" data-module="reference">
      <div class="onto-pagehead">
        <p class="onto-eyebrow">APT-LABS · Reference</p>
        <h1 class="onto-h1">Reference</h1>
        <p class="onto-sub">
          The vocabulary the workspace records use: the object types in your view, the productive-reality
          cycle, how evidence is graded, and who holds authority over each stage. This is the schema, not a
          status report. For what is happening now, see <a routerLink="/workspace">Home</a>,
          <a routerLink="/workspace/workbench">Workbench</a> and <a routerLink="/workspace/records">Records</a>.
        </p>
      </div>

      <app-object-explorer />

      <section class="onto-section" aria-labelledby="ref-cycle">
        <h2 class="onto-section-title" id="ref-cycle">The productive-reality cycle</h2>
        <p class="onto-section-note">
          One chain from intention to knowledge. Stages marked <span class="onto-gatechip">gated</span> are
          authority decisions: a person, not a mechanical step, must move them.
        </p>
        <ol class="onto-cycle">
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
        </ol>
      </section>

      <section class="onto-section" aria-labelledby="ref-families">
        <h2 class="onto-section-title" id="ref-families">Entity families</h2>
        <p class="onto-section-note">{{ familyCount }} families, grouped by the role they play in the cycle.</p>
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

      <section class="onto-section" aria-labelledby="ref-standing">
        <h2 class="onto-section-title" id="ref-standing">Evidence standing and maturity</h2>
        <p class="onto-section-note">
          Evidence climbs a fixed ladder of named states. It is never averaged into a percentage, and a disputed
          or rejected item stands where the record says it stands.
        </p>
        <div class="onto-standmat">
          <div>
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
          <div>
            <h3 class="onto-subhead">Maturity</h3>
            <ul class="onto-maturity-list">
              @for (m of maturities; track m) {
                <li class="onto-maturity-row">{{ maturityLabel(m) }}</li>
              }
            </ul>
          </div>
        </div>
      </section>

      <section class="onto-section" aria-labelledby="ref-distinctions">
        <h2 class="onto-section-title" id="ref-distinctions">Canonical distinctions</h2>
        <p class="onto-section-note">The lines the record keeps separate.</p>
        <div class="onto-distinctions">
          @for (d of distinctions; track d) {
            <span class="onto-dist">{{ d }}</span>
          }
        </div>
      </section>

      <section class="onto-section" aria-labelledby="ref-authority">
        <h2 class="onto-section-title" id="ref-authority">Forms of authority</h2>
        <p class="onto-section-note">
          Nine named governance types. Naming the form keeps a consent from quietly becoming a permission, or a
          role from hardening into a mandate.
        </p>
        <div class="onto-gov-grid">
          @for (g of governance; track g.type) {
            <div class="onto-gov">
              <h3 class="onto-gov-type">{{ g.type }}</h3>
              <p class="onto-gov-meaning">{{ g.meaning }}</p>
            </div>
          }
        </div>
      </section>

      <section class="onto-section" aria-labelledby="ref-gates">
        <h2 class="onto-section-title" id="ref-gates">Where a decision is required</h2>
        <p class="onto-section-note">
          Authority-gated stages need a person to move them. Automated steps can assemble and check work, but
          they do not decide intent, accept a commitment or stamp evidence.
        </p>
        <ul class="onto-gates">
          @for (s of gatedStages; track s.key) {
            <li class="onto-gate">
              <span class="onto-gate-key">{{ s.label }}</span>
              <span class="onto-gate-note">Authority decision</span>
            </li>
          }
        </ul>
      </section>

      <section class="onto-section" aria-labelledby="ref-lifecycle">
        <h2 class="onto-section-title" id="ref-lifecycle">The commitment lifecycle</h2>
        <p class="onto-section-note">
          A commitment moves through named states along legal transitions only. It cannot reach fulfilment
          without first being accepted and made active.
        </p>
        <ol class="onto-lifecycle">
          @for (st of lifecycle; track st.state) {
            <li class="onto-lc-step">
              <span class="onto-lc-state">{{ st.label }}</span>
              @if (st.next.length > 0) {
                <span class="onto-lc-next">→ {{ st.next.join(' · ') }}</span>
              } @else {
                <span class="onto-lc-next">terminal</span>
              }
            </li>
          }
        </ol>
      </section>

      <section class="onto-section onto-section--thesis" aria-labelledby="ref-thesis">
        <h2 class="onto-section-title" id="ref-thesis">Design thesis</h2>
        <p class="onto-section-note">
          Intent the product is built toward. This describes design direction, not how the system operates today.
        </p>
        <ul class="onto-thesis">
          <li>Value is produced by the network and settled open to it. Value is not the same as price.</li>
          <li>Legitimacy comes from open evidence and the standing it has earned, not from scale or a closed ledger.</li>
          <li>The people and institution network is the durable asset; evidence and grounded intelligence are shared.</li>
        </ul>
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
    .onto-eyebrow { margin: 0; font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); letter-spacing: 0.1em; text-transform: uppercase; color: var(--apt-text-dim); }
    .onto-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-3); line-height: 1.05; letter-spacing: -0.02em; }
    .onto-sub { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; max-width: 74ch; line-height: var(--apt-line-relaxed); }
    .onto-sub a { color: var(--apt-module-accent, var(--apt-accent)); }

    .onto-section { margin: 0 var(--apt-space-10) var(--apt-space-10); }
    .onto-section-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0 0 var(--apt-space-2); }
    .onto-section-note { font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-space-5); max-width: 74ch; }
    .onto-gatechip { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.06em; color: var(--apt-module-accent, var(--apt-accent)); }

    .onto-cycle { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--apt-space-3); }
    .onto-cycle-step { display: flex; align-items: flex-start; gap: var(--apt-space-3); padding: var(--apt-space-4); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); background: var(--apt-surface-page); }
    .onto-cycle-step--gated { border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-accent)) 40%, var(--apt-border)); }
    .onto-cycle-idx { font-family: var(--apt-font-mono); font-size: var(--apt-size-md); color: var(--apt-text-dim); flex: none; }
    .onto-cycle-step--gated .onto-cycle-idx { color: var(--apt-module-accent, var(--apt-accent)); }
    .onto-cycle-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .onto-cycle-label { font-size: var(--apt-size-md); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); }
    .onto-cycle-family { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }
    .onto-cycle-note { font-size: var(--apt-size-micro); color: var(--apt-text-muted); }

    .onto-groups { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--apt-space-4); }
    .onto-group { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); padding: var(--apt-space-5); }
    .onto-group-label, .onto-subhead { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); margin: 0 0 var(--apt-space-3); font-weight: normal; }
    .onto-group-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-space-2); }
    .onto-family { display: flex; align-items: baseline; justify-content: space-between; gap: var(--apt-space-3); }
    .onto-family-name { font-size: var(--apt-size-body); color: var(--apt-text-body); }
    .onto-family-key { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }

    .onto-standmat { display: grid; grid-template-columns: 1fr 1fr; gap: var(--apt-space-6); }
    .onto-ladder-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-space-2); }
    .onto-ladder-row { display: flex; align-items: center; gap: var(--apt-space-3); padding: var(--apt-space-2) var(--apt-space-3); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); background: var(--apt-surface-page); }
    .onto-ladder-ord { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }
    .onto-ladder-name { font-size: var(--apt-size-body); color: var(--apt-text-body); }
    .onto-maturity-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--apt-space-2); }
    .onto-maturity-row { font-size: var(--apt-size-body); color: var(--apt-text-body); padding: var(--apt-space-2) var(--apt-space-4); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); background: var(--apt-surface-page); }

    .onto-distinctions { display: flex; flex-wrap: wrap; gap: var(--apt-space-2); }
    .onto-dist { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-muted); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); padding: 3px 8px; }

    .onto-gov-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--apt-space-4); }
    .onto-gov { padding: var(--apt-space-4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); }
    .onto-gov-type { font-family: var(--apt-font-serif); font-size: var(--apt-size-md); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-2); }
    .onto-gov-meaning { margin: 0; font-size: var(--apt-size-body); color: var(--apt-text-muted); line-height: var(--apt-line-relaxed); }

    .onto-gates { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--apt-space-3); }
    .onto-gate { display: flex; flex-direction: column; gap: 2px; padding: var(--apt-space-3) var(--apt-space-4); border: 1px solid color-mix(in srgb, var(--apt-module-accent, var(--apt-accent)) 40%, var(--apt-border)); border-radius: var(--apt-button-radius); background: var(--apt-surface-page); }
    .onto-gate-key { font-size: var(--apt-size-body); color: var(--apt-text-strong); }
    .onto-gate-note { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }

    .onto-lifecycle { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-space-2); }
    .onto-lc-step { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--apt-space-3); padding: var(--apt-space-2) var(--apt-space-3); border-left: 2px solid var(--apt-border); }
    .onto-lc-state { font-size: var(--apt-size-body); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); min-width: 16ch; }
    .onto-lc-next { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); }

    .onto-section--thesis { border-top: 1px solid var(--apt-border); padding-top: var(--apt-space-8); }
    .onto-thesis { margin: 0; padding-left: var(--apt-space-5); color: var(--apt-text-muted); line-height: var(--apt-line-relaxed); display: flex; flex-direction: column; gap: var(--apt-space-2); max-width: 74ch; }

    @media (max-width: 900px) {
      .onto-section { margin-inline: var(--apt-space-5); }
      .onto-pagehead { padding-left: var(--apt-space-5); }
      .onto-cycle, .onto-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .onto-standmat, .onto-gov-grid { grid-template-columns: 1fr; }
    }
    `,
  ],
})
export class ReferenceComponent {
  readonly cycle = PRODUCTIVE_REALITY_CYCLE;
  readonly governance = GOVERNANCE_TYPES;
  readonly gatedStages = PRODUCTIVE_REALITY_CYCLE.filter((s) => s.authorityGated);

  readonly familyGroups = [
    { id: 'core', label: 'Operational core', families: OPERATIONAL_CORE },
    { id: 'continuity', label: 'Continuity & learning', families: CONTINUITY_LEARNING },
    { id: 'value', label: 'Value & legitimacy', families: VALUE_LEGITIMACY },
    { id: 'context', label: 'Context', families: CONTEXT },
  ];

  readonly familyCount = Object.values(FAMILY).length;
  readonly distinctions = CANONICAL_DISTINCTIONS;
  readonly standings = Object.values(EVIDENCE_STANDING);
  readonly maturities = Object.values(MATURITY);

  readonly lifecycle: readonly { state: CommitmentLifecycleState; label: string; next: string[] }[] =
    (Object.keys(COMMITMENT_LIFECYCLE_STATE) as (keyof typeof COMMITMENT_LIFECYCLE_STATE)[]).map((k) => {
      const state = COMMITMENT_LIFECYCLE_STATE[k];
      const next = COMMITMENT_LIFECYCLE_TRANSITIONS[state].map((to) => COMMITMENT_LIFECYCLE_LABELS[to]);
      return { state, label: COMMITMENT_LIFECYCLE_LABELS[state], next };
    });

  readonly familyLabel = (f: Family): string => FAMILY_LABELS[f];
  readonly standingLabel = (s: EvidenceStanding): string => EVIDENCE_STANDING_LABELS[s];
  readonly maturityLabel = (m: (typeof MATURITY)[keyof typeof MATURITY]): string => MATURITY_LABELS[m];

  readonly cycleNote = (s: { authorityGated: boolean; advancesBy?: string }): string => {
    if (s.authorityGated) return 'Authority decision';
    if (s.advancesBy) return `Advanced by ${s.advancesBy}`;
    return '';
  };
}
