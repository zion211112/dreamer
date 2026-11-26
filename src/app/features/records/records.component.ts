import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspaceDataService } from '@apt-labs/shared/state';
import { SectionTabsComponent, type SectionTab } from '../workspace/section-tabs.component';

/**
 * Records: what the workspace recorded, when, and how far it reached the
 * evidence chain. Three lenses over the same permission-scoped data:
 * Canon (structure), Annals (dated sequence), Roll (evidence chain).
 */
@Component({
  selector: 'app-records',
  standalone: true,
  imports: [RouterOutlet, SectionTabsComponent],
  template: `
    <section class="records" data-module="records">
      <header class="records-head">
        <p class="records-eyebrow">APT-LABS · Records</p>
        <h1 class="records-title">Records</h1>
        <p class="records-lede">
          What was recorded, when, and how far it reached the evidence chain. A record shows that an action
          was entered and who entered it. It does not verify that work was done or that an outcome was achieved,
          and a report or review is one party's recorded statement, not an independent check.
        </p>
      </header>

      <app-section-tabs label="Records lenses" [tabs]="tabs" />

      @if (data.error()) {
        <section class="records-state records-state--error" role="alert">
          <p>Records could not be loaded: {{ data.error().replaceAll('_', ' ') }}.</p>
          <button type="button" class="records-retry" (click)="data.refresh()">Retry</button>
        </section>
      }

      <router-outlet />
    </section>
  `,
  styles: [
    `
    :host { display: block; font-family: var(--apt-font-sans); color: var(--apt-text-body); }
    .records { max-width: 1120px; margin: 0 auto; padding: var(--apt-space-8) var(--apt-space-10); }
    .records-eyebrow { margin: 0 0 var(--apt-space-2); font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); letter-spacing: 0.1em; text-transform: uppercase; color: var(--apt-text-dim); }
    .records-title { margin: 0 0 var(--apt-space-3); font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); line-height: 1.1; }
    .records-lede { margin: 0 0 var(--apt-space-6); max-width: 72ch; font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); }
    .records-state { display: flex; align-items: center; justify-content: space-between; gap: var(--apt-space-4); padding: var(--apt-space-4); margin-bottom: var(--apt-space-5); border: 1px solid var(--apt-destructive-surface, var(--apt-border)); border-radius: var(--apt-radius-md); color: var(--apt-text-body); }
    .records-state p { margin: 0; }
    .records-retry { padding: var(--apt-space-2) var(--apt-space-4); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); background: var(--apt-surface-raised); color: var(--apt-text-strong); cursor: pointer; }
    @media (max-width: 760px) { .records { padding: var(--apt-space-6) var(--apt-space-4); } }
    `,
  ],
})
export class RecordsComponent implements OnInit {
  readonly data = inject(WorkspaceDataService);
  readonly tabs: readonly SectionTab[] = [
    { label: 'Canon', path: '/workspace/records/canon' },
    { label: 'Annals', path: '/workspace/records/annals' },
    { label: 'Roll', path: '/workspace/records/roll' },
  ];

  ngOnInit(): void {
    void this.data.refresh();
  }
}
