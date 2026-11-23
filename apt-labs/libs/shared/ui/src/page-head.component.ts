/**
 * @apt-labs/shared/ui — PageHeadComponent
 *
 * Page header: title, subtitle, and right-side action area.
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-head',
  imports: [],
  template: `
    <div class="page-head">
      <div class="page-head-left">
        <h1 class="page-title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="page-head-actions">
        <ng-content select="[actions]" />
      </div>
    </div>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: flex-start; padding: var(--apt-spacing-s10); }
    .page-title { font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0; font-family: var(--apt-font-serif); }
    .page-subtitle { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: var(--apt-spacing-s2) 0 0; }
    .page-head-actions { display: flex; gap: var(--apt-spacing-s3); }
  `],
})
export class PageHeadComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
