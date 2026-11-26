/**
 * @apt-labs/features/network — NetworkComponent
 *
 * Shell for the Network module: one set of authorized network records, shown
 * through People, Institutions and Capabilities tabs. No synthetic entries are
 * presented as participants.
 */
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspaceDataService } from '@apt-labs/shared/state';
import { SectionTabsComponent, type SectionTab } from '../workspace/section-tabs.component';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [RouterOutlet, SectionTabsComponent],
  template: `
    <section class="net" data-module="network">
      <header class="net-head">
        <p class="net-eyebrow">APT-LABS · Network</p>
        <h1 class="net-title">Network</h1>
        <p class="net-lede">People and organizations connected through memberships you are authorized to see. This view is permission-scoped, not a public directory.</p>
      </header>

      <app-section-tabs label="Network sections" [tabs]="tabs" />

      @if (data.error()) {
        <p class="net-notice" role="alert">
          Network records are unavailable: {{ data.error().replaceAll('_', ' ') }}
          <button type="button" (click)="data.refresh()">Retry</button>
        </p>
      }

      <router-outlet />
    </section>
  `,
  styles: [
    `
    :host { display: block; font-family: var(--apt-font-sans); color: var(--apt-text-body); }
    .net { max-width: 1120px; margin: 0 auto; padding: var(--apt-space-8) var(--apt-space-10); }
    .net-eyebrow { margin: 0 0 var(--apt-space-2); font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); letter-spacing: 0.1em; text-transform: uppercase; color: var(--apt-text-dim); }
    .net-title { margin: 0 0 var(--apt-space-3); font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); line-height: 1.1; }
    .net-lede { margin: 0 0 var(--apt-space-6); max-width: 72ch; font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); }
    .net-notice { display: flex; justify-content: space-between; align-items: center; gap: var(--apt-space-3); padding: var(--apt-space-4); border: 1px solid var(--apt-text-danger); border-radius: var(--apt-radius-md); font-size: var(--apt-size-body); }
    .net-notice button { min-height: 38px; padding: 7px 12px; border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); background: transparent; color: var(--apt-text-body); font: inherit; font-weight: var(--apt-weight-semibold); cursor: pointer; }
    @media (max-width: 760px) { .net { padding: var(--apt-space-6) var(--apt-space-4); } .net-notice { flex-direction: column; align-items: flex-start; } }
    `,
  ],
})
export class NetworkComponent implements OnInit {
  readonly data = inject(WorkspaceDataService);

  readonly tabs: readonly SectionTab[] = [
    { label: 'People', path: '/workspace/network/people' },
    { label: 'Institutions', path: '/workspace/network/institutions' },
    { label: 'Capabilities', path: '/workspace/network/capabilities' },
  ];

  ngOnInit(): void {
    void this.data.refresh();
  }
}
