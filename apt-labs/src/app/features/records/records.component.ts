/**
 * @apt-labs/features/records — RecordsComponent
 *
 * Canon, annals, and the immutable roll. Dense table view with standing badges.
 */
import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { RecordsService, type RecordsView } from '@apt-labs/shared/state';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DatePipe],
  template: `
    <div class="records-page">
      <header class="records-head">
        <div class="records-pagehead">
          <h1 class="records-h1">Records</h1>
          <p class="records-sub">
            Canon, annals, and the immutable roll — the system of record that keeps work on record.
          </p>
        </div>
        <div class="records-actions">
          <button class="records-btn records-btn--primary" (click)="openRoll()">Open Roll →</button>
        </div>
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

      <div class="records-table-wrap">
        <table class="records-table">
          <thead>
            <tr>
              <th class="records-th">Kind</th>
              <th class="records-th">Title</th>
              <th class="records-th">Institution</th>
              <th class="records-th">Status</th>
              <th class="records-th">Created</th>
            </tr>
          </thead>
          <tbody>
            @for (row of visible(); track row.id) {
              <tr class="records-tr">
                <td class="records-td">
                  <span class="records-kind [row.kind]">{{ row.kind }}</span>
                </td>
                <td class="records-td records-td--name">{{ row.title }}</td>
                <td class="records-td">{{ row.institution }}</td>
                <td class="records-td"><span class="records-status [row.status]">{{ row.status }}</span></td>
                <td class="records-td">{{ row.createdAt | date: 'short' }}</td>
              </tr>
            }
            @if (visible().length === 0) {
              <tr><td colspan="5" class="records-empty">No records in this view yet.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
    .records-page {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .records-head { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); padding-left: var(--apt-spacing-s10); }
    .records-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display-xl); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); line-height: 1.05; letter-spacing: -0.02em; }
    .records-sub { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-height-relaxed); }
    .records-actions { display: flex; gap: var(--apt-spacing-s3); margin-top: var(--apt-spacing-s4); }
    .records-btn {
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
    .records-btn:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .records-btn--primary { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }

    .records-subnav { display: flex; gap: var(--apt-spacing-s4); margin-bottom: var(--apt-spacing-s6); border-bottom: 1px solid var(--apt-border); padding-bottom: var(--apt-spacing-s3); }
    .subnav-item { text-decoration: none; font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); }
    .subnav-item.active { color: var(--apt-text-strong); font-weight: var(--apt-font-weight-medium); background: var(--apt-surface-info); }

    .records-filter { display: flex; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s10); }
    .records-filter button { padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: transparent; color: var(--apt-text-muted); cursor: pointer; font-size: var(--apt-font-size-body-sm); }
    .records-filter button.active { background: var(--apt-surface-info); border-color: var(--apt-module-accent); color: var(--apt-module-accent); }

    .records-table-wrap { overflow-x: auto; border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); }
    .records-table { width: 100%; border-collapse: collapse; font-size: var(--apt-font-size-body-sm); }
    .records-th {
      text-align: left;
      padding: var(--apt-spacing-s4) var(--apt-spacing-s5);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--apt-text-dim);
      border-bottom: 1px solid var(--apt-border);
      font-weight: var(--apt-font-weight-medium);
      white-space: nowrap;
    }
    .records-tr { border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background var(--apt-animation-fast); }
    .records-tr:hover { background: var(--apt-surface-raised); }
    .records-td { padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-bottom: 1px solid #f3f4f6; color: var(--apt-text-body); vertical-align: middle; }
    .records-td--name { font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); }

    .records-kind {
      font-size: var(--apt-font-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: var(--apt-font-weight-semibold);
      padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
      border-radius: 999px;
    }
    .records-kind.canon { background: var(--apt-surface-success); color: var(--apt-text-success); }
    .records-kind.annals { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .records-kind.roll { background: var(--apt-surface-raised); color: var(--apt-text-strong); }

    .records-status {
      font-size: var(--apt-font-size-micro);
      font-weight: var(--apt-font-weight-medium);
      text-transform: capitalize;
    }
    .records-status.sealed { color: var(--apt-text-success); }
    .records-status.active { color: var(--apt-text-info); }
    .records-status.disputed { color: var(--apt-text-danger); }

    .records-empty { padding: var(--apt-spacing-s8); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-r2); color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); text-align: center; }

    @media (max-width: 760px) {
      .records-page { padding: var(--apt-spacing-s8); }
      .records-head { padding-left: 0; }
    }
    `,
  ],
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

  private syncFromRoute(): void {
    const seg = this.route.snapshot.url.at(-1)?.['path'] ?? '';
    this.filter.set(seg === 'canon' || seg === 'annals' || seg === 'roll' ? seg : 'all');
  }

  setFilter(v: RecordsView): void {
    this.filter.set(v);
    this.router.navigate(v === 'all' ? ['/workspace/records'] : ['/workspace/records', v]);
  }

  openRoll(): void {
    this.router.navigate(['/workspace/records/roll']);
  }
}
