/**
 * @apt-labs/features/network — InstitutionsComponent
 *
 * Institutions and organizations directory — dense table view.
 * Structural Emergence.
 */
import { Component, signal, computed, inject } from '@angular/core';
import { NetworkService, type DirectoryRow } from '@apt-labs/shared/state';

@Component({
  selector: 'app-institutions',
  standalone: true,
  template: `
    <div class="ins" data-module="institutions">
      <div class="ins-pagehead">
        <h1 class="ins-h1">Institutions and organizations</h1>
        <p class="ins-sub">Institutions and organizations appear here when connected records are available. No participant or institution records are loaded in this local demo.</p>
        <div class="ins-actions">
          <input
            type="search"
            class="ins-search-input"
            placeholder="Search institutions…"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
          <span class="ins-count">{{ visible().length }} shown</span>
        </div>
      </div>

      <div class="ins-table-wrap">
        <table class="ins-table">
          <thead>
            <tr>
              <th class="ins-th">Name</th>
              <th class="ins-th ins-th--nowrap">Type</th>
              <th class="ins-th">Focus</th>
              <th class="ins-th">Can do</th>
              <th class="ins-th">Has</th>
              <th class="ins-th ins-th--nowrap">Registered</th>
              <th class="ins-th ins-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (row of visible(); track row.id) {
              <tr class="ins-tr">
                <td class="ins-td ins-td--name">{{ row.name }}</td>
                <td class="ins-td"><span class="ins-type-badge">{{ row.type }}</span></td>
                <td class="ins-td ins-td--dim">{{ row.description }}</td>
                <td class="ins-td ins-td--dim">{{ caps(row) }}</td>
                <td class="ins-td ins-td--dim">{{ assets(row) }}</td>
                <td class="ins-td ins-td--dim ins-td--nowrap">{{ row.registered }}</td>
                <td class="ins-td ins-td--actions">
                  <button class="ins-btn ins-btn--quiet">View</button>
                </td>
              </tr>
            }
            @if (visible().length === 0) {
              <tr><td colspan="7" class="ins-empty">No connected institutions or organizations are available.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
    .ins {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .ins-pagehead { display: flex; flex-direction: column; gap: var(--apt-space-3); margin-bottom: var(--apt-space-8); padding-left: var(--apt-space-10); }
    .ins-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-3); line-height: 1.05; letter-spacing: -0.02em; }
    .ins-sub { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-relaxed); }
    .ins-actions { display: flex; gap: var(--apt-space-3); margin-top: var(--apt-space-4); align-items: center; }
    .ins-search-input { flex: 1; min-width: 200px; padding: var(--apt-space-3) var(--apt-space-4); border-radius: var(--apt-button-radius); border: 1px solid var(--apt-border); background: var(--apt-surface-page); color: var(--apt-text-body); font-size: var(--apt-size-body); font-family: inherit; }
    .ins-search-input:focus { outline: none; border-color: var(--apt-accent); }
    .ins-count { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); white-space: nowrap; }

    .ins-table-wrap { overflow-x: auto; border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); }
    .ins-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--apt-size-body); }
    .ins-th {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--apt-text-dim);
      padding: var(--apt-space-4) var(--apt-space-5);
      border-bottom: 1px solid var(--apt-border-faint);
      white-space: nowrap;
      font-weight: var(--apt-weight-medium);
    }
    .ins-td { padding: var(--apt-space-4) var(--apt-space-5); border-bottom: 1px solid var(--apt-border-faint); color: var(--apt-text-body); vertical-align: middle; }
    .ins-td--name { font-weight: var(--apt-weight-medium); color: var(--apt-text-strong); white-space: nowrap; }
    .ins-td--dim { color: var(--apt-text-muted); font-size: var(--apt-size-body); }
    .ins-td--nowrap { white-space: nowrap; }
    .ins-type-badge {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: lowercase;
      letter-spacing: 0.04em;
      color: var(--apt-text-body);
      background: var(--apt-surface-raised);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      padding: 1px 6px;
      white-space: nowrap;
    }
    .ins-empty { padding: var(--apt-space-7); color: var(--apt-text-muted); font-size: var(--apt-size-body); text-align: center; }

    .ins-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--apt-space-2);
      padding: var(--apt-space-1) var(--apt-space-3);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: transparent;
      color: var(--apt-module-accent, var(--apt-accent));
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-sm);
      cursor: pointer;
    }
    .ins-btn:hover { background: var(--apt-surface-raised); }

    @media (max-width: 760px) {
      .ins-pagehead { padding-left: 0; }
    }
    `,
  ],
})
export class InstitutionsComponent {
  private readonly service = inject(NetworkService);

  readonly query = signal('');
  readonly rows: readonly DirectoryRow[] = this.service.bodies;

  readonly visible = computed(() =>
    this.rows.filter((r) => this.service.matchQuery(this.query(), r)),
  );

  readonly caps = (r: DirectoryRow) => r.capabilities.join(', ') || '—';
  readonly assets = (r: DirectoryRow) => r.assets.join(', ') || '—';
}
