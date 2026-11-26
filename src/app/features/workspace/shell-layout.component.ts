/**
 * @apt-labs/features/workspace — ShellLayoutComponent
 *
 * Shell regions: topbar, module navigation, sidebar, work surface and status
 * footer. Five modules (charter B3); Reference is reached from the footer and
 * the command palette. At 760px and below the module rail becomes a disclosure
 * menu so the rail never overflows horizontally.
 */
import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { TopbarComponent } from './topbar.component';
import { SidebarComponent } from './sidebar.component';
import { StatusbarComponent } from './statusbar.component';
import { CommandPaletteComponent } from './command-palette.component';

const MODULES = [
  { path: '', label: 'Home', icon: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z' },
  { path: 'commons', label: 'Commons', icon: 'M7 4h7l4 4v12H7zM14 4v4h4M10 12h5M10 16h4' },
  { path: 'workbench', label: 'Workbench', icon: 'M3 10h18M3 10v10a4 4 0 004 4h10a4 4 0 004-4V10M3 15l6-6m6 6l6-6' },
  { path: 'network', label: 'Network', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 008 0z' },
  { path: 'records', label: 'Records', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

/** Module label for a workspace URL; Reference is not a rail module but has its own label. */
function moduleLabelFor(url: string): string {
  if (url.startsWith('/workspace/reference')) return 'Reference';
  return MODULES.find((item) => item.path && url.startsWith(`/workspace/${item.path}`))?.label ?? 'Home';
}

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TopbarComponent, SidebarComponent, StatusbarComponent, CommandPaletteComponent],
  template: `
    <app-command-palette #palette></app-command-palette>

    <div class="shell-layout" [attr.inert]="palette.open() ? '' : null">
      <a class="skip-link" href="#shell-main">Skip to main content</a>

      <app-topbar [context]="context" [activeRecord]="activeRecord" (paletteRequest)="palette.toggle()"></app-topbar>

      <div class="shell-body">
        <nav class="module-rail" aria-label="Modules" (keydown.escape)="closeMenu(true)">
          <button
            #menuToggle
            type="button"
            class="menu-toggle"
            aria-controls="module-list"
            [attr.aria-expanded]="menuOpen()"
            (click)="toggleMenu()"
          >
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            <span>Menu: {{ currentModule() }}</span>
          </button>
          <div id="module-list" class="module-list" [class.is-open]="menuOpen()">
            @for (item of modules; track item.path) {
              <a
                [routerLink]="['/workspace', item.path]"
                class="nav-item"
                [class.active]="isActive(item.path)"
                [attr.aria-current]="isActive(item.path) ? 'page' : null"
                [attr.aria-label]="item.label"
                (click)="navigateFromMenu()"
              >
                <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="item.icon" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          </div>
        </nav>

        @if (sidebarItems().length > 0) {
          <app-sidebar [title]="sidebarTitle()" [items]="sidebarItems()"></app-sidebar>
        }

        <main #shellMain class="shell-main" id="shell-main" tabindex="-1">
          <router-outlet />
        </main>
      </div>

      <app-statusbar [module]="currentModule()"></app-statusbar>
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

    /* Module rail — slim icon-only on desktop, labels appear on hover */
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
    .menu-toggle { display: none; }
    .module-list {
      display: flex;
      flex-direction: column;
      gap: var(--apt-space-1);
    }
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
    .nav-item:focus-visible,
    .menu-toggle:focus-visible {
      outline: 2px solid var(--apt-accent);
      outline-offset: 2px;
    }
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
    .module-rail:hover .nav-label,
    .module-rail:focus-within .nav-label { opacity: 1; }

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
        position: relative;
        width: 100%;
        flex: 0 0 auto;
        flex-direction: row;
        align-items: center;
        overflow: visible;
        padding: var(--apt-space-2) var(--apt-space-3);
        border-right: 0;
        border-bottom: 1px solid var(--apt-border);
      }
      .module-rail:hover { width: 100%; }
      .menu-toggle {
        display: inline-flex;
        align-items: center;
        gap: var(--apt-space-2);
        min-height: 44px;
        padding: var(--apt-space-2) var(--apt-space-3);
        border: 1px solid var(--apt-border);
        border-radius: var(--apt-radius-md);
        background: var(--apt-surface-raised);
        color: var(--apt-text-strong);
        font: inherit;
        font-size: var(--apt-size-sm);
        font-weight: var(--apt-weight-semibold);
        cursor: pointer;
      }
      .module-list { display: none; }
      .module-list.is-open {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 20;
        max-height: calc(100dvh - 56px);
        overflow-y: auto;
        padding: var(--apt-space-2);
        background: var(--apt-surface-page);
        border-bottom: 1px solid var(--apt-border);
        box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
      }
      .nav-item { min-height: 44px; }
      .nav-label { opacity: 1; font-size: 14px; }
      .shell-main { padding: var(--apt-space-6); }
    }
    @media (max-width: 390px) {
      .module-rail { padding-inline: var(--apt-space-2); }
      .shell-main { padding: var(--apt-space-4); }
    }
    `,
  ],
})
export class ShellLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentUrl = signal(this.router.url);
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly shellMain = viewChild<ElementRef<HTMLElement>>('shellMain');

  readonly menuOpen = signal(false);
  readonly modules = MODULES;
  readonly context = 'Workspace';
  readonly activeRecord = '';
  readonly currentModule = computed(() => moduleLabelFor(this.currentUrl()));
  readonly sidebarTitle = computed(() => {
    if (this.currentUrl().startsWith('/workspace/network')) return 'Network';
    if (this.currentUrl().startsWith('/workspace/records')) return 'Records';
    if (this.currentUrl() === '/workspace') return 'References';
    return 'Context';
  });
  readonly sidebarItems = computed(() => {
    if (this.currentUrl().startsWith('/workspace/workbench/')) {
      return [{ id: 'workbench', label: 'All undertakings', path: ['/workspace', 'workbench'] }];
    }

    if (this.currentUrl().startsWith('/workspace/records/')) {
      return [{ id: 'records', label: 'All record lenses', path: ['/workspace', 'records'] }];
    }

    return [];
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.menuOpen.set(false);
      });
  }

  isActive(path: string): boolean {
    const url = this.currentUrl().split('?')[0].replace(/\/+$/, '') || '/';
    const target = path ? `/workspace/${path}` : '/workspace';
    return path ? url === target || url.startsWith(`${target}/`) : url === target;
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  navigateFromMenu(): void {
    const wasOpen = this.menuOpen();
    this.menuOpen.set(false);
    if (wasOpen) requestAnimationFrame(() => this.shellMain()?.nativeElement.focus());
  }

  /** Closes the narrow-screen module menu; `returnFocus` moves focus back to its toggle. */
  closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (returnFocus) this.menuToggle()?.nativeElement.focus();
  }
}
