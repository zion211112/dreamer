import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Organization { id: string; name: string; role: string }
interface Undertaking {
  id: string; organizationId: string; organizationName?: string; title: string; scope: string; status: string;
  isMember?: boolean; isParticipant?: boolean; canReview?: boolean; ownInterest?: boolean;
  interests?: Array<{ id: string; message: string }>;
  offers?: Array<{ id: string; proposal: string; status: string }>;
  reports?: Array<{ id: string; authorPersonId: string; report: string }>;
  reviews?: Array<{ reportId: string; decision: string; rationale: string }>;
}

@Component({
  selector: 'app-shared-workbench',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="page">
      <header class="head">
        <p class="eyebrow">APT-LABS · Workbench</p>
        <h1>Undertakings</h1>
        <p class="intro">A shared, persistent place to organise real work. Offers, participant reports and reviews are separate, attributable steps.</p>
      </header>

      @if (error()) { <p class="notice error" role="alert">{{ error() }}</p> }
      @if (message()) { <p class="notice" role="status">{{ message() }}</p> }
      @if (loading()) { <p class="empty" aria-live="polite">Loading shared records…</p> }

      <div class="columns">
        <main>
          <section aria-labelledby="open-title">
            <div class="section-head"><div><p class="eyebrow">Discover and coordinate</p><h2 id="open-title">Open undertakings</h2></div><button type="button" class="quiet" (click)="load()">Refresh</button></div>
            @if (!loading() && undertakings().length === 0) { <p class="empty">No open undertakings yet. Create an organisation, then post the first scoped piece of work.</p> }
            <div class="list">
              @for (item of undertakings(); track item.id) {
                <button type="button" class="row" [class.selected]="selected()?.id === item.id" (click)="select(item)">
                  <span class="row-kicker">{{ item.organizationName }} · {{ item.status }}</span>
                  <strong>{{ item.title }}</strong><span class="scope">{{ item.scope }}</span>
                </button>
              }
            </div>
          </section>

          @if (selected(); as item) {
            <section class="detail" aria-labelledby="detail-title">
              <p class="eyebrow">{{ item.organizationName }} · {{ item.status }}</p>
              <h2 id="detail-title">{{ item.title }}</h2><p>{{ item.scope }}</p>
              @if (!item.isMember && !item.isParticipant) {
                @if (item.ownInterest) { <p class="notice">Your expression of interest is recorded. An offer, if issued, will appear here.</p> }
                @else {
                  <form (submit)="interest($event, item)"><label for="interest">Express interest</label><textarea id="interest" name="interest" [(ngModel)]="interestText" required maxlength="4000" placeholder="Briefly describe how you could take part"></textarea><button class="primary" [disabled]="saving()">Send interest</button></form>
                }
                @for (offer of item.offers ?? []; track offer.id) { @if (offer.status === 'pending') { <article class="subcard"><p><strong>Offer</strong> · {{ offer.proposal }}</p><div class="actions"><button class="primary" (click)="decide(offer.id, 'accepted')">Accept</button><button class="quiet" (click)="decide(offer.id, 'declined')">Decline</button></div></article> } }
              }

              @if (item.isMember && (item.interests?.length ?? 0) > 0) {
                <h3>Expressions of interest</h3>
                @for (interest of item.interests; track interest.id) {
                  <article class="subcard"><p>{{ interest.message }}</p><form (submit)="offer($event, item, interest.id)"><label [for]="'offer-' + interest.id">Commissioner offer</label><textarea [id]="'offer-' + interest.id" name="proposal" [(ngModel)]="offerText[interest.id]" required maxlength="4000" placeholder="Describe the proposed role and scope"></textarea><button class="primary" [disabled]="saving()">Issue offer</button></form></article>
                }
              }

              @if (item.isParticipant) {
                <form (submit)="report($event, item)"><label for="report">Report work completed or in progress</label><textarea id="report" name="report" [(ngModel)]="reportText" required maxlength="10000" placeholder="Record a participant report; this is not independent verification"></textarea><button class="primary" [disabled]="saving()">Submit report</button></form>
              }

              @if ((item.reports?.length ?? 0) > 0) {
                <h3>Participant reports</h3>
                @for (report of item.reports; track report.id) {
                  <article class="subcard"><p class="report-label">Reported by a participant · not independently verified</p><p>{{ report.report }}</p>
                    @if (item.canReview && !item.reviews?.some(review => review.reportId === report.id)) {
                      <form (submit)="review($event, item, report.id)"><label [for]="'review-' + report.id">Separate commissioner review</label><select [id]="'decision-' + report.id" name="decision" [(ngModel)]="reviewDecision[report.id]"><option value="accepted">Accept report</option><option value="needs_revision">Request revision</option><option value="disputed">Dispute report</option></select><textarea [id]="'review-' + report.id" name="rationale" [(ngModel)]="reviewText[report.id]" required maxlength="4000" placeholder="Give a reason for the review decision"></textarea><button class="primary" [disabled]="saving()">Record review</button></form>
                    } @else if (item.reviews?.find(review => review.reportId === report.id); as review) { <p class="review">Review: {{ review.decision }} · {{ review.rationale }}</p> }
                  </article>
                }
              }
            </section>
          }
        </main>

        <aside>
          @if (organizations().length === 0) {
            <section class="panel"><p class="eyebrow">Start as an organisation</p><h2>Create a provisional organisation</h2><p>Creation establishes an owner membership; it does not verify institutional standing.</p><form (submit)="createOrganization($event)"><label for="org-name">Organisation name</label><input id="org-name" name="name" [(ngModel)]="organizationName" required maxlength="200"><button class="primary" [disabled]="saving()">Create organisation</button></form></section>
          } @else {
            <section class="panel"><p class="eyebrow">Your organisation</p><label for="organization">Select owner or member organisation</label><select id="organization" name="organization" [(ngModel)]="organizationId" (ngModelChange)="selectedOrganization.set($event)">@for (org of organizations(); track org.id) { <option [value]="org.id">{{ org.name }} · {{ org.role }}</option> }</select>
              <h2>Post an undertaking</h2><form (submit)="createUndertaking($event)"><label for="title">Title</label><input id="title" name="title" [(ngModel)]="title" required maxlength="200"><label for="scope">Scope</label><textarea id="scope" name="scope" [(ngModel)]="scope" required maxlength="10000" placeholder="What needs doing, and what is in scope?"></textarea><button class="primary" [disabled]="saving() || !organizationId">Post undertaking</button></form>
            </section>
          }
          <section class="principles"><h2>Record distinctions</h2><ul><li>Interest is not an offer.</li><li>Offer is not acceptance.</li><li>Participant report is not independent review.</li><li>Review is not payment, credential or universal assessment.</li></ul></section>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    :host{display:block;color:var(--apt-text-body);font-family:var(--apt-font-sans)}.page{max-width:1440px;margin:auto}.head{margin-bottom:32px}.eyebrow{margin:0 0 8px;color:var(--apt-accent);font:600 11px var(--apt-font-mono);letter-spacing:.1em;text-transform:uppercase}.head h1{margin:0;color:var(--apt-text-strong);font:600 clamp(30px,4vw,44px) var(--apt-font-serif)}.intro{max-width:68ch;color:var(--apt-text-muted);line-height:1.6}.columns{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(280px,.8fr);gap:32px;align-items:start}.section-head{display:flex;justify-content:space-between;align-items:center}.section-head h2,.detail h2,.panel h2{margin:0 0 14px;color:var(--apt-text-strong);font:600 23px var(--apt-font-serif)}.list{display:grid;gap:8px}.row{display:grid;gap:7px;width:100%;text-align:left;padding:16px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-md);background:var(--apt-surface-page);color:inherit;cursor:pointer}.row:hover,.row.selected{border-color:var(--apt-accent)}.row strong{font-size:17px;color:var(--apt-text-strong)}.row-kicker,.scope{font-size:13px;color:var(--apt-text-muted)}.detail,.panel,.principles{margin-top:20px;padding:20px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-md);background:var(--apt-surface-page)}.detail>p{line-height:1.6}.detail h3{margin:24px 0 10px;font:600 18px var(--apt-font-serif)}.panel>p:not(.eyebrow),.principles{font-size:13px;line-height:1.5;color:var(--apt-text-muted)}form{display:grid;gap:8px;margin:16px 0}label{font-size:13px;font-weight:600;color:var(--apt-text-strong)}input,textarea,select{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-sm);background:var(--apt-surface-default);color:var(--apt-text-body);font:inherit}textarea{min-height:84px;resize:vertical}button{min-height:40px;padding:8px 14px;border-radius:var(--apt-radius-sm);font:600 13px var(--apt-font-sans);cursor:pointer}.primary{justify-self:start;border:1px solid var(--apt-accent);background:var(--apt-accent);color:var(--apt-action-on-accent)}.quiet{border:1px solid var(--apt-border);background:transparent;color:var(--apt-text-body)}button:disabled{opacity:.55;cursor:wait}.subcard{margin:12px 0;padding:14px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-sm);background:var(--apt-surface-default)}.subcard p{line-height:1.55}.actions{display:flex;gap:8px}.empty,.notice{padding:16px;border:1px dashed var(--apt-border);border-radius:var(--apt-radius-sm);color:var(--apt-text-muted);line-height:1.5}.notice.error{border-color:var(--apt-text-danger);color:var(--apt-text-danger)}.report-label{font:11px var(--apt-font-mono);color:var(--apt-text-muted)}.review{padding:10px;background:var(--apt-surface-raised);border-radius:var(--apt-radius-sm)}.principles h2{font:600 16px var(--apt-font-serif);color:var(--apt-text-strong)}.principles ul{padding-left:18px}@media(max-width:900px){.columns{grid-template-columns:1fr}.columns aside{grid-row:1}.detail,.panel{margin-top:14px}}@media(max-width:600px){.page{padding:0}.columns{gap:12px}.row{padding:13px}.detail,.panel,.principles{padding:15px}}
  `],
})
export class SharedWorkbenchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly organizations = signal<Organization[]>([]);
  readonly undertakings = signal<Undertaking[]>([]);
  readonly selected = signal<Undertaking | null>(null);
  readonly selectedOrganization = signal('');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  organizationId = '';
  organizationName = '';
  title = '';
  scope = '';
  interestText = '';
  reportText = '';
  offerText: Record<string, string> = {};
  reviewText: Record<string, string> = {};
  reviewDecision: Record<string, string> = {};

  ngOnInit(): void { void this.load(this.route.snapshot.queryParamMap.get('undertaking')); }

  async load(requestedUndertakingId?: string | null): Promise<void> {
    this.loading.set(true); this.error.set('');
    try {
      const [orgResponse, workResponse] = await Promise.all([this.request<{ data: Organization[] }>('/api/me/organizations'), this.request<{ data: Undertaking[] }>('/api/undertakings')]);
      this.organizations.set(orgResponse.data); this.undertakings.set(workResponse.data);
      if (!this.organizationId && orgResponse.data[0]) this.organizationId = orgResponse.data[0].id;
      const currentId = this.selected()?.id ?? requestedUndertakingId;
      if (currentId) await this.select(this.undertakings().find(item => item.id === currentId) ?? null);
    } catch (error) { this.error.set(this.messageFor(error)); }
    finally { this.loading.set(false); }
  }

  async select(item: Undertaking | null): Promise<void> {
    if (!item) { this.selected.set(null); return; }
    try { const result = await this.request<{ data: Undertaking }>(`/api/undertakings/${item.id}`); this.selected.set(result.data); }
    catch (error) { this.error.set(this.messageFor(error)); }
  }

  async createOrganization(event: Event): Promise<void> {
    event.preventDefault(); await this.mutate(async () => { await this.request('/api/organizations', { method: 'POST', body: JSON.stringify({ name: this.organizationName }) }); this.organizationName = ''; await this.load(); this.message.set('Provisional organisation created. Its standing is not institutionally verified.'); });
  }

  async createUndertaking(event: Event): Promise<void> {
    event.preventDefault(); const organizationId = this.organizationId;
    await this.mutate(async () => { await this.request(`/api/organizations/${organizationId}/undertakings`, { method: 'POST', body: JSON.stringify({ title: this.title, scope: this.scope }) }); this.title = ''; this.scope = ''; await this.load(); this.message.set('Undertaking posted to the shared workspace.'); });
  }

  async interest(event: Event, item: Undertaking): Promise<void> {
    event.preventDefault(); await this.mutate(async () => { await this.request(`/api/undertakings/${item.id}/interests`, { method: 'POST', body: JSON.stringify({ message: this.interestText }) }); this.interestText = ''; await this.select(item); this.message.set('Expression of interest recorded for the organisation to consider.'); });
  }

  async offer(event: Event, item: Undertaking, interestId: string): Promise<void> {
    event.preventDefault(); await this.mutate(async () => { await this.request(`/api/organizations/${item.organizationId}/undertakings/${item.id}/offers`, { method: 'POST', body: JSON.stringify({ interestId, proposal: this.offerText[interestId] }) }); this.offerText[interestId] = ''; await this.select(item); this.message.set('Offer issued; it remains pending until the recipient decides.'); });
  }

  async decide(offerId: string, decision: string): Promise<void> {
    const item = this.selected(); if (!item) return;
    await this.mutate(async () => { await this.request(`/api/undertaking-offers/${offerId}/decision`, { method: 'POST', body: JSON.stringify({ decision }) }); await this.load(); await this.select(item); this.message.set(`Offer ${decision}.`); });
  }

  async report(event: Event, item: Undertaking): Promise<void> {
    event.preventDefault(); await this.mutate(async () => { await this.request(`/api/undertakings/${item.id}/reports`, { method: 'POST', body: JSON.stringify({ report: this.reportText }) }); this.reportText = ''; await this.select(item); this.message.set('Participant report recorded; it is not an independent verification.'); });
  }

  async review(event: Event, item: Undertaking, reportId: string): Promise<void> {
    event.preventDefault(); await this.mutate(async () => { await this.request(`/api/organizations/${item.organizationId}/reports/${reportId}/reviews`, { method: 'POST', body: JSON.stringify({ decision: this.reviewDecision[reportId] ?? 'accepted', rationale: this.reviewText[reportId] }) }); this.reviewText[reportId] = ''; await this.select(item); this.message.set('Separate review recorded. No payment, credential or settlement was created.'); });
  }

  private async mutate(action: () => Promise<void>): Promise<void> {
    this.saving.set(true); this.error.set(''); this.message.set('');
    try { await action(); } catch (error) { this.error.set(this.messageFor(error)); }
    finally { this.saving.set(false); }
  }

  private async request<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, { ...options, credentials: 'same-origin', headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
    const body = await response.json() as T & { error?: string };
    if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
    return body;
  }

  private messageFor(error: unknown): string {
    if (error instanceof Error) {
      const messages: Record<string, string> = { unauthenticated: 'Your session is unavailable. Sign in again.', forbidden: 'Your account is not authorised for this action.', interest_already_submitted: 'Your interest has already been submitted.', offer_already_exists: 'An offer has already been created for this participant.', author_cannot_review_own_report: 'The report author cannot review their own report.', report_already_reviewed: 'This report already has a review.' };
      return messages[error.message] ?? (error.message.includes('Failed to fetch') ? 'The workspace service is unavailable. Check the local server and try again.' : error.message.replaceAll('_', ' '));
    }
    return 'The request could not be completed. Please try again.';
  }
}
