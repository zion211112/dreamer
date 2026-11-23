/**
 * @apt-labs/features/workspace — DockComponent
 *
 * Shell region: contextual per-module change-set / evidence strip. Shows
 * what is staged, what is gated, and what is blocked for the current module.
 * One job per module; content is provided by the module.
 *
 * Impeccable craft-floor: shadows with offset+blur, full state coverage.
 */
import { Component, input } from '@angular/core';

export interface DockItem {
  id: string;
  label: string;
  status: 'staged' | 'gated' | 'blocked' | 'ready';
  action?: string;
}

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
      z-index: var(--apt-z-index-dropdown);
      box-shadow: 0 -1px 3px 0 rgba(0,0,0,0.08), 0 -1px 2px -1px rgba(0,0,0,0.04);
    }
    .dock--empty { display: none; }
    .dock-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--apt-spacing-s3) var(--apt-spacing-s6);
      border-bottom: 1px solid var(--apt-border-faint);
      background: var(--apt-surface-raised);
      flex-shrink: 0;
    }
    .dock-label { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
    .dock-count { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-body); }
    .dock-items { flex: 1; overflow-y: auto; padding: var(--apt-spacing-s4); display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
    .dock-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--apt-spacing-s3) var(--apt-spacing-s5);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r1);
      background: var(--apt-surface-raised);
    }
    .dock-item-label { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-body); }
    .dock-item-status { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.06em; color: var(--apt-text-muted); flex-shrink: 0; }
    .dock-item--gated .dock-item-status { color: var(--apt-color-warning-base, #92400e); }
    .dock-item--blocked .dock-item-status { color: var(--apt-color-danger-base, #991b1b); }
    .dock-item--ready .dock-item-status { color: var(--apt-color-success-base, #166534); }
    .dock-item--staged .dock-item-status { color: var(--apt-text-info); }
    .dock-item-action {
      padding: var(--apt-spacing-s1) var(--apt-spacing-s3);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r0);
      background: transparent;
      color: var(--apt-module-accent, var(--apt-color-brand-primary));
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-sm-3);
      cursor: pointer;
    }
    .dock-item-action:hover { background: var(--apt-surface-raised); }
    .dock-empty { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); color: var(--apt-text-dim); padding: var(--apt-spacing-s6); text-align: center; }
    @media (max-width: 760px) { .dock { display: none; } }
    `,
  ],
})
export class DockComponent {
  readonly module = input<string>('Module');
  readonly items = input<DockItem[]>([]);
}
