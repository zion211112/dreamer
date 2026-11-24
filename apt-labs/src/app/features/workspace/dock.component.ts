/**
 * @apt-labs/features/workspace — DockComponent
 *
 * Shell region: contextual per-module change-set / evidence strip. Shows
 * what is staged, what is gated, and what is blocked for the current module.
 * Structural Emergence.
 */
import { Component, input } from '@angular/core';

export interface DockItem {
  id: string;
  label: string;
  status: 'staged' | 'gated' | 'blocked' | 'ready';
  action?: string;
}

const STATUS_COLORS: Record<string, string> = {
  staged: 'var(--apt-text-info)',
  gated: 'var(--apt-state-caution)',
  blocked: 'var(--apt-state-risk)',
  ready: 'var(--apt-state-canon)',
};

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [],
  template: `
    <footer class="dock" [class.dock--empty]="items().length === 0">
      <div class="dock-head">
        <span class="dock-label">{{ module() }}</span>
        <span class="dock-count">{{ items().length }}</span>
      </div>
      <div class="dock-items">
        @for (item of items(); track item.id) {
          <div class="dock-item" [class]="'dock-item--' + item.status">
            <span class="dock-item-label">{{ item.label }}</span>
            <span class="dock-item-status">{{ item.status }}</span>
            @if (item.action) {
              <button class="dock-item-action">{{ item.action }}</button>
            }
          </div>
        }
        @if (items().length === 0) {
          <span class="dock-empty">Nothing staged.</span>
        }
      </div>
    </footer>
  `,
  styles: [
    `
    .dock {
      height: var(--apt-shell-dock);
      border-top: 1px solid var(--apt-border);
      background: var(--apt-surface-page);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      z-index: var(--apt-z-dropdown);
      box-shadow: 0 -1px 3px 0 rgba(20, 19, 13, 0.08), 0 -1px 2px -1px rgba(20, 19, 13, 0.04);
    }
    .dock--empty { display: none; }
    .dock-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--apt-space-3) var(--apt-space-6);
      border-bottom: 1px solid var(--apt-border-faint);
      background: var(--apt-surface-raised);
      flex-shrink: 0;
    }
    .dock-label { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
    .dock-count { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-body); }
    .dock-items { flex: 1; overflow-y: auto; padding: var(--apt-space-4); display: flex; flex-direction: column; gap: var(--apt-space-3); }
    .dock-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--apt-space-3) var(--apt-space-5);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-raised);
    }
    .dock-item-label { font-size: var(--apt-size-body); color: var(--apt-text-body); }
    .dock-item-status {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--apt-text-muted);
      flex-shrink: 0;
    }
    .dock-item--gated .dock-item-status { color: var(--apt-state-caution); }
    .dock-item--blocked .dock-item-status { color: var(--apt-state-risk); }
    .dock-item--ready .dock-item-status { color: var(--apt-state-canon); }
    .dock-item--staged .dock-item-status { color: var(--apt-text-info); }
    .dock-item-action {
      padding: var(--apt-space-1) var(--apt-space-3);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: transparent;
      color: var(--apt-module-accent, var(--apt-accent));
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-sm);
      cursor: pointer;
    }
    .dock-item-action:hover { background: var(--apt-surface-raised); }
    .dock-empty { font-family: var(--apt-font-mono); font-size: var(--apt-size-sm); color: var(--apt-text-dim); padding: var(--apt-space-6); text-align: center; }
    @media (max-width: 760px) { .dock { display: none; } }
    `,
  ],
})
export class DockComponent {
  readonly module = input<string>('Module');
  readonly items = input<DockItem[]>([]);
}
