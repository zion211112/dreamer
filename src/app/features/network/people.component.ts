/**
 * @apt-labs/features/network — PeopleComponent
 *
 * People and crews directory — dense table view with capability chips.
 * Structural Emergence.
 */
import { Component, signal, computed, inject } from '@angular/core';
import { NetworkService, type DirectoryRow } from '@apt-labs/shared/state';

@Component({
  selector: 'app-people',
  standalone: true,
  template: `
    <div class="plp" data-module="people">
      <div class="plp-pagehead">
        <h1 class="plp-h1">People and crews</h1>
        <p class="plp-sub">Individuals and teams who claim capability. Search by name, description, or capability.</p>
        <div class="plp-actions">
          <input
            type="search"
            class="plp-search-input"
            placeholder="Search people, crews, capabilities…"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
          <span class="plp-count">{{ visible().length }} shown</span>
        </div>
      </div>

      <div class="plp-table-wrap">
        <table class="plp-table">
          <thead>
            <tr>
              <th class="plp-th">Name</th>
              <th class="plp-th">Type</th>
              <th class="plp-th">Description</th>
              <th class="plp-th">Capabilities</th>
              <th class="plp-th plp-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (row of visible(); track row.id) {
              <tr class="plp-tr">
                <td class="plp-td plp-td--name">
                  <span class="plp-glyph">{{ initial(row.name) }}</span>
                  <span class="plp-name">{{ row.name }}</span>
                </td>
                <td class="plp-td"><span class="plp-type-badge">{{ row.type }}</span></td>
                <td class="plp-td plp-td--dim">{{ row.description }}</td>
                <td class="plp-td plp-td--dim">{{ caps(row) }}</td>
                <td class="plp-td plp-td--actions">
                  <button class="plp-btn plp-btn--quiet">View</button>
                </td>
              </tr>
            }
            @if (visible().length === 0) {
              <tr><td colspan="5" class="plp-empty">No people or crews match “{{ query() }}”.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
    .plp {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .plp-pagehead { display: flex; flex-direction: column; gap: var(--apt-space-3); margin-bottom: var(--apt-space-8); padding-left: var(--apt-space-10); }
    .plp-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-3); line-height: 1.05; letter-spacing: -0.02em; }
    .plp-sub { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-relaxed); }
    .plp-actions { display: flex; gap: var(--apt-space-3); margin-top: var(--apt-space-4); align-items: center; }
    .plp-search-input { flex: 1; min-width: 200px; padding: var(--apt-space-3) var(--apt-space-4); border-radius: var(--apt-button-radius); border: 1px solid var(--apt-border); background: var(--apt-surface-page); color: var(--apt-text-body); font-size: var(--apt-size-body); font-family: inherit; }
    .plp-search-input:focus { outline: none; border-color: var(--apt-accent); }
    .plp-count { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); white-space: nowrap; }

    .plp-table-wrap { overflow-x: auto; border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); }
    .plp-table { width: 100%; border-collapse: collapse; font-size: var(--apt-size-body); }
    .plp-th {
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
    .plp-tr { border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background var(--apt-motion-fast); }
    .plp-tr:hover { background: var(--apt-surface-raised); }
    .plp-td { padding: var(--apt-space-4) var(--apt-space-5); border-bottom: 1px solid #f3f4f6; color: var(--apt-text-body); vertical-align: middle; }
    .plp-td--name { font-weight: var(--apt-weight-medium); color: var(--apt-text-strong); }
    .plp-td--dim { color: var(--apt-text-muted); font-size: var(--apt-size-body); }
    .plp-glyph {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--apt-accent) 15%, transparent);
      color: var(--apt-accent);
      font-family: var(--apt-font-serif);
      font-size: var(--apt-size-md);
      font-weight: var(--apt-weight-semibold);
      display: grid;
      place-items: center;
      flex: none;
    }
    .plp-name { font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; display: block; }
    .plp-type-badge {
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
    .plp-empty { grid-column: 1 / -1; padding: var(--apt-space-8); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-md); color: var(--apt-text-muted); font-size: var(--apt-size-body); text-align: center; }

    .plp-btn {
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
    .plp-btn:hover { background: var(--apt-surface-raised); }

    @media (max-width: 760px) {
      .plp-pagehead { padding-left: 0; }
    }
    `,
  ],
})
export class PeopleComponent {
  private readonly service = inject(NetworkService);

  readonly query = signal('');
  readonly rows: readonly DirectoryRow[] = this.service.people;

  readonly visible = computed(() =>
    this.rows.filter((r) => this.service.matchQuery(this.query(), r)),
  );

  readonly caps = (r: DirectoryRow) => r.capabilities.join(', ') || '—';

  readonly initial = (name: string) => name[0] ?? '?';
}
