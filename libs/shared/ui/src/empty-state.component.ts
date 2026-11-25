/**
 * @apt-labs/shared/ui — EmptyStateComponent
 *
 * Placeholder when a list or table has no data.
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [],
  template: `
    <div class="empty-state">
      @if (icon()) {
        <div class="empty-icon">{{ icon() }}</div>
      }
      @if (title()) {
        <div class="empty-title">{{ title() }}</div>
      }
      @if (hint()) {
        <div class="empty-hint">{{ hint() }}</div>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    .empty-state { padding: var(--apt-spacing-s14) var(--apt-spacing-s12); display: flex; flex-direction: column; align-items: center; text-align: center; }
    .empty-icon { font-size: var(--apt-font-size-display); margin-bottom: var(--apt-spacing-s5); opacity: 0.4; }
    .empty-title { font-size: var(--apt-font-size-title-1); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin-bottom: var(--apt-spacing-s2); }
    .empty-hint { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); max-width: 280px; }
  `],
})
export class EmptyStateComponent {
  readonly icon = input<string>('');
  readonly title = input<string>('');
  readonly hint = input<string>('');
}
