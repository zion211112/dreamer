import { Component } from '@angular/core';

@Component({
  selector: 'app-capabilities',
  standalone: true,
  template: `
    <section class="capabilities-page">
      <header class="capabilities-head">
        <p class="capabilities-eyebrow">NETWORK / DIRECTORY</p>
        <h1>Capabilities</h1>
        <p>Capability profiles are not yet connected to shared network records.</p>
        <p class="capabilities-note" role="status">No capability claims are shown here. When connected, claims will remain distinct from independent verification.</p>
      </header>
    </section>
  `,
  styles: [
    `
    .capabilities-page { min-height: 100%; color: var(--apt-text-body); }
    .capabilities-head { margin: 0 0 var(--apt-space-8); }
    .capabilities-eyebrow { margin: 0 0 var(--apt-space-2); color: var(--apt-text-dim); font: var(--apt-size-micro) var(--apt-font-mono); letter-spacing: 0.1em; text-transform: uppercase; }
    h1 { margin: 0 0 var(--apt-space-3); color: var(--apt-text-strong); font: var(--apt-weight-semibold) var(--apt-size-display)/1.1 var(--apt-font-serif); }
    .capabilities-head p { max-width: 72ch; }
    .capabilities-note { color: var(--apt-text-muted); font-size: var(--apt-size-sm); }
    `,
  ],
})
export class CapabilitiesComponent {}
