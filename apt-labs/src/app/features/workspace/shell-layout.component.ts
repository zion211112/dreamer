/**
 * @apt-labs/features/workspace — ShellLayoutComponent
 *
 * Shell layout: six functional regions + separate persistent statusbar.
 * Each region has one job; no duplicate navigation systems (charter B3).
 *
 * Regions:
 *   Topbar   — working-context identity
 *   Rail     — module switching (6 icons: Home + 5 productive modules)
 *   Sidebar  — within-module context only
 *   Main     — work surface (router outlet)
 *   Inspector — contextual, opens on selection
 *   Dock     — contextual per-module change-set / evidence strip
 *   Statusbar — single boundary line + ledger head state (separate)
 *
 * Responsive behavior:
 *   1440px: All regions visible; rail + sidebar fixed widths; inspector side panel; dock bottom; statusbar full width.
 *   1024px: Sidebar narrows; inspector narrows; item labels shrink.
 *   768px: Sidebar hidden; inspector becomes bottom fixed panel; dock hidden; topbar hides context.
 *   390px: Rail hidden; main full width; inspector bottom sheet; statusbar compact.
 */
import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TopbarComponent } from './topbar.component';
import { SidebarComponent } from './sidebar.component';
import { InspectorComponent, InspectorEntity } from './inspector.component';
import { DockComponent } from './dock.component';
import { StatusbarComponent } from './statusbar.component';
import { SelectionService } from '@apt-labs/shared/state';

const MODULES = [
  { path: '', label: 'Overview' },
  { path: 'commons', label: 'Commons' },
  { path: 'network', label: 'Network' },
  { path: 'workbench', label: 'Workbench' },
  { path: 'value', label: 'Value' },
  { path: 'records', label: 'Records' },
  { path: 'intelligence', label: 'Intelligence' },
];

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TopbarComponent, SidebarComponent, InspectorComponent, DockComponent, StatusbarComponent],
  template: `
    <div class="shell-layout">
      <app-topbar [context]="context" [activeRecord]="activeRecord"></app-topbar>

      <div class="shell-body">
        <nav class="module-rail" aria-label="Modules">
          <div class="rail-brand">APT-LABS</div>
          @for (item of modules; track item.path) {
            <a [routerLink]="['/workspace', item.path]" [routerLinkActive]="['active']" class="nav-item" [class.active]="isActive(item.path)">
              {{ item.label }}
            </a>
          }
        </nav>

        <app-sidebar [title]="sidebarTitle" [collapsed]="sidebarCollapsed" [items]="sidebarItems"></app-sidebar>

        <main class="shell-main">
          <router-outlet />
        </main>

        <app-inspector [open]="inspectorOpen()" [entity]="inspectorEntity()"></app-inspector>

        <app-dock [module]="dockModule" [items]="dockItems"></app-dock>
      </div>

      <app-statusbar [ledger]="ledger"></app-statusbar>
    </div>
  `,
  styles: [
    `
    .shell-layout { display: flex; flex-direction: column; height: 100dvh; background: var(--apt-surface-default); }
    .shell-body { flex: 1; display: flex; overflow: hidden; }
    .module-rail {
      width: 232px;
      border-right: 1px solid var(--apt-border);
      padding: var(--apt-spacing-s8) var(--apt-spacing-s4);
      display: flex;
      flex-direction: column;
      gap: var(--apt-spacing-s2);
      background: var(--apt-surface-page);
      flex-shrink: 0;
    }
    .rail-brand {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-font-size-title-1);
      font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong);
      letter-spacing: -0.02em;
      margin-bottom: var(--apt-spacing-s8);
      padding-bottom: var(--apt-spacing-s4);
      border-bottom: 1px solid var(--apt-border-faint, var(--apt-border));
    }
    .nav-item {
      padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
      border-radius: var(--apt-radius-r2);
      text-decoration: none;
      color: var(--apt-text-muted);
      font-size: var(--apt-font-size-body-sm);
      font-weight: var(--apt-font-weight-medium);
      display: flex;
      align-items: center;
      gap: var(--apt-spacing-s3);
      border: 1px solid transparent;
    }
    .nav-item:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); border-color: var(--apt-border-faint, var(--apt-border)); }
    .nav-item.active {
      background: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 12%, transparent);
      color: var(--apt-text-strong);
      border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary));
      border-color: transparent;
    }
    .shell-main { flex: 1; overflow-y: auto; padding: var(--apt-spacing-s10); background: var(--apt-surface-default); min-width: 0; }
    @media (max-width: 760px) {
      .module-rail { display: none; }
      .shell-main { padding: var(--apt-spacing-s8); }
    }
    `,
  ],
})
export class ShellLayoutComponent {
  readonly selection = inject(SelectionService);

  readonly modules = MODULES;
  readonly context = 'Workspace';
  readonly activeRecord = '';
  readonly sidebarTitle = 'Context';
  readonly sidebarCollapsed = false;
  readonly sidebarItems = [
    { id: 'overview', label: 'Overview', path: ['/workspace', ''], active: true },
    { id: 'commons', label: 'Commons', path: ['/workspace', 'commons'] },
    { id: 'network', label: 'Network', path: ['/workspace', 'network'] },
    { id: 'workbench', label: 'Workbench', path: ['/workspace', 'workbench'] },
    { id: 'records', label: 'Records', path: ['/workspace', 'records'] },
    { id: 'intelligence', label: 'Intelligence', path: ['/workspace', 'intelligence'] },
  ];
  readonly inspectorOpen = computed(() => this.selection.hasSelection());
  readonly inspectorEntity = computed<InspectorEntity | null>(() => {
    const s = this.selection.selected();
    if (!s) return null;
    return {
      id: s.id,
      name: s.name,
      family: s.family,
      type: s.type,
      standing: s.standing,
      maturity: s.maturity,
      relationships: s.relationships,
      cycleStage: s.cycleStage,
      authorityGated: s.authorityGated,
    };
  });
  readonly dockModule = 'Workbench';
  readonly dockItems = [
    { id: 'd-1', label: 'Need: Kibera workshop bench', status: 'ready' as const, action: 'Open' },
    { id: 'd-2', label: 'Evidence: Build plan', status: 'staged' as const, action: 'View' },
  ];
  readonly ledger = {
    module: 'Workspace',
    environment: 'local-demo' as const,
    open: 2,
    committed: 1,
    delivered: 3,
    evidence: 9,
  };

  isActive(path: string): boolean {
    return path === '';
  }
}
