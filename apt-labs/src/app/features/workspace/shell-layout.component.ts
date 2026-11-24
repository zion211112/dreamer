/**
 * @apt-labs/features/workspace — ShellLayoutComponent
 *
 * Masterpiece shell: six functional regions + separate statusbar.
 * Each region has one job; no duplicate navigation (charter B3).
 * Structural Emergence — warm ivory base, earthy neutrals, serif headings,
 * mono interface, selective deep-forest / brass / sage accents.
 *
 * Responsive: 1440 / 1024 / 768 / 390.
 */
import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TopbarComponent } from './topbar.component';
import { SidebarComponent } from './sidebar.component';
import { InspectorComponent } from './inspector.component';
import { DockComponent } from './dock.component';
import { StatusbarComponent } from './statusbar.component';
import { SelectionService } from '@apt-labs/shared/state';
import { CommandPaletteComponent } from './command-palette.component';

const MODULES = [
  { path: '', label: 'Overview', icon: 'M4 5h16M4 12h16M4 19h10' },
  { path: 'commons', label: 'Commons', icon: 'M7 4h7l4 4v12H7zM14 4v4h4M10 12h5M10 16h4' },
  { path: 'network', label: 'Network', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 008 0z' },
  { path: 'workbench', label: 'Workbench', icon: 'M3 10h18M3 10v10a4 4 0 004 4h10a4 4 0 004-4V10M3 15l6-6m6 6l6-6' },
  { path: 'value', label: 'Value', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2-3-.895-3-3 1.343-2 3-2' },
  { path: 'records', label: 'Records', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: 'intelligence', label: 'Intelligence', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { path: 'ontology', label: 'Ontology', icon: 'M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 0H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z' },
  { path: 'sovereignty', label: 'Sovereignty', icon: 'M7 21a1 1 0 01-1 1c0 .55-.234 1-.523 1H4a1 1 0 01-1-1V4c0-.55.234-1 .523-1h3a1 1 0 011 1v16zm14-6a1 1 0 01-1 1h-3a1 1 0 011 1v16zm0 0H4a1 1 0 01-1-1V4c0-.55.234-1 .523-1h3a1 1 0 011 1v16zm11-5.5c0 .832-.448 1.5-1 1.5s-1-.668-1-1.5V11c0-.832.448-1.5 1-1.5s1 .668 1 1.5v5.5zM12 14c0 1.105-.448 2-1 2s-1-.895-1-2c0-.553-.09-1.086-.257-1.573A1 1 0 0110.747 11H13c.553 0 1 .447 1 1z' },
];

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    TopbarComponent, SidebarComponent, InspectorComponent,
    DockComponent, StatusbarComponent, CommandPaletteComponent,
  ],
  template: `
    <app-command-palette (execute)="onPaletteExecute($event)"></app-command-palette>

    <div class="shell-layout">
      <app-topbar [context]="context" [activeRecord]="activeRecord"></app-topbar>

      <div class="shell-body">
        <nav class="module-rail" aria-label="Modules">
          <div class="rail-brand">APT-LABS</div>
          @for (item of modules; track item.path) {
            <a [routerLink]="['/workspace', item.path]" [routerLinkActive]="['active']" class="nav-item" [class.active]="isActive(item.path)" [attr.aria-label]="item.label">
              <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="item.icon" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span class="nav-label">{{ item.label }}</span>
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
    /* ===== Shell layout — Structural Emergence ===== */
    .shell-layout {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      background: var(--apt-surface-default);
    }
    .shell-body {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    /* Module rail — slim icon-only, expands on hover */
    .module-rail {
      width: var(--apt-shell-rail);
      border-right: 1px solid var(--apt-border);
      padding: var(--apt-space-8) var(--apt-space-2);
      display: flex;
      flex-direction: column;
      gap: var(--apt-space-1);
      background: var(--apt-surface-page);
      flex-shrink: 0;
      transition: width var(--apt-motion-normal);
    }
    .module-rail:hover { width: var(--apt-shell-rail-expanded); }
    .rail-brand {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-size-title);
      font-weight: var(--apt-weight-semibold);
      color: var(--apt-text-strong);
      letter-spacing: -0.02em;
      margin-bottom: var(--apt-space-8);
      padding-bottom: var(--apt-space-4);
      border-bottom: 1px solid var(--apt-border-faint);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .module-rail:hover .rail-brand { max-width: none; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--apt-space-3);
      padding: var(--apt-space-3) var(--apt-space-2);
      border-radius: var(--apt-radius-md);
      text-decoration: none;
      color: var(--apt-text-muted);
      font-size: var(--apt-size-sm);
      font-weight: var(--apt-weight-medium);
      border: 1px solid transparent;
      white-space: nowrap;
      transition: background var(--apt-motion-fast), color var(--apt-motion-fast), border-color var(--apt-motion-fast);
    }
    .nav-item:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); border-color: var(--apt-border-faint); }
    .nav-item.active {
      background: color-mix(in srgb, var(--apt-module-accent, var(--apt-accent)) 12%, transparent);
      color: var(--apt-text-strong);
      border-left: 3px solid var(--apt-module-accent, var(--apt-accent));
      border-color: transparent;
    }
    .nav-item.active .nav-label { font-weight: var(--apt-weight-semibold); }
    .nav-icon { width: 18px; height: 18px; flex: none; }
    .nav-label {
      opacity: 0;
      transition: opacity var(--apt-motion-fast);
    }
    .module-rail:hover .nav-label { opacity: 1; }

    /* Main work surface */
    .shell-main {
      flex: 1;
      overflow-y: auto;
      padding: var(--apt-space-10);
      background: var(--apt-surface-default);
      min-width: 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .module-rail { width: var(--apt-shell-rail); }
      .shell-main { padding: var(--apt-space-8); }
    }
    @media (max-width: 760px) {
      .module-rail { display: none; }
      .shell-main { padding: var(--apt-space-6); }
    }
    @media (max-width: 390px) {
      .shell-main { padding: var(--apt-space-4); }
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
    { id: 'value', label: 'Value', path: ['/workspace', 'value'] },
    { id: 'intelligence', label: 'Intelligence', path: ['/workspace', 'intelligence'] },
    { id: 'ontology', label: 'Ontology', path: ['/workspace', 'ontology'] },
    { id: 'sovereignty', label: 'Sovereignty', path: ['/workspace', 'sovereignty'] },
  ];
  readonly inspectorOpen = computed(() => this.selection.hasSelection());
  readonly inspectorEntity = computed<import('./inspector.component').InspectorEntity | null>(() => {
    const s = this.selection.selected();
    if (!s) return null;
    return {
      id: s.id, name: s.name, family: s.family, type: s.type,
      standing: s.standing, maturity: s.maturity,
      relationships: s.relationships,
      cycleStage: s.cycleStage, authorityGated: s.authorityGated,
    };
  });
  readonly dockModule = 'Workbench';
  readonly dockItems: import('./dock.component').DockItem[] = [
    { id: 'd-1', label: 'Need: Kibera workshop bench', status: 'ready', action: 'Open' },
    { id: 'd-2', label: 'Evidence: Build plan', status: 'staged', action: 'View' },
  ];
  readonly ledger = {
    module: 'Workspace',
    environment: 'local-demo' as const,
    open: 2, committed: 1, delivered: 3, evidence: 9,
  };

  isActive(path: string): boolean {
    return path === '';
  }

  onPaletteExecute(exec: { action: string; payload?: any }): void {
    if (exec.action === 'create-need') {
      // Navigate handled by parent via CommandPalette output
    }
  }
}
