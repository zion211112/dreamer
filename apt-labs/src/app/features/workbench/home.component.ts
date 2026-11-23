/**
 * @apt-labs/features/workbench/home — HomeComponent
 *
 * Workbench home: the live coordination beachhead. Lists open and in-flight
 * needs and their fulfilment, all read from the shared CoordinationService —
 * the same spine that Records / Value / Network will read.
 */

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CoordinationService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-workbench-home',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="wb-page">
      <header class="wb-head">
        <h1 class="wb-title">Workbench</h1>
        <p class="wb-lede">Every need is a commitment with evidence. Post one, accept it, deliver it against the record.</p>
      </header>

      <div class="wb-metrics">
        <div class="wb-metric">
          <span class="metric-label">Total needs</span>
          <span class="metric-value">{{ counts().total }}</span>
        </div>
        <div class="wb-metric">
          <span class="metric-label">Open</span>
          <span class="metric-value">{{ counts().open }}</span>
        </div>
        <div class="wb-metric">
          <span class="metric-label">In progress</span>
          <span class="metric-value">{{ counts().inProgress }}</span>
        </div>
        <div class="wb-metric">
          <span class="metric-label">Delivered</span>
          <span class="metric-value">{{ counts().delivered }}</span>
        </div>
      </div>

      <div class="wb-post">
        <input class="wb-post-input" [ngModel]="newNeed()" (ngModelChange)="newNeed.set($event)" placeholder="Describe a new need…" aria-label="New need" />
        <button class="wb-post-btn" type="button" (click)="postNeed()">Post a need</button>
      </div>

      <div class="wb-pilots">
        @for (row of needs(); track row.needId) {
          <a [routerLink]="['/workspace/workbench', row.needId]" class="wb-pilot-card">
            <div class="wb-pilot-head">
              <span class="wb-pilot-id">{{ row.needId }}</span>
              <span
                class="wb-pilot-status"
                [class.open]="row.status === 'open'"
                [class.committed]="row.status === 'committed'"
                [class.fulfilled]="row.status === 'fulfilled'"
              >{{ row.status }}</span>
            </div>
            <div class="wb-pilot-label">{{ row.label }}</div>
            <div class="wb-pilot-module">{{ pilotLabel(row.needId) }}</div>
          </a>
        }
        @if (needs().length === 0) {
          <div class="wb-empty">No needs yet. Post the first one above.</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wb-page { padding: var(--apt-spacing-s10); max-width: 1000px; margin: 0 auto; }
    .wb-head { margin-bottom: var(--apt-spacing-s10); }
    .wb-title { font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); font-family: var(--apt-font-serif); }
    .wb-lede { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); margin: 0; }
    .wb-metrics { display: flex; gap: var(--apt-spacing-s5); margin-bottom: var(--apt-spacing-s8); flex-wrap: wrap; }
    .wb-metric { background: var(--apt-surface-raised); padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); min-width: 120px; }
    .metric-label { font-size: var(--apt-font-size-micro); text-transform: uppercase; color: var(--apt-text-muted); display: block; margin-bottom: var(--apt-spacing-s2); }
    .metric-value { font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); }
    .wb-post { display: flex; gap: var(--apt-spacing-s4); margin-bottom: var(--apt-spacing-s10); }
    .wb-post-input { flex: 1; padding: var(--apt-spacing-s4) var(--apt-spacing-s5); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); background: var(--apt-surface-page); color: var(--apt-text-strong); font-size: var(--apt-font-size-body-sm); font-family: inherit; }
    .wb-post-input:focus { outline: none; border-color: var(--apt-module-accent); }
    .wb-post-btn { padding: var(--apt-spacing-s4) var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: none; background: var(--apt-module-accent); color: var(--apt-text-strong); font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); cursor: pointer; }
    .wb-pilots { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--apt-spacing-s6); }
    .wb-pilot-card { display: block; padding: var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); background: var(--apt-surface-page); text-decoration: none; color: var(--apt-text-strong); transition: border-color var(--apt-animation-fast); }
    .wb-pilot-card:hover { border-color: var(--apt-module-accent); }
    .wb-pilot-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--apt-spacing-s5); }
    .wb-pilot-id { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .wb-pilot-status { font-size: var(--apt-font-size-micro); font-weight: var(--apt-font-weight-semibold); text-transform: uppercase; padding: var(--apt-spacing-s1) var(--apt-spacing-s3); border-radius: 999px; }
    .wb-pilot-status.open { background: var(--apt-surface-raised); color: var(--apt-text-muted); }
    .wb-pilot-status.committed { background: var(--apt-surface-info); color: var(--apt-text-info); }
    .wb-pilot-status.fulfilled { background: var(--apt-surface-success); color: var(--apt-text-success); }
    .wb-pilot-label { font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); margin-bottom: var(--apt-spacing-s2); }
    .wb-pilot-module { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .wb-empty { padding: var(--apt-spacing-s14); text-align: center; color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); }
  `],
})
export class HomeComponent {
  private readonly service = inject(CoordinationService);
  private readonly router = inject(Router);

  readonly needs = this.service.needs;
  readonly counts = this.service.counts;
  private readonly newNeed = signal('');

  pilotLabel(needId: string): string {
    const pilot = this.service.pilot(needId);
    return pilot ? pilot.institution.name : 'Ad-hoc need';
  }

  postNeed(): void {
    const label = this.newNeed().trim();
    if (!label) return;
    const rec = this.service.createNeed({ need: label });
    this.newNeed.set('');
    this.router.navigate(['/workspace/workbench', rec.id]);
  }
}
