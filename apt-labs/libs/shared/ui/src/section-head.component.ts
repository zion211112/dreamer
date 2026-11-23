/**
 * @apt-labs/shared/ui — SectionHeadComponent
 *
 * Section heading with optional count badge and right-side actions.
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-head',
  imports: [],
  template: `
    <div class="section-head">
      <div class="section-left">
        <h2 class="section-title">{{ title() }}</h2>
        @if (count() !== undefined) {
          <span class="section-count">{{ count() }}</span>
        }
        @if (subtitle()) {
          <p class="section-subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="section-actions">
        <ng-content select="[actions]" />
      </div>
    </div>
  `,
  styles: [`
    .section-head { display: flex; justify-content: space-between; align-items: flex-start; padding: var(--apt-spacing-s8) 0; }
    .section-title { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0; font-family: var(--apt-font-serif); }
    .section-count { font-size: var(--apt-font-size-micro); background: var(--apt-surface-raised); padding: var(--apt-spacing-s1) var(--apt-spacing-s3); border-radius: 999px; margin-left: var(--apt-spacing-s3); color: var(--apt-text-muted); }
    .section-subtitle { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); margin: var(--apt-spacing-s2) 0 0; }
    .section-actions { display: flex; gap: var(--apt-spacing-s3); }
  `],
})
export class SectionHeadComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly count = input<number>();
}
