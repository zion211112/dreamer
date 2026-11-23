/**
 * @apt-labs/features/records — RecordsComponent
 *
 * Canon, annals, and the immutable roll. Ported from Vue `src/pages/workspace/Records.vue`.
 */

import { Component, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface RecordRow {
  id: string;
  title: string;
  kind: 'canon' | 'annals' | 'roll';
  institution: string;
  createdAt: string;
  status: 'sealed' | 'active' | 'disputed';
}

@Component({
  selector: 'app-records',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="records-page">
      <header class="records-head">
        <h1 class="records-title">Records</h1>
        <p class="records-lede">Canon, annals, and the immutable roll — the audit trail that makes work on record.</p>
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
            <span class="records-date">{{ row.createdAt }}</span>
          </div>
        }
        @if (visible().length === 0) {
          <div class="records-empty">No records in this view.</div>
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
export class RecordsComponent {
  readonly filter = signal<'all' | 'canon' | 'annals' | 'roll'>('all');

  readonly allRows: RecordRow[] = [
    { id: 'r-001', title: 'Pilot 001 acceptance canon', kind: 'canon', institution: 'Nairobi County', createdAt: '2026-01-15', status: 'sealed' },
    { id: 'r-002', title: 'Mombasa port drayage — active commitment', kind: 'annals', institution: 'Mombasa Port Authority', createdAt: '2026-02-05', status: 'active' },
    { id: 'r-003', title: 'Kisumu agri supply — reconciliation', kind: 'canon', institution: 'Kisumu University', createdAt: '2026-02-20', status: 'sealed' },
    { id: 'r-004', title: 'Nakuru PPE procurement — roll entry', kind: 'roll', institution: 'Nakuru Hospital', createdAt: '2026-03-10', status: 'active' },
    { id: 'r-005', title: 'Eldoret logistics — disputed record', kind: 'annals', institution: 'Eldoret Gov', createdAt: '2026-03-15', status: 'disputed' },
  ];

  readonly visible = computed(() => {
    if (this.filter() === 'all') return this.allRows;
    return this.allRows.filter((r) => r.kind === this.filter());
  });

  setFilter(v: 'all' | 'canon' | 'annals' | 'roll'): void {
    this.filter.set(v);
  }
}
