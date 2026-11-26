import { Component } from '@angular/core';

@Component({
  selector: 'app-capabilities',
  standalone: true,
  template: `
    <section class="capabilities-page">
      <header class="capabilities-head">
        <h2>Capabilities</h2>
        <p>Capability profiles are not yet connected to shared network records.</p>
        <p class="capabilities-note" role="status">No capability claims are shown here. When connected, claims will remain distinct from independent verification.</p>
      </header>
    </section>
  `,
  styles: [
    `
    .capabilities-page { min-height: 100%; color: var(--apt-text-body); }
    .capabilities-head { margin: 0 0 var(--apt-space-8); }
    h2 { margin: 0 0 var(--apt-space-3); color: var(--apt-text-strong); font: var(--apt-weight-semibold) 28px/1.15 var(--apt-font-serif); }
    .capabilities-head p { max-width: 72ch; }
    .capabilities-note { color: var(--apt-text-muted); font-size: var(--apt-size-sm); }
    `,
  ],
})
export class CapabilitiesComponent {}
