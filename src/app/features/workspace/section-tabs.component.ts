import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SectionTab {
  label: string;
  path: string;
}

/** Sub-navigation for a workspace module: one route per tab, each tab is a real URL. */
@Component({
  selector: 'app-section-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="section-tabs" [attr.aria-label]="label()">
      @for (tab of tabs(); track tab.path) {
        <a
          class="section-tab"
          [routerLink]="tab.path"
          routerLinkActive="section-tab--active"
          [routerLinkActiveOptions]="{ exact: true }"
          ariaCurrentWhenActive="page"
        >{{ tab.label }}</a>
      }
    </nav>
  `,
  styles: [
    `
    .section-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: var(--apt-space-1);
      border-bottom: 1px solid var(--apt-border);
      margin-bottom: var(--apt-space-6);
    }
    .section-tab {
      position: relative;
      padding: var(--apt-space-2) var(--apt-space-4);
      font-size: var(--apt-size-body);
      color: var(--apt-text-muted);
      text-decoration: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    .section-tab:hover { color: var(--apt-text-strong); }
    .section-tab:focus-visible { outline: 2px solid var(--apt-focus-ring, var(--apt-accent)); outline-offset: -2px; border-radius: 4px; }
    .section-tab--active { color: var(--apt-text-strong); border-bottom-color: var(--apt-module-accent, var(--apt-accent)); font-weight: var(--apt-weight-semibold); }
    `,
  ],
})
export class SectionTabsComponent {
  readonly label = input.required<string>();
  readonly tabs = input.required<readonly SectionTab[]>();
}
