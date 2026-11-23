/**
 * @apt-labs/features/workspace — StatusbarComponent
 *
 * Shell region: separate persistent boundary element. Single boundary line
 * + ledger head state: module label + environment label (Local demo /
 * Configured) + key tallies from the shared spine.
 *
 * Impeccable craft-floor: themed browser surfaces, full state coverage.
 */
import { Component, input } from '@angular/core';

export interface LedgerHead {
  module: string;
  environment: 'local-demo' | 'configured';
  open: number;
  committed: number;
  delivered: number;
  evidence: number;
}

@Component({
  selector: 'app-statusbar',
  standalone: true,
  imports: [],
  template: `
    <footer class="statusbar" aria-label="Ledger head state">
      <div class="statusbar-line"></div>
      <div class="statusbar-content">
        <span class="statusbar-module">{{ ledger().module }}</span>
        <span class="statusbar-divider">·</span>
        <span class="statusbar-env" [class]="'env-' + ledger().environment">
          {{ ledger().environment === 'local-demo' ? 'Local demo' : 'Configured' }}
        </span>
        <span class="statusbar-divider">·</span>
        <span class="statusbar-tally">
          <span class="tally-item"><span class="tally-num">{{ ledger().open }}</span><span class="tally-label">open</span></span>
          <span class="tally-item"><span class="tally-num">{{ ledger().committed }}</span><span class="tally-label">committed</span></span>
          <span class="tally-item"><span class="tally-num">{{ ledger().delivered }}</span><span class="tally-label">delivered</span></span>
          <span class="tally-item"><span class="tally-num">{{ ledger().evidence }}</span><span class="tally-label">evidence</span></span>
        </span>
      </div>
    </footer>
  `,
  styles: [
    `
    .statusbar {
      height: var(--apt-shell-statusbar);
      border-top: 1px solid var(--apt-border);
      background: var(--apt-surface-page);
      flex-shrink: 0;
      z-index: var(--apt-z-index-dropdown);
    }
    .statusbar-line { height: 1px; background: var(--apt-border-faint); flex-shrink: 0; }
    .statusbar-content {
      display: flex;
      align-items: center;
      gap: var(--apt-spacing-s3);
      padding: 0 var(--apt-spacing-s8);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-font-size-sm-3);
      color: var(--apt-text-muted);
      height: var(--apt-shell-statusbar);
    }
    .statusbar-divider { color: var(--apt-text-dim); }
    .statusbar-module { color: var(--apt-text-body); font-weight: var(--apt-font-weight-medium); }
    .statusbar-env.env-local-demo { color: var(--apt-color-warning-base, #92400e); }
    .statusbar-env.env-configured { color: var(--apt-color-success-base, #166534); }
    .statusbar-tally { display: flex; gap: var(--apt-spacing-s5); margin-left: auto; }
    .tally-item { display: flex; align-items: center; gap: var(--apt-spacing-s1); }
    .tally-num { color: var(--apt-text-strong); font-weight: var(--apt-font-weight-semibold); }
    .tally-label { text-transform: uppercase; letter-spacing: 0.04em; font-size: var(--apt-font-size-micro); }
    @media (max-width: 760px) {
      .statusbar-content { padding: 0 var(--apt-spacing-s6); font-size: var(--apt-font-size-micro); }
      .statusbar-tally { gap: var(--apt-spacing-s3); }
      .tally-label { display: none; }
    }
    `,
  ],
})
export class StatusbarComponent {
  readonly ledger = input<LedgerHead>({
    module: 'Workspace',
    environment: 'local-demo',
    open: 0,
    committed: 0,
    delivered: 0,
    evidence: 0,
  });
}
