/**
 * @apt-labs/features/workspace — TopbarComponent
 *
 * Shell region: working-context identity.
 * Impeccable craft-floor: no eyebrow, shadows with offset+blur,
 * themed browser surfaces, full state coverage.
 */
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  template: `
    <header class="topbar" [attr.aria-label]="'Working context: ' + context()">
      <div class="topbar-brand">
        <div class="brand-mark">APT</div>
        <span class="brand-name">APT-LABS</span>
      </div>
      <div class="topbar-context">
        <span class="context-label">{{ context() }}</span>
        @if (activeRecord()) {
          <span class="context-divider">·</span>
          <span class="context-record">{{ activeRecord() }}</span>
        }
      </div>
      <div class="topbar-actions">
        <button class="topbar-action" aria-label="Command palette">⌘K</button>
        <button class="topbar-action" aria-label="Account">👤</button>
      </div>
    </header>
  `,
  styles: [
    `
    .topbar {
      height: var(--apt-shell-topbar);
      border-bottom: 1px solid var(--apt-border);
      background: var(--apt-surface-page);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--apt-spacing-s8);
      flex-shrink: 0;
      z-index: var(--apt-z-index-dropdown);
      /* Shadow with offset + soft blur (craft-floor: not zero-offset colored halo) */
      box-shadow: 0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04);
    }
    .topbar-brand {
      display: flex;
      align-items: center;
      gap: var(--apt-spacing-s3);
      font-family: var(--apt-font-serif);
      font-size: var(--apt-font-size-title-1);
      font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong);
      letter-spacing: -0.02em;
    }
    .brand-mark {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      background: var(--apt-module-accent, var(--apt-color-brand-primary));
      color: var(--apt-action-on-primary);
      border-radius: var(--apt-radius-r1);
      font-size: var(--apt-font-size-sm-3);
      font-weight: var(--apt-font-weight-semibold);
    }
    .brand-name { letter-spacing: -0.01em; }
    .topbar-context {
      display: flex;
      align-items: center;
      gap: var(--apt-spacing-s3);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-sm-3);
      color: var(--apt-text-muted);
    }
    .context-divider { color: var(--apt-text-dim); }
    .context-record { color: var(--apt-text-body); }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: var(--apt-spacing-s3);
    }
    .topbar-action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r1);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-font-size-sm-3);
      cursor: pointer;
    }
    .topbar-action:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    @media (max-width: 760px) {
      .topbar { height: 48px; padding: 0 var(--apt-spacing-s6); }
      .topbar-context { display: none; }
    }
    `,
  ],
})
export class TopbarComponent {
  readonly context = input<string>('Workspace');
  readonly activeRecord = input<string>('');
}
