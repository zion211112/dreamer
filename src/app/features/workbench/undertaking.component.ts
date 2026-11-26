import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WorkspaceDataService, describeWorkspaceError, type UndertakingDetail } from '@apt-labs/shared/state';

@Component({
  selector: 'app-undertaking',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="undertaking">
      <a class="back" routerLink="/workspace/workbench">← Workbench</a>

      @if (error() && !undertaking()) {
        <section class="state error" role="alert"><div><h1>This undertaking cannot be opened</h1><p>{{ error() }}</p></div><a class="button" routerLink="/workspace/workbench">Back to workbench</a></section>
      } @else if (loading() && !undertaking()) {
        <p class="state" role="status">Loading the undertaking and its history…</p>
      } @else if (undertaking(); as work) {
        @if (message()) { <p class="notice" role="status">{{ message() }}</p> }
        @if (error()) { <p class="notice danger" role="alert">{{ error() }}</p> }

        <header class="head">
          <div class="meta-line">
            <span class="org">{{ work.organizationName }}</span>
            <span class="dot" aria-hidden="true">·</span>
            <span>{{ work.organizationStanding.replaceAll('_', ' ') }}</span>
            <span class="dot" aria-hidden="true">·</span>
            <span class="status" [class.active]="work.status === 'active'" [class.closed]="work.status === 'closed'">{{ statusLabel(work.status) }}</span>
          </div>
          <h1>{{ work.title }}</h1>
          <p class="byline">Published by {{ work.createdByName }} · {{ when(work.createdAt) }} · {{ work.participants.length }} participant{{ work.participants.length === 1 ? '' : 's' }}</p>
        </header>

        <div class="grid">
          <main>
            <section class="panel" aria-labelledby="scope-title">
              <h2 id="scope-title">Scope</h2>
              <p class="body">{{ work.scope }}</p>
            </section>

            <section class="panel" aria-labelledby="team-title">
              <h2 id="team-title">Participants</h2>
              @if (work.participants.length === 0) {
                <p class="muted">No one has accepted an offer yet. The undertaking stays open for interest.</p>
              } @else {
                <ul class="people">
                  @for (person of work.participants; track person.personId) {
                    <li><span class="avatar" aria-hidden="true">{{ initial(person.name) }}</span><span>{{ person.name }}</span><time>joined {{ when(person.joinedAt) }}</time></li>
                  }
                </ul>
              }
            </section>

            @if (work.position.isMember) {
              <section class="panel" aria-labelledby="interest-title">
                <h2 id="interest-title">Expressions of interest</h2>
                @if (work.interests.length === 0) {
                  <p class="muted">No one has expressed interest yet. Share the undertaking with people who can deliver it.</p>
                } @else {
                  @for (interest of work.interests; track interest.id) {
                    <article class="interest" [class.declined]="interest.declined">
                      <div class="row-head">
                        <strong>{{ interest.personName }}</strong>
                        <time>{{ when(interest.createdAt) }}</time>
                        @if (interest.declined) { <span class="chip">Declined</span> }
                      </div>
                      <p class="body small">{{ interest.message }}</p>
                      @if (!interest.declined && work.actions.canIssueOffer) {
                        <div class="inline-form">
                          <label [for]="'offer-' + interest.id">Offer this person the work</label>
                          <input [id]="'offer-' + interest.id" [name]="'offer-' + interest.id" [(ngModel)]="offerText[interest.id]" placeholder="What is offered, by when, and on what terms?" />
                          <div class="actions">
                            <button type="button" class="primary" [disabled]="busy() === interest.id || !offerText[interest.id]?.trim()" (click)="issueOffer(work, interest.id)">Issue offer</button>
                            <button type="button" [disabled]="busy() === interest.id" (click)="declineInterest(work, interest.id)">Decline interest</button>
                          </div>
                        </div>
                      }
                    </article>
                  }
                }
              </section>

              <section class="panel" aria-labelledby="offers-title">
                <h2 id="offers-title">Offers</h2>
                @if (work.offers.length === 0) {
                  <p class="muted">No offers issued yet.</p>
                } @else {
                  @for (offer of work.offers; track offer.id) {
                    <article class="offer">
                      <div class="row-head">
                        <strong>{{ offer.offeredToPersonName }}</strong>
                        <span class="chip" [class.chip-accepted]="offer.status === 'accepted'" [class.chip-declined]="offer.status === 'declined'">{{ offer.status }}</span>
                        <time>{{ when(offer.createdAt) }}</time>
                      </div>
                      <p class="body small">{{ offer.proposal }}</p>
                      <p class="muted">Issued by {{ offer.issuedByName }}@if (offer.decidedAt) { · decided {{ when(offer.decidedAt) }} }</p>
                    </article>
                  }
                }
              </section>
            }

            <section class="panel" aria-labelledby="delivery-title">
              <h2 id="delivery-title">Delivery and review</h2>
              @if (work.reports.length === 0) {
                <p class="muted">Nothing reported yet. Delivery is a participant report; a review is a separate decision by the organization.</p>
              } @else {
                @for (report of work.reports; track report.id) {
                  <article class="report">
                    <div class="row-head"><strong>{{ report.authorName }}</strong><time>{{ when(report.createdAt) }}</time>
                      @if (report.review) { <span class="chip" [class.chip-accepted]="report.review.decision === 'accepted'" [class.chip-declined]="report.review.decision !== 'accepted'">{{ reviewLabel(report.review.decision) }}</span> }
                    </div>
                    <p class="body small">{{ report.report }}</p>
                    @if (report.review) {
                      <div class="review"><p class="muted">Reviewed by {{ report.review.reviewerName }} · {{ when(report.review.createdAt) }}</p><p class="body small">{{ report.review.rationale }}</p></div>
                    } @else if (work.position.canReview && report.authorPersonId !== work.createdByPersonId) {
                      <div class="inline-form">
                        <label [for]="'decision-' + report.id">Review decision</label>
                        <select [id]="'decision-' + report.id" [name]="'decision-' + report.id" [(ngModel)]="reviewDecision[report.id]">
                          <option value="accepted">Accepted</option>
                          <option value="needs_revision">Needs revision</option>
                          <option value="disputed">Disputed</option>
                        </select>
                        <label [for]="'rationale-' + report.id">Rationale</label>
                        <textarea [id]="'rationale-' + report.id" [name]="'rationale-' + report.id" rows="2" [(ngModel)]="reviewText[report.id]" placeholder="What was checked, and why this decision?"></textarea>
                        <button type="button" class="primary" [disabled]="busy() === report.id" (click)="review(work, report.id)">Record review</button>
                      </div>
                    }
                  </article>
                }
              }

              @if (work.actions.canReport) {
                <form class="inline-form" (submit)="report(work, $event)">
                  <label for="report-text">Report delivered work</label>
                  <textarea id="report-text" name="report" rows="3" [(ngModel)]="reportText" placeholder="What was delivered, what remains, and what the organization should verify."></textarea>
                  <button type="submit" class="primary" [disabled]="saving() || !reportText.trim()">{{ saving() ? 'Recording…' : 'Submit report' }}</button>
                </form>
              }
            </section>

            <section class="panel" aria-labelledby="history-title">
              <h2 id="history-title">History</h2>
              @if (work.events.length === 0) {
                <p class="muted">No recorded activity yet.</p>
              } @else {
                <ol class="timeline">
                  @for (event of work.events; track event.id) {
                    <li><span class="actor">{{ event.actorName }}</span> {{ describe(event.action) }} <time>{{ when(event.occurredAt) }}</time></li>
                  }
                </ol>
              }
            </section>
          </main>

          <aside>
            <section class="panel position" aria-labelledby="position-title">
              <h2 id="position-title">Your position</h2>
              @if (work.position.role) { <p class="body small">You are {{ work.position.role === 'owner' ? 'an' : 'a' }} <strong>{{ work.position.role }}</strong> of {{ work.organizationName }}. Organization roles decide work; they are not a reputation score.</p> }
              @else if (work.position.isParticipant) { <p class="body small">You are an accepted participant. You can report delivery; you cannot review your own report.</p> }
              @else if (work.position.hasInterest) { <p class="body small">Your interest is with the organization. An offer is the next step; until then you are not a participant.</p> }
              @else { <p class="body small">This undertaking is open. Express interest to be considered; the organization decides through an offer.</p> }

              @if (work.position.pendingOffer; as offer) {
                <div class="panel-inner">
                  <h3>Offer waiting</h3>
                  <p class="body small">{{ offer.proposal }}</p>
                  <p class="muted">Issued by {{ offer.issuedByName }}.</p>
                  <div class="actions">
                    <button type="button" class="primary" [disabled]="busy() === offer.id" (click)="decide(work, offer.id, 'accepted')">Accept</button>
                    <button type="button" [disabled]="busy() === offer.id" (click)="decide(work, offer.id, 'declined')">Decline</button>
                  </div>
                </div>
              } @else if (work.actions.canRegisterInterest) {
                <form class="inline-form" (submit)="interest(work, $event)">
                  <label for="interest-text">Why you can deliver this scope</label>
                  <textarea id="interest-text" name="interest" rows="3" [(ngModel)]="interestText" placeholder="Relevant work, availability, and what you would need."></textarea>
                  <button type="submit" class="primary" [disabled]="saving() || !interestText.trim()">{{ saving() ? 'Sending…' : 'Express interest' }}</button>
                </form>
              }

              @if (work.actions.canClose) {
                <div class="panel-inner">
                  <h3>Close the undertaking</h3>
                  <p class="muted">Closing stops new interest, offers and reports. History remains readable.</p>
                  <button type="button" [disabled]="busy() === 'close'" (click)="close(work)">{{ busy() === 'close' ? 'Closing…' : 'Close undertaking' }}</button>
                </div>
              }
            </section>

            <section class="panel rules" aria-labelledby="rules-title">
              <h2 id="rules-title">What this record means</h2>
              <ul>
                <li>A report is the participant’s account, not independent verification.</li>
                <li>A review is a separate decision by the owning organization.</li>
                <li>No payment, credential or settlement is created here.</li>
                <li>Organization standing is shown as recorded, not as a trust guarantee.</li>
              </ul>
            </section>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    :host{display:block;font-family:var(--apt-font-sans);color:var(--apt-text-body)}
    .undertaking{max-width:1120px;margin:auto}
    .back{display:inline-block;margin:0 0 18px;color:var(--apt-text-muted);font:600 12px var(--apt-font-mono);text-decoration:none}
    .back:hover{color:var(--apt-accent)}
    .head{padding-bottom:20px;border-bottom:1px solid var(--apt-border)}
    .meta-line{display:flex;flex-wrap:wrap;gap:8px;align-items:center;color:var(--apt-text-muted);font-size:12px}
    .org{color:var(--apt-accent);font-weight:600}
    .dot{color:var(--apt-text-dim)}
    .status{color:var(--apt-text-info);font:600 11px var(--apt-font-mono);text-transform:uppercase;letter-spacing:.04em}
    .status.active{color:var(--apt-state-canon)}
    .status.closed{color:var(--apt-text-dim)}
    .head h1{margin:10px 0 8px;color:var(--apt-text-strong);font:600 34px/1.15 var(--apt-font-serif);letter-spacing:-.01em}
    .byline{margin:0;color:var(--apt-text-muted);font-size:12.5px}
    .grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:30px;margin-top:24px;align-items:start}
    @media(max-width:980px){.grid{grid-template-columns:1fr}}
    .panel{padding:18px 0 20px;border-bottom:1px solid var(--apt-border)}
    .panel:first-child{padding-top:0}
    .panel h2{margin:0 0 10px;color:var(--apt-text-strong);font:600 20px var(--apt-font-serif)}
    .panel h3{margin:14px 0 4px;color:var(--apt-text-strong);font:600 13px var(--apt-font-sans)}
    .body{margin:0;font-size:14.5px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
    .body.small{font-size:13.5px}
    .muted{margin:4px 0 0;color:var(--apt-text-muted);font-size:12.5px;line-height:1.5}
    .people{list-style:none;margin:0;padding:0;display:grid;gap:8px}
    .people li{display:flex;align-items:center;gap:10px;font-size:13.5px}
    .people time{margin-left:auto;color:var(--apt-text-dim);font:11px var(--apt-font-mono)}
    .avatar{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--apt-surface-subtle);color:var(--apt-text-strong);font:600 11px var(--apt-font-mono)}
    .interest,.offer,.report{padding:12px 0;border-top:1px solid var(--apt-border-faint)}
    .interest:first-of-type,.offer:first-of-type,.report:first-of-type{border-top:0;padding-top:0}
    .interest.declined{opacity:.62}
    .row-head{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
    .row-head strong{color:var(--apt-text-strong);font-size:13.5px}
    .row-head time{margin-left:auto;color:var(--apt-text-dim);font:11px var(--apt-font-mono)}
    .chip{padding:2px 7px;border:1px solid var(--apt-border);border-radius:4px;color:var(--apt-text-muted);font:600 10px var(--apt-font-mono);text-transform:uppercase;letter-spacing:.03em}
    .chip-accepted{color:var(--apt-state-canon)}
    .chip-declined{color:var(--apt-text-dim)}
    .inline-form{display:grid;gap:6px;margin-top:12px}
    .inline-form label{font:600 10.5px var(--apt-font-mono);text-transform:uppercase;letter-spacing:.05em;color:var(--apt-text-muted)}
    .inline-form input,.inline-form select,.inline-form textarea{width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-sm);background:var(--apt-surface-page);color:var(--apt-text-body);font:13.5px var(--apt-font-sans)}
    .inline-form input:focus-visible,.inline-form select:focus-visible,.inline-form textarea:focus-visible{outline:2px solid var(--apt-ring);outline-offset:1px}
    .inline-form button{justify-self:start;margin-top:4px}
    .actions{display:flex;gap:8px;margin-top:6px}
    button{font:600 12.5px var(--apt-font-sans);padding:8px 12px;border-radius:var(--apt-radius-sm);border:1px solid var(--apt-border-strong);background:var(--apt-surface-page);color:var(--apt-text-strong);cursor:pointer}
    button:hover:not(:disabled){background:var(--apt-surface-raised)}
    button:disabled{opacity:.55;cursor:not-allowed}
    button.primary{background:var(--apt-accent);border-color:var(--apt-accent);color:var(--apt-action-on-accent)}
    button.primary:hover:not(:disabled){background:var(--apt-accent-hover)}
    .review{margin-top:8px;padding:10px 12px;border-left:2px solid var(--apt-border-strong);background:var(--apt-surface-raised)}
    .timeline{list-style:none;margin:0;padding:0;display:grid;gap:8px}
    .timeline li{color:var(--apt-text-muted);font-size:12.5px;line-height:1.45}
    .timeline .actor{color:var(--apt-text-strong);font-weight:600}
    .timeline time{margin-left:6px;color:var(--apt-text-dim);font:11px var(--apt-font-mono)}
    .panel-inner{margin-top:16px;padding-top:14px;border-top:1px solid var(--apt-border-faint)}
    .rules ul{margin:0;padding-left:18px;color:var(--apt-text-muted);font-size:12.5px;line-height:1.6}
    .rules li{margin-bottom:5px}
    .state{margin-top:20px;padding:22px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-sm);background:var(--apt-surface-raised)}
    .state h1{margin:0 0 6px;font:600 20px var(--apt-font-serif);color:var(--apt-text-strong)}
    .state p{margin:0 0 14px;color:var(--apt-text-muted)}
    .state.error{border-color:color-mix(in srgb,var(--apt-text-danger) 40%,var(--apt-border));background:var(--apt-surface-danger)}
    .button{display:inline-block;padding:8px 12px;border-radius:var(--apt-radius-sm);background:var(--apt-accent);color:var(--apt-action-on-accent);font:600 12.5px var(--apt-font-sans);text-decoration:none}
    .notice{margin:16px 0 0;padding:10px 12px;border:1px solid color-mix(in srgb,var(--apt-state-canon) 30%,var(--apt-border));border-radius:var(--apt-radius-sm);background:color-mix(in srgb,var(--apt-state-canon) 7%,var(--apt-surface-page));font-size:13px}
    .notice.danger{border-color:color-mix(in srgb,var(--apt-text-danger) 40%,var(--apt-border));background:var(--apt-surface-danger);color:var(--apt-text-danger)}
  `],
})
export class UndertakingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly data = inject(WorkspaceDataService);
  readonly undertaking = signal<UndertakingDetail | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly busy = signal('');
  readonly error = signal('');
  readonly message = signal('');
  interestText = '';
  reportText = '';
  offerText: Record<string, string> = {};
  reviewText: Record<string, string> = {};
  reviewDecision: Record<string, string> = {};

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('undertakingId');
    if (!id) { this.error.set('No undertaking was requested.'); this.loading.set(false); return; }
    void this.load(id);
  }

  async load(id = this.undertaking()?.id): Promise<void> {
    if (!id) return;
    this.loading.set(true);
    this.error.set('');
    try {
      this.undertaking.set(await this.data.undertaking(id));
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.loading.set(false);
    }
  }

  async issueOffer(work: UndertakingDetail, interestId: string): Promise<void> {
    await this.mutate(interestId, async () => {
      await this.data.issueOffer(work.organizationId, work.id, interestId, this.offerText[interestId] ?? '');
      this.offerText[interestId] = '';
      this.message.set('Offer issued. The undertaking changes only when the recipient accepts.');
      await this.load(work.id);
    });
  }

  async declineInterest(work: UndertakingDetail, interestId: string): Promise<void> {
    await this.mutate(interestId, async () => {
      await this.data.declineInterest(work.organizationId, work.id, interestId);
      this.message.set('Interest declined. The decision is recorded; the message stays readable.');
      await this.load(work.id);
    });
  }

  async decide(work: UndertakingDetail, offerId: string, decision: 'accepted' | 'declined'): Promise<void> {
    await this.mutate(offerId, async () => {
      await this.data.decideOffer(offerId, decision);
      this.message.set(decision === 'accepted' ? 'Offer accepted. You are now a participant and can report delivery.' : 'Offer declined.');
      await this.load(work.id);
    });
  }

  async interest(work: UndertakingDetail, event: Event): Promise<void> {
    event.preventDefault();
    if (!this.interestText.trim()) return;
    await this.mutate('interest', async () => {
      await this.data.registerInterest(work.id, this.interestText.trim());
      this.interestText = '';
      this.message.set('Interest recorded with the owning organization.');
      await this.load(work.id);
    });
  }

  async report(work: UndertakingDetail, event: Event): Promise<void> {
    event.preventDefault();
    if (!this.reportText.trim()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await this.data.submitReport(work.id, this.reportText.trim());
      this.reportText = '';
      this.message.set('Report recorded. It is the participant account, not independent verification.');
      await this.load(work.id);
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.saving.set(false);
    }
  }

  async review(work: UndertakingDetail, reportId: string): Promise<void> {
    const decision = (this.reviewDecision[reportId] ?? 'accepted') as 'accepted' | 'disputed' | 'needs_revision';
    await this.mutate(reportId, async () => {
      await this.data.submitReview(work.organizationId, reportId, decision, this.reviewText[reportId] ?? '');
      this.reviewText[reportId] = '';
      this.message.set('Review recorded separately from the author’s report.');
      await this.load(work.id);
    });
  }

  async close(work: UndertakingDetail): Promise<void> {
    await this.mutate('close', async () => {
      await this.data.closeUndertaking(work.organizationId, work.id);
      this.message.set('Undertaking closed. No new interest, offers or reports can be added.');
      await this.load(work.id);
    });
  }

  statusLabel(status: string): string {
    return status === 'active' ? 'In delivery' : status === 'closed' ? 'Closed' : 'Open for interest';
  }

  reviewLabel(decision: string): string {
    return decision === 'accepted' ? 'Accepted' : decision === 'needs_revision' ? 'Needs revision' : 'Disputed';
  }

  describe(action: string): string {
    const copy: Record<string, string> = {
      'undertaking.created': 'published the undertaking',
      'undertaking.interest_submitted': 'expressed interest',
      'undertaking.interest_declined': 'declined an expression of interest',
      'undertaking.offer_issued': 'issued an offer',
      'undertaking.offer_accepted': 'accepted an offer',
      'undertaking.offer_declined': 'declined an offer',
      'undertaking.report_submitted': 'submitted a delivery report',
      'undertaking.review_accepted': 'accepted a delivery report',
      'undertaking.review_disputed': 'disputed a delivery report',
      'undertaking.review_needs_revision': 'asked for revision on a delivery report',
      'undertaking.closed': 'closed the undertaking',
    };
    return copy[action] ?? action.replaceAll('_', ' ').replaceAll('.', ' ');
  }

  when(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  initial(name: string): string {
    return name.trim().charAt(0).toLocaleUpperCase();
  }

  private async mutate(key: string, action: () => Promise<void>): Promise<void> {
    this.busy.set(key);
    this.error.set('');
    this.message.set('');
    try {
      await action();
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.busy.set('');
    }
  }
}
