import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceDataService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-commons',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="commons">
      <header class="head"><p class="eyebrow">APT-LABS · Commons</p><h1>Open work, shared scope</h1><p>Discover undertakings organizations have made open to participation. Read the scope before expressing interest; membership and standing are shown separately.</p></header>
      @if (data.error()) {<section class="state error" role="alert"><div><h2>Commons could not be loaded</h2><p>{{ data.error().replaceAll('_', ' ') }}. Check your session or service and try again.</p></div><button type="button" (click)="data.refresh()">Retry</button></section>}
      @else {
        <div class="tools"><label for="commons-search">Search open work</label><input id="commons-search" type="search" [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Title, organization, or scope"><span class="count">{{ visible().length }} open</span></div>
        @if (data.loading() && undertakings().length === 0) {<p class="state" role="status">Loading open undertakings…</p>}
        @else if (visible().length === 0 && !query()) {<section class="empty"><h2>No open undertakings yet</h2><p>When an organization publishes a scoped undertaking, it becomes discoverable here. Posting is available to an authorized organization member.</p><a routerLink="/workspace/workbench">Open Workbench →</a></section>}
        @else if (visible().length === 0) {<p class="empty" role="status">No open work matches “{{ query() }}”. Try another search.</p>}
        @else {<section class="list" aria-label="Open undertakings">@for (item of visible(); track item.id) {<article class="row"><div class="row-head"><span class="state-tag">Open</span><span class="org">{{ item.organizationName }}</span></div><h2>{{ item.title }}</h2><p>{{ item.scope }}</p><footer><span>Organization standing · {{ item.organizationStanding.replaceAll('_', ' ') }}</span><a [routerLink]="['/workspace/workbench', item.id]">Inspect undertaking <span aria-hidden="true">→</span></a></footer></article>}</section>}
      }
    </section>
  `,
  styles: [`
    :host{display:block;font-family:var(--apt-font-sans);color:var(--apt-text-body)}.commons{max-width:1120px;margin:auto}.head{padding:8px 0 24px;border-bottom:1px solid var(--apt-border)}.eyebrow{margin:0 0 7px;color:var(--apt-accent);font:600 11px var(--apt-font-mono);letter-spacing:.09em;text-transform:uppercase}.head h1{margin:0;color:var(--apt-text-strong);font:600 36px/1.12 var(--apt-font-serif)}.head>p:last-child{max-width:70ch;color:var(--apt-text-muted);line-height:1.55}.tools{display:flex;align-items:center;gap:14px;padding:20px 0}.tools label{font-size:13px;font-weight:600;color:var(--apt-text-strong)}.tools input{flex:1;min-width:0;max-width:480px;padding:10px 12px;border:1px solid var(--apt-border);border-radius:var(--apt-input-radius);background:var(--apt-surface-page);color:var(--apt-text-body);font:inherit}.tools input:focus-visible{outline:2px solid var(--apt-ring);outline-offset:2px}.count{margin-left:auto;color:var(--apt-text-muted);font:12px var(--apt-font-mono);white-space:nowrap}.list{border-top:1px solid var(--apt-border)}.row{padding:20px 12px;border-bottom:1px solid var(--apt-border-faint)}.row-head{display:flex;align-items:center;gap:10px}.state-tag{padding:3px 7px;border:1px solid var(--apt-border);border-radius:4px;color:var(--apt-text-info);font:600 10px var(--apt-font-mono);text-transform:uppercase}.org{color:var(--apt-text-muted);font-size:12px}.row h2{margin:10px 0 5px;color:var(--apt-text-strong);font:600 23px var(--apt-font-serif)}.row>p{max-width:80ch;margin:0;color:var(--apt-text-body);line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}.row footer{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:16px;color:var(--apt-text-muted);font-size:12px}.row footer a,.empty a{color:var(--apt-accent);text-decoration:none;font-weight:600}.row footer a:hover,.empty a:hover{text-decoration:underline}.empty,.state{margin-top:16px;padding:22px 18px;border:1px dashed var(--apt-border);border-radius:var(--apt-radius-md);color:var(--apt-text-muted);line-height:1.5}.empty h2,.state h2{margin:0 0 6px;color:var(--apt-text-strong);font:600 21px var(--apt-font-serif)}.empty p,.state p{margin:0 0 10px}.state.error{display:flex;justify-content:space-between;gap:16px;border-color:var(--apt-text-danger)}button{min-height:40px;padding:8px 14px;border:1px solid var(--apt-border);border-radius:var(--apt-button-radius);background:transparent;color:var(--apt-text-body);font:600 13px var(--apt-font-sans);cursor:pointer}@media(max-width:650px){.head h1{font-size:31px}.tools{align-items:stretch;flex-direction:column;gap:8px}.tools input{max-width:none}.count{margin-left:0}.row footer{align-items:flex-start;flex-direction:column;gap:8px}}
  `],
})
export class CommonsComponent implements OnInit {
  readonly data = inject(WorkspaceDataService);
  readonly query = signal('');
  readonly undertakings = computed(() => this.data.undertakingsState().filter((item) => item.status === 'open'));
  readonly visible = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return this.undertakings().filter((item) => !query || `${item.title} ${item.organizationName} ${item.scope}`.toLocaleLowerCase().includes(query));
  });
  ngOnInit(): void { void this.data.refresh(); }
}
