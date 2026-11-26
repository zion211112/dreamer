import { Component, computed, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceDataService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-intelligence',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <section class="intelligence">
      <header class="head"><p class="eyebrow">APT-LABS · Intelligence</p><h1>What the record can support</h1><p>Transparent summaries of records you can access. There is no forecasting, scoring, automated matching, or autonomous recommendation engine connected here.</p></header>
      @if (data.error()) {<section class="state error" role="alert"><div><h2>Records could not be analyzed</h2><p>{{ data.error().replaceAll('_', ' ') }}.</p></div><button type="button" (click)="data.refresh()">Retry</button></section>}
      <section class="summary" aria-label="Record summary"><article><span>Open undertakings in your view</span><strong>{{ openCount() }}</strong><small>not a measure of value or quality</small></article><article><span>Recorded actions in your view</span><strong>{{ eventCount() }}</strong><small>not independent verification</small></article><article><span>Capability assessments</span><strong>Not connected</strong><small>no capability scoring</small></article></section>
      <section class="panel"><div class="panel-head"><div><p class="eyebrow">Source: permission-scoped activity</p><h2>Recent record changes</h2></div><a routerLink="/workspace/records">Open Records →</a></div>
        @if (data.loading() && recentEvents().length === 0) {<p class="state" role="status">Loading authorized records…</p>}
        @else if (recentEvents().length) {<ol class="events">@for (event of recentEvents(); track event.id) {<li><span class="event-mark" aria-hidden="true"></span><div><strong>{{ event.action.replaceAll('.', ' ').replaceAll('_', ' ') }}</strong><p>{{ event.actorName }} · {{ event.organizationName ?? 'Shared network' }} · {{ event.subjectType }}</p></div><time [attr.datetime]="event.occurredAt">{{ event.occurredAt | date:'medium' }}</time></li>}</ol>}
        @else {<p class="empty">No organization-visible activity is available yet. When records are created or updated, this view can summarize their recorded state.</p>}
      </section>
      <section class="limits"><h2>Limits are part of the analysis</h2><ul><li><strong>Reported ≠ reviewed.</strong> Participant reports and independent reviews are separate records.</li><li><strong>Recorded ≠ verified.</strong> An audit entry proves that an action was recorded, not that its claim is true.</li><li><strong>Identity ≠ authority.</strong> A signed-in account alone does not confer institutional standing or decision rights.</li><li><strong>No universal reputation score.</strong> We do not average people, capabilities, or evidence into a single score.</li></ul></section>
    </section>
  `,
  styles: [`
    :host{display:block;font-family:var(--apt-font-sans);color:var(--apt-text-body)}.intelligence{max-width:1120px;margin:auto}.head{padding:8px 0 24px;border-bottom:1px solid var(--apt-border)}.eyebrow{margin:0 0 7px;color:var(--apt-accent);font:600 11px var(--apt-font-mono);letter-spacing:.09em;text-transform:uppercase}.head h1{margin:0;color:var(--apt-text-strong);font:600 36px/1.12 var(--apt-font-serif)}.head>p:last-child{max-width:74ch;color:var(--apt-text-muted);line-height:1.55}.summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:22px 0}.summary article{display:grid;gap:8px;padding:16px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-md);background:var(--apt-surface-page)}.summary span,.summary small{color:var(--apt-text-muted);font-size:12px;line-height:1.4}.summary strong{color:var(--apt-text-strong);font:600 24px var(--apt-font-serif)}.summary small{font:11px var(--apt-font-mono)}.panel,.limits{margin-top:12px;padding:20px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-md);background:var(--apt-surface-page)}.panel-head{display:flex;justify-content:space-between;align-items:end;gap:12px}.panel-head h2,.limits h2{margin:0;color:var(--apt-text-strong);font:600 23px var(--apt-font-serif)}.panel-head a{color:var(--apt-accent);font-size:13px;text-decoration:none}.events{list-style:none;margin:17px 0 0;padding:0}.events li{display:grid;grid-template-columns:12px minmax(0,1fr) auto;align-items:center;gap:12px;padding:13px 0;border-top:1px solid var(--apt-border-faint)}.event-mark{width:9px;height:9px;border:2px solid var(--apt-accent);border-radius:50%}.events strong{color:var(--apt-text-strong);font-size:13px;text-transform:capitalize}.events p{margin:4px 0 0;color:var(--apt-text-muted);font-size:12px}.events time{color:var(--apt-text-muted);font:11px var(--apt-font-mono)}.empty,.state{padding:16px;border:1px dashed var(--apt-border);border-radius:var(--apt-radius-md);color:var(--apt-text-muted);font-size:13px;line-height:1.5}.state.error{display:flex;justify-content:space-between;gap:16px;border-color:var(--apt-text-danger)}.state h2{margin:0 0 5px;color:var(--apt-text-strong);font:600 18px var(--apt-font-serif)}.state p{margin:0}button{min-height:40px;padding:8px 14px;border:1px solid var(--apt-border);border-radius:var(--apt-button-radius);background:transparent;color:var(--apt-text-body);font:600 13px var(--apt-font-sans);cursor:pointer}.limits h2{margin-bottom:12px}.limits ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;list-style:none;margin:0;padding:0}.limits li{padding:12px;border-left:2px solid var(--apt-border);color:var(--apt-text-muted);font-size:12px;line-height:1.5}.limits li strong{display:block;margin-bottom:3px;color:var(--apt-text-strong)}@media(max-width:700px){.head h1{font-size:31px}.summary{grid-template-columns:1fr}.limits ul{grid-template-columns:1fr}.panel-head{align-items:flex-start;flex-direction:column}.events li{grid-template-columns:12px 1fr}.events time{grid-column:2}}
  `],
})
export class IntelligenceComponent implements OnInit {
  readonly data = inject(WorkspaceDataService);
  readonly openCount = computed(() => this.data.undertakingsState().filter((item) => item.status === 'open').length);
  readonly eventCount = computed(() => this.data.recordsState().events.length);
  readonly recentEvents = computed(() => this.data.recordsState().events.slice(0, 12));
  ngOnInit(): void { void this.data.refresh(); }
}
