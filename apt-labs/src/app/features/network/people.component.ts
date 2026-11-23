import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

const PEOPLE_ROWS = [
  {
    id: 'p-001', name: 'Wanjiku Mwangi', type: 'person' as const,
    description: 'Structural engineer, 12 years in Kenyan public works.',
    capabilities: ['Structural design', 'Load calculations'],
    assets: ['Licensed PE (Kenya)'],
    createdAt: '2025-11-04',
  },
  {
    id: 'p-002', name: 'Kisumu Solar Crew', type: 'crew' as const,
    description: 'Four-person crew with PV install capability.',
    capabilities: ['PV installation', 'Inverter commissioning'],
    assets: ['Mobile workshop', 'Certified team'],
    createdAt: '2025-12-10',
  },
  {
    id: 'p-003', name: 'James Otieno', type: 'person' as const,
    description: 'Civil engineer, water infrastructure.',
    capabilities: ['Hydraulic systems', 'Borehole design'],
    assets: ['Licensed PE (Kenya)'],
    createdAt: '2025-10-22',
  },
  {
    id: 'p-004', name: 'Mombasa Makers Guild', type: 'crew' as const,
    description: 'Woodworking and metal finishing team.',
    capabilities: ['Wood joinery', 'Metal finishing'],
    assets: ['CNC router', 'Sanding line'],
    createdAt: '2026-01-15',
  },
  {
    id: 'p-005', name: 'Amina Hassan', type: 'person' as const,
    description: 'Architect, public building specialist.',
    capabilities: ['Building design', 'LEED consulting'],
    assets: ['Architect license', 'BIM proficiency'],
    createdAt: '2025-09-30',
  },
] as const;

@Component({
  selector: 'app-people',
  imports: [RouterLink],
  template: `
    <div class="plp" data-module="people">
      <div class="plp-body">
        <main class="plp-main">
          <div class="plp-pagehead">
            <p class="plp-eyebrow">NETWORK · PEOPLE &amp; CREWS</p>
            <h1 class="plp-h1">People and crews</h1>
            <p class="plp-sub">Individuals and teams who claim capability. Search by name, description, or capability.</p>
          </div>

          <div class="plp-search">
            <svg class="plp-search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 1-4.8 13.3L3 19.1 4.4 20.5l2.8-2.8A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
            </svg>
            <input
              type="search"
              class="plp-search-input"
              placeholder="Search people, crews, capabilities…"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
            <span class="plp-count">{{ visible().length }} shown</span>
          </div>

          <div class="plp-grid">
            @for (row of visible(); track row.id) {
              <article class="plp-card" [style]="'--card-accent:' + (row.type === 'crew' ? 'var(--apt-group-continuity)' : 'var(--apt-color-brand-primary)')">
                <div class="plp-card-head">
                  <span class="plp-glyph">{{ initial(row.name) }}</span>
                  <div class="plp-id">
                    <h3 class="plp-name">{{ row.name }}</h3>
                    <span class="plp-type">{{ row.type }}</span>
                  </div>
                </div>
                <p class="plp-desc">{{ row.description }}</p>
                <div class="plp-caps">
                  @for (cap of row.capabilities; track cap) {
                    <span class="plp-chip">{{ cap }}</span>
                  }
                </div>
                <div class="plp-assets">
                  @for (asset of row.assets; track asset) {
                    <span class="plp-asset">{{ asset }}</span>
                  }
                </div>
              </article>
            }
            @if (visible().length === 0) {
              <p class="plp-empty">No people or crews match “{{ query() }}”.</p>
            }
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
.plp { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }
.plp-body { display: flex; flex: 1; min-height: 0; }
.plp-main { flex: 1; min-width: 0; padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22); max-width: 1180px; }
.plp-pagehead { margin-bottom: var(--apt-spacing-s6); }
.plp-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0 0 var(--apt-spacing-s2); }
.plp-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); letter-spacing: -0.022em; line-height: 1.05; color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); }
.plp-sub { font-size: var(--apt-font-size-body-md); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; max-width: 64ch; }
.plp-search { display: flex; align-items: center; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); }
.plp-search-icon { width: 16px; height: 16px; color: var(--apt-text-dim); flex: none; }
.plp-search-input { flex: 1; min-width: 0; padding: var(--apt-spacing-s3) var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); background: var(--apt-surface-page); font-size: var(--apt-font-size-body-md); color: var(--apt-text-body); outline: none; }
.plp-search-input:focus { border-color: var(--apt-color-brand-primary); }
.plp-count { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); white-space: nowrap; }
.plp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--apt-spacing-s5); }
.plp-card { border: 1px solid var(--apt-border); border-left: 3px solid var(--card-accent, var(--apt-color-brand-primary)); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s5) var(--apt-spacing-s6); display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
.plp-card-head { display: flex; align-items: center; gap: var(--apt-spacing-s4); }
.plp-glyph { width: 36px; height: 36px; border-radius: 50%; background: color-mix(in srgb, var(--card-accent, var(--apt-color-brand-primary)) 15%, transparent); color: var(--card-accent, var(--apt-color-brand-primary)); font-family: var(--apt-font-serif); font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-semibold); display: grid; place-items: center; flex: none; }
.plp-id { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.plp-name { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plp-type { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: lowercase; letter-spacing: 0.06em; color: var(--apt-text-muted); }
.plp-desc { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; }
.plp-caps { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s2); }
.plp-chip { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-body); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 1px 6px; white-space: nowrap; }
.plp-assets { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s2); margin-top: var(--apt-spacing-s1); }
.plp-asset { font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); font-family: var(--apt-font-mono); }
.plp-empty { grid-column: 1 / -1; padding: var(--apt-spacing-s8); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-r2); color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); text-align: center; }
@media (max-width: 900px) { .plp-main { padding: var(--apt-spacing-s8); } .plp-grid { grid-template-columns: 1fr; } }
`,
  ],
})
export class PeopleComponent {
  readonly query = signal('');
  readonly rows = PEOPLE_ROWS;

  readonly visible = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return [...this.rows];
    return this.rows.filter((r) =>
      (r.name + ' ' + r.description + ' ' + r.capabilities.join(' ')).toLowerCase().includes(q)
    );
  });

  readonly initial = (name: string) => name[0] ?? '?';
}
