/**
 * @apt-labs/shared/ui — MetricTileComponent
 *
 * Single KPI card: label, value, and optional delta indicator.
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-tile',
  imports: [],
  template: `
    <div class="metric-tile" [class.delta-up]="delta() > 0" [class.delta-down]="delta() < 0">
      <div class="metric-label">{{ label() }}</div>
      <div class="metric-value">{{ value() }}</div>
      @if (delta() !== 0) {
        <div class="metric-delta" [class.up]="delta() > 0" [class.down]="delta() < 0">
          {{ delta() > 0 ? '↑' : '↓' }} {{ delta() | number }}%
        </div>
      }
      @if (hint()) {
        <div class="metric-hint">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    .metric-tile { padding: var(--apt-spacing-s7); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); border: 1px solid var(--apt-border); min-width: 140px; }
    .metric-label { font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; color: var(--apt-text-muted); margin-bottom: var(--apt-spacing-s3); }
    .metric-value { font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); }
    .metric-delta { font-size: var(--apt-font-size-micro); margin-top: var(--apt-spacing-s1); }
    .metric-delta.up { color: var(--apt-text-success); }
    .metric-delta.down { color: var(--apt-text-danger); }
    .metric-hint { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); margin-top: var(--apt-spacing-s1); }
  `],
})
export class MetricTileComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly delta = input<number>(0);
  readonly hint = input<string>('');
}
