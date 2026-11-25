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
import { Component, DestroyRef, inject, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { TopbarComponent } from './topbar.component';
import { SidebarComponent } from './sidebar.component';
import { InspectorComponent } from './inspector.component';
import { DockComponent } from './dock.component';
import { StatusbarComponent } from './statusbar.component';
import { SelectionService } from '@apt-labs/shared/state';
import { CommandPaletteComponent } from './command-palette.component';

const MODULES = [
  { path: '', label: 'Home', icon: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z' },
  { path: 'commons', label: 'Commons', icon: 'M7 4h7l4 4v12H7zM14 4v4h4M10 12h5M10 16h4' },
  { path: 'network', label: 'Network', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 008 0z' },
  { path: 'workbench', label: 'Workbench', icon: 'M3 10h18M3 10v10a4 4 0 004 4h10a4 4 0 004-4V10M3 15l6-6m6 6l6-6' },
  { path: 'records', label: 'Records', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: 'intelligence', label: 'Intelligence', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink,
    TopbarComponent, SidebarComponent, InspectorComponent,
    DockComponent, StatusbarComponent, CommandPaletteComponent,
  ],
  template: `
    <app-command-palette (execute)="onPaletteExecute($event)"></app-command-palette>

    <div class="shell-layout">
      <a class="skip-link" href="#shell-main">Skip to main content</a>

      <app-topbar [context]="context" [activeRecord]="activeRecord"></app-topbar>

      <div class="shell-body">
        <nav class="module-rail" aria-label="Modules">
          @for (item of modules; track item.path) {
            <a [routerLink]="['/workspace', item.path]" class="nav-item" [class.active]="isActive(item.path)" [attr.aria-current]="isActive(item.path) ? 'page' : null" [attr.aria-label]="item.label">
              <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="item.icon" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <app-sidebar [title]="sidebarTitle()" [items]="sidebarItems()"></app-sidebar>

        <main class="shell-main" id="shell-main">
          <router-outlet />
        </main>

        <app-inspector [open]="inspectorOpen()" [entity]="inspectorEntity()"></app-inspector>
      </div>

      <app-dock class="shell-dock" [module]="dockModule" [items]="dockItems"></app-dock>

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
      min-width: 0;
      overflow: hidden;
      background: var(--apt-surface-default);
      --apt-text-muted: #5f5849;
      --apt-text-dim: #6b655a;
      --apt-text-info: #0b6376;
      --apt-state-caution: #755222;
    }
    .skip-link {
      position: absolute;
      left: -9999px;
      top: var(--apt-space-4);
      z-index: var(--apt-z-toast);
      padding: var(--apt-space-3) var(--apt-space-4);
      background: var(--apt-surface-page);
      color: var(--apt-text-strong);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-sm);
      font-size: var(--apt-size-sm);
      text-decoration: none;
    }
    .skip-link:focus-visible {
      left: var(--apt-space-4);
      outline: 2px solid var(--apt-accent);
      outline-offset: 2px;
    }
    .shell-body {
      flex: 1 1 0;
      display: flex;
      overflow: hidden;
      min-height: 0;
    }
    .shell-dock {
      display: block;
      width: 100%;
      height: var(--apt-shell-dock);
      min-width: 0;
      box-sizing: border-box;
      flex: 0 0 var(--apt-shell-dock);
    }

    /* Module rail — slim icon-only, expands on hover */
    .module-rail {
      width: var(--apt-shell-rail);
      box-sizing: border-box;
      overflow: hidden;
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
      padding: var(--apt-space-8) var(--apt-space-10);
      background: var(--apt-surface-default);
      min-width: 0;
      min-height: 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .module-rail { width: var(--apt-shell-rail); }
      .shell-main { padding: var(--apt-space-8); }
    }
    @media (max-width: 760px) {
      .shell-body { flex-direction: column; }
      .module-rail {
        width: 100%;
        box-sizing: border-box;
        flex: 0 0 auto;
        flex-direction: row;
        overflow-x: auto;
        overflow-y: hidden;
        padding: var(--apt-space-2) var(--apt-space-3);
        border-right: 0;
        border-bottom: 1px solid var(--apt-border);
      }
      .module-rail:hover { width: 100%; }
      .nav-item {
        flex: 0 0 auto;
        gap: var(--apt-space-1);
        min-height: 44px;
        padding: var(--apt-space-2) var(--apt-space-1);
      }
      .nav-label { opacity: 1; }
      .shell-main { padding: var(--apt-space-6); }
      .shell-dock { display: none; }
    }
    @media (max-width: 390px) {
      .module-rail { padding-inline: var(--apt-space-2); }
      .shell-main { padding: var(--apt-space-4); }
    }
    `,
  ],
})
export class ShellLayoutComponent {
  readonly selection = inject(SelectionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentUrl = signal(this.router.url);

  readonly modules = MODULES;
  readonly context = 'Workspace';
  readonly activeRecord = '';
  readonly sidebarTitle = computed(() => {
    if (this.currentUrl().startsWith('/workspace/network')) return 'Network';
    if (this.currentUrl().startsWith('/workspace/records')) return 'Records';
    if (this.currentUrl() === '/workspace') return 'References';
    return 'Context';
  });
  readonly sidebarItems = computed(() => {
    if (this.currentUrl().startsWith('/workspace/network')) {
      return [
        { id: 'people', label: 'People', path: ['/workspace', 'network', 'people'] },
        { id: 'institutions', label: 'Institutions', path: ['/workspace', 'network', 'institutions'] },
        { id: 'capabilities', label: 'Capabilities', path: ['/workspace', 'network', 'capabilities'] },
      ];
    }

    if (this.currentUrl() === '/workspace') {
      return [
        { id: 'value', label: 'Value', path: ['/workspace', 'value'] },
        { id: 'ontology', label: 'Ontology', path: ['/workspace', 'ontology'] },
        { id: 'sovereignty', label: 'Sovereignty', path: ['/workspace', 'sovereignty'] },
      ];
    }

    return [];
  });
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

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }

  isActive(path: string): boolean {
    const url = this.currentUrl().split('?')[0].replace(/\/+$/, '') || '/';
    const target = path ? `/workspace/${path}` : '/workspace';
    return path ? url === target || url.startsWith(`${target}/`) : url === target;
  }

  onPaletteExecute(exec: { action: string; payload?: any }): void {
    if (exec.action === 'create-need') {
      // Navigate handled by parent via CommandPalette output
    }
  }
}
