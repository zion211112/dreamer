import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WorkspaceDataService, describeWorkspaceError, type WorkbenchSummary } from '@apt-labs/shared/state';
import { SectionTabsComponent, type SectionTab } from '../workspace/section-tabs.component';

@Component({
  selector: 'app-workbench',
  standalone: true,
  imports: [FormsModule, RouterLink, SectionTabsComponent],
  template: `
    <section class="workbench">
      <header class="head">
        <p class="eyebrow">APT-LABS · Workbench</p>
        <h1>Work, with someone accountable on both ends.</h1>
        <p class="intro">Publish a scoped undertaking, invite a person through an offer, deliver against it, and review the delivery as a different person. Every step is a record on the same undertaking — not a message thread that disappears.</p>
      </header>

      <app-section-tabs label="Workbench sections" [tabs]="tabs" />

      @if (error()) {
        <section class="state error" role="alert"><div><h2>The workbench could not be loaded</h2><p>{{ error() }}</p></div><button type="button" (click)="load()">Retry</button></section>
      } @else if (loading() && !summary()) {
        <p class="state" role="status">Loading your work, decisions and organisations…</p>
      } @else if (summary(); as s) {
        @if (message()) { <p class="notice" role="status">{{ message() }}</p> }

        <div class="grid">
          <main>
            <section class="panel" aria-labelledby="needs-title">
              <header class="panel-head">
                <div><h2 id="needs-title">Needs you</h2><p>Interests waiting for a decision, and delivered reports waiting for a separate review.</p></div>
                <span class="count" [class.zero]="s.counts.needsYou === 0">{{ s.counts.needsYou }}</span>
              </header>
              @if (s.needsYou.length === 0) {
                <p class="empty">Nothing is waiting on you. Publish work, or check whether an undertaking needs closing.</p>
              } @else {
                <ul class="queue">
                  @for (item of s.needsYou; track item) {
                    <li>
                      <div class="row-head">
                        <span class="chip" [class.chip-report]="item.kind === 'report'">{{ item.kind === 'interest' ? 'Interest' : 'Report' }}</span>
                        <a class="row-title" [routerLink]="['/workspace/workbench', item.undertakingId]">{{ item.title }}</a>
                        <time>{{ when(item.createdAt) }}</time>
                      </div>
                      <p class="row-meta">{{ item.personName }} · {{ item.organizationName }}</p>
                      <p class="row-body">{{ item.kind === 'interest' ? item.message : item.report }}</p>
                      <a class="row-action" [routerLink]="['/workspace/workbench', item.undertakingId]">{{ item.kind === 'interest' ? 'Decide the interest' : 'Review the report' }} <span aria-hidden="true">→</span></a>
                    </li>
                  }
                </ul>
              }
            </section>

            <section class="panel" aria-labelledby="work-title">
              <header class="panel-head">
                <div><h2 id="work-title">My work</h2><p>Undertakings you took on through an accepted offer.</p></div>
                <span class="count">{{ s.myWork.length }}</span>
              </header>
              @if (s.myWork.length === 0) {
                <p class="empty">You are not on a delivery yet. <a routerLink="/workspace/commons">Find open work in Commons →</a></p>
              } @else {
                <ul class="queue">
                  @for (item of s.myWork; track item.undertakingId) {
                    <li>
                      <div class="row-head">
                        <span class="chip" [class.chip-closed]="item.status === 'closed'" [class.chip-active]="item.status === 'active'">{{ statusLabel(item.status) }}</span>
                        <a class="row-title" [routerLink]="['/workspace/workbench', item.undertakingId]">{{ item.title }}</a>
                        <time>{{ when(item.joinedAt) }}</time>
                      </div>
                      <p class="row-meta">{{ item.organizationName }}</p>
                      <p class="row-body">{{ item.scope }}</p>
                    </li>
                  }
                </ul>
              }
            </section>

            <section class="panel" aria-labelledby="interest-title">
              <header class="panel-head">
                <div><h2 id="interest-title">My interest</h2><p>Expressions of interest still with the owning organization.</p></div>
                <span class="count">{{ s.myInterests.length }}</span>
              </header>
              @if (s.myInterests.length === 0) {
                <p class="empty">You have no pending interest. Discover <a routerLink="/workspace/commons">open work</a>.</p>
              } @else {
                <ul class="queue">
                  @for (item of s.myInterests; track item.undertakingId) {
                    <li>
                      <div class="row-head">
                        <span class="chip" [class.chip-closed]="item.status === 'closed'">{{ statusLabel(item.status) }}</span>
                        <a class="row-title" [routerLink]="['/workspace/workbench', item.undertakingId]">{{ item.title }}</a>
                        <time>{{ when(item.createdAt) }}</time>
                      </div>
                      <p class="row-meta">{{ item.organizationName }}</p>
                      <p class="row-body">{{ item.message }}</p>
                    </li>
                  }
                </ul>
              }
            </section>
          </main>

          <aside>
            <section class="panel offers" aria-labelledby="offers-title">
              <header class="panel-head"><div><h2 id="offers-title">Offers to you</h2><p>Accepting makes you a participant; declining keeps the record.</p></div><span class="count">{{ s.offersToYou.length }}</span></header>
              @if (s.offersToYou.length === 0) {
                <p class="empty">No pending offers.</p>
              } @else {
                @for (offer of s.offersToYou; track offer.offerId) {
                  <article class="offer">
                    <a class="row-title" [routerLink]="['/workspace/workbench', offer.undertakingId]">{{ offer.title }}</a>
                    <p class="row-meta">{{ offer.organizationName }} · issued by {{ offer.issuedByName }}</p>
                    <p class="row-body">{{ offer.proposal }}</p>
                    <div class="actions">
                      <button type="button" class="primary" [disabled]="busy() === offer.offerId" (click)="decide(offer.offerId, 'accepted')">Accept offer</button>
                      <button type="button" [disabled]="busy() === offer.offerId" (click)="decide(offer.offerId, 'declined')">Decline</button>
                    </div>
                  </article>
                }
              }
            </section>

            <section class="panel" aria-labelledby="org-title">
              <header class="panel-head"><div><h2 id="org-title">Your organisation</h2><p>Publish scoped work and close it when delivery ends.</p></div></header>
              @if (s.organizations.length === 0) {
                <form class="form" (submit)="createOrganization($event)">
                  <p class="row-meta">You are not in an organization yet. Creating one makes you its owner, able to publish work and add colleagues.</p>
                  <label for="org-name">Organization name</label>
                  <input id="org-name" name="orgName" [(ngModel)]="organizationName" required placeholder="e.g. Kisumu Market Traders Association">
                  <button type="submit" class="primary" [disabled]="saving() || !organizationName.trim()">{{ saving() ? 'Creating…' : 'Create organization' }}</button>
                </form>
              } @else if (managedOrganizations().length === 0) {
                <p class="empty">You are a member, not a manager. Ask an owner or administrator for a managing role to publish work.</p>
              } @else {
                <form class="form" (submit)="createUndertaking($event)">
                  <label for="work-org">Publishing as</label>
                  <select id="work-org" [value]="organizationId()" (change)="organizationId.set($any($event.target).value)">
                    @for (org of managedOrganizations(); track org.id) { <option [value]="org.id">{{ org.name }}</option> }
                  </select>
                  <label for="work-title">Title</label>
                  <input id="work-title" name="title" [(ngModel)]="title" maxlength="200" required placeholder="e.g. Map 40 market stalls in Kisumu">
                  <label for="work-scope">Scope and deliverable</label>
                  <textarea id="work-scope" name="scope" [(ngModel)]="scope" rows="4" required placeholder="What is included, what is out of scope, and what a complete delivery looks like."></textarea>
                  <button type="submit" class="primary" [disabled]="saving()">{{ saving() ? 'Publishing…' : 'Publish undertaking' }}</button>
                </form>
              }

              @if (s.organizationWork.length) {
                <h3 class="subhead">Published work</h3>
                <ul class="published">
                  @for (item of s.organizationWork; track item.id) {
                    <li>
                      <a [routerLink]="['/workspace/workbench', item.id]">{{ item.title }}</a>
                      <p class="row-meta">{{ statusLabel(item.status) }} · {{ item.interestCount }} interest · {{ item.participantCount }} participant · {{ item.reportCount }} report</p>
                      @if (item.status !== 'closed') {
                        <button type="button" class="link" [disabled]="busy() === item.id" (click)="close(item)">Close undertaking</button>
                      }
                    </li>
                  }
                </ul>
              }
              @if (canAdminister()) {
                <form class="form member-form" (submit)="addMember($event)">
                  <h3 class="subhead">Add a colleague</h3>
                  <p class="row-meta">Membership is how several people share one commissioning authority. The person needs an account first.</p>
                  <label for="member-email">Account email</label>
                  <input id="member-email" type="email" name="memberEmail" [(ngModel)]="memberEmail" required placeholder="colleague@organisation.org">
                  <label for="member-role">Role</label>
                  <select id="member-role" name="memberRole" [(ngModel)]="memberRole">
                    <option value="manager">Manager — publish, decide, review</option>
                    <option value="administrator">Administrator — manage work and members</option>
                    <option value="member">Member — read the organization's work</option>
                    <option value="viewer">Viewer — read only</option>
                  </select>
                  <button type="submit" [disabled]="saving() || !memberEmail.trim()">{{ saving() ? 'Adding…' : 'Add member' }}</button>
                </form>
              }
            </section>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    :host{display:block;color:var(--apt-text-body);font-family:var(--apt-font-sans)}
    .workbench{max-width:1180px;margin:auto}
    .head{padding:6px 0 22px;border-bottom:1px solid var(--apt-border)}
    .eyebrow{margin:0 0 8px;color:var(--apt-accent);font:600 11px var(--apt-font-mono);letter-spacing:.09em;text-transform:uppercase}
    .head h1{margin:0;color:var(--apt-text-strong);font:600 34px/1.15 var(--apt-font-serif);letter-spacing:-.01em}
    .intro{max-width:76ch;margin:10px 0 0;color:var(--apt-text-muted);line-height:1.55}
    .grid{display:grid;grid-template-columns:minmax(0,1fr) 372px;gap:28px;margin-top:26px;align-items:start}
    @media(max-width:1000px){.grid{grid-template-columns:1fr}}
    .panel{padding:18px 0 22px;border-bottom:1px solid var(--apt-border)}
    .panel:first-child{padding-top:0}
    .panel-head{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:12px}
    .panel-head h2{margin:0;color:var(--apt-text-strong);font:600 21px var(--apt-font-serif)}
    .panel-head p{margin:4px 0 0;color:var(--apt-text-muted);font-size:12.5px;line-height:1.45}
    .count{min-width:26px;padding:3px 8px;border:1px solid var(--apt-border);border-radius:999px;color:var(--apt-text-strong);font:600 12px var(--apt-font-mono);text-align:center}
    .count.zero{color:var(--apt-text-dim)}
    .queue{list-style:none;margin:0;padding:0}
    .queue li{padding:13px 0;border-top:1px solid var(--apt-border-faint)}
    .row-head{display:flex;align-items:baseline;gap:10px}
    .row-title{color:var(--apt-text-strong);font-weight:600;text-decoration:none}
    .row-title:hover{text-decoration:underline;text-underline-offset:3px}
    .row-head time{margin-left:auto;color:var(--apt-text-dim);font:11px var(--apt-font-mono);white-space:nowrap}
    .row-meta{margin:4px 0 0;color:var(--apt-text-muted);font-size:12px}
    .row-body{max-width:74ch;margin:5px 0 0;color:var(--apt-text-body);font-size:13.5px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
    .row-action{display:inline-block;margin-top:7px;color:var(--apt-accent);font-size:12.5px;font-weight:600;text-decoration:none}
    .row-action:hover{text-decoration:underline}
    .chip{padding:2px 7px;border:1px solid var(--apt-border);border-radius:4px;color:var(--apt-text-muted);font:600 10px var(--apt-font-mono);text-transform:uppercase;letter-spacing:.03em;white-space:nowrap}
    .chip-active{color:var(--apt-state-canon);border-color:color-mix(in srgb,var(--apt-state-canon) 35%,var(--apt-border))}
    .chip-report{color:var(--apt-state-info)}
    .chip-closed{color:var(--apt-text-dim)}
    .empty{margin:0;padding:14px 0;color:var(--apt-text-muted);font-size:13.5px}
    .empty a{color:var(--apt-accent);font-weight:600;text-decoration:none}
    .offer{padding:12px 0;border-top:1px solid var(--apt-border-faint)}
    .offer:first-of-type{border-top:0;padding-top:0}
    .actions{display:flex;gap:8px;margin-top:10px}
    button{font:600 12.5px var(--apt-font-sans);padding:8px 12px;border-radius:var(--apt-radius-sm);border:1px solid var(--apt-border-strong);background:var(--apt-surface-page);color:var(--apt-text-strong);cursor:pointer}
    button:hover:not(:disabled){background:var(--apt-surface-raised)}
    button:disabled{opacity:.55;cursor:not-allowed}
    button.primary{background:var(--apt-accent);border-color:var(--apt-accent);color:var(--apt-action-on-accent)}
    button.primary:hover:not(:disabled){background:var(--apt-accent-hover)}
    button.link{padding:0;border:0;background:none;color:var(--apt-accent);font:600 12px var(--apt-font-sans);margin-top:6px}
    .form{display:grid;gap:6px;margin:6px 0 18px}
    .form label{font:600 11px var(--apt-font-mono);text-transform:uppercase;letter-spacing:.05em;color:var(--apt-text-muted);margin-top:6px}
    .form input,.form select,.form textarea{padding:8px 10px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-sm);background:var(--apt-surface-page);color:var(--apt-text-body);font:13.5px var(--apt-font-sans);width:100%;box-sizing:border-box}
    .form input:focus-visible,.form select:focus-visible,.form textarea:focus-visible{outline:2px solid var(--apt-ring);outline-offset:1px}
    .form button{margin-top:10px;justify-self:start}
    .subhead{margin:18px 0 6px;color:var(--apt-text-strong);font:600 13px var(--apt-font-sans)}
    .published{list-style:none;margin:0;padding:0}
    .published li{padding:9px 0;border-top:1px solid var(--apt-border-faint)}
    .published a{color:var(--apt-text-strong);font-size:13.5px;font-weight:600;text-decoration:none}
    .published a:hover{text-decoration:underline}
    .state{margin-top:18px;padding:18px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-sm);background:var(--apt-surface-raised);display:flex;gap:16px;justify-content:space-between;align-items:center}
    .state h2{margin:0 0 4px;font:600 16px var(--apt-font-serif)}
    .state p{margin:0;color:var(--apt-text-muted);font-size:13px}
    .state.error{border-color:color-mix(in srgb,var(--apt-text-danger) 40%,var(--apt-border));background:var(--apt-surface-danger)}
    .notice{margin:16px 0 0;padding:10px 12px;border:1px solid color-mix(in srgb,var(--apt-state-canon) 30%,var(--apt-border));border-radius:var(--apt-radius-sm);background:color-mix(in srgb,var(--apt-state-canon) 7%,var(--apt-surface-page));color:var(--apt-text-strong);font-size:13px}
  `],
})
export class WorkbenchComponent implements OnInit {
  readonly data = inject(WorkspaceDataService);
  readonly tabs: readonly SectionTab[] = [
    { label: 'Undertakings', path: '/workspace/workbench' },
    { label: 'Value', path: '/workspace/workbench/value' },
  ];
  readonly summary = signal<WorkbenchSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly message = signal('');
  readonly saving = signal(false);
  readonly busy = signal('');
  readonly organizationId = signal('');
  title = '';
  scope = '';
  memberEmail = '';
  memberRole = 'manager';
  organizationName = '';

