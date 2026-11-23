/**
 * @apt-labs/features/value — ValueComponent
 *
 * Home of what circulates: value moved between parties, in the open,
 * allocated by transparent rule. Ported from Vue `src/pages/workspace/Value.vue`.
 */

import { Component, signal, computed } from "@angular/core";
import { DecimalPipe, CurrencyPipe } from "@angular/common";
import { RouterLink } from '@angular/router';

interface Row {
  key: string;
  label: string;
  institution: string;
  location: string;
  amount: number | null;
  currency: string;
  settled: boolean;
  acceptedAt: string | null;
}

@Component({
  selector: 'app-value',
  imports: [RouterLink, DecimalPipe, CurrencyPipe],
  template: `
    <div class="value-page">
      <header class="value-head">
        <h1 class="value-title">Value — outcomes &amp; circulation</h1>
        <p class="value-lede">The home of what circulates: value moved between parties, in the open.</p>
      </header>

      <div class="value-metrics">
        <div class="metric">
          <span class="metric-label">Disclosed</span>
          <span class="metric-value">{{ metrics().outcomes }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Total KES</span>
          <span class="metric-value">{{ metrics().totalKes | number }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Funding</span>
          <span class="metric-value">{{ metrics().funding }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Settled</span>
          <span class="metric-value">{{ metrics().settled }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Open</span>
          <span class="metric-value">{{ metrics().open }}</span>
        </div>
      </div>

      <div class="value-filter">
        <button [class.active]="filter() === 'all'" (click)="setFilter('all')">All</button>
        <button [class.active]="filter() === 'disclosed'" (click)="setFilter('disclosed')">Disclosed</button>
        <button [class.active]="filter() === 'settled'" (click)="setFilter('settled')">Settled</button>
        <button [class.active]="filter() === 'open'" (click)="setFilter('open')">Open</button>
      </div>

      <table class="value-table">
        <thead>
          <tr>
            <th>Pilot</th>
            <th>Institution</th>
            <th>Location</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (row of visible(); track row.key) {
            <tr>
              <td><a [routerLink]="['/workspace/workbench', row.key]" class="row-label">{{ row.label }}</a></td>
              <td>{{ row.institution }}</td>
              <td>{{ row.location }}</td>
              <td class="amount">{{ fmtAmount(row.amount) }}</td>
              <td class="status">{{ row.settled ? 'Settled' : 'Open' }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="value-docs">
        <h3 class="value-docs-title">Commercial model (cloak-compatible)</h3>
        <p>Replacement Engine routes institutional procurement through verified local producers, 3–5% transaction fee. Roll density is the defensibility layer.</p>
      </div>
    </div>
  `,
  styles: [`
    .value-page { padding: var(--apt-spacing-s10); max-width: 1000px; margin: 0 auto; }
    .value-head { margin-bottom: var(--apt-spacing-s10); }
    .value-title { font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); font-family: var(--apt-font-serif); }
    .value-lede { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); margin: 0; }
    .value-metrics { display: flex; gap: var(--apt-spacing-s5); margin-bottom: var(--apt-spacing-s10); flex-wrap: wrap; }
    .metric { background: var(--apt-surface-raised); padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); min-width: 120px; }
    .metric-label { font-size: var(--apt-font-size-micro); text-transform: uppercase; color: var(--apt-text-muted); display: block; margin-bottom: var(--apt-spacing-s2); }
    .metric-value { font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); }
    .value-filter { display: flex; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s10); }
    .value-filter button { padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: transparent; color: var(--apt-text-muted); cursor: pointer; font-size: var(--apt-font-size-body-sm); }
    .value-filter button.active { background: var(--apt-surface-info); border-color: var(--apt-module-accent); color: var(--apt-module-accent); }
    .value-table { width: 100%; border-collapse: collapse; margin-bottom: var(--apt-spacing-s10); font-size: var(--apt-font-size-body-sm); }
    .value-table th { text-align: left; padding: var(--apt-spacing-s5) var(--apt-spacing-s6); font-size: var(--apt-font-size-micro); text-transform: uppercase; color: var(--apt-text-muted); border-bottom: 1px solid var(--apt-border); font-weight: var(--apt-font-weight-medium); }
    .value-table td { padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border-bottom: 1px solid var(--apt-border); color: var(--apt-text-strong); }
    .row-label { font-weight: var(--apt-font-weight-medium); color: var(--apt-module-accent); text-decoration: none; }
    .amount { font-family: var(--apt-font-mono); }
    .status { font-weight: var(--apt-font-weight-medium); }
    .value-docs { padding-top: var(--apt-spacing-s6); border-top: 1px solid var(--apt-border); }
    .value-docs-title { font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-semibold); margin-bottom: var(--apt-spacing-s3); }
  `],
})
export class ValueComponent {
  readonly filter = signal<'all' | 'disclosed' | 'settled' | 'open'>('all');

  readonly allRows: Row[] = [
    { key: 'pilot-001', label: 'Nairobi Procurement Pilot', institution: 'Nairobi County', location: 'Nairobi', amount: 4500000, currency: 'KES', settled: true, acceptedAt: '2026-01-15' },
    { key: 'pilot-002', label: 'Mombasa Port Drayage', institution: 'Mombasa Port Authority', location: 'Mombasa', amount: 8200000, currency: 'KES', settled: false, acceptedAt: null },
    { key: 'pilot-003', label: 'Kisumu Agri Supply', institution: 'Kisumu University', location: 'Kisumu', amount: 3100000, currency: 'KES', settled: true, acceptedAt: '2026-02-20' },
    { key: 'pilot-004', label: 'Eldoret Logistics Hub', institution: 'Eldoret Gov', location: 'Eldoret', amount: 12000000, currency: 'KES', settled: false, acceptedAt: null },
    { key: 'pilot-005', label: 'Nakuru Health Supply', institution: 'Nakuru Hospital', location: 'Nakuru', amount: 6800000, currency: 'KES', settled: true, acceptedAt: '2026-03-10' },
  ];

  readonly rows = computed(() => this.allRows);

  readonly metrics = computed(() => {
    const disclosed = this.allRows.filter((r) => r.amount != null);
    const total = disclosed.reduce((s, r) => s + (r.amount ?? 0), 0);
    const settledCount = disclosed.filter((r) => r.settled).length;
    return {
      outcomes: disclosed.length,
      totalKes: total,
      funding: this.allRows.length,
      settled: settledCount,
      open: disclosed.length - settledCount,
    };
  });

  readonly visible = computed(() => {
    if (this.filter() === 'disclosed')
      return this.allRows.filter((r) => r.amount != null);
    if (this.filter() === 'settled')
      return this.allRows.filter((r) => r.amount != null && r.settled);
    if (this.filter() === 'open')
      return this.allRows.filter((r) => r.amount != null && !r.settled);
    return this.allRows;
  });

  setFilter(v: 'all' | 'disclosed' | 'settled' | 'open'): void {
    this.filter.set(v);
  }
  fmtAmount(n: number | null): string {
    if (n === null) return '—';
    return n.toLocaleString('en-KE');
  }
}