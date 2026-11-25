/**
 * @apt-labs/shared/ui — FlowRailComponent
 *
 * Horizontal step rail: shows progress through a multi-step process.
 */

import { Component, input } from '@angular/core';

export interface FlowStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

@Component({
  selector: 'app-flow-rail',
  imports: [],
  template: `
    <div class="flow-rail">
      <ol class="flow-list" role="list">
        @for (step of steps(); track step.id; let i = $index) {
          <li class="flow-item" [class.active]="step.status === 'active'" [class.completed]="step.status === 'completed'">
            <span class="flow-dot"></span>
            <span class="flow-label">{{ step.label }}</span>
            @if (i < steps().length - 1) {
              <span class="flow-line"></span>
            }
          </li>
        }
      </ol>
    </div>
  `,
  styles: [`
    .flow-rail { display: flex; align-items: center; gap: var(--apt-spacing-s3); }
    .flow-list { display: flex; align-items: center; gap: var(--apt-spacing-s3); list-style: none; margin: 0; padding: 0; }
    .flow-item { position: relative; display: flex; align-items: center; gap: var(--apt-spacing-s3); }
    .flow-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--apt-border); }
    .flow-item.active .flow-dot { background: var(--apt-module-accent); }
    .flow-item.completed .flow-dot { background: var(--apt-text-success); }
    .flow-label { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .flow-item.active .flow-label, .flow-item.completed .flow-label { color: var(--apt-text-strong); font-weight: var(--apt-font-weight-medium); }
    .flow-line { flex: 1; height: 1px; background: var(--apt-border); }
  `],
})
export class FlowRailComponent {
  readonly steps = input.required<readonly FlowStep[]>();
}
