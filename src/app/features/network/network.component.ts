/**
 * @apt-labs/features/network — NetworkComponent
 *
 * Network directory for real, connected actor records. No synthetic entries
 * are presented as participants.
 */
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceDataService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="net" data-module="network">
      <div class="net-pagehead">
        <p class="net-eyebrow">APT-LABS · Network</p>
        <h1 class="net-h1">People and institutions</h1>
        <p class="net-sub">See organizations you belong to and people connected through their active memberships. This view is permission-scoped, not a public people directory.</p>
        <div class="net-actions"><a class="net-btn net-btn--quiet" routerLink="/workspace/network/people">People and crews →</a><a class="net-btn net-btn--quiet" routerLink="/workspace/network/institutions">Institutions →</a><a class="net-btn net-btn--quiet" routerLink="/workspace/network/capabilities">Capabilities →</a></div>
      </div>
      @if (data.loading() && !data.error()) { <p class="net-empty" role="status">Loading authorized network records…</p> }
      @else if (data.error()) { <p class="net-empty" role="alert">Network records are unavailable: {{ data.error().replaceAll('_', ' ') }} <button type="button" (click)="data.refresh()">Retry</button></p> }
      @else {
      <div class="net-summary"><section><span>Organizations you belong to</span><strong>{{ data.networkState().organizations.length }}</strong></section><section><span>Other active members in those organizations</span><strong>{{ members().length }}</strong></section></div>

      <div class="net-table-wrap">
        <table class="net-table">
          <thead>
            <tr>
              <th class="net-th">Person</th>
              <th class="net-th">Organization</th>
              <th class="net-th">Membership</th>
              <th class="net-th net-th--actions">Context</th>
            </tr>
          </thead>
          <tbody>
            @for (row of members(); track row.id + row.organizationId) {
              <tr class="net-tr">
                <td class="net-td net-td--name"><span class="net-name">{{ row.name }}</span></td>
                <td class="net-td">{{ row.organizationName }}</td>
                <td class="net-td"><span class="net-type-badge">{{ row.role }}</span></td>
                <td class="net-td net-td--actions"><a class="net-btn net-btn--sm net-btn--quiet" routerLink="/workspace/workbench">Open work</a></td>
              </tr>
            }
            @if (members().length === 0) {
              <tr><td colspan="4" class="net-empty">No other active organization members are visible in your current network.</td></tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>
  `,
  styles: [
    `
    .net { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }
    .net-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0 26px}.net-summary section{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--apt-border);border-radius:var(--apt-radius-md);background:var(--apt-surface-page)}.net-summary span{color:var(--apt-text-muted);font-size:13px}.net-summary strong{color:var(--apt-text-strong);font:600 22px var(--apt-font-serif)}

    .net-pagehead { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); }
    .net-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0; text-transform: uppercase; }
    .net-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); letter-spacing: -0.022em; line-height: 1.05; }
    @media(max-width:760px){.net-h1{font-size:clamp(30px,8vw,36px)}}
    .net-sub { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-height-relaxed); }
    .net-actions { display: flex; gap: var(--apt-spacing-s3); margin-top: var(--apt-spacing-s4); }

    .net-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--apt-spacing-s2);
      padding: var(--apt-button-padding);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r1);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-font-size-body-sm);
      font-weight: var(--apt-font-weight-medium);
      font-family: inherit;
      cursor: pointer;
    }
    .net-btn:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .net-btn--primary { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .net-btn--primary:hover { background: color-mix(in srgb, var(--apt-color-brand-primary) 90%, var(--apt-surface-default)); }
    .net-btn--quiet { background: transparent; border-color: transparent; color: var(--apt-text-muted); }
    .net-btn--quiet:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); }
    .net-btn--sm { padding: var(--apt-spacing-s1) var(--apt-spacing-s3); font-size: var(--apt-font-size-sm-3); }

    /* Type pills */
    .net-pills { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); }
    .net-pill { display: flex; align-items: center; gap: var(--apt-spacing-s2); padding: var(--apt-spacing-s2) var(--apt-spacing-s4); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: transparent; color: var(--apt-text-muted); font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; }
    .net-pill:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-text-body); }
    .net-pill--active { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .net-pill--active .net-pill-count { color: var(--apt-action-on-primary); }
    .net-pill-count { font-size: var(--apt-font-size-micro); opacity: 0.75; }

    /* Dense table */
    .net-table-wrap { overflow-x: auto; border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); }
    .net-table { width: 100%; border-collapse: collapse; font-size: var(--apt-font-size-body-sm); }
    .net-th { text-align: left; padding: var(--apt-spacing-s4) var(--apt-spacing-s5); font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); border-bottom: 1px solid var(--apt-border); font-weight: var(--apt-font-weight-medium); white-space: nowrap; }
    .net-tr { border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background var(--apt-animation-fast); }
    .net-tr:hover { background: var(--apt-surface-raised); }
    .net-tr--selected { background: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 8%, transparent); border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .net-td { padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-bottom: 1px solid #f3f4f6; color: var(--apt-text-body); vertical-align: middle; }
    .net-td--name { font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); }
    .net-glyph { width: 32px; height: 32px; border-radius: 50%; background: color-mix(in srgb, var(--card-accent) 15%, transparent); color: var(--card-accent); font-family: var(--apt-font-serif); font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-semibold); display: grid; place-items: center; flex: none; }
    .net-name { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; display: block; }
    .net-type-badge { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: lowercase; letter-spacing: 0.04em; color: var(--apt-text-body); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 1px 6px; white-space: nowrap; }
    .net-empty { grid-column: 1 / -1; padding: var(--apt-spacing-s8); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-r2); color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); text-align: center; }
    @media(max-width:600px){.net-summary{grid-template-columns:1fr}.net-table{table-layout:fixed}.net-th,.net-td{padding:10px 7px;white-space:normal;overflow-wrap:anywhere}.net-th:nth-child(4),.net-td:nth-child(4){display:none}.net-th:nth-child(1){width:26%}.net-th:nth-child(2){width:42%}.net-th:nth-child(3){width:32%}.net-empty{padding:14px 8px}}
    `,
  ],
})
export class NetworkComponent implements OnInit {
  readonly data = inject(WorkspaceDataService);
  readonly members = computed(() => this.data.networkState().members);
  ngOnInit(): void { void this.data.refresh(); }
}
