/**
 * @apt-labs/features/workspace — SidebarComponent
 *
 * Shell region: within-module context only. Shows context relevant to the
 * currently selected record within the active module — never duplicate
 * module navigation (that is the rail's job). Collapsible to icons-only
 * at 1024px and below.
 */
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="collapsed()">
      <div class="sidebar-head">
        <h3 class="sidebar-title">{{ title() }}</h3>
        <button class="sidebar-toggle" (click)="toggle()" aria-label="Collapse sidebar">‹</button>
      </div>
      <nav class="sidebar-nav" aria-label="Within-module context">
        @for (item of items(); track item.id) {
          <a [routerLink]="item.path" class="sidebar-item" [class.active]="item.active">
            <span class="sidebar-item-label">{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [
    `
    .sidebar {
      width: 252px;
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
      padding: var(--apt-spacing-s6);
      border-bottom: 1px solid var(--apt-border-faint, var(--apt-border));
      background: var(--apt-surface-raised);
      flex-shrink: 0;
    }
    .sidebar-title {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-font-size-title-2);
      font-weight: var(--apt-font-weight-semibold);
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
      font-size: var(--apt-font-size-body-sm);
    }
    .sidebar-toggle:hover { color: var(--apt-text-strong); }
    .sidebar--collapsed .sidebar-toggle { transform: rotate(180deg); }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: var(--apt-spacing-s4); }
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: var(--apt-spacing-s4);
      padding: var(--apt-spacing-s3) var(--apt-spacing-s5);
      border-radius: var(--apt-radius-r1);
      text-decoration: none;
      color: var(--apt-text-muted);
      font-size: var(--apt-font-size-body-sm);
      font-weight: var(--apt-font-weight-medium);
      border: 1px solid transparent;
    }
    .sidebar-item:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); }
    .sidebar-item.active {
      background: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 12%, transparent);
      color: var(--apt-text-strong);
      border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary));
      border-color: transparent;
    }
    .sidebar-item-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sidebar--collapsed .sidebar-item-label { display: none; }
    .sidebar--collapsed .sidebar-item { justify-content: center; padding: var(--apt-spacing-s3); }
    @media (max-width: 1024px) {
      .sidebar { width: 220px; }
      .sidebar-item-label { font-size: var(--apt-font-size-sm-3); }
    }
    @media (max-width: 760px) {
      .sidebar { display: none; }
    }
    `,
  ],
})
export class SidebarComponent {
  readonly title = input<string>('Context');
  readonly collapsed = input<boolean>(false);
  readonly items = input<{ id: string; label: string; path: string[]; active?: boolean }[]>([]);

  toggle(): void {}
}
