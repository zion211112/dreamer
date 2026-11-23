import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

type NetworkGroup = 'all' | 'people' | 'crews' | 'institutions' | 'organizations';

const GROUP_LABELS: Record<NetworkGroup, string> = {
  all: 'All',
  people: 'People',
  crews: 'Crews',
  institutions: 'Institutions',
  organizations: 'Organizations',
};

const DIRECTORY = [
  {
    id: 'row-001',
    actor: { name: 'Wanjiku Mwangi', description: 'Structural engineer, 12 years in Kenyan public works.', createdAt: '2025-11-04', type: 'person' as const },
    type: 'person' as const,
    capabilities: ['Structural design', 'Load calculations'],
    assets: ['Licensed PE (Kenya)'],
  },
  {
    id: 'row-002',
    actor: { name: 'Kisumu Solar Crew', description: 'Four-person crew with PV install capability.', createdAt: '2025-12-10', type: 'crew' as const },
    type: 'crew' as const,
    capabilities: ['PV installation', 'Inverter commissioning'],
    assets: ['Mobile workshop', 'Certified team'],
  },
  {
    id: 'row-003',
    actor: { name: 'Nairobi North Primary School', description: 'Public primary school, 620 pupils.', createdAt: '2026-01-08', type: 'institution' as const },
    type: 'institution' as const,
    capabilities: ['Facility commissioning', 'Curriculum oversight'],
    assets: ['Campus land', 'School board'],
  },
  {
    id: 'row-004',
    actor: { name: 'Nakuru Fab Collective', description: 'Fabrication workshop serving East Africa regional markets.', createdAt: '2026-02-15', type: 'organization' as const },
    type: 'organization' as const,
    capabilities: ['CNC machining', 'Sheet metal'],
    assets: ['CNC rig', 'Press-brake'],
  },
  {
    id: 'row-005',
    actor: { name: 'James Otieno', description: 'Civil engineer, water infrastructure.', createdAt: '2025-10-22', type: 'person' as const },
    type: 'person' as const,
    capabilities: ['Hydraulic systems', 'Borehole design'],
    assets: ['Licensed PE (Kenya)'],
  },
] as const;

function groupOf(type: string): NetworkGroup {
  if (type === 'person') return 'people';
  if (type === 'crew') return 'crews';
  if (type === 'institution') return 'institutions';
  return 'organizations';
}