  readonly managedOrganizations = computed(() => (this.summary()?.organizations ?? []).filter((org) => ['owner', 'administrator', 'manager'].includes(org.role)));
  readonly canAdminister = computed(() => (this.summary()?.organizations ?? []).some((org) => ['owner', 'administrator'].includes(org.role)));

  ngOnInit(): void { void this.load(); }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.summary.set(await this.data.workbench());
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.loading.set(false);
    }
  }

  async decide(offerId: string, decision: 'accepted' | 'declined'): Promise<void> {
    await this.mutate(offerId, async () => {
      await this.data.decideOffer(offerId, decision);
      this.message.set(decision === 'accepted' ? 'Offer accepted. The undertaking is now in delivery and you can report against it.' : 'Offer declined. The organization keeps the record of the decision.');
      await this.load();
    });
  }

  async close(item: { id: string; organizationId: string }): Promise<void> {
    await this.mutate(item.id, async () => {
      await this.data.closeUndertaking(item.organizationId, item.id);
      this.message.set('Undertaking closed. New interest, offers and reports stop; the history stays readable.');
      await this.load();
    });
  }

  async createOrganization(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.organizationName.trim()) return;
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    try {
      const organization = await this.data.createOrganization(this.organizationName.trim());
      this.organizationId.set(organization.id);
      this.organizationName = '';
      this.message.set('Organization created. You are its owner; publish a scoped undertaking next.');
      await this.load();
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.saving.set(false);
    }
  }

  async addMember(event: Event): Promise<void> {
    event.preventDefault();
    const organizationId = this.organizationId() || this.managedOrganizations()[0]?.id;
    if (!organizationId || !this.memberEmail.trim()) return;
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    try {
      const member = await this.data.addMember(organizationId, this.memberEmail.trim(), this.memberRole);
      this.memberEmail = '';
      this.message.set(`${member.name} added as ${member.role}. They can act for the organization after signing in again.`);
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.saving.set(false);
    }
  }

  async createUndertaking(event: Event): Promise<void> {
    event.preventDefault();
    const organizationId = this.organizationId() || this.managedOrganizations()[0]?.id;
    if (!organizationId || this.title.trim().length < 3 || !this.scope.trim()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await this.data.createUndertaking(organizationId, { title: this.title.trim(), scope: this.scope.trim() });
      this.title = '';
      this.scope = '';
      this.message.set('Undertaking published to the shared workspace.');
      await this.load();
    } catch (error) {
      this.error.set(describeWorkspaceError(error));
    } finally {
      this.saving.set(false);
    }
  }

  statusLabel(status: string): string {
    return status === 'active' ? 'In delivery' : status === 'closed' ? 'Closed' : 'Open';
  }

  when(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
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
