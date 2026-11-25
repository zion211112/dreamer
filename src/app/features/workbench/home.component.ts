/**
 * @apt-labs/features/workbench/home — WorkbenchHomeComponent
 *
 * Dense operational view of needs with cycle progress, deliverables, and
 * contextual actions per row. Direction 3: The Desk.
 * Structural Emergence.
 */
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoordinationService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-workbench-home',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="wb-page">
      <header class="wb-head">
        <div class="wb-pagehead">
          <h1 class="wb-h1">Workbench</h1>
          <p class="wb-sub">
            Record a need, a commitment, and a reported outcome. This local session is in-memory only; reported work is not independently verified.
          </p>
        </div>

        <div class="wb-actions">
          <input
            class="wb-post-input"
            [ngModel]="newNeed()"
            (ngModelChange)="newNeed.set($event)"
            placeholder="Describe a new need…"
            aria-label="New need"
          />
          <button class="wb-btn wb-btn--primary" type="button" (click)="postNeed()">Post a need</button>
        </div>
      </header>

      <div class="wb-metrics">
        <div class="wb-metric wb-metric--teal">
          <div class="wb-metric-label">Total needs</div>
          <div class="wb-metric-value">{{ counts().total }}</div>
        </div>
        <div class="wb-metric">
          <div class="wb-metric-label">Open</div>
          <div class="wb-metric-value">{{ counts().open }}</div>
        </div>
        <div class="wb-metric">
          <div class="wb-metric-label">In progress</div>
          <div class="wb-metric-value">{{ counts().inProgress }}</div>
        </div>
        <div class="wb-metric">
          <div class="wb-metric-label">Reported outcomes</div>
          <div class="wb-metric-value">{{ counts().delivered }}</div>
        </div>
      </div>

      <div class="wb-table-wrap">
        <table class="wb-table">
          <thead>
            <tr>
              <th class="wb-th">Need</th>
              <th class="wb-th">Commissioning party</th>
              <th class="wb-th">Status</th>
              <th class="wb-th">Reported outcome</th>
              <th class="wb-th">Evidence references</th>
              <th class="wb-th wb-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (row of needs(); track row.needId) {
              <tr class="wb-tr" [class.wb-tr--selected]="selectedRow() === row.needId" (click)="selectRow(row)">
                <td class="wb-td wb-td--name">
                  <span class="wb-name">{{ row.label }}</span>
                  <span class="wb-id">{{ row.needId }}</span>
                </td>
                <td class="wb-td">Not recorded</td>
                <td class="wb-td"><span class="wb-status" [class]="'wb-status is-' + row.status">{{ row.status === 'fulfilled' ? 'reported' : row.status }}</span></td>
                <td class="wb-td">{{ row.outcome ?? 'Not reported' }}</td>
                <td class="wb-td">{{ row.evidenceIds.length || '—' }}</td>
                <td class="wb-td wb-td--actions">
                  <button class="wb-btn wb-btn--sm wb-btn--quiet" (click)="$event.stopPropagation(); openPilot(row.needId)">Open</button>
                </td>
              </tr>
            }
            @if (needs().length === 0) {
              <tr><td colspan="6" class="wb-empty">No needs yet. Post the first one above.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
    .wb-page {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .wb-head { display: flex; flex-direction: column; gap: var(--apt-space-3); margin-bottom: var(--apt-space-8); padding-left: var(--apt-space-10); }
    .wb-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-3); line-height: 1.05; letter-spacing: -0.02em; }
    .wb-sub { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-relaxed); }
    .wb-actions { display: flex; align-items: center; gap: var(--apt-space-3); margin-top: var(--apt-space-4); }

    .wb-post-input { flex: 1; min-width: 200px; padding: var(--apt-space-3) var(--apt-space-5); border-radius: var(--apt-button-radius); border: 1px solid var(--apt-border); background: var(--apt-surface-raised); color: var(--apt-text-strong); font-size: var(--apt-size-body); font-family: inherit; }
    .wb-post-input:focus { outline: none; border-color: var(--apt-accent); }

    .wb-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--apt-space-2);
      padding: var(--apt-button-padding);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-button-font-size);
      font-weight: var(--apt-button-font-weight);
      font-family: inherit;
      cursor: pointer;
    }
    .wb-btn:hover { border-color: var(--apt-accent); }
    .wb-btn--primary { background: var(--apt-accent); color: var(--apt-action-on-accent); border-color: var(--apt-accent); }
    .wb-btn--primary:hover { background: color-mix(in srgb, var(--apt-accent) 90%, var(--apt-surface-default)); }
    .wb-btn--quiet { background: transparent; border-color: transparent; color: var(--apt-text-muted); }
    .wb-btn--quiet:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); }
    .wb-btn--sm { padding: var(--apt-space-1) var(--apt-space-3); font-size: var(--apt-size-sm); }

    .wb-metrics {
      display: flex;
      gap: var(--apt-space-5);
      margin-bottom: var(--apt-space-8);
      flex-wrap: wrap;
    }
    .wb-metric {
      flex: 1;
      min-width: 140px;
      background: var(--apt-surface-page);
      padding: var(--apt-space-5) var(--apt-space-6);
      border-radius: var(--apt-radius-md);
      border: 1px solid var(--apt-border);
    }
    .wb-metric--teal { border-left: 3px solid var(--apt-text-info); }
    .wb-metric-label {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--apt-text-dim);
      display: block;
      margin-bottom: var(--apt-space-2);
    }
    .wb-metric-value {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-size-display);
      font-weight: var(--apt-weight-semibold);
      color: var(--apt-text-strong);
      line-height: 1;
      letter-spacing: -0.01em;
    }

    .wb-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-md);
      background: var(--apt-surface-page);
    }
    .wb-table { width: 100%; border-collapse: collapse; font-size: var(--apt-size-body); }
    .wb-th {
      text-align: left;
      padding: var(--apt-space-4) var(--apt-space-5);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--apt-text-dim);
      border-bottom: 1px solid var(--apt-border);
      font-weight: var(--apt-weight-medium);
      white-space: nowrap;
    }
    .wb-tr { border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background var(--apt-motion-fast); }
    .wb-tr:hover { background: var(--apt-surface-raised); }
    .wb-tr--selected { background: color-mix(in srgb, var(--apt-accent) 8%, transparent); border-left: 3px solid var(--apt-accent); }
    .wb-td {
      padding: var(--apt-space-4) var(--apt-space-5);
      border-bottom: 1px solid #f3f4f6;
      color: var(--apt-text-body);
      vertical-align: middle;
    }
    .wb-td--name { font-weight: var(--apt-weight-medium); color: var(--apt-text-strong); }
    .wb-name { font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; display: block; }
    .wb-id { font-family: var(--apt-font-mono); font-size: var(--apt-size-sm); color: var(--apt-text-dim); display: block; margin-top: var(--apt-space-2); }
    .wb-status {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 7px;
      border-radius: var(--apt-button-radius);
      border: 1px solid var(--apt-border);
      white-space: nowrap;
    }
    .wb-status.is-open { background: var(--apt-surface-raised); color: var(--apt-text-muted); }
    .wb-status.is-committed { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .wb-status.is-fulfilled { background: var(--apt-surface-success); color: var(--apt-text-success); }
    .wb-empty { grid-column: 1 / -1; padding: var(--apt-space-8); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-md); color: var(--apt-text-muted); font-size: var(--apt-size-body); text-align: center; }

    @media (max-width: 760px) {
      .wb-page { padding: var(--apt-space-8); }
      .wb-head { padding-left: 0; }
      .wb-actions { flex-direction: column; align-items: stretch; }
      .wb-post-input { width: 100%; }
    }
    `,
  ],
})
export class HomeComponent {
  private readonly service = inject(CoordinationService);
  private readonly router = inject(Router);

  readonly needs = this.service.needs;
  readonly counts = this.service.counts;
  private readonly newNeed = signal('');
  readonly selectedRow = signal<string>('');

  postNeed(): void {
    const label = this.newNeed().trim();
    if (!label) return;
    const rec = this.service.createNeed({ need: label });
    this.newNeed.set('');
    this.router.navigate(['/workspace/workbench', rec.id]);
  }

  selectRow(row: { needId: string }): void {
    this.selectedRow.set(row.needId);
  }

  openPilot(id: string): void {
    this.router.navigate(['/workspace/workbench', id]);
  }
}
