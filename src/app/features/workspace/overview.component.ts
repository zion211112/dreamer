import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceDataService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="home">
      <header class="head">
        <p class="eyebrow">APT-LABS · Workspace</p>
        <h1>Your work, in context</h1>
        <p class="lede">A shared record of work you can access, the organizations connected to you, and what changed most recently.</p>
        <nav class="actions" aria-label="Workspace actions">
          <a class="primary" routerLink="/workspace/commons">Find open work</a>
          <a class="quiet" routerLink="/workspace/workbench">Open Workbench</a>
        </nav>
      </header>

      @if (data.error()) {
        <section class="state error" role="alert"><div><h2>Workspace records could not be loaded</h2><p>{{ data.error().replaceAll('_', ' ') }}. Your work has not been changed.</p></div><button type="button" class="quiet" (click)="data.refresh()">Try again</button></section>
      } @else if (data.loading() && undertakings().length === 0) {
        <p class="state" role="status" aria-live="polite">Loading records you can access…</p>
      } @else {
        <section class="queue" aria-labelledby="queue-title">
          <div class="section-head"><div><p class="eyebrow">Your shared network</p><h2 id="queue-title">Work in view <span>{{ undertakings().length }}</span></h2></div><a routerLink="/workspace/commons">Browse Commons →</a></div>
          @if (undertakings().length) {
            <div class="records">
              @for (item of undertakings(); track item.id) {
                <a class="record" [routerLink]="['/workspace/workbench']" [queryParams]="{ undertaking: item.id }">
                  <span class="record-state" [attr.data-status]="item.status">{{ item.status }}</span>
                  <span class="record-main"><strong>{{ item.title }}</strong><span>{{ item.organizationName }} · {{ item.scope }}</span></span>
                  <span class="record-date">{{ item.createdAt | date:'mediumDate' }}</span>
                  <span class="arrow" aria-hidden="true">→</span>
                </a>
              }
            </div>
          } @else {
            <div class="empty"><h3>No shared work in view yet</h3><p>Open work becomes discoverable here. Join an undertaking through Commons, or post a scoped need for your organization.</p><a routerLink="/workspace/commons">Explore open undertakings →</a></div>
          }
        </section>

        <div class="lower">
          <section class="organizations" aria-labelledby="org-title"><div class="section-head"><div><p class="eyebrow">Membership</p><h2 id="org-title">Organizations</h2></div><a routerLink="/workspace/network">Network →</a></div>
            @if (data.organizationsState().length) {<ul>@for (org of data.organizationsState(); track org.id) {<li><strong>{{ org.name }}</strong><span>{{ org.role }} · {{ org.standing.replaceAll('_', ' ') }}</span></li>}</ul>}
            @else {<p class="muted">No active organization memberships yet. You can still discover open work.</p>}
          </section>
          <section class="activity" aria-labelledby="activity-title"><div class="section-head"><div><p class="eyebrow">Provenance</p><h2 id="activity-title">Recent activity</h2></div><a routerLink="/workspace/records">Records →</a></div>
            @if (recentEvents().length) {<ol>@for (event of recentEvents(); track event.id) {<li><span class="event-action">{{ event.action.replaceAll('.', ' ').replaceAll('_', ' ') }}</span><span>{{ event.actorName }} · {{ event.organizationName ?? 'Shared network' }}</span><time [attr.datetime]="event.occurredAt">{{ event.occurredAt | date:'short' }}</time></li>}</ol>}
            @else {<p class="muted">Activity appears here when authorized work is recorded. Participant reports remain separate from reviews.</p>}
          </section>
        </div>

        <section class="capability-note" aria-label="Capability record boundary"><span class="mark" aria-hidden="true">C</span><p><strong>Capability is not a score.</strong> This workspace does not yet store your personal capability claims. You may participate without a credential; claims, evidence, and assessments remain distinct.</p><a routerLink="/workspace/network/capabilities">Capability reference →</a></section>
      }
    </section>
  `,
  styles: [`
    :host{display:block;color:var(--apt-text-body);font-family:var(--apt-font-sans)}.home{max-width:1180px;margin-inline:auto}.head{padding:8px 0 30px;border-bottom:1px solid var(--apt-border)}.eyebrow{margin:0 0 7px;color:var(--apt-accent);font:600 11px var(--apt-font-mono);letter-spacing:.09em;text-transform:uppercase}.head h1{margin:0;color:var(--apt-text-strong);font:600 38px/1.12 var(--apt-font-serif)}.lede{max-width:68ch;margin:12px 0 0;color:var(--apt-text-muted);font-size:15px;line-height:1.55}.actions{display:flex;gap:10px;margin-top:20px}.actions a,.quiet,.primary{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 15px;border:1px solid var(--apt-border);border-radius:var(--apt-button-radius);font:600 13px var(--apt-font-sans);text-decoration:none;cursor:pointer}.primary{background:var(--apt-accent);border-color:var(--apt-accent);color:var(--apt-action-on-accent)}.quiet{background:transparent;color:var(--apt-text-body)}.section-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:14px}.section-head h2{margin:0;color:var(--apt-text-strong);font:600 23px/1.2 var(--apt-font-serif)}.section-head h2 span{margin-left:6px;color:var(--apt-text-muted);font:500 13px var(--apt-font-mono)}.section-head>a{color:var(--apt-accent);font-size:13px;text-decoration:none;white-space:nowrap}.queue{padding:26px 0;border-bottom:1px solid var(--apt-border)}.records{border-top:1px solid var(--apt-border)}.record{display:grid;grid-template-columns:78px minmax(0,1fr) 115px 22px;align-items:center;gap:14px;padding:16px 10px;border-bottom:1px solid var(--apt-border-faint);color:inherit;text-decoration:none}.record:hover,.record:focus-visible{background:var(--apt-surface-raised);outline-color:var(--apt-ring)}.record-state{width:max-content;padding:4px 7px;border:1px solid var(--apt-border);border-radius:4px;color:var(--apt-text-muted);font:600 10px var(--apt-font-mono);text-transform:uppercase}.record-state[data-status=active]{color:var(--apt-text-info)}.record-main{display:grid;gap:4px;min-width:0}.record-main strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--apt-text-strong);font-size:15px}.record-main span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--apt-text-muted);font-size:13px}.record-date{color:var(--apt-text-muted);font:12px var(--apt-font-mono)}.arrow{color:var(--apt-accent)}.empty,.state{padding:22px 18px;border:1px dashed var(--apt-border);border-radius:var(--apt-radius-md);color:var(--apt-text-muted)}.empty h3,.state h2{margin:0 0 5px;color:var(--apt-text-strong);font:600 19px var(--apt-font-serif)}.empty p,.state p{margin:0 0 10px;line-height:1.5}.empty a{color:var(--apt-accent);font-size:13px;text-decoration:none}.state.error{display:flex;justify-content:space-between;align-items:center;gap:18px;border-color:var(--apt-text-danger)}.lower{display:grid;grid-template-columns:minmax(240px,.85fr) minmax(0,1.4fr);gap:28px;padding:25px 0;border-bottom:1px solid var(--apt-border)}.lower section{min-width:0}.organizations ul,.activity ol{list-style:none;margin:0;padding:0}.organizations li,.activity li{display:grid;gap:4px;padding:12px 0;border-top:1px solid var(--apt-border-faint)}.organizations li strong{color:var(--apt-text-strong);font-size:14px}.organizations li span,.activity li span,.muted{color:var(--apt-text-muted);font-size:13px;line-height:1.45}.activity li{grid-template-columns:minmax(130px,.8fr) minmax(120px,1fr) auto;align-items:center}.activity li time{color:var(--apt-text-muted);font:11px var(--apt-font-mono);white-space:nowrap}.event-action{color:var(--apt-text-strong)!important;text-transform:capitalize}.capability-note{display:flex;align-items:center;gap:14px;padding:20px 0}.mark{display:grid;place-items:center;width:34px;height:34px;flex:none;border:1px solid var(--apt-border);border-radius:50%;color:var(--apt-accent);font:600 16px var(--apt-font-serif)}.capability-note p{flex:1;margin:0;color:var(--apt-text-muted);font-size:13px;line-height:1.5}.capability-note strong{color:var(--apt-text-strong)}.capability-note>a{color:var(--apt-accent);font-size:13px;text-decoration:none;white-space:nowrap}@media(max-width:760px){.head h1{font-size:32px}.lower{grid-template-columns:1fr;gap:12px}.record{grid-template-columns:65px minmax(0,1fr) 18px;gap:10px}.record-date{display:none}.activity li{grid-template-columns:1fr;gap:3px}.capability-note{align-items:flex-start;flex-wrap:wrap}.capability-note p{min-width:calc(100% - 52px)}.capability-note>a{margin-left:48px}.state.error{align-items:flex-start;flex-direction:column}}
  `],
})
export class OverviewComponent implements OnInit {
  readonly data = inject(WorkspaceDataService);
  readonly undertakings = computed(() => this.data.undertakingsState().filter((item) => item.status !== 'closed'));
  readonly recentEvents = computed(() => this.data.recordsState().events.slice(0, 5));

  ngOnInit(): void { void this.data.refresh(); }
}
