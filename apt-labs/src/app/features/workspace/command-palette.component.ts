/**
 * @apt-labs/features/workspace — CommandPaletteComponent
 *
 * Keyboard-accessible command palette (Cmd-K). Opens on `Mod+K` and lets the
 * user jump to a module, create a need, or open an entity by id.
 *
 * Lightweight custom implementation on signals — avoids the unverified
 * @ngxpert/cmdk package on Angular 22. No new dependencies.
 */
import { Component, inject, output, signal, effect, HostListener } from '@angular/core';
import { Router } from '@angular/router';

export interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  action: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [],
  template: `
    @if (open()) {
      <button class="cp-backdrop" (click)="close()" aria-label="Close command palette" tabindex="-1"></button>
      <div class="cp-panel" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="cp-head">
          <span class="cp-kbd">⌘&nbsp;K</span>
          <span class="cp-title">Command palette</span>
        </div>
        <input
          class="cp-input"
          [value]="query()"
          (input)="onInput($event)"
          (keydown.Escape)="close()"
          (keydown.ArrowDown)="move(1)"
          (keydown.ArrowUp)="move(-1)"
          (keydown.Enter)="select()"
          placeholder="Jump to module, create need, or open entity…"
          autofocus
        />
        <div class="cp-list">
          @for (item of filtered(); track item.id; let i = $index) {
            <button
              class="cp-item"
              [class.cp-item--active]="i === highlighted()"
              (click)="selectItem(item)"
              type="button"
            >
              <span class="cp-item-label">{{ item.label }}</span>
              @if (item.hint) {
                <span class="cp-item-hint">{{ item.hint }}</span>
              }
            </button>
          }
          @if (filtered().length === 0 && query().trim()) {
            <div class="cp-empty">No matches.</div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
    .cp-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; }
    .cp-panel { position: fixed; top: 120px; left: 50%; transform: translateX(-50%); width: 520px; max-width: 90vw; max-height: 70vh; background: var(--apt-surface-page); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-lg); box-shadow: var(--apt-shadow-1); z-index: 1001; display: flex; flex-direction: column; overflow: hidden; }
    .cp-head { display: flex; align-items: center; gap: var(--apt-space-3); padding: var(--apt-space-5) var(--apt-space-6); border-bottom: 1px solid var(--apt-border-faint); background: var(--apt-surface-raised); }
    .cp-kbd { font-family: var(--apt-font-mono); font-size: var(--apt-size-sm); background: var(--apt-surface-page); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-sm); padding: 2px 6px; color: var(--apt-text-body); }
    .cp-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); }
    .cp-input { width: 100%; padding: var(--apt-space-4) var(--apt-space-6); border: 0; background: transparent; color: var(--apt-text-body); font-size: var(--apt-size-body); font-family: inherit; }
    .cp-input:focus-visible { outline: 2px solid var(--apt-accent); outline-offset: 2px; border-radius: var(--apt-radius-sm); }
    .cp-list { flex: 1; overflow-y: auto; padding: var(--apt-space-4); }
    .cp-item { display: flex; align-items: center; justify-content: space-between; gap: var(--apt-space-4); padding: var(--apt-space-3) var(--apt-space-5); border-radius: var(--apt-radius-sm); cursor: pointer; }
    .cp-item:hover { background: var(--apt-surface-raised); }
    .cp-item--active { background: color-mix(in srgb, var(--apt-module-accent, var(--apt-accent)) 15%, transparent); border-left: 3px solid var(--apt-module-accent, var(--apt-accent)); }
    .cp-item-label { font-size: var(--apt-size-sm); color: var(--apt-text-body); }
    .cp-item-hint { font-family: var(--apt-font-mono); font-size: var(--apt-size-sm); color: var(--apt-text-dim); }
    .cp-empty { font-family: var(--apt-font-mono); font-size: var(--apt-size-sm); color: var(--apt-text-muted); padding: var(--apt-space-4); text-align: center; }
    @media (max-width: 760px) { .cp-panel { top: 80px; width: 92vw; left: 50%; } }
    `,
  ],
})
export class CommandPaletteComponent {
  private readonly router = inject(Router);

  readonly open = signal(false);
  readonly query = signal('');
  readonly highlighted = signal(0);

  readonly execute = output<{ action: string; payload?: any }>();

  private readonly items: PaletteItem[] = [
    { id: 'module-workbench', label: 'Open Workbench', hint: '/workspace/workbench', action: () => this.router.navigate(['/workspace', 'workbench']) },
    { id: 'module-commons', label: 'Open Commons', hint: '/workspace/commons', action: () => this.router.navigate(['/workspace', 'commons']) },
    { id: 'module-network', label: 'Open Network', hint: '/workspace/network', action: () => this.router.navigate(['/workspace', 'network']) },
    { id: 'module-records', label: 'Open Records', hint: '/workspace/records', action: () => this.router.navigate(['/workspace', 'records']) },
    { id: 'module-value', label: 'Open Value', hint: '/workspace/value', action: () => this.router.navigate(['/workspace', 'value']) },
    { id: 'module-intelligence', label: 'Open Intelligence', hint: '/workspace/intelligence', action: () => this.router.navigate(['/workspace', 'intelligence']) },
    { id: 'create-need', label: 'Create a new need', hint: 'Workbench → post need', action: () => this.execute.emit({ action: 'create-need' }) },
    { id: 'open-entity', label: 'Open entity by id', hint: 'Enter an entity id', action: () => this.execute.emit({ action: 'open-entity' }) },
  ];

  constructor() {
    effect(() => {
      if (this.open()) {
        document.body.style.overflow = 'hidden';
        this.highlighted.set(0);
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  onCmdK(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
    }
  }

  toggle(): void {
    this.open.set(!this.open());
    if (this.open()) this.query.set('');
  }

  close(): void {
    this.open.set(false);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
    this.highlighted.set(0);
  }

  move(delta: number): void {
    const list = this.filtered();
    if (list.length === 0) return;
    this.highlighted.set((this.highlighted() + delta + list.length) % list.length);
  }

  select(): void {
    const item = this.filtered()[this.highlighted()];
    if (item) this.selectItem(item);
  }

  selectItem(item: PaletteItem): void {
    item.action();
    this.close();
  }

  filtered(): PaletteItem[] {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.items;
    return this.items.filter((i) => i.label.toLowerCase().includes(q) || (i.hint ?? '').toLowerCase().includes(q));
  }
}
