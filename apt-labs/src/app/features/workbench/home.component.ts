/**
 * @apt-labs/features/workbench/home — HomeComponent
 *
 * Workbench home: scope, assemble, and coordinate productive work.
 * Ported from Vue `src/modules/workbench/pages-vue/Home.vue`.
 */

import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PilotRow {
  id: string;
  label: string;
  status: 'draft' | 'published' | 'in-progress' | 'delivered';
  module: string;
}

@Component({
  selector: 'app-workbench-home',
  imports: [RouterLink],
  template: `
    <div class="wb-page">
      <header class="wb-head">
        <h1 class="wb-title">Workbench</h1>
        <p class="wb-lede">Scope, assemble, and coordinate productive work. Every pilot is a commitment with evidence.</p>
      </header>

      <div class="wb-metrics">
        <div class="wb-metric">
          <span class="metric-label">Total pilots</span>
          <span class="metric-value">{{ pilots().length }}</span>
        </div>
        <div class="wb-metric">
          <span class="metric-label">Published</span>
          <span class="metric-value">{{ publishedCount() }}</span>
        </div>
        <div class="wb-metric">
          <span class="metric-label">In progress</span>
          <span class="metric-value">{{ inProgressCount() }}</span>
        </div>
        <div class="wb-metric">
          <span class="metric-label">Delivered</span>
          <span class="metric-value">{{ deliveredCount() }}</span>
        </div>
      </div>

      <div class="wb-pilots">
        @for (pilot of pilots(); track pilot.id) {
          <a [routerLink]="['/workspace/workbench', pilot.id]" class="wb-pilot-card">
            <div class="wb-pilot-head">
              <span class="wb-pilot-id">{{ pilot.id }}</span>
              <span class="wb-pilot-status" [class.draft]="pilot.status === 'draft'" [class.published]="pilot.status === 'published'" [class.in-progress]="pilot.status === 'in-progress'" [class.delivered]="pilot.status === 'delivered'">
                {{ pilot.status }}
              </span>
            </div>
            <div class="wb-pilot-label">{{ pilot.label }}</div>
            <div class="wb-pilot-module">{{ pilot.module }}</div>
          </a>
        }
        @if (pilots().length === 0) {
          <div class="wb-empty">No pilots yet. Start by scoping one.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wb-page { padding: var(--apt-spacing-s10); max-width: 1000px; margin: 0 auto; }
    .wb-head { margin-bottom: var(--apt-spacing-s10); }
    .wb-title { font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); font-family: var(--apt-font-serif); }
    .wb-lede { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); margin: 0; }
    .wb-metrics { display: flex; gap: var(--apt-spacing-s5); margin-bottom: var(--apt-spacing-s10); flex-wrap: wrap; }
    .wb-metric { background: var(--apt-surface-raised); padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); min-width: 120px; }
    .metric-label { font-size: var(--apt-font-size-micro); text-transform: uppercase; color: var(--apt-text-muted); display: block; margin-bottom: var(--apt-spacing-s2); }
    .metric-value { font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); }
    .wb-pilots { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--apt-spacing-s6); }
    .wb-pilot-card { display: block; padding: var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); background: var(--apt-surface-page); text-decoration: none; color: var(--apt-text-strong); transition: border-color var(--apt-animation-fast); }
    .wb-pilot-card:hover { border-color: var(--apt-module-accent); }
    .wb-pilot-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--apt-spacing-s5); }
    .wb-pilot-id { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .wb-pilot-status { font-size: var(--apt-font-size-micro); font-weight: var(--apt-font-weight-semibold); text-transform: uppercase; padding: var(--apt-spacing-s1) var(--apt-spacing-s3); border-radius: 999px; }
    .wb-pilot-status.draft { background: var(--apt-surface-raised); color: var(--apt-text-muted); }
    .wb-pilot-status.published { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .wb-pilot-status.in-progress { background: var(--apt-surface-info); color: var(--apt-module-accent); }
    .wb-pilot-status.delivered { background: var(--apt-surface-success); color: var(--apt-text-success); }
    .wb-pilot-label { font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); margin-bottom: var(--apt-spacing-s2); }
    .wb-pilot-module { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .wb-empty { padding: var(--apt-spacing-s14); text-align: center; color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); }
  `],
})
export class HomeComponent {
  private readonly pilots_ = signal<PilotRow[]>([
    { id: 'pilot-001', label: 'Nairobi Procurement Pilot', status: 'delivered', module: 'workbench' },
    { id: 'pilot-002', label: 'Mombasa Port Drayage', status: 'in-progress', module: 'workbench' },
    { id: 'pilot-003', label: 'Kisumu Agri Supply', status: 'published', module: 'workbench' },
    { id: 'pilot-004', label: 'Eldoret Logistics Hub', status: 'draft', module: 'workbench' },
    { id: 'pilot-005', label: 'Nakuru Health Supply', status: 'delivered', module: 'workbench' },
  ]);

  readonly pilots = this.pilots_;
  readonly publishedCount = computed(() => this.pilots_().filter((p) => p.status === 'published').length);
  readonly inProgressCount = computed(() => this.pilots_().filter((p) => p.status === 'in-progress').length);
  readonly deliveredCount = computed(() => this.pilots_().filter((p) => p.status === 'delivered').length);
}
