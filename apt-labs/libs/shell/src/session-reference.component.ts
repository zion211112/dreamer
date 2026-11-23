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
    .session-reference { padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border-bottom: 1px solid var(--apt-border); background: var(--apt-surface-raised); font-size: var(--apt-font-size-micro); }
    .session-line { display: flex; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s1); }
    .session-key { color: var(--apt-text-muted); min-width: 64px; font-weight: var(--apt-font-weight-medium); }
    .session-value { color: var(--apt-text-strong); font-weight: var(--apt-font-weight-medium); }
  `],
})
export class SessionReferenceComponent {
  readonly module = input<string>('');
  readonly intent = input<string>('');
  readonly pcwu = input<string>('');
}