@Component({
  selector: 'app-network',
  imports: [RouterLink],
  template: `
    <div class="net" data-module="network">
      <div class="net-body">
        <main class="net-main">
          <div class="net-pagehead">
            <p class="net-eyebrow">WORKSPACE · DIRECTORY</p>
            <h1 class="net-h1">Who is in the network</h1>
            <p class="net-sub">
              Every entity that acts, claims capability, or holds a resource. Filter by type or browse the full directory.
            </p>
          </div>

          <div class="net-pills">
            @for (g of groups(); track g.id) {
              <button
                class="net-pill"
                [class.net-pill--active]="filter() === g.id"
                (click)="filter.set(g.id)"
              >
                <span class="net-pill-label">{{ GROUP_LABELS[g.id] }}</span>
                <span class="net-pill-count">{{ counts()[g.id] }}</span>
              </button>
            }
          </div>

          <div class="net-grid">
            @for (row of visible(); track row.id) {
              <article class="net-card">
                <div class="net-card-head">
                  <span class="net-card-glyph" [style]="'--card-accent:' + cardAccent(row.type)">{{ initial(row.actor.name) }}</span>
                  <div class="net-card-id">
                    <h3 class="net-card-name">{{ row.actor.name }}</h3>
                    <span class="net-card-type">{{ typeLabel(row.type) }}</span>
                  </div>
                </div>
                <p class="net-card-desc">{{ row.actor.description }}</p>
                <div class="net-card-meta">
                  <span class="net-card-meta-item">Registered {{ row.actor.createdAt }}</span>
                </div>
                <div class="net-card-caps">
                  @for (cap of row.capabilities; track cap) {
                    <span class="net-chip">{{ cap }}</span>
                  }
                </div>
                <a [routerLink]="['/workspace', 'network', 'institutions']" class="net-card-link">View in institutions →</a>
              </article>
            }
            @if (visible().length === 0) {
              <p class="net-empty">No entities match this filter yet.</p>
            }
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
.net { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }
.net-body { display: flex; flex: 1; min-height: 0; }
.net-main { flex: 1; min-width: 0; padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22); max-width: 1180px; }
.net-pagehead { margin-bottom: var(--apt-spacing-s8); }
.net-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0 0 var(--apt-spacing-s2); }
.net-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); letter-spacing: -0.022em; line-height: 1.05; color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); }
.net-sub { font-size: var(--apt-font-size-body-md); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; max-width: 64ch; }
.net-pills { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s8); }
.net-pill { display: flex; align-items: center; gap: var(--apt-spacing-s2); padding: var(--apt-spacing-s2) var(--apt-spacing-s4); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: transparent; color: var(--apt-text-muted); font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; }
.net-pill:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-text-body); }
.net-pill--active { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.net-pill--active .net-pill-count { color: var(--apt-action-on-primary); }
.net-pill-count { font-size: var(--apt-font-size-micro); opacity: 0.75; }
.net-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--apt-spacing-s5); }
.net-card { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s5) var(--apt-spacing-s6); display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
.net-card:hover { border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 40%, var(--apt-border)); box-shadow: var(--apt-shadow-sh1); }
.net-card-head { display: flex; align-items: center; gap: var(--apt-spacing-s4); }
.net-card-glyph { width: 36px; height: 36px; border-radius: 50%; background: color-mix(in srgb, var(--card-accent) 15%, transparent); color: var(--card-accent); font-family: var(--apt-font-serif); font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-semibold); display: grid; place-items: center; flex: none; }
.net-card-id { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.net-card-name { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.net-card-type { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: lowercase; letter-spacing: 0.06em; color: var(--apt-text-muted); }
.net-card-desc { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; flex: 1; }
.net-card-meta { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s3); }
.net-card-meta-item { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); }
.net-card-caps { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s2); }
.net-chip { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-body); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 1px 6px; white-space: nowrap; }
.net-card-link { font-size: var(--apt-font-size-body-sm); color: var(--apt-module-accent, var(--apt-color-brand-primary)); text-decoration: none; margin-top: var(--apt-spacing-s1); }
.net-card-link:hover { text-decoration: underline; }
.net-empty { grid-column: 1 / -1; padding: var(--apt-spacing-s8); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-r2); color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); text-align: center; }
@media (max-width: 900px) {
  .net-main { padding: var(--apt-spacing-s8); }
  .net-grid { grid-template-columns: 1fr; }
}
`,
  ],
})
export class NetworkComponent {
  protected readonly GROUP_LABELS = GROUP_LABELS;
  readonly filter = signal<NetworkGroup>('all');
  readonly directory = DIRECTORY;

  readonly groups = computed(() => (Object.keys(GROUP_LABELS) as NetworkGroup[]).map((g) => ({ id: g, label: GROUP_LABELS[g] })));

  readonly counts = computed(() => {
    const c: Record<NetworkGroup, number> = { all: this.directory.length, people: 0, crews: 0, institutions: 0, organizations: 0 };
    for (const row of this.directory) { c[groupOf(row.type)]++; }
    return c;
  });

  readonly visible = computed(() => {
    const f = this.filter();
    if (f === 'all') return [...this.directory];
    return this.directory.filter((row) => groupOf(row.type) === f);
  });

  readonly initial = (name: string) => name[0] ?? '?';

  readonly typeLabel = (type: string) => {
    const m: Record<string, string> = { person: 'person', crew: 'crew', institution: 'institution', organization: 'organization' };
    return m[type] ?? type;
  };

  readonly cardAccent = (type: string) => {
    const m: Record<string, string> = {
      person: 'var(--apt-color-brand-primary)',
      crew: 'var(--apt-group-continuity)',
      institution: 'var(--apt-group-value)',
      organization: 'var(--apt-group-core)',
    };
    return m[type] ?? 'var(--apt-text-muted)';
  };
}
