/**
 * @apt-labs/features/workspace — InspectorComponent
 *
 * Shell region: contextual, opens on selection. Shows the selected entity's
 * typed relationships, evidence standing on the named-state ladder, and its
 * position in the productive-reality cycle. Never a score — standing is a
 * named state shown side by side.
 */
import { Component, computed, input } from '@angular/core';

export interface InspectorEntity {
  id: string;
  name: string;
  family: string;
  type: string;
  standing?: string;
  maturity?: string;
  relationships?: Array<{
    kind: string;
    target: string;
    sourceRole?: string;
    targetRole?: string;
  }>;
  cycleStage?: string;
  authorityGated?: boolean;
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

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [],
  template: `
    <section class="inspector" [class.inspector--open]="open()">
      <div class="inspector-head">
        <h3 class="inspector-title">{{ entityName() }}</h3>
        <button class="inspector-close" (click)="close()" aria-label="Close inspector">✕</button>
      </div>
      <div class="inspector-meta">
        <div class="meta-row">
          <span class="meta-label">Family</span><span class="meta-value">{{ entity()?.family ?? '—' }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Type</span><span class="meta-value">{{ entity()?.type ?? '—' }}</span>
        </div>
        @if (entity()?.cycleStage) {
          <div class="meta-row">
            <span class="meta-label">Cycle stage</span>
            <span class="meta-value">{{ entity()?.cycleStage }}{{ entity()?.authorityGated ? ' · gate' : '' }}</span>
          </div>
        }
      </div>
      @if (entity()?.standing) {
        <div class="inspector-section">
          <h4 class="inspector-section-title">Evidence standing</h4>
          <div class="standing-ladder">
            @for (s of standingOrder; track s) {
              <span
                class="standing-chip"
                [class.standing-chip--active]="s === standing()"
                [class.standing-chip--passed]="standingIndex(s) < standingIndex(standing() ?? '')"
              >{{ standingLabel(s) }}</span>
            }
          </div>
          <p class="standing-note">Standing is a named state, never a score.</p>
        </div>
      }
      @if (relationships().length > 0) {
        <div class="inspector-section">
          <h4 class="inspector-section-title">Typed relationships</h4>
          <ul class="relationship-list">
            @for (r of relationships(); track r.kind + r.target) {
              <li class="relationship-item">
                <span class="rel-kind">{{ r.kind }}</span>
                <span class="rel-arrow">→</span>
                <span class="rel-target">{{ r.target }}</span>
                @if (r.sourceRole || r.targetRole) {
                  <span class="rel-roles">({{ r.sourceRole ?? '' }}→{{ r.targetRole ?? '' }})</span>
                }
              </li>
            }
          </ul>
        </div>
      }
      @if (!hasEntity()) {
        <p class="inspector-empty">Select an entity to inspect its relationships, standing, and cycle position.</p>
      }
    </section>
  `,
  styles: [
    `
    .inspector {
      width: var(--apt-shell-inspector-max);
      border-left: 1px solid var(--apt-border);
      background: var(--apt-surface-page);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
      z-index: var(--apt-z-index-dropdown);
    }
    .inspector--open { display: flex; }
    .inspector-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--apt-spacing-s6);
      border-bottom: 1px solid var(--apt-border-faint);
      background: var(--apt-surface-raised);
      flex-shrink: 0;
    }
    .inspector-title {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-font-size-title-1);
      font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong);
      margin: 0;
    }
    .inspector-close {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: 0;
      background: transparent;
      color: var(--apt-text-muted);
      cursor: pointer;
    }
    .inspector-close:hover { color: var(--apt-text-strong); }
    .inspector-meta { display: flex; flex-direction: column; gap: var(--apt-spacing-s2); padding: var(--apt-spacing-s4) var(--apt-spacing-s6); border-bottom: 1px solid var(--apt-border-faint); }
    .meta-row { display: flex; gap: var(--apt-spacing-s3); }
    .meta-label { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); min-width: 100px; }
    .meta-value { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-body); }
    .inspector-section { padding: var(--apt-spacing-s6); border-bottom: 1px solid var(--apt-border-faint); }
    .inspector-section:last-child { border-bottom: none; }
    .inspector-section-title {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--apt-text-dim);
      margin: 0 0 var(--apt-spacing-s3);
    }
    .standing-ladder { display: flex; gap: var(--apt-spacing-s1); flex-wrap: wrap; }
    .standing-chip {
      padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
      border-radius: var(--apt-radius-r0);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-sm-3);
      border: 1px solid var(--apt-border);
      background: var(--apt-surface-raised);
      color: var(--apt-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .standing-chip--active { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); font-weight: var(--apt-font-weight-medium); }
    .standing-chip--passed { border-color: var(--apt-border-faint); background: var(--apt-surface-default); color: var(--apt-text-dim); }
    .standing-note { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); color: var(--apt-text-dim); margin: var(--apt-spacing-s2) 0 0; }
    .relationship-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-spacing-s2); }
    .relationship-item {
      display: flex;
      align-items: center;
      gap: var(--apt-spacing-s2);
      padding: var(--apt-spacing-s2) var(--apt-spacing-s3);
      border: 1px solid var(--apt-border-faint);
      border-radius: var(--apt-radius-r1);
      background: var(--apt-surface-default);
      font-size: var(--apt-font-size-body-sm);
    }
    .rel-kind { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); text-transform: uppercase; letter-spacing: 0.06em; color: var(--apt-text-dim); flex-shrink: 0; }
    .rel-arrow { color: var(--apt-text-dim); font-size: var(--apt-font-size-sm-3); }
    .rel-target { color: var(--apt-text-body); font-weight: var(--apt-font-weight-medium); min-width: 0; }
    .rel-roles { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); margin-left: auto; }
    .inspector-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--apt-spacing-s16);
      color: var(--apt-text-muted);
      font-size: var(--apt-font-size-body-sm);
      text-align: center;
    }
    @media (max-width: 1024px) { .inspector { width: 320px; } }
    @media (max-width: 760px) {
      .inspector { position: fixed; inset: 0; z-index: 600; width: 100%; border-left: none; border-top: 1px solid var(--apt-border); }
    }
    `,
  ],
})
export class InspectorComponent {
  readonly open = input<boolean>(false);
  readonly entity = input<InspectorEntity | null>(null);
  readonly standingOrder = STANDING_ORDER;
  readonly standingLabel = (s: string) => STANDING_LABELS[s] ?? s;

  readonly pendingTransition = computed(() => null as any);

  readonly relationships = computed(() => this.entity()?.relationships ?? []);
  readonly standing = computed(() => this.entity()?.standing);
  readonly entityName = computed(() => this.entity()?.name ?? 'No selection');
  readonly cycleStage = computed(() => this.entity()?.cycleStage);
  readonly authorityGated = computed(() => this.entity()?.authorityGated ?? false);
  readonly hasEntity = computed(() => this.entity() !== null);

  standingIndex(standing: string): number {
    return STANDING_ORDER.indexOf(standing);
  }

  close(): void {}
}
