import { Component, computed, inject, signal } from '@angular/core';
import { WorkspaceDataService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-institutions',
  standalone: true,
  template: `
    <section class="page"><header><h2>Organizations in your network</h2><p>Organizations appear through your active memberships. The recorded standing is descriptive; identity, membership, capabilities, and formal authority remain separate.</p></header>
      <div class="toolbar"><label for="organization-search">Search organizations</label><input id="organization-search" type="search" [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Organization or membership role"><span>{{ visible().length }} visible</span></div>
      @if (data.loading() && organizations().length === 0) {<p class="empty" role="status">Loading your memberships…</p>}
      @else if (visible().length) {<ul class="list">@for (organization of visible(); track organization.id) {<li><span class="seal" aria-hidden="true">O</span><span class="main"><strong>{{ organization.name }}</strong><span>{{ organization.role }} membership</span></span><span class="standing">{{ organization.standing.replaceAll('_', ' ') }}</span></li>}</ul>}
      @else {<p class="empty">{{ query() ? 'No organizations match your search.' : 'No active organization memberships yet. An organization becomes visible to you when your membership is recorded.' }}</p>}
      <p class="boundary"><strong>Standing is not authority.</strong> Provisional standing is not formal verification. Membership alone does not grant decision rights; protected actions are checked by the server.</p>
    </section>
  `,
  styles: [`
    :host{display:block;font-family:var(--apt-font-sans);color:var(--apt-text-body)}.page{max-width:1120px;margin:auto}header{padding:8px 0 24px;border-bottom:1px solid var(--apt-border)}.eyebrow{margin:0 0 7px;color:var(--apt-accent);font:600 11px var(--apt-font-mono);letter-spacing:.09em;text-transform:uppercase}h2{margin:0;color:var(--apt-text-strong);font:600 28px/1.15 var(--apt-font-serif)}header>p:last-child{max-width:76ch;color:var(--apt-text-muted);line-height:1.55}.toolbar{display:flex;align-items:center;gap:12px;padding:18px 0}.toolbar label{color:var(--apt-text-strong);font-size:13px;font-weight:600}.toolbar input{flex:1;max-width:480px;min-width:0;padding:10px 12px;border:1px solid var(--apt-border);border-radius:var(--apt-input-radius);background:var(--apt-surface-page);color:var(--apt-text-body);font:inherit}.toolbar span{margin-left:auto;color:var(--apt-text-muted);font:11px var(--apt-font-mono)}.list{list-style:none;margin:0;padding:0;border-top:1px solid var(--apt-border)}.list li{display:flex;align-items:center;gap:13px;padding:15px 10px;border-bottom:1px solid var(--apt-border-faint)}.seal{display:grid;place-items:center;width:36px;height:36px;flex:none;border:1px solid var(--apt-border);border-radius:8px;color:var(--apt-accent);font:600 16px var(--apt-font-serif)}.main{display:grid;gap:4px;min-width:0;flex:1}.main strong{color:var(--apt-text-strong);font-size:14px}.main span{color:var(--apt-text-muted);font-size:12px;text-transform:capitalize}.standing{padding:4px 7px;border:1px solid var(--apt-border);border-radius:4px;color:var(--apt-text-muted);font:10px var(--apt-font-mono);text-transform:capitalize}.empty,.notice{padding:18px;border:1px dashed var(--apt-border);border-radius:var(--apt-radius-md);color:var(--apt-text-muted);font-size:13px;line-height:1.5}.notice{display:flex;justify-content:space-between;gap:12px;border-color:var(--apt-text-danger)}button{min-height:38px;padding:7px 12px;border:1px solid var(--apt-border);border-radius:var(--apt-button-radius);background:transparent;color:var(--apt-text-body);font:600 12px var(--apt-font-sans);cursor:pointer}.boundary{margin-top:18px;padding:13px;border-left:2px solid var(--apt-border);color:var(--apt-text-muted);font-size:12px;line-height:1.5}.boundary strong{display:block;margin-bottom:3px;color:var(--apt-text-strong)}@media(max-width:600px){h2{font-size:24px}.toolbar{align-items:stretch;flex-direction:column}.toolbar input{max-width:none}.toolbar span{margin:0}.notice{align-items:flex-start;flex-direction:column}.standing{max-width:120px;text-align:right}}
  `],
})
export class InstitutionsComponent {
  readonly data = inject(WorkspaceDataService);
  readonly query = signal('');
  readonly organizations = computed(() => this.data.networkState().organizations);
  readonly visible = computed(() => { const q = this.query().trim().toLocaleLowerCase(); return this.organizations().filter((organization) => !q || `${organization.name} ${organization.role} ${organization.standing}`.toLocaleLowerCase().includes(q)); });
}
