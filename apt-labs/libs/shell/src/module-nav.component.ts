/**
 * @apt-labs/shell — ModuleNavComponent
 *
 * 232px context column. Renders the active module's secondary navigation:
 * grouped, collapsible sections with count badges. Items with a `to` route
 * navigate; items without are in-module filters.
 */

import { Component, computed, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavSection {
  heading: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  to?: string;
  count?: number;
}

export interface Module {
  id: string;
  title: string;
  primitive: string;
  ctxNav: NavSection[];
}

@Component({
  selector: 'app-module-nav',
  imports: [RouterLink],
  template: `
    <aside class="module-nav" aria-label="Module navigation">
      <div class="module-nav-head">
        <div class="module-nav-title">{{ module().title }}</div>
        <span class="module-nav-primitive">{{ module().primitive }}</span>
      </div>

      @for (sec of sections(); track sec.heading) {
        <div class="module-nav-sec">
          <button
            class="module-nav-heading"
            type="button"
            aria-expanded="openSections()[sec.heading]"
            (click)="toggleSection(sec.heading)"
          >
            {{ sec.heading }}
          </button>
          @if (openSections()[sec.heading]) {
            <nav class="module-nav-items">
              @for (item of sec.items; track item.label) {
                @if (item.to) {
                  <a
                    class="module-nav-item"
                    [routerLink]="item.to"
                    [routerLinkActive]="['active']"
                  >
                    {{ item.label }}
                    @if (item.count !== undefined) { <span class="count">{{ item.count }}</span> }
                  </a>
                } @else {
                  <button class="module-nav-item" type="button">{{ item.label }}</button>
                }
              }
            </nav>
          }
        </div>
      }
    </aside>
  `,
  styles: [`
    .module-nav { width: 232px; border-right: 1px solid var(--apt-border); background: var(--apt-surface-page); }
    .module-nav-head { padding: var(--apt-spacing-s7) var(--apt-spacing-s4); border-bottom: 1px solid var(--apt-border); }
    .module-nav-title { font-weight: var(--apt-font-weight-semibold); font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); display: block; }
    .module-nav-primitive { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); margin-top: var(--apt-spacing-s2); display: block; }
    .module-nav-sec { padding: var(--apt-spacing-s5) var(--apt-spacing-s4); }
    .module-nav-heading { font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; color: var(--apt-text-muted); padding: 0 0 var(--apt-spacing-s3) 0; cursor: pointer; width: 100%; text-align: left; background: none; border: none; font-family: inherit; }
    .module-nav-heading:hover { color: var(--apt-text-strong); }
    .module-nav-items { margin-left: var(--apt-spacing-s3); }
    .module-nav-item { display: block; padding: var(--apt-spacing-s3) var(--apt-spacing-s4); border-radius: var(--apt-radius-r1); text-decoration: none; color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); }
    .module-nav-item.active, .module-nav-item[routerLinkActive] { background: color-mix(in srgb, var(--apt-module-accent) 12%, transparent); color: var(--apt-text-strong); font-weight: var(--apt-font-weight-medium); border-left: 3px solid var(--apt-module-accent); }
    .count { font-size: var(--apt-font-size-micro); background: var(--apt-surface-raised); padding: var(--apt-spacing-s1) var(--apt-spacing-s3); border-radius: 999px; margin-left: var(--apt-spacing-s2); }
  `],
})
export class ModuleNavComponent {
  readonly module = input.required<Module>();
  readonly openSections = signal<Record<string, boolean>>({});

  readonly sections = computed(() => this.module().ctxNav);

  toggleSection(heading: string): void {
    this.openSections.update((s) => ({ ...s, [heading]: !s[heading] }));
  }
}
