/**
 * @apt-labs/features/value — ValueComponent
 *
 * Home of what circulates: value moved between parties, in the open,
 * allocated by transparent rule. Dense table view.
 */
import { Component, signal, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ValueService, type ValueRow } from '@apt-labs/shared/state';

@Component({
  selector: 'app-value',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="value-page">
      <header class="value-head">
        <div class="value-pagehead">
          <h1 class="value-h1">Value — outcomes &amp; circulation</h1>
          <p class="value-sub">
            The home of what circulates: value moved between parties, in the open.
          </p>
        </div>
        <div class="value-actions">
          <button class="value-btn value-btn--primary" (click)="openWorkbench()">Open Workbench →</button>
        </div>
      </header>

      <div class="value-metrics">
        <div class="value-metric value-metric--teal">
          <div class="value-metric-label">Outcomes</div>
          <div class="value-metric-value">{{ metrics().outcomes }}</div>
        </div>
        <div class="value-metric">
          <div class="value-metric-label">Total KES</div>
          <div class="value-metric-value">{{ metrics().totalKes | number }}</div>
        </div>
        <div class="value-metric">
          <div class="value-metric-label">Funding</div>
          <div class="value-metric-value">{{ metrics().funding }}</div>
        </div>
        <div class="value-metric">
          <div class="value-metric-label">Settled</div>
          <div class="value-metric-value">{{ metrics().settled }}</div>
        </div>
        <div class="value-metric">
          <div class="value-metric-label">Open</div>
          <div class="value-metric-value">{{ metrics().open }}</div>
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
            <th class="value-th">Pilot</th>
            <th class="value-th">Institution</th>
            <th class="value-th">Location</th>
            <th class="value-th">Amount</th>
            <th class="value-th">Status</th>
          </tr>
        </thead>
        <tbody>
          @for (row of visible(); track row.key) {
            <tr class="value-tr">
              <td class="value-td value-td--name">
                <a [routerLink]="['/workspace/workbench', row.key]" class="value-row-label">{{ row.label }}</a>
              </td>
              <td class="value-td">{{ row.institution }}</td>
              <td class="value-td">{{ row.location }}</td>
              <td class="value-td value-td--amount">{{ fmtAmount(row.amount) }}</td>
              <td class="value-td"><span class="value-status [row.settled ? 'settled' : 'open']">{{ row.settled ? 'Settled' : 'Open' }}</span></td>
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
  styles: [
    `
    .value-page {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .value-head { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); padding-left: var(--apt-spacing-s10); }
    .value-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display-xl); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); line-height: 1.05; letter-spacing: -0.02em; }
    .value-sub { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-height-relaxed); }
    .value-actions { display: flex; gap: var(--apt-spacing-s3); margin-top: var(--apt-spacing-s4); }
    .value-btn {
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
    .value-btn:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .value-btn--primary { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }

    .value-metrics { display: flex; gap: var(--apt-spacing-s5); margin-bottom: var(--apt-spacing-s10); flex-wrap: wrap; }
    .value-metric {
      background: var(--apt-surface-raised);
      padding: var(--apt-spacing-s5) var(--apt-spacing-s6);
      border-radius: var(--apt-radius-r2);
      border: 1px solid var(--apt-border);
      min-width: 120px;
    }
    .value-metric--teal { border-left: 3px solid var(--apt-text-info); }
    .value-metric-label {
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      color: var(--apt-text-muted);
      display: block;
      margin-bottom: var(--apt-spacing-s2);
      font-family: var(--apt-font-mono);
    }
    .value-metric-value {
      font-size: var(--apt-font-size-body-md);
      font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong);
    }

    .value-filter { display: flex; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s10); }
    .value-filter button { padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: transparent; color: var(--apt-text-muted); cursor: pointer; font-size: var(--apt-font-size-body-sm); }
    .value-filter button.active { background: var(--apt-surface-info); border-color: var(--apt-module-accent); color: var(--apt-module-accent); }

    .value-table { width: 100%; border-collapse: collapse; margin-bottom: var(--apt-spacing-s10); font-size: var(--apt-font-size-body-sm); }
    .value-table th {
      text-align: left;
      padding: var(--apt-spacing-s5) var(--apt-spacing-s6);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      color: var(--apt-text-dim);
      border-bottom: 1px solid var(--apt-border);
      font-weight: var(--apt-font-weight-medium);
      white-space: nowrap;
    }
    .value-table td { padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border-bottom: 1px solid var(--apt-border); color: var(--apt-text-strong); vertical-align: middle; }
    .value-table tr:hover td { background: var(--apt-surface-raised); }

    .row-label { font-weight: var(--apt-font-weight-medium); color: var(--apt-module-accent); text-decoration: none; }
    .amount { font-family: var(--apt-font-mono); }
    .value-status {
      font-size: var(--apt-font-size-micro);
      font-weight: var(--apt-font-weight-medium);
      text-transform: capitalize;
    }
    .value-status.settled { color: var(--apt-text-success); }
    .value-status.open { color: var(--apt-text-info); }

    .value-docs { padding-top: var(--apt-spacing-s6); border-top: 1px solid var(--apt-border); }
    .value-docs-title {
      font-size: var(--apt-font-size-body-sm);
      font-weight: var(--apt-font-weight-semibold);
      margin-bottom: var(--apt-spacing-s3);
      font-family: var(--apt-font-mono);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--apt-text-dim);
    }

    @media (max-width: 760px) {
      .records-page { padding: var(--apt-spacing-s8); }
      .records-head { padding-left: 0; }
    }
    `,
  ],
})
export class ValueComponent {
  private readonly service = inject(ValueService);

  readonly filter = signal<'all' | 'disclosed' | 'settled' | 'open'>('all');

  readonly visible = computed<ValueRow[]>(() =>
    this.service.filterRows(this.service.rows(), this.filter()),
  );
  readonly metrics = this.service.metrics;

  setFilter(v: 'all' | 'disclosed' | 'settled' | 'open'): void {
    this.filter.set(v);
  }

  fmtAmount(n: number | null): string {
    if (n === null) return '—';
    return n.toLocaleString('en-KE');
  }

  openWorkbench(): void {}
}
