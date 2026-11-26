/**
 * @apt-labs/features/workspace — TopbarComponent
 *
 * Shell region: working-context identity.
 * Structural Emergence — warm ivory base, earthy neutrals, serif headings,
 * mono interface, selective deep-forest / brass / sage accents.
 * Shadow with offset + soft blur (craft-floor: not zero-offset colored halo).
 */
import { Component, input, output } from '@angular/core';

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
        <button type="button" class="topbar-action" aria-label="Command palette" (click)="paletteRequest.emit()">⌘&nbsp;K</button>
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
      padding: 0 var(--apt-space-8);
      flex-shrink: 0;
      z-index: var(--apt-z-dropdown);
      box-shadow: var(--apt-shadow-1);
    }
    .topbar-brand {
      display: flex;
      align-items: center;
      gap: var(--apt-space-3);
      font-family: var(--apt-font-serif);
      font-size: var(--apt-size-title);
      font-weight: var(--apt-weight-semibold);
      color: var(--apt-text-strong);
      letter-spacing: -0.02em;
    }
    .brand-mark {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      background: var(--apt-module-accent, var(--apt-accent));
      color: var(--apt-action-on-accent);
      border-radius: var(--apt-button-radius);
      font-size: var(--apt-size-sm);
      font-weight: var(--apt-weight-semibold);
    }
    .brand-name { letter-spacing: -0.01em; }
    .topbar-context {
      display: flex;
      align-items: center;
      gap: var(--apt-space-3);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-sm);
      color: var(--apt-text-muted);
    }
    .context-divider { color: var(--apt-text-dim); }
    .context-record { color: var(--apt-text-body); }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: var(--apt-space-3);
    }
    .topbar-action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-size-sm);
      cursor: pointer;
    }
    .topbar-action:hover { border-color: var(--apt-border-active); }
    @media (max-width: 760px) {
      .topbar { height: 48px; padding: 0 var(--apt-space-6); }
      .topbar-context { display: none; }
      .topbar-action { width: 44px; height: 44px; flex: none; }
    }
    `,
  ],
})
export class TopbarComponent {
  readonly context = input<string>('Workspace');
  readonly activeRecord = input<string>('');
  readonly paletteRequest = output<void>();
}
