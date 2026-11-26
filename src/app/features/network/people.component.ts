import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { WorkspaceDataService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-people',
  standalone: true,
  template: `
    <section class="page"><header><p class="eyebrow">APT-LABS · Network / People</p><h1>People in your network</h1><p>People are shown only through active organization memberships you are authorized to see. Membership does not imply capability, endorsement, or authority beyond the recorded role.</p></header>
      @if (data.error()) {<p class="notice" role="alert">People records unavailable: {{ data.error().replaceAll('_', ' ') }} <button type="button" (click)="data.refresh()">Retry</button></p>}
      <div class="toolbar"><label for="people-search">Search members</label><input id="people-search" type="search" [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Name, organization, role"><span>{{ visible().length }} visible</span></div>
      @if (data.loading() && people().length === 0) {<p class="empty" role="status">Loading authorized memberships…</p>}
      @else if (visible().length) {<ul class="list">@for (person of visible(); track person.organizationId + person.id) {<li><span class="avatar" aria-hidden="true">{{ person.name.slice(0, 1).toUpperCase() }}</span><span class="main"><strong>{{ person.name }}</strong><span>{{ person.organizationName }}</span></span><span class="role">{{ person.role }}</span></li>}</ul>}
      @else {<p class="empty">{{ query() ? 'No members match your search.' : 'No other active members are visible yet. People appear here through organization memberships; no synthetic participant profiles are shown.' }}</p>}
    </section>
  `,
  styles: [`
    :host{display:block;font-family:var(--apt-font-sans);color:var(--apt-text-body)}.page{max-width:1120px;margin:auto}header{padding:8px 0 24px;border-bottom:1px solid var(--apt-border)}.eyebrow{margin:0 0 7px;color:var(--apt-accent);font:600 11px var(--apt-font-mono);letter-spacing:.09em;text-transform:uppercase}h1{margin:0;color:var(--apt-text-strong);font:600 36px/1.12 var(--apt-font-serif)}header>p:last-child{max-width:76ch;color:var(--apt-text-muted);line-height:1.55}.toolbar{display:flex;align-items:center;gap:12px;padding:18px 0}.toolbar label{color:var(--apt-text-strong);font-size:13px;font-weight:600}.toolbar input{flex:1;max-width:480px;min-width:0;padding:10px 12px;border:1px solid var(--apt-border);border-radius:var(--apt-input-radius);background:var(--apt-surface-page);color:var(--apt-text-body);font:inherit}.toolbar span{margin-left:auto;color:var(--apt-text-muted);font:11px var(--apt-font-mono)}.list{list-style:none;margin:0;padding:0;border-top:1px solid var(--apt-border)}.list li{display:flex;align-items:center;gap:13px;padding:14px 10px;border-bottom:1px solid var(--apt-border-faint)}.avatar{display:grid;place-items:center;width:36px;height:36px;flex:none;border:1px solid var(--apt-border);border-radius:50%;color:var(--apt-accent);font:600 16px var(--apt-font-serif)}.main{display:grid;gap:4px;min-width:0;flex:1}.main strong{color:var(--apt-text-strong);font-size:14px}.main span{overflow:hidden;color:var(--apt-text-muted);font-size:12px;text-overflow:ellipsis;white-space:nowrap}.role{padding:4px 7px;border:1px solid var(--apt-border);border-radius:4px;color:var(--apt-text-muted);font:10px var(--apt-font-mono);text-transform:uppercase}.empty,.notice{padding:18px;border:1px dashed var(--apt-border);border-radius:var(--apt-radius-md);color:var(--apt-text-muted);font-size:13px;line-height:1.5}.notice{display:flex;justify-content:space-between;gap:12px;border-color:var(--apt-text-danger)}button{min-height:38px;padding:7px 12px;border:1px solid var(--apt-border);border-radius:var(--apt-button-radius);background:transparent;color:var(--apt-text-body);font:600 12px var(--apt-font-sans);cursor:pointer}@media(max-width:600px){h1{font-size:31px}.toolbar{align-items:stretch;flex-direction:column}.toolbar input{max-width:none}.toolbar span{margin:0}.notice{align-items:flex-start;flex-direction:column}}
  `],
})
export class PeopleComponent implements OnInit {
  readonly data = inject(WorkspaceDataService);
  readonly query = signal('');
  readonly people = computed(() => this.data.networkState().members);
  readonly visible = computed(() => { const q = this.query().trim().toLocaleLowerCase(); return this.people().filter((person) => !q || `${person.name} ${person.organizationName} ${person.role}`.toLocaleLowerCase().includes(q)); });
  ngOnInit(): void { void this.data.refresh(); }
}
