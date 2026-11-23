/**
 * @apt-labs/features/sovereignty — SovereigntyComponent
 *
 * Who governs, and over what — the governance vocabulary, authority-gated
 * stages, and evidence-standing ladder read from @apt-labs/ontology.
 */
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoordinationService } from '@apt-labs/shared/state';
import {
  PRODUCTIVE_REALITY_CYCLE,
  EVIDENCE_STANDING,
  EVIDENCE_STANDING_LABELS,
  COMMITMENT_LIFECYCLE_STATE,
  COMMITMENT_LIFECYCLE_LABELS,
  COMMITMENT_LIFECYCLE_TRANSITIONS,
  type CommitmentLifecycleState,
  type EvidenceStanding,
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
  selector: 'app-sovereignty',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="sov" data-module="sovereignty">
      <div class="sov-pagehead">
        <p class="sov-eyebrow">WORKSPACE · SOVEREIGNTY</p>
        <h1 class="sov-h1">Who governs, and over what</h1>
        <p class="sov-sub">
          A people-powered production system must say, plainly, who holds authority over each stage —
          and that authority is granted, revocable, and checked by standing, not by size.
        </p>
      </div>

      <section class="sov-section">
        <h2 class="sov-section-title">The forms authority takes</h2>
        <p class="sov-section-note">
          Nine named governance types. Naming the form keeps a consent from quietly becoming a
          permission, or a role from hardening into a mandate.
        </p>
        <div class="sov-gov-grid">
          @for (g of GOVERNANCE; track g.type) {
            <div class="sov-gov">
              <h3 class="sov-gov-type">{{ g.type }}</h3>
              <p class="sov-gov-meaning">{{ g.meaning }}</p>
            </div>
          }
        </div>
      </section>

      <section class="sov-section">
        <h2 class="sov-section-title">Where a decision is required</h2>
        <p class="sov-section-note">
          Three of the eight cycle stages are authority-gated: a person must move them. The engine
          assembles, verifies and settles — it does not decide intent, accept a commitment, or stamp
          evidence.
        </p>
        <div class="sov-gates">
          @for (s of gatedStages; track s.key) {
            <div class="sov-gate">
              <span class="sov-gate-key">{{ s.key }}</span>
              <span class="sov-gate-note">Authority decision</span>
            </div>
          }
        </div>
      </section>

      <section class="sov-section">
        <h2 class="sov-section-title">The commitment lifecycle</h2>
        <p class="sov-section-note">
          A commitment moves through named states only, along legal transitions. It cannot skip to
          fulfilment without having been accepted and gone active.
        </p>
        <ol class="sov-lifecycle">
          @for (st of lifecycle; track st.state) {
            <li class="sov-lc-step">
              <span class="sov-lc-state">{{ st.label }}</span>
              @if (st.next.length > 0) {
                <span class="sov-lc-next">→ {{ st.next.join(' · ') }}</span>
              } @else {
                <span class="sov-lc-terminal">terminal</span>
              }
            </li>
          }
        </ol>
      </section>

      <section class="sov-section">
        <h2 class="sov-section-title">Standing is a named state</h2>
        <p class="sov-section-note">
          Evidence climbs a fixed ladder. It is never averaged into a confidence figure, and a disputed
          or rejected item stands where the record says it stands — not where a model would like it.
        </p>
        <div class="sov-standing">
          @for (s of standings; track s) {
            <span class="sov-standing-chip">{{ standingLabel(s) }}</span>
          }
        </div>
      </section>

      <section class="sov-section">
        <h2 class="sov-section-title">People-powered, not capitalist</h2>
        <p class="sov-section-note">
          The model inverts where value accrues. This is the thesis made explicit, not a slogan.
        </p>
        <div class="sov-contrast">
          <div class="sov-col sov-col--old">
            <h3 class="sov-col-head">The old model</h3>
            <ul class="sov-col-list">
              <li>Value is read as <em>price</em>, captured by the few who own the platform.</li>
              <li>Legitimacy comes from scale and a closed ledger only the operator can see.</li>
              <li>The network is a supply for the middleman; the middleman holds the record.</li>
            </ul>
          </div>
          <div class="sov-col sov-col--new">
            <h3 class="sov-col-head">The people-powered model</h3>
            <ul class="sov-col-list">
              <li>Value is <em>produced</em> by the network and settled open to it (value ≠ price).</li>
              <li>Legitimacy comes from open evidence and the standing it has earned, to anyone.</li>
              <li>The durable people-institution network is the moat; evidence and grounded
                intelligence are public property.</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="sov-section sov-section--live">
        <h2 class="sov-section-title">Already operating on the spine</h2>
        <p class="sov-section-note">
          This is not a proposal. The governance is running on the live record — every delivered
          commitment crossed the evidence gate and sealed items onto the roll.
        </p>
        <div class="sov-live">
          <div class="sov-live-cell">
            <span class="sov-live-num">{{ live().delivered }}</span>
            <span class="sov-live-cap">commitments delivered</span>
          </div>
          <div class="sov-live-cell">
            <span class="sov-live-num">{{ live().open }}</span>
            <span class="sov-live-cap">needs awaiting a provider</span>
          </div>
          <div class="sov-live-cell">
            <span class="sov-live-num">{{ live().evidence }}</span>
            <span class="sov-live-cap">evidence items sealed</span>
          </div>
          <div class="sov-live-cell">
            <span class="sov-live-num">{{ live().gates }}</span>
            <span class="sov-live-cap">authority gates held</span>
          </div>
        </div>
        <a [routerLink]="['/workspace', 'intelligence']" class="sov-live-link">
          Read the grounded intelligence →
        </a>
      </section>
    </div>
  `,
  styles: [
    `
    .sov { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }

    .sov-pagehead { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s10); }
    .sov-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0; text-transform: uppercase; }
    .sov-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); letter-spacing: -0.022em; line-height: 1.05; }
    .sov-sub { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: 0; max-width: 74ch; line-height: var(--apt-line-height-relaxed); }

    .sov-section { margin-bottom: var(--apt-spacing-s10); }
    .sov-section-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-1); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0 0 var(--apt-spacing-s2); }
    .sov-section-note { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s5); max-width: 74ch; }

    .sov-gov-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--apt-spacing-s4); }
    .sov-gov { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s5); }
    .sov-gov-type { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0 0 var(--apt-spacing-s2); }
    .sov-gov-meaning { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; }

    .sov-gates { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--apt-spacing-s4); }
    .sov-gate { display: flex; flex-direction: column; gap: 4px; padding: var(--apt-spacing-s5); border: 1px solid color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 40%, var(--apt-border)); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); }
    .sov-gate-key { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-body-sm); text-transform: uppercase; letter-spacing: 0.06em; color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .sov-gate-note { font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); }

    .sov-lifecycle { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--apt-spacing-s3); }
    .sov-lc-step { display: flex; flex-direction: column; gap: 4px; padding: var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); background: var(--apt-surface-page); }
    .sov-lc-state { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); }
    .sov-lc-next { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .sov-lc-terminal { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); }

    .sov-standing { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s2); }
    .sov-standing-chip { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-body); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 3px 9px; }

    .sov-contrast { display: grid; grid-template-columns: 1fr 1fr; gap: var(--apt-spacing-s5); }
    .sov-col { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); padding: var(--apt-spacing-s6); background: var(--apt-surface-page); }
    .sov-col--new { border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 45%, var(--apt-border)); }
    .sov-col-head { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s4); }
    .sov-col-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
    .sov-col-list li { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); }
    .sov-col-list li em { font-style: normal; color: var(--apt-text-strong); }

    .sov-section--live { border-top: 1px solid var(--apt-border); padding-top: var(--apt-spacing-s8); }
    .sov-live { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--apt-spacing-s4); margin-bottom: var(--apt-spacing-s5); }
    .sov-live-cell { display: flex; flex-direction: column; gap: 2px; padding: var(--apt-spacing-s5); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); }
    .sov-live-num { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.02em; line-height: 1; }
    .sov-live-cap { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.06em; color: var(--apt-text-dim); }
    .sov-live-link { font-size: var(--apt-font-size-body-sm); color: var(--apt-module-accent, var(--apt-color-brand-primary)); text-decoration: none; }
    .sov-live-link:hover { text-decoration: underline; }

    @media (max-width: 900px) {
      .sov-gov-grid, .sov-gates, .sov-lifecycle { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .sov-contrast, .sov-live { grid-template-columns: 1fr; }
    }
    `,
  ],
})
export class SovereigntyComponent {
  private readonly coordination = inject(CoordinationService);

  readonly GOVERNANCE = GOVERNANCE_TYPES;

  readonly gatedStages = PRODUCTIVE_REALITY_CYCLE.filter((s) => s.authorityGated);

  readonly standings = Object.values(EVIDENCE_STANDING);

  readonly lifecycle: readonly { state: CommitmentLifecycleState; label: string; next: string[] }[] =
    (Object.keys(COMMITMENT_LIFECYCLE_STATE) as (keyof typeof COMMITMENT_LIFECYCLE_STATE)[]).map((k) => {
      const state = COMMITMENT_LIFECYCLE_STATE[k];
      const next = COMMITMENT_LIFECYCLE_TRANSITIONS[state].map((to) => COMMITMENT_LIFECYCLE_LABELS[to]);
      return { state, label: COMMITMENT_LIFECYCLE_LABELS[state], next };
    });

  readonly live = computed(() => {
    const counts = this.coordination.counts();
    const evidence = this.coordination.needs().reduce((sum, n) => sum + n.evidenceIds.length, 0);
    return {
      delivered: counts.delivered,
      open: counts.open,
      evidence,
      gates: this.gatedStages.length,
    };
  });

  readonly standingLabel = (s: EvidenceStanding): string => EVIDENCE_STANDING_LABELS[s];
}
