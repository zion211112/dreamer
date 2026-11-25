import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="not-found">
      <p class="not-found-code">404</p>
      <h1>Page not found</h1>
      <p>This address does not match a page in APT-LABS.</p>
      <div class="not-found-actions">
        <a routerLink="/landing">Go to home</a>
        <a routerLink="/workspace">Open the workspace</a>
      </div>
    </main>
  `,
  styles: [
    `
    .not-found { display: grid; align-content: center; justify-items: start; gap: var(--apt-space-3); min-height: 100dvh; max-width: 42rem; margin-inline: auto; padding: var(--apt-space-8); color: var(--apt-text-body); }
    .not-found-code { margin: 0; color: var(--apt-accent); font: var(--apt-size-sm) var(--apt-font-mono); letter-spacing: 0.12em; }
    h1 { margin: 0; color: var(--apt-text-strong); font: var(--apt-weight-semibold) var(--apt-size-display)/1.1 var(--apt-font-serif); }
    .not-found-actions { display: flex; flex-wrap: wrap; gap: var(--apt-space-3); margin-top: var(--apt-space-3); }
    .not-found-actions a { padding: var(--apt-space-3) var(--apt-space-4); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); color: var(--apt-text-strong); text-decoration: none; }
    .not-found-actions a:hover { border-color: var(--apt-accent); background: var(--apt-surface-raised); }
    `,
  ],
})
export class NotFoundComponent {}
