import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

const INSTITUTION_ROWS = [
  {
    id: 'i-001', name: 'Nairobi North Primary School', type: 'institution' as const,
    focus: 'Primary education, 620 pupils',
    can: 'Facility commissioning, Curriculum oversight',
    has: 'Campus land, School board',
    registered: '2026-01-08',
  },
  {
    id: 'i-002', name: 'Kisumu Farmers Cooperative', type: 'organization' as const,
    focus: 'Agricultural inputs and produce aggregation',
    can: 'PV commissioning, Cold storage',
    has: 'Warehouse network, Member base',
    registered: '2025-11-20',
  },
  {
    id: 'i-003', name: 'Mombasa Community Centre', type: 'institution' as const,
    focus: 'Community services and training',
    can: 'Hall operations, Youth programmes',
    has: 'Multifunction hall, Training rooms',
    registered: '2026-02-02',
  },
  {
    id: 'i-004', name: 'Eldoret Boarding School', type: 'institution' as const,
    focus: 'Secondary education, boarding',
    can: 'Kitchen commissioning, Dorm maintenance',
    has: 'Dorm blocks, Kitchen facilities',
    registered: '2025-12-05',
  },
  {
    id: 'i-005', name: 'Nakuru Tech Lab', type: 'organization' as const,
    focus: 'Fabrication and prototyping services',
    can: 'CNC machining, Sheet metal, 3D printing',
    has: 'CNC rig, Press-brake, Laser cutter',
    registered: '2026-02-15',
  },
] as const;

@Component({
  selector: 'app-institutions',
  imports: [RouterLink],
  template: `
    <div class="ins" data-module="institutions">
      <div class="ins-body">
        <main class="ins-main">
          <div class="ins-pagehead">
            <p class="ins-eyebrow">NETWORK · INSTITUTIONS &amp; ORGANIZATIONS</p>
            <h1 class="ins-h1">Institutions and organizations</h1>
            <p class="ins-sub">The entities that commission, govern, and hold resources. Browse by focus, capability, or registration date.</p>
          </div>

          <div class="ins-search">
            <svg class="ins-search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 1-4.8 13.3L3 19.1 4.4 20.5l2.8-2.8A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
            </svg>
            <input
              type="search"
              class="ins-search-input"
              placeholder="Search institutions…"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
            <span class="ins-count">{{ visible().length }} shown</span>
          </div>

          <div class="ins-table-wrap">
            <table class="ins-table">
              <thead>
                <tr>
                  <th class="ins-th">Name</th>
                  <th class="ins-th ins-th-nowrap">Type</th>
                  <th class="ins-th">Focus</th>
                  <th class="ins-th">Can do</th>
                  <th class="ins-th">Has</th>
                  <th class="ins-th ins-th-nowrap">Registered</th>
                </tr>
              </thead>
              <tbody>
                @for (row of visible(); track row.id) {
                  <tr class="ins-tr">
                    <td class="ins-td ins-td-name">{{ row.name }}</td>
                    <td class="ins-td"><span class="ins-type-badge">{{ row.type }}</span></td>
                    <td class="ins-td ins-td-dim">{{ row.focus }}</td>
                    <td class="ins-td ins-td-dim">{{ row.can }}</td>
                    <td class="ins-td ins-td-dim">{{ row.has }}</td>
                    <td class="ins-td ins-td-dim ins-td-nowrap">{{ row.registered }}</td>
                  </tr>
                }
                @if (visible().length === 0) {
                  <tr><td colspan="6" class="ins-empty">No institutions match “{{ query() }}”.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
.ins { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }
.ins-body { display: flex; flex: 1; min-height: 0; }
.ins-main { flex: 1; min-width: 0; padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22); max-width: 1180px; }
.ins-pagehead { margin-bottom: var(--apt-spacing-s6); }
.ins-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0 0 var(--apt-spacing-s2); }
.ins-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); letter-spacing: -0.022em; line-height: 1.05; color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); }
.ins-sub { font-size: var(--apt-font-size-body-md); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; max-width: 64ch; }
.ins-search { display: flex; align-items: center; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s6); }
.ins-search-icon { width: 16px; height: 16px; color: var(--apt-text-dim); flex: none; }
.ins-search-input { flex: 1; min-width: 0; padding: var(--apt-spacing-s3) var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); background: var(--apt-surface-page); font-size: var(--apt-font-size-body-md); color: var(--apt-text-body); outline: none; }
.ins-search-input:focus { border-color: var(--apt-color-brand-primary); }
.ins-count { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); white-space: nowrap; }
.ins-table-wrap { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); overflow: auto; }
.ins-table { width: 100%; border-collapse: collapse; text-align: left; font-size: var(--apt-font-size-body-md); }
.ins-th { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-bottom: 1px solid var(--apt-border-faint, var(--apt-border)); white-space: nowrap; }
.ins-td { padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-bottom: 1px solid var(--apt-border-faint, var(--apt-border)); }
.ins-td-name { font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); white-space: nowrap; }
.ins-td-dim { color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); }
.ins-td-nowrap { white-space: nowrap; }
.ins-type-badge { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: lowercase; letter-spacing: 0.04em; color: var(--apt-text-body); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 1px 6px; white-space: nowrap; }
.ins-empty { padding: var(--apt-spacing-s7); color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); text-align: center; }
@media (max-width: 900px) {
  .ins-main { padding: var(--apt-spacing-s8); }
  .ins-table { font-size: var(--apt-font-size-body-sm); }
}
`,
  ],
})
export class InstitutionsComponent {
  readonly query = signal('');
  readonly rows = INSTITUTION_ROWS;

  readonly visible = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return [...this.rows];
    return this.rows.filter((r) =>
      (r.name + ' ' + r.type + ' ' + r.focus + ' ' + r.can + ' ' + r.has).toLowerCase().includes(q)
    );
  });
}
