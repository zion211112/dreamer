/**
 * @apt-labs/features/workspace — SidebarComponent
 *
 * Shell region: within-module context only. Shows context relevant to the
 * currently selected record within the active module — never duplicate
 * module navigation (that is the rail's job). Collapsible to icons-only
 * at 1024px and below.
 * Structural Emergence.
 */
import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="collapsed()" aria-label="Within-module context">
      <div class="sidebar-head">
        <div class="sidebar-title">{{ title() }}</div>
        <button class="sidebar-toggle" type="button" (click)="toggle()" [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'">{{ collapsed() ? '›' : '‹' }}</button>
      </div>
      @if (items().length) {
        <nav class="sidebar-nav" aria-label="Within-module links">
          @for (item of items(); track item.id) {
            <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="sidebar-item">
              <span class="sidebar-item-label">{{ item.label }}</span>
            </a>
          }
        </nav>
      } @else {
        <p class="sidebar-empty">No related destinations for this view.</p>
      }
    </aside>
  `,
  styles: [
    `
    .sidebar {
      box-sizing: border-box;
      width: var(--apt-shell-sidebar-max);
      border-right: 1px solid var(--apt-border);
      background: var(--apt-surface-page);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
    }
    .sidebar--collapsed { width: 64px; }
    .sidebar-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--apt-space-6);
      border-bottom: 1px solid var(--apt-border-faint);
      background: var(--apt-surface-raised);
      flex-shrink: 0;
    }
    .sidebar-title {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-size-title);
      font-weight: var(--apt-weight-semibold);
      color: var(--apt-text-strong);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sidebar--collapsed .sidebar-title { display: none; }
    .sidebar-toggle {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: 0;
      background: transparent;
      color: var(--apt-text-muted);
      cursor: pointer;
      font-size: var(--apt-size-body);
    }
    .sidebar-toggle:hover { color: var(--apt-text-strong); }
    .sidebar--collapsed .sidebar-toggle { transform: rotate(180deg); }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: var(--apt-space-4); }
    .sidebar-empty { padding: var(--apt-space-4); color: var(--apt-text-muted); font-size: var(--apt-size-sm); }
    .sidebar--collapsed .sidebar-empty { display: none; }
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: var(--apt-space-4);
      padding: var(--apt-space-3) var(--apt-space-5);
      border-radius: var(--apt-button-radius);
      text-decoration: none;
      color: var(--apt-text-muted);
      font-size: var(--apt-size-body);
      font-weight: var(--apt-weight-medium);
      border: 1px solid transparent;
    }
    .sidebar-item:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); }
    .sidebar-item.active {
      background: color-mix(in srgb, var(--apt-module-accent, var(--apt-accent)) 12%, transparent);
      color: var(--apt-text-strong);
      border-left: 3px solid var(--apt-module-accent, var(--apt-accent));
      border-color: transparent;
    }
    .sidebar-item-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    .sidebar--collapsed .sidebar-item-label { display: none; }
    .sidebar--collapsed .sidebar-item { justify-content: center; padding: var(--apt-space-3); }
    @media (max-width: 1024px) {
      .sidebar { width: var(--apt-shell-sidebar-min); }
      .sidebar-item-label { font-size: var(--apt-size-sm); }
    }
    @media (max-width: 760px) {
      .sidebar { display: none; }
    }
    `,
  ],
})
export class SidebarComponent {
  readonly title = input<string>('Context');
  readonly collapsed = signal(false);
  readonly items = input<{ id: string; label: string; path: string[]; active?: boolean }[]>([]);

  toggle(): void {
    this.collapsed.update((value) => !value);
  }
}
