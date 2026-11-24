/**
 * @apt-labs/shell — SessionReferenceComponent
 *
 * Session context header: module identity, active intent, and current
 * Proof-Carrying Work Unit reference.
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-session-reference',
  imports: [],
  template: `
    <div class="session-reference" aria-label="Session reference">
      <div class="session-line">
        <span class="session-key">Module:</span>
        <span class="session-value">{{ module() }}</span>
      </div>
      <div class="session-line">
        <span class="session-key">Intent:</span>
        <span class="session-value">{{ intent() }}</span>
      </div>
      <div class="session-line">
        <span class="session-key">PCWU:</span>
        <span class="session-value">{{ pcwu() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .session-reference { padding: var(--apt-space-5) var(--apt-space-6); border-bottom: 1px solid var(--apt-border); background: var(--apt-surface-raised); font-size: var(--apt-size-micro); }
    .session-line { display: flex; gap: var(--apt-space-3); margin-bottom: var(--apt-space-1); }
    .session-key { color: var(--apt-text-muted); min-width: 64px; font-weight: var(--apt-weight-medium); }
    .session-value { color: var(--apt-text-strong); font-weight: var(--apt-weight-medium); }
  `],
})
export class SessionReferenceComponent {
  readonly module = input<string>('');
  readonly intent = input<string>('');
  readonly pcwu = input<string>('');
}
