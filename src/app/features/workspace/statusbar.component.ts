/**
 * @apt-labs/features/workspace — StatusbarComponent
 *
 * Footer for the workspace shell. Shows the current module, states that the
 * view is limited to what the signed-in person may see, and links to Reference.
 * It reports no counts: local simulated tallies were removed.
 */
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-statusbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="statusbar" aria-label="Workspace status">
      <span class="statusbar-module">{{ module() }}</span>
      <span class="statusbar-sep" aria-hidden="true">·</span>
      <span class="statusbar-scope">Your authorized view</span>
      <a class="statusbar-link" routerLink="/workspace/reference">Reference</a>
    </footer>
  `,
  styles: [
    `
    .statusbar {
      display: flex;
      align-items: center;
      gap: var(--apt-space-3);
      min-height: 32px;
      padding: var(--apt-space-1) var(--apt-space-6);
      border-top: 1px solid var(--apt-border);
      background: var(--apt-surface-page);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      color: var(--apt-text-muted);
      flex-shrink: 0;
    }
    .statusbar-module { color: var(--apt-text-strong); }
    .statusbar-sep { color: var(--apt-text-muted); }
    .statusbar-link {
      margin-left: auto;
      color: var(--apt-text-body);
      text-decoration: none;
      padding: var(--apt-space-1) var(--apt-space-2);
      border-radius: var(--apt-radius-sm);
    }
    .statusbar-link:hover { text-decoration: underline; }
    .statusbar-link:focus-visible {
      outline: 2px solid var(--apt-accent);
      outline-offset: 2px;
    }
    @media (max-width: 760px) {
      .statusbar { padding-inline: var(--apt-space-3); }
      .statusbar-scope { display: none; }
    }
    `,
  ],
})
export class StatusbarComponent {
  readonly module = input<string>('Home');
}
