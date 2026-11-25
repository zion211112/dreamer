import { Component, computed, inject } from '@angular/core';
import { NetworkService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-capabilities',
  standalone: true,
  template: `
    <section class="capabilities-page">
      <header class="capabilities-head">
        <p class="capabilities-eyebrow">NETWORK / DIRECTORY</p>
        <h1>Capabilities</h1>
        <p>Capabilities recorded across people and crews in the operational network.</p>
        <p class="capabilities-note">These are claims in the record, not independent verification.</p>
      </header>

      <ul class="capabilities-list">
        @for (capability of capabilities(); track capability.name) {
          <li class="capability-row">
            <h2>{{ capability.name }}</h2>
            <span>{{ capability.claimantCount }} claimants</span>
          </li>
        } @empty {
          <li class="capabilities-empty">No capability claims are recorded yet.</li>
        }
      </ul>
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
    .capabilities-list { display: grid; gap: var(--apt-space-2); }
    .capability-row { display: flex; align-items: center; justify-content: space-between; gap: var(--apt-space-4); padding: var(--apt-space-4) var(--apt-space-5); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); }
    .capability-row h2 { margin: 0; color: var(--apt-text-strong); font-size: var(--apt-size-body); font-weight: var(--apt-weight-medium); }
    .capability-row span { color: var(--apt-text-muted); font: var(--apt-size-sm) var(--apt-font-mono); white-space: nowrap; }
    .capabilities-empty { padding: var(--apt-space-8); border: 1px dashed var(--apt-border); color: var(--apt-text-muted); text-align: center; }
    @media (max-width: 760px) { .capability-row { align-items: flex-start; flex-direction: column; } }
    `,
  ],
})
export class CapabilitiesComponent {
  private readonly network = inject(NetworkService);

  readonly capabilities = computed(() => {
    const claimants = new Map<string, Set<string>>();
    for (const row of this.network.directory) {
      for (const capability of row.capabilities) {
        const ids = claimants.get(capability) ?? new Set<string>();
        ids.add(row.id);
        claimants.set(capability, ids);
      }
    }

    return [...claimants]
      .map(([name, ids]) => ({ name, claimantCount: ids.size }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}
