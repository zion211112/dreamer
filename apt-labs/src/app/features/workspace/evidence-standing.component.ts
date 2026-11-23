/**
 * @apt-labs/features/workspace — EvidenceStandingComponent
 *
 * Renders evidence standing as a named-state ladder (never a score) and offers
 * authority-gated transitions per the Evidence State-Transition Specification.
 *
 * Transitions are offered as buttons; authorization is checked against the
 * actor's role. The UI requires a reason before allowing dispute or expiry
 * transitions, per the transition table.
 *
 * The actual event write is delegated to a provided `onTransition` callback
 * (wired to the domain/action layer or n8n callback in production). The UI
 * does not invent enforcement.
 */
import { Component, input, output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type EvidenceActorRole = 'public' | 'authenticated' | 'coordinator' | 'institution' | 'admin';

export interface EvidenceStandingTransition {
  from: string;
  to: string;
  label: string;
  authorizedRoles: EvidenceActorRole[];
  requiresReason: boolean;
  requiresEvidence: boolean;
  eventType: string;
}

const STANDING_ORDER: string[] = [
  'unassessed', 'reported', 'supported', 'verified', 'disputed', 'rejected', 'expired',
];

const STANDING_LABELS: Record<string, string> = {
  unassessed: 'Unassessed',
  reported: 'Reported',
  supported: 'Supported',
  verified: 'Verified',
  disputed: 'Disputed',
  rejected: 'Rejected',
  expired: 'Expired',
};

// Per the Evidence State-Transition Specification transition table.
const TRANSITIONS: Record<string, EvidenceStandingTransition[]> = {
  unassessed: [
    { from: 'unassessed', to: 'reported', label: 'Report', authorizedRoles: ['public', 'authenticated', 'coordinator', 'institution', 'admin'], requiresReason: false, requiresEvidence: false, eventType: 'EVIDENCE_ADDED' },
  ],
  reported: [
    { from: 'reported', to: 'supported', label: 'Support', authorizedRoles: ['coordinator', 'institution', 'admin'], requiresReason: false, requiresEvidence: true, eventType: 'EVIDENCE_ADDED' },
    { from: 'reported', to: 'disputed', label: 'Dispute', authorizedRoles: ['public', 'authenticated', 'coordinator', 'institution', 'admin'], requiresReason: true, requiresEvidence: false, eventType: 'EVIDENCE_ADDED' },
  ],
  supported: [
    { from: 'supported', to: 'verified', label: 'Verify', authorizedRoles: ['coordinator', 'institution', 'admin'], requiresReason: false, requiresEvidence: true, eventType: 'EVIDENCE_VERIFIED' },
    { from: 'supported', to: 'disputed', label: 'Dispute', authorizedRoles: ['public', 'authenticated', 'coordinator', 'institution', 'admin'], requiresReason: true, requiresEvidence: true, eventType: 'EVIDENCE_ADDED' },
  ],
  verified: [
    { from: 'verified', to: 'disputed', label: 'Dispute', authorizedRoles: ['coordinator', 'institution', 'admin'], requiresReason: true, requiresEvidence: true, eventType: 'EVIDENCE_ADDED' },
    { from: 'verified', to: 'expired', label: 'Expire', authorizedRoles: ['coordinator', 'institution', 'admin'], requiresReason: true, requiresEvidence: false, eventType: 'ENTITY_CORRECTED' },
  ],
  disputed: [
    { from: 'disputed', to: 'supported', label: 'Resolve (support)', authorizedRoles: ['coordinator', 'institution', 'admin'], requiresReason: true, requiresEvidence: true, eventType: 'EVIDENCE_ADDED' },
    { from: 'disputed', to: 'rejected', label: 'Resolve (reject)', authorizedRoles: ['coordinator', 'institution', 'admin'], requiresReason: true, requiresEvidence: true, eventType: 'EVIDENCE_ADDED' },
  ],
  rejected: [
    { from: 'rejected', to: 'reported', label: 'Re-open', authorizedRoles: ['public', 'authenticated', 'coordinator', 'institution', 'admin'], requiresReason: true, requiresEvidence: true, eventType: 'EVIDENCE_ADDED' },
  ],
  expired: [
    { from: 'expired', to: 'reported', label: 'Re-activate', authorizedRoles: ['public', 'authenticated', 'coordinator', 'institution', 'admin'], requiresReason: true, requiresEvidence: true, eventType: 'EVIDENCE_ADDED' },
  ],
};

@Component({
  selector: 'app-evidence-standing',
  imports: [FormsModule],
  template: `
    <div class="evidence-standing">
      <div class="es-head">
        <h4 class="es-title">Evidence standing</h4>
        <span class="es-current" [class]="'es-current--' + current()">
          {{ standingLabel(current()) }}
        </span>
      </div>

      <div class="es-ladder">
        @for (s of standingOrder; track s) {
          <span
            class="es-chip"
            [class.es-chip--active]="s === current()"
            [class.es-chip--passed]="standingIndex(s) < standingIndex(current())"
            [class.es-chip--blocked]="!isActionable(s)"
          >
            {{ standingLabel(s) }}
          </span>
        }
      </div>

      <div class="es-transitions">
        @for (t of availableTransitions(); track t.from + t.to) {
          <button
            class="es-btn"
            [class.es-btn--authorized]="isAuthorized(t)"
            [class.es-btn--unauthorized]="!isAuthorized(t)"
            [disabled]="!isAuthorized(t)"
            (click)="isAuthorized(t) ? proposeTransition(t) : null"
          >
            <span class="es-btn-label">{{ t.label }}</span>
            @if (t.requiresReason) {
              <span class="es-btn-guard">reason required</span>
            }
            @if (t.requiresEvidence) {
              <span class="es-btn-guard">evidence required</span>
            }
            @if (!isAuthorized(t)) {
              <span class="es-btn-guard">not authorized</span>
            }
          </button>
        }
        @if (availableTransitions().length === 0) {
          <p class="es-none">No transitions available from this state.</p>
        }
      </div>

      @if (pendingTransition()) {
        <div class="es-propose">
          <label class="es-label">Reason</label>
          <textarea
            class="es-reason"
            [(ngModel)]="reasonText"
            placeholder="Why is this transition warranted?"
            [required]="pendingRequiresReason()"
          ></textarea>
          <label class="es-label">Supporting evidence IDs (comma-separated)</label>
          <input
            class="es-evidence"
            [(ngModel)]="evidenceIdsText"
            placeholder="evd-01, evd-02"
            [required]="pendingRequiresEvidence()"
          />
          <div class="es-actions">
            <button class="es-btn-cancel" (click)="cancelTransition()">Cancel</button>
            <button class="es-btn-submit" (click)="submitTransition()" [disabled]="!canSubmit()">
              {{ pendingTransition()?.label }}
            </button>
          </div>
          <p class="es-note">This writes an append-only audit event. The prior state is never overwritten.</p>
        </div>
      }

      <p class="es-note es-note--subtle">
        Standing is a named state, never a score. A hash verifies content integrity,
        not claim truth.
      </p>
    </div>
  `,
  styles: [
    `
    .evidence-standing { display: flex; flex-direction: column; gap: var(--apt-spacing-s4); }
    .es-head { display: flex; align-items: center; gap: var(--apt-spacing-s3); }
    .es-title {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--apt-text-dim);
      margin: 0;
    }
    .es-current {
      font-family: var(--apt-font-sans);
      font-size: var(--apt-font-size-body-sm);
      font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong);
      padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
      border-radius: var(--apt-radius-r0);
      border: 1px solid var(--apt-border);
      background: var(--apt-surface-raised);
    }
    .es-current--verified { color: var(--apt-color-success-base, #166534); border-color: var(--apt-color-success-base, #166534); }
    .es-current--disputed { color: var(--apt-color-danger-base, #991b1b); border-color: var(--apt-color-danger-base, #991b1b); }
    .es-current--rejected { color: var(--apt-color-brand-geist-alert, #ef4444); border-color: var(--apt-color-brand-geist-alert, #ef4444); }
    .es-current--expired { color: var(--apt-text-dim); border-color: var(--apt-border-faint, var(--apt-border)); }
    .es-ladder { display: flex; gap: var(--apt-spacing-s1); flex-wrap: wrap; }
    .es-chip {
      padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
      border-radius: var(--apt-radius-r0);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-sm-3);
      border: 1px solid var(--apt-border);
      background: var(--apt-surface-raised);
      color: var(--apt-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: default;
    }
    .es-chip--active { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); font-weight: var(--apt-font-weight-medium); }
    .es-chip--passed { border-color: var(--apt-border-faint, var(--apt-border)); background: var(--apt-surface-default); color: var(--apt-text-dim); }
    .es-chip--blocked { opacity: 0.4; }
    .es-transitions { display: flex; flex-direction: column; gap: var(--apt-spacing-s2); }
    .es-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--apt-spacing-s3);
      padding: var(--apt-spacing-s2) var(--apt-spacing-s4);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r1);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-font-size-body-sm);
      font-family: inherit;
      cursor: pointer;
      text-align: left;
    }
    .es-btn:not(:disabled):hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .es-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .es-btn--authorized:not(:disabled) { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-text-strong); }
    .es-btn--unauthorized { border-style: dashed; color: var(--apt-text-dim); }
    .es-btn-label { font-weight: var(--apt-font-weight-medium); }
    .es-btn-guard {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-left: auto;
    }
    .es-none { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); color: var(--apt-text-dim); margin: 0; }
    .es-propose { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); padding: var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); }
    .es-label { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); display: block; margin-bottom: var(--apt-spacing-s1); }
    .es-reason, .es-evidence { width: 100%; min-height: 80px; padding: var(--apt-spacing-s3) var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); background: var(--apt-surface-raised); color: var(--apt-text-body); font-family: inherit; font-size: var(--apt-font-size-body-sm); }
    .es-evidence { min-height: 36px; }
    .es-actions { display: flex; gap: var(--apt-spacing-s3); margin-top: var(--apt-spacing-s1); }
    .es-btn-cancel { flex: 1; padding: var(--apt-spacing-s2) var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); background: transparent; color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); cursor: pointer; }
    .es-btn-cancel:hover { background: var(--apt-surface-raised); }
    .es-btn-submit { flex: 1; padding: var(--apt-spacing-s2) var(--apt-spacing-s4); border: 0; border-radius: var(--apt-radius-r1); background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); cursor: pointer; }
    .es-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .es-btn-submit:not(:disabled):hover { background: var(--apt-color-neutral-n950, #0f172a); }
    .es-note { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); color: var(--apt-text-dim); margin: 0; }
    .es-note--subtle { opacity: 0.6; }
    @media (max-width: 760px) {
      .es-head { flex-direction: column; align-items: flex-start; gap: var(--apt-spacing-s1); }
      .es-transitions { gap: var(--apt-spacing-s1); }
      .es-btn { flex-direction: column; align-items: flex-start; gap: var(--apt-spacing-s1); }
      .es-btn-guard { margin-left: 0; }
    }
    `,
  ],
})
export class EvidenceStandingComponent {
  readonly current = input.required<string>();
  readonly actorRole = input.required<EvidenceActorRole>();
  readonly onTransition = output<{ from: string; to: string; reason: string; evidenceIds: string[] }>();

  readonly standingOrder = STANDING_ORDER;
  readonly standingLabel = (s: string) => STANDING_LABELS[s] ?? s;

  readonly pendingTransition = signal<EvidenceStandingTransition | null>(null);
  readonly reasonText = signal('');
  readonly evidenceIdsText = signal('');

  readonly availableTransitions = computed(() => {
    const t = TRANSITIONS[this.current()];
    return t ?? [];
  });

  readonly pendingRequiresReason = computed(() => {
    const t = this.pendingTransition();
    return t ? t.requiresReason : false;
  });

  readonly pendingRequiresEvidence = computed(() => {
    const t = this.pendingTransition();
    return t ? t.requiresEvidence : false;
  });

  isAuthorized(t: EvidenceStandingTransition): boolean {
    return t.authorizedRoles.includes(this.actorRole());
  }

  standingIndex(standing: string): number {
    return STANDING_ORDER.indexOf(standing);
  }

  isActionable(standing: string): boolean {
    // Per isActionableEvidence in ontology/evidence.ts
    if (standing === 'rejected' || standing === 'expired' || standing === 'disputed') return false;
    if (standing === 'unassessed') return false;
    return true;
  }

  proposeTransition(t: EvidenceStandingTransition): void {
    this.pendingTransition.set(t);
    this.reasonText.set('');
    this.evidenceIdsText.set('');
  }

  cancelTransition(): void {
    this.pendingTransition.set(null);
  }

  canSubmit(): boolean {
    const t = this.pendingTransition();
    if (!t) return false;
    if (t.requiresReason && !this.reasonText().trim()) return false;
    if (t.requiresEvidence && !this.evidenceIdsText().trim()) return false;
    return true;
  }

  submitTransition(): void {
    const t = this.pendingTransition();
    if (!t) return;
    const evidenceIds = this.evidenceIdsText()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    this.onTransition.emit({
      from: t.from,
      to: t.to,
      reason: this.reasonText().trim(),
      evidenceIds,
    });
    this.pendingTransition.set(null);
    this.reasonText.set('');
    this.evidenceIdsText.set('');
  }
}
