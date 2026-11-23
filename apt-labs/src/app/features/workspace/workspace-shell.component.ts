import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-workspace-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <nav class="module-rail" aria-label="Modules">
        <div class="rail-brand">APT-LABS</div>
        @for (item of navItems; track item.path) {
          <a [routerLink]="['/workspace', item.path]" [routerLinkActive]="['active']" class="nav-item">
            {{ item.label }}
          </a>
        }
      </nav>
      <main class="shell-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; height: 100dvh; background: var(--apt-surface-default); }
    .module-rail {
      width: 232px; border-right: 1px solid var(--apt-border);
      padding: var(--apt-spacing-s8) var(--apt-spacing-s4); display: flex; flex-direction: column; gap: var(--apt-spacing-s2);
      background: var(--apt-surface-page);
    }
    .rail-brand {
      font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-1); font-weight: var(--apt-font-weight-semibold);
      color: var(--apt-text-strong); letter-spacing: -0.02em; margin-bottom: var(--apt-spacing-s8);
      padding-bottom: var(--apt-spacing-s4); border-bottom: 1px solid var(--apt-border-faint);
    }
    .nav-item {
      padding: var(--apt-spacing-s4) var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); text-decoration: none;
      color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium);
      display: flex; align-items: center; gap: var(--apt-spacing-s3); border: 1px solid transparent;
    }
    .nav-item:hover { background: var(--apt-surface-raised); color: var(--apt-text-body); border-color: var(--apt-border-faint); }
    .nav-item.active { background: color-mix(in srgb, var(--apt-module-accent) 12%, transparent); color: var(--apt-text-strong); border-left: 3px solid var(--apt-module-accent); border-color: transparent; }
    .shell-main { flex: 1; overflow-y: auto; padding: var(--apt-spacing-s10); background: var(--apt-surface-default); }
  `],
})
export class WorkspaceShellComponent {
  readonly navItems = [
    { path: '', label: 'Overview' },
    { path: 'commons', label: 'Commons' },
    { path: 'network', label: 'Network' },
    { path: 'workbench', label: 'Workbench' },
    { path: 'value', label: 'Value' },
    { path: 'records', label: 'Records' },
    { path: 'intelligence', label: 'Intelligence' },
    { path: 'ontology', label: 'Ontology' },
    { path: 'sovereignty', label: 'Sovereignty' },
  ];
}
