/**
 * @apt-labs/features/workbench/pilot — PilotComponent
 *
 * The detail view of one coordination journey. Renders the composed,
 * trustworthy picture (need → commitment → outcome → evidence → audit) read
 * live from the shared CoordinationService, and exposes the two chain actions
 * (accept, fulfil) so the state visibly advances.
 */

import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoordinationService } from '@apt-labs/shared/state';
import type { Journey, OperationalPilot } from '@apt-labs/domain';

@Component({
  selector: 'app-pilot',
  imports: [RouterLink, FormsModule],
  template: `
    @if (journey(); as j) {
      <div class="pilot-page">
        <div class="pilot-breadcrumb">
          <a [routerLink]="['/workspace/workbench']" class="pilot-back">Back to Workbench</a>
        </div>

        <header class="pilot-head">
          <h1 class="pilot-title">{{ j.need?.data['need'] }}</h1>
          <div class="pilot-meta">
            <span class="pilot-id">{{ needId }}</span>
            <span class="pilot-status" [class.fulfilled]="status() === 'fulfilled'" [class.committed]="status() === 'committed'">
              {{ status() }}
            </span>
          </div>
        </header>

        @if (pilot(); as p) {
          <div class="pilot-grid">
            <section class="pilot-section">
              <h2 class="pilot-section-title">Institution</h2>
              <div class="pilot-detail">
                <span class="detail-value">{{ p.institution.name }}</span>
                <span class="detail-sub">{{ p.location }}</span>
              </div>
            </section>
            <section class="pilot-section">
              <h2 class="pilot-section-title">Scope</h2>
              <p class="pilot-scope">{{ p.scope }}</p>
            </section>
          </div>
        }

        <section class="pilot-section">
          <h2 class="pilot-section-title">Coordination chain</h2>
          <ol class="chain">
            <li class="chain-step is-live">
              <span class="chain-k">Intention</span>
              <span class="chain-v">{{ j.need?.data['need'] }}</span>
              <span class="chain-note">need · {{ status() }}</span>
            </li>
            @if (j.commitments[0]; as c) {
              <li class="chain-step is-live">
                <span class="chain-k">Commitment</span>
                <span class="chain-v">Provider {{ c.data['providerActorId'] }}</span>
                <span class="chain-note">{{ c.data['status'] }}</span>
              </li>
            } @else {
              <li class="chain-step">
                <span class="chain-k">Commitment</span>
                <span class="chain-v">Not yet accepted</span>
              </li>
            }
            @if (j.outcomes[0]; as o) {
              <li class="chain-step is-live">
                <span class="chain-k">Outcome</span>
                <span class="chain-v">{{ o.data['outcome'] }}</span>
                <span class="chain-note">{{ o.evidenceIds.length }} evidence</span>
              </li>
            } @else {
              <li class="chain-step">
                <span class="chain-k">Outcome</span>
                <span class="chain-v">Not yet delivered</span>
              </li>
            }
          </ol>
        </section>

        @if (evidence().length > 0) {
          <section class="pilot-section">
            <h2 class="pilot-section-title">Evidence</h2>
            <ul class="evidence">
              @for (e of evidence(); track e.id) {
                <li class="evidence-item">
                  <span class="evidence-title">{{ e.title }}</span>
                  <span class="evidence-layer">{{ e.layer }}</span>
                </li>
              }
            </ul>
          </section>
        }

        @if (j.auditEvents.length > 0) {
          <section class="pilot-section">
            <h2 class="pilot-section-title">Audit trail</h2>
            <ul class="audit">
              @for (ev of j.auditEvents; track ev.id) {
                <li class="audit-item">
                  <span class="audit-action">{{ ev.action }}</span>
                  <span class="audit-time">{{ ev.timestamp }}</span>
                </li>
              }
            </ul>
          </section>
        }

        <div class="pilot-actions">
          @if (status() === 'open') {
            <button class="pilot-action-btn" type="button" (click)="accept()">Accept as provider</button>
          } @else if (status() === 'committed') {
            <input class="pilot-outcome-input" [ngModel]="outcomeText()" (ngModelChange)="outcomeText.set($event)" placeholder="Record the delivered outcome…" aria-label="Outcome" />
            <button class="pilot-action-btn" type="button" (click)="fulfil()">Record outcome</button>
          } @else {
            <span class="pilot-delivered">Delivered & verified — {{ j.outcomes[0]?.data['outcome'] }}</span>
          }
        </div>
      </div>
    } @else {
      <div class="pilot-page">
        <div class="pilot-empty">
          <p>No journey found for this need.</p>
          <a [routerLink]="['/workspace/workbench']" class="pilot-back">Back to Workbench</a>
        </div>
      </div>
    }
  `,
  styles: [`
    .pilot-page { padding: var(--apt-spacing-s10); max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--apt-spacing-s8); }
    .pilot-breadcrumb { margin-bottom: 0; }
    .pilot-back { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); text-decoration: none; }
    .pilot-back:hover { color: var(--apt-module-accent); }
    .pilot-head { margin-bottom: 0; }
    .pilot-title { font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0; font-family: var(--apt-font-serif); }
    .pilot-meta { display: flex; gap: var(--apt-spacing-s5); margin-top: var(--apt-spacing-s3); font-size: var(--apt-font-size-micro); align-items: center; }
    .pilot-id { font-family: var(--apt-font-mono); color: var(--apt-text-muted); }
    .pilot-status { font-weight: var(--apt-font-weight-medium); text-transform: capitalize; padding: var(--apt-spacing-s1) var(--apt-spacing-s3); border-radius: 999px; background: var(--apt-surface-warning); color: var(--apt-text-warning); }
    .pilot-status.committed { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .pilot-status.fulfilled { background: var(--apt-surface-success); color: var(--apt-text-success); }
    .pilot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--apt-spacing-s6); }
    .pilot-section { padding: var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); background: var(--apt-surface-page); }
    .pilot-section-title { font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s4); }
    .pilot-detail { display: flex; flex-direction: column; gap: var(--apt-spacing-s1); }
    .detail-value { font-weight: var(--apt-font-weight-medium); font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); }
    .detail-sub { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .pilot-scope { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); margin: 0; line-height: var(--apt-line-height-relaxed); }
    .chain { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-spacing-s4); }
    .chain-step { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s3); align-items: baseline; padding: var(--apt-spacing-s3); border: 1px solid var(--apt-border-faint); border-radius: var(--apt-radius-r1); color: var(--apt-text-muted); }
    .chain-step.is-live { border-color: var(--apt-module-accent); background: var(--apt-surface-raised); }
    .chain-k { font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; color: var(--apt-text-muted); min-width: 96px; }
    .chain-v { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); }
    .chain-note { margin-left: auto; font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); text-transform: capitalize; }
    .evidence, .audit { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-spacing-s2); }
    .evidence-item, .audit-item { display: flex; justify-content: space-between; gap: var(--apt-spacing-s4); font-size: var(--apt-font-size-micro); }
    .evidence-title { color: var(--apt-text-strong); }
    .evidence-layer { color: var(--apt-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .audit-action { font-family: var(--apt-font-mono); color: var(--apt-text-body); }
    .audit-time { font-family: var(--apt-font-mono); color: var(--apt-text-muted); }
    .pilot-actions { display: flex; gap: var(--apt-spacing-s4); flex-wrap: wrap; align-items: center; }
    .pilot-outcome-input { flex: 1; min-width: 200px; padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: var(--apt-surface-raised); color: var(--apt-text-strong); font-size: var(--apt-font-size-body-sm); font-family: inherit; }
    .pilot-outcome-input:focus { outline: none; border-color: var(--apt-module-accent); }
    .pilot-action-btn { padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); border: none; background: var(--apt-module-accent); color: var(--apt-text-strong); font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); cursor: pointer; }
    .pilot-delivered { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-success); }
    .pilot-empty { text-align: center; padding: var(--apt-spacing-s16); color: var(--apt-text-muted); display: flex; flex-direction: column; gap: var(--apt-spacing-s4); align-items: center; }
  `],
})
export class PilotComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CoordinationService);

  readonly needId: string;
  private readonly journey_ = signal<Journey | null>(null);
  private readonly pilot_ = signal<OperationalPilot | undefined>(undefined);
  private readonly outcomeText = signal('');

  readonly journey = this.journey_;
  readonly pilot = this.pilot_;

  constructor() {
    this.needId = this.route.snapshot.paramMap.get('pilot') ?? '';
    this.journey_.set(this.service.journey(this.needId));
    this.pilot_.set(this.service.pilot(this.needId));
  }

  readonly evidence = computed(() => {
    const j = this.journey_();
    const ids = j?.outcomes[0]?.evidenceIds ?? [];
    const catalog = this.pilot_()?.evidence ?? [];
    return ids.map((id) => {
      const found = catalog.find((e) => e.id === id);
      return { id, title: found?.title ?? id, layer: found?.layer ?? 'unknown' };
    });
  });

  status(): string {
    return (this.journey_()?.need?.data as { status?: string } | undefined)?.status ?? 'unknown';
  }

  accept(): void {
    const provider = this.pilot_()?.institution.coordinatorId ?? 'provider';
    this.service.acceptNeed(this.needId, provider);
    this.journey_.set(this.service.journey(this.needId));
  }

  fulfil(): void {
    const commitmentId = this.journey_()?.commitments[0]?.id;
    if (!commitmentId) return;
    const fallback = this.pilot_()?.deliverables.join(' · ') ?? 'Delivered';
    const outcome = this.outcomeText().trim() || fallback;
    const evidenceIds = this.pilot_()?.evidence.map((e) => e.id);
    this.service.fulfilNeed(commitmentId, outcome, evidenceIds);
    this.journey_.set(this.service.journey(this.needId));
  }
}
