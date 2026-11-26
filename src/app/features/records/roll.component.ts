import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  WorkspaceDataService,
  describeWorkspaceError,
  type UndertakingDetail,
} from '@apt-labs/shared/state';
import { OFFER_STATUS_LABEL, REVIEW_DECISION_LABEL, UNDERTAKING_STATUS_LABEL } from './records-labels';

/**
 * Roll: the evidence chain for each undertaking — interest, offer, participants,
 * report and review — shown as recorded. Each chain loads when opened.
 */
@Component({
  selector: 'app-records-roll',
  standalone: true,
  imports: [DatePipe, RouterLink],
  styleUrl: './records-lens.css',
  template: `
    <section class="lens-section" aria-labelledby="roll-chains">
      <h2 class="lens-title" id="roll-chains">Evidence chains</h2>
      <p class="lens-note">Open an undertaking to read its chain as recorded: interest, offer, participation, report and review. Each step shows who recorded it. Opening a chain does not change it.</p>

      @if (undertakings().length === 0) {
        <p class="lens-empty">No undertakings are visible to you yet, so there are no chains to show.</p>
      } @else {
        <ul class="roll-list">
          @for (u of undertakings(); track u.id) {
            <li class="roll-item">
              <details (toggle)="onToggle(u.id, $event)">
                <summary class="roll-summary">
                  <span class="roll-title">{{ u.title }}</span>
                  <span class="lens-muted">{{ u.organizationName }}</span>
                  <span class="lens-pill">{{ statusLabel(u.status) }}</span>
                  <span class="lens-mono">{{ u.interestCount ?? 0 }} interest · {{ u.reportCount ?? 0 }} report</span>
                </summary>

                <div class="roll-body">
                  @if (loading()[u.id]) {
                    <p class="lens-muted" role="status">Loading chain…</p>
                  } @else if (errors()[u.id]) {
                    <p class="roll-error" role="alert">{{ errors()[u.id] }}</p>
                  } @else if (details()[u.id]; as d) {
                    <dl class="roll-stages">
                      <div class="roll-stage">
                        <dt>Interest</dt>
                        <dd>
                          @if (d.interests.length === 0) {
                            <span class="lens-muted">No interest recorded.</span>
                          }
                          @for (i of d.interests; track i.id) {
                            <span class="roll-line">{{ i.personName }} · {{ i.createdAt | date: 'd MMM y' }}@if (i.declined) { · declined }</span>
                          }
                        </dd>
                      </div>
                      <div class="roll-stage">
                        <dt>Offer</dt>
                        <dd>
                          @if (d.offers.length === 0) {
                            <span class="lens-muted">No offer issued.</span>
                          }
                          @for (o of d.offers; track o.id) {
                            <span class="roll-line">
                              To {{ o.offeredToPersonName }} · {{ offerLabel(o.status) }}
                              <span class="lens-muted">— {{ o.proposal }}</span>
                            </span>
                          }
                        </dd>
                      </div>
                      <div class="roll-stage">
                        <dt>Participants</dt>
                        <dd>
                          @if (d.participants.length === 0) {
                            <span class="lens-muted">No participants recorded.</span>
                          }
                          @for (p of d.participants; track p.personId) {
                            <span class="roll-line">{{ p.name }} · joined {{ p.joinedAt | date: 'd MMM y' }}</span>
                          }
                        </dd>
                      </div>
                      <div class="roll-stage">
                        <dt>Report and review</dt>
                        <dd>
                          @if (d.reports.length === 0) {
                            <span class="lens-muted">No report filed.</span>
                          }
                          @for (r of d.reports; track r.id) {
                            <span class="roll-line">{{ r.authorName }} · {{ r.createdAt | date: 'd MMM y' }}: {{ r.report }}</span>
                            @if (r.review; as rv) {
                              <span class="roll-line lens-muted">{{ reviewLabel(rv.decision) }} by {{ rv.reviewerName }}@if (rv.rationale) { — {{ rv.rationale }} }</span>
                            } @else {
                              <span class="roll-line lens-muted">Not yet reviewed.</span>
                            }
                          }
                        </dd>
                      </div>
                    </dl>
                    <p class="roll-open"><a class="lens-link" [routerLink]="['/workspace/workbench', u.id]">Open in Workbench</a></p>
                  }
                </div>
              </details>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
    .roll-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-space-2); }
    .roll-item { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); }
    .roll-summary { display: flex; flex-wrap: wrap; align-items: center; gap: var(--apt-space-3); padding: var(--apt-space-3) var(--apt-space-4); cursor: pointer; font-size: var(--apt-size-body); list-style: none; }
    .roll-summary::-webkit-details-marker { display: none; }
    .roll-summary:focus-visible { outline: 2px solid var(--apt-focus-ring, var(--apt-accent)); outline-offset: -2px; }
    .roll-title { font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); }
    .roll-body { padding: 0 var(--apt-space-4) var(--apt-space-4); border-top: 1px solid var(--apt-border); }
    .roll-stages { margin: var(--apt-space-4) 0 0; display: flex; flex-direction: column; gap: var(--apt-space-3); }
    .roll-stage { display: grid; grid-template-columns: 9rem 1fr; gap: var(--apt-space-3); }
    .roll-stage dt { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.06em; color: var(--apt-text-dim); }
    .roll-stage dd { margin: 0; display: flex; flex-direction: column; gap: var(--apt-space-1); font-size: var(--apt-size-body); }
    .roll-line { line-height: var(--apt-line-relaxed); }
    .roll-open { margin: var(--apt-space-4) 0 0; font-size: var(--apt-size-body); }
    .roll-error { color: var(--apt-text-body); }
    @media (max-width: 640px) { .roll-stage { grid-template-columns: 1fr; gap: var(--apt-space-1); } }
    `,
  ],
})
export class RollComponent {
  private readonly data = inject(WorkspaceDataService);

  readonly undertakings = () => this.data.recordsState().undertakings;
  readonly details = signal<Record<string, UndertakingDetail>>({});
  readonly loading = signal<Record<string, boolean>>({});
  readonly errors = signal<Record<string, string>>({});

  statusLabel(status: keyof typeof UNDERTAKING_STATUS_LABEL): string {
    return UNDERTAKING_STATUS_LABEL[status] ?? status;
  }

  offerLabel(status: keyof typeof OFFER_STATUS_LABEL): string {
    return OFFER_STATUS_LABEL[status] ?? status;
  }

  reviewLabel(decision: keyof typeof REVIEW_DECISION_LABEL): string {
    return REVIEW_DECISION_LABEL[decision] ?? decision;
  }

  onToggle(id: string, event: Event): void {
    const open = (event.target as HTMLDetailsElement).open;
    if (!open || this.details()[id] || this.loading()[id]) return;
    this.loading.update((state) => ({ ...state, [id]: true }));
    this.errors.update((state) => ({ ...state, [id]: '' }));
    this.data
      .undertaking(id)
      .then((detail) => this.details.update((state) => ({ ...state, [id]: detail })))
      .catch((error: unknown) => this.errors.update((state) => ({ ...state, [id]: describeWorkspaceError(error) })))
      .finally(() => this.loading.update((state) => ({ ...state, [id]: false })));
  }
}
