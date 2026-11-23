/**
 * @apt-labs/features/records — RecordsComponent
 *
 * Canon, annals, and the immutable roll. Reads the shared L0 system of record
 * via `RecordsService` (the same store the Workbench mutates), so records here
 * are live, not a static fixture. The register is synced to the route — the
 * canon/annals/roll sub-routes and the filter buttons stay in one state.
 */

import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { RecordsService, type RecordsView } from '@apt-labs/shared/state';

@Component({
  selector: 'app-records',
  imports: [RouterLink, RouterLinkActive, DatePipe],
  template: `
    <div class="records-page">
      <header class="records-head">
        <h1 class="records-title">Records</h1>
        <p class="records-lede">Canon, annals, and the immutable roll — the system of record that keeps work on record.</p>
      </header>

      <div class="records-subnav">
        <a [routerLink]="['/workspace/records']" [routerLinkActive]="['active']" class="subnav-item">All</a>
        <a [routerLink]="['/workspace/records/canon']" [routerLinkActive]="['active']" class="subnav-item">Canon</a>
        <a [routerLink]="['/workspace/records/annals']" [routerLinkActive]="['active']" class="subnav-item">Annals</a>
        <a [routerLink]="['/workspace/records/roll']" [routerLinkActive]="['active']" class="subnav-item">Roll</a>
      </div>

      <div class="records-filter">
        <button [class.active]="filter() === 'all'" (click)="setFilter('all')">All</button>
        <button [class.active]="filter() === 'canon'" (click)="setFilter('canon')">Canon</button>
        <button [class.active]="filter() === 'annals'" (click)="setFilter('annals')">Annals</button>
        <button [class.active]="filter() === 'roll'" (click)="setFilter('roll')">Roll</button>
      </div>

      <div class="records-list">
        @for (row of visible(); track row.id) {
          <div class="records-row">
            <span class="records-kind" [class.canon]="row.kind === 'canon'" [class.annals]="row.kind === 'annals'" [class.roll]="row.kind === 'roll'">{{ row.kind }}</span>
            <div class="records-content">
              <span class="records-title">{{ row.title }}</span>
              <span class="records-institution">{{ row.institution }}</span>
            </div>
            <span class="records-status" [class.sealed]="row.status === 'sealed'" [class.active-status]="row.status === 'active'" [class.disputed]="row.status === 'disputed'">{{ row.status }}</span>
            <span class="records-date">{{ row.createdAt | date: 'short' }}</span>
          </div>
        }
        @if (visible().length === 0) {
          <div class="records-empty">No records in this view yet.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .records-page { padding: var(--apt-spacing-s10); max-width: 1000px; margin: 0 auto; }
    .records-head { margin-bottom: var(--apt-spacing-s10); }
    .records-title { font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); font-family: var(--apt-font-serif); }
    .records-lede { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); margin: 0; }
    .records-subnav { display: flex; gap: var(--apt-spacing-s4); margin-bottom: var(--apt-spacing-s6); border-bottom: 1px solid var(--apt-border); padding-bottom: var(--apt-spacing-s3); }
    .subnav-item { text-decoration: none; font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); }
    .subnav-item.active { color: var(--apt-text-strong); font-weight: var(--apt-font-weight-medium); background: var(--apt-surface-raised); }
    .records-filter { display: flex; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s10); }
    .records-filter button { padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: transparent; color: var(--apt-text-muted); cursor: pointer; font-size: var(--apt-font-size-body-sm); }
    .records-filter button.active { background: var(--apt-surface-info); border-color: var(--apt-module-accent); color: var(--apt-module-accent); }
    .records-list { display: flex; flex-direction: column; gap: var(--apt-spacing-s4); }
    .records-row { display: grid; grid-template-columns: 64px 1fr auto auto; gap: var(--apt-spacing-s6); align-items: center; padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); background: var(--apt-surface-page); }
    .records-kind { font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; font-weight: var(--apt-font-weight-semibold); padding: var(--apt-spacing-s1) var(--apt-spacing-s3); border-radius: 999px; }
    .records-kind.canon { background: var(--apt-surface-success); color: var(--apt-text-success); }
    .records-kind.annals { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .records-kind.roll { background: var(--apt-surface-raised); color: var(--apt-text-strong); }
    .records-content { display: flex; flex-direction: column; gap: var(--apt-spacing-s1); }
    .records-title { font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); }
    .records-institution { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .records-status { font-size: var(--apt-font-size-micro); font-weight: var(--apt-font-weight-medium); text-transform: capitalize; }
    .records-status.sealed { color: var(--apt-text-success); }
    .records-status.active-status { color: var(--apt-text-info); }
    .records-status.disputed { color: var(--apt-text-danger); }
    .records-date { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .records-empty { padding: var(--apt-spacing-s14); text-align: center; color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); }
  `],
})
export class RecordsComponent implements OnInit {
  private readonly service = inject(RecordsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly filter = signal<RecordsView>('all');
  readonly visible = computed<readonly { id: string; title: string; kind: string; institution: string; status: string; createdAt: string }[]>(() =>
    this.service.view(this.filter()),
  );

  ngOnInit(): void {
    this.syncFromRoute();
    this.route.url.subscribe(() => this.syncFromRoute());
  }

  /** Read the active register off the route so sub-nav and filter agree. */
  private syncFromRoute(): void {
    const seg = this.route.snapshot.url.at(-1)?.['path'] ?? '';
    this.filter.set(seg === 'canon' || seg === 'annals' || seg === 'roll' ? seg : 'all');
  }

  setFilter(v: RecordsView): void {
    this.filter.set(v);
    this.router.navigate(v === 'all' ? ['/workspace/records'] : ['/workspace/records', v]);
  }
}
