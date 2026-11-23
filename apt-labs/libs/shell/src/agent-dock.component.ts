/**
 * @apt-labs/shell — AgentDockComponent
 *
 * 360px right column. The agent operates on the active module:
 * reads the module's primitive, proposes the next move, every action
 * carries a receipt (Proof-Carrying Work Unit).
 */

import { Component, input, signal } from '@angular/core';

interface ModuleIntent {
  label: string;
  hint: string;
  active: boolean;
  gated?: boolean;
}

export interface ModuleAgentSpec {
  id: string;
  title: string;
  intents: ModuleIntent[];
}

@Component({
  selector: 'app-agent-dock',
  imports: [],
  template: `
    <aside class="agent-dock" aria-label="Agent dock">
      <div class="agent-dock-head">
        <div class="agent-dock-title">{{ module().title }}</div>
        <div class="agent-dock-sub">{{ module().subtitle }}</div>
      </div>

      <div class="agent-dock-actions">
        @for (intent of intents(); track intent.label) {
          <button
            class="agent-intent"
            [class.active]="intent.active"
            [class.gated]="intent.gated"
            (click)="onIntent(intent.label)"
          >
            {{ intent.label }}
            <span class="intent-hint">{{ intent.hint }}</span>
            @if (intent.gated) {
              <span class="gate-chip">gated</span>
            }
          </button>
        }
      </div>

      <div class="agent-dock-receipts">
        @for (receipt of receipts(); track $index) {
          <div class="receipt {{ receipt.outcome }}">
            <span class="receipt-outcome">{{ receipt.outcome }}</span>
            <span class="receipt-text">{{ receipt.intent }}</span>
          </div>
        }
        @if (receipts().length === 0) {
          <div class="receipts-empty">No receipts yet.</div>
        }
      </div>
    </aside>
  `,
  styles: [`
    .agent-dock { width: 360px; border-left: 1px solid var(--apt-border); background: var(--apt-surface-page); }
    .agent-dock-head { padding: var(--apt-spacing-s7) var(--apt-spacing-s4); border-bottom: 1px solid var(--apt-border); }
    .agent-dock-title { font-weight: var(--apt-font-weight-semibold); font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); }
    .agent-dock-sub { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); margin-top: var(--apt-spacing-s2); }
    .agent-dock-actions { padding: var(--apt-spacing-s6); display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
    .agent-intent { width: 100%; padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); background: var(--apt-surface-raised); text-align: left; cursor: pointer; font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); display: flex; justify-content: space-between; align-items: center; }
    .agent-intent.active { border-color: var(--apt-module-accent); background: var(--apt-surface-info); color: var(--apt-module-accent); font-weight: var(--apt-font-weight-medium); }
    .agent-intent.gated { opacity: 0.5; }
    .gate-chip { font-size: var(--apt-font-size-micro); background: var(--apt-surface-warning); color: var(--apt-color-warning-base); padding: var(--apt-spacing-s1) var(--apt-spacing-s3); border-radius: var(--apt-radius-r1); }
    .intent-hint { font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); font-weight: var(--apt-font-weight-medium); }
    .agent-dock-receipts { padding: var(--apt-spacing-s6); }
    .receipt { font-size: var(--apt-font-size-micro); padding: var(--apt-spacing-s3); border-radius: var(--apt-radius-r1); margin-bottom: var(--apt-spacing-s3); }
    .receipt.executed { background: var(--apt-surface-success); color: var(--apt-text-success); }
    .receipt.gated { background: var(--apt-surface-warning); color: var(--apt-text-warning); }
    .receipt-outcome { font-weight: var(--apt-font-weight-semibold); text-transform: uppercase; font-size: var(--apt-font-size-micro); margin-bottom: var(--apt-spacing-s1); display: block; }
    .receipt-text { font-size: var(--apt-font-size-micro); }
    .receipts-empty { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); font-style: italic; }
  `],
})
export class AgentDockComponent {
  readonly module = input.required<{ title: string; subtitle: string }>();
  readonly intents = input.required<ModuleIntent[]>();
  readonly receipts = signal<{ outcome: 'executed' | 'gated'; intent: string }[]>([]);

  onIntent(label: string): void {
    this.receipts.update((r) => [...r, { outcome: 'executed', intent: label }]);
  }
}
