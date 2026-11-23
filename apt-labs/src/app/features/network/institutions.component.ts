/**
 * @apt-labs/features/network — InstitutionsComponent
 *
 * Institutions and organizations directory — dense table view.
 */
import { Component, signal, computed, inject } from '@angular/core';
import { NetworkService, type DirectoryRow } from '@apt-labs/shared/state';

@Component({
  selector: 'app-institutions',
  standalone: true,
  template: `
    <div class="ins" data-module="institutions">
      <div class="ins-pagehead">
        <p class="ins-eyebrow">NETWORK · INSTITUTIONS & ORGANIZATIONS</p>
        <h1 class="ins-h1">Institutions and organizations</h1>
        <p class="ins-sub">The entities that commission, govern, and hold resources. Browse by focus, capability, or registration date.</p>
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
              <tr><td colspan="7" class="ins-empty">No institutions match “{{ query() }}”.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
    .ins { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }

    .ins-pagehead { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); }
    .ins-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0; text-transform: uppercase; }
    .ins-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); letter-spacing: -0.022em; line-height: 1.05; }
    .ins-sub { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-height-relaxed); }
    .ins-actions { display: flex; gap: var(--apt-spacing-s3); margin-top: var(--apt-spacing-s4); align-items: center; }

    .ins-search-input { flex: 1; min-width: 200px; padding: var(--apt-spacing-s3) var(--apt-spacing-s4); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: var(--apt-surface-page); color: var(--apt-text-body); font-size: var(--apt-font-size-body-md); font-family: inherit; }
    .ins-search-input:focus { outline: none; border-color: var(--apt-color-brand-primary); }

    .ins-count { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); white-space: nowrap; }

    .ins-table-wrap { overflow-x: auto; border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); }
    .ins-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--apt-font-size-body-md); }
    .ins-th { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-bottom: 1px solid var(--apt-border-faint, var(--apt-border)); white-space: nowrap; font-weight: var(--apt-font-weight-medium); }
    .ins-td { padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-bottom: 1px solid var(--apt-border-faint, var(--apt-border)); color: var(--apt-text-body); vertical-align: middle; }
    .ins-td--name { font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); white-space: nowrap; }
    .ins-td--dim { color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); }
    .ins-td--nowrap { white-space: nowrap; }
    .ins-type-badge { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: lowercase; letter-spacing: 0.04em; color: var(--apt-text-body); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 1px 6px; white-space: nowrap; }
    .ins-empty { padding: var(--apt-spacing-s7); color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); text-align: center; }

    .ins-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--apt-spacing-s2);
      padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r0);
      background: transparent;
      color: var(--apt-module-accent, var(--apt-color-brand-primary));
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-sm-3);
      cursor: pointer;
    }
    .ins-btn:hover { background: var(--apt-surface-raised); }
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
