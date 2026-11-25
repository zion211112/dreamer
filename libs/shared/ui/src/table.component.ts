/**
 * @apt-labs/shared/ui — TableComponent
 *
 * Generic data table with column configuration.
 */

import { Component, input } from '@angular/core';
import { EmptyStateComponent } from './empty-state.component';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

@Component({
  selector: 'app-table',
  imports: [EmptyStateComponent],
  template: `
    @if (rows().length > 0) {
      <div class="table-wrap">
        <table class="table" role="table">
          <thead>
            <tr>
              @for (col of columns(); track $index) {
                <th class="table-th" [style.width]="col.width" [style.text-align]="col.align || 'left'">
                  {{ col.label }}
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track $index) {
              <tr class="table-row">
                @for (col of columns(); track $index) {
                  <td class="table-td" [style.text-align]="col.align || 'left'">
                    <ng-content select="[cell]" [row]="row" [col]="col" />
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <app-empty-state [icon]="emptyIcon()" [title]="emptyTitle()" [hint]="emptyHint()" />
    }
  `,
  styles: [`
    .table-wrap { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: var(--apt-font-size-body-sm); }
    .table-th { padding: var(--apt-spacing-s5) var(--apt-spacing-s6); text-align: left; font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; color: var(--apt-text-muted); border-bottom: 1px solid var(--apt-border); font-weight: var(--apt-font-weight-medium); }
    .table-td { padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border-bottom: 1px solid var(--apt-border); color: var(--apt-text-strong); }
    .table-row:hover .table-td { background: var(--apt-surface-raised); }
  `],
})
export class TableComponent<T> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly emptyIcon = input<string>('');
  readonly emptyTitle = input<string>('No data');
  readonly emptyHint = input<string>('');
}
