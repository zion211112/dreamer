/**
 * @apt-labs/features/network — NetworkComponent
 *
 * Network directory: people, crews, institutions, capabilities — one derived
 * directory from the shared operational corpus. Uses Direction 3 (The Desk)
 * dense table as default with Direction 2 (The Floor) relationship graph
 * available via Inspector on selection.
 */
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NetworkService, GROUP_LABELS, type NetworkGroup, type DirectoryRow } from '@apt-labs/shared/state';
import { SelectionService } from '@apt-labs/shared/state';
import { InspectorEntity } from '@apt-labs/features/workspace/inspector.component';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="net" data-module="network">
      <div class="net-pagehead">
        <p class="net-eyebrow">WORKSPACE · DIRECTORY</p>
        <h1 class="net-h1">Who is in the network</h1>
        <p class="net-sub">
          Every person, crew, institution and organization in the operational record.
          Filter by type or browse the full directory.
        </p>

        <div class="net-actions">
          <button class="net-btn net-btn--primary" (click)="openPeople()">Open people →</button>
          <button class="net-btn net-btn--quiet" (click)="openInstitutions()">Open institutions →</button>
        </div>
      </div>

      <div class="net-pills">
        @for (g of groups; track g.id) {
          <button
            class="net-pill"
            [class.net-pill--active]="filter() === g.id"
            (click)="filter.set(g.id)"
          >
            <span class="net-pill-label">{{ GROUP_LABELS[g.id] }}</span>
            <span class="net-pill-count">{{ counts()[g.id] }}</span>
          </button>
        }
      </div>

      <div class="net-table-wrap">
        <table class="net-table">
          <thead>
            <tr>
              <th class="net-th">Name</th>
              <th class="net-th">Type</th>
              <th class="net-th">Description</th>
              <th class="net-th">Capabilities</th>
              <th class="net-th">Registered</th>
              <th class="net-th net-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (row of visible(); track row.id) {
              <tr class="net-tr" (click)="selectRow(row)">
                <td class="net-td net-td--name">
                  <span class="net-glyph" [style]="'--card-accent:' + cardAccent(row.type)">{{ initial(row.name) }}</span>
                  <span class="net-name">{{ row.name }}</span>
                </td>
                <td class="net-td"><span class="net-type-badge">{{ typeLabel(row.type) }}</span></td>
                <td class="net-td">{{ row.description }}</td>
                <td class="net-td">{{ caps(row) }}</td>
                <td class="net-td">{{ row.registered }}</td>
                <td class="net-td net-td--actions">
                  <button class="net-btn net-btn--sm net-btn--quiet" (click)="$event.stopPropagation(); viewRow(row)">View</button>
                  <button class="net-btn net-btn--sm net-btn--quiet" (click)="$event.stopPropagation(); inspectRow(row)">Inspect</button>
                </td>
              </tr>
              @if (visible().length === 0) {
                <tr><td colspan="6" class="net-empty">No entities match this filter yet.</td></tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
    .net { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }

    .net-pagehead { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); }
    .net-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0; text-transform: uppercase; }
    .net-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); letter-spacing: -0.022em; line-height: 1.05; }
    .net-sub { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-height-relaxed); }
    .net-actions { display: flex; gap: var(--apt-spacing-s3); margin-top: var(--apt-spacing-s4); }

    .net-btn {
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
    .net-btn:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .net-btn--primary { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .net-btn--primary:hover { background: color-mix(in srgb, var(--apt-color-brand-primary) 90%, var(--apt-surface-default)); }
    .net-btn--quiet { background: transparent; border-color: transparent; color: var(--apt-text-muted); }
    .net-btn--quiet:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); }
    .net-btn--sm { padding: var(--apt-spacing-s1) var(--apt-spacing-s3); font-size: var(--apt-font-size-sm-3); }

    /* Type pills */
    .net-pills { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); }
    .net-pill { display: flex; align-items: center; gap: var(--apt-spacing-s2); padding: var(--apt-spacing-s2) var(--apt-spacing-s4); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: transparent; color: var(--apt-text-muted); font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; }
    .net-pill:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-text-body); }
    .net-pill--active { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .net-pill--active .net-pill-count { color: var(--apt-action-on-primary); }
    .net-pill-count { font-size: var(--apt-font-size-micro); opacity: 0.75; }

    /* Dense table */
    .net-table-wrap { overflow-x: auto; border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); }
    .net-table { width: 100%; border-collapse: collapse; font-size: var(--apt-font-size-body-sm); }
    .net-th { text-align: left; padding: var(--apt-spacing-s4) var(--apt-spacing-s5); font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); border-bottom: 1px solid var(--apt-border); font-weight: var(--apt-font-weight-medium); white-space: nowrap; }
    .net-tr { border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background var(--apt-animation-fast); }
    .net-tr:hover { background: var(--apt-surface-raised); }
    .net-tr--selected { background: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 8%, transparent); border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .net-td { padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-bottom: 1px solid #f3f4f6; color: var(--apt-text-body); vertical-align: middle; }
    .net-td--name { font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); }
    .net-glyph { width: 32px; height: 32px; border-radius: 50%; background: color-mix(in srgb, var(--card-accent) 15%, transparent); color: var(--card-accent); font-family: var(--apt-font-serif); font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-semibold); display: grid; place-items: center; flex: none; }
    .net-name { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; display: block; }
    .net-type-badge { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: lowercase; letter-spacing: 0.04em; color: var(--apt-text-body); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 1px 6px; white-space: nowrap; }
    .net-empty { grid-column: 1 / -1; padding: var(--apt-spacing-s8); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-r2); color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); text-align: center; }
    `,
  ],
})
export class NetworkComponent {
  private readonly service = inject(NetworkService);

  protected readonly GROUP_LABELS = GROUP_LABELS;

  readonly filter = this.service.filter;
  readonly groups = this.service.groups;
  readonly counts = this.service.counts;
  readonly visible = this.service.visible;

  readonly initial = (name: string) => name[0] ?? '?';

  readonly typeLabel = (type: DirectoryRow['type']) => {
    const m: Record<string, string> = { person: 'person', crew: 'crew', institution: 'institution', organization: 'organization' };
    return m[type] ?? type;
  };

  readonly cardAccent = (type: DirectoryRow['type']) => {
    const m: Record<string, string> = {
      person: 'var(--apt-color-brand-primary)',
      crew: 'var(--apt-group-continuity)',
      institution: 'var(--apt-group-value)',
      organization: 'var(--apt-group-core)',
    };
    return m[type] ?? 'var(--apt-text-muted)';
  };

  readonly caps = (r: DirectoryRow) => r.capabilities.join(', ') || '—';

  openPeople(): void {}
  openInstitutions(): void {}
  selectRow(row: DirectoryRow): void {}
  viewRow(row: DirectoryRow): void {}
  inspectRow(row: DirectoryRow): void {}
}
