import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

interface PilotDetail {
  id: string;
  label: string;
  institution: string;
  location: string;
  status: string;
  scope: string;
}

const PILOTS: Record<string, PilotDetail> = {
  'pilot-001': { id: 'pilot-001', label: 'Nairobi Procurement Pilot', institution: 'Nairobi County', location: 'Nairobi', status: 'delivered', scope: 'Institutional procurement routed through verified local producers. 3-5% transaction fee, full cost disclosure.' },
  'pilot-002': { id: 'pilot-002', label: 'Mombasa Port Drayage', institution: 'Mombasa Port Authority', location: 'Mombasa', status: 'in-progress', scope: 'Port-to-inland drayage coordination. Crews matched from Mombasa Makers Guild, 820 KES base rate.' },
  'pilot-003': { id: 'pilot-003', label: 'Kisumu Agri Supply', institution: 'Kisumu University', location: 'Kisumu', status: 'published', scope: 'Agricultural input supply chain. 310 KES per unit, seasonal cycle Q2-Q4.' },
  'pilot-004': { id: 'pilot-004', label: 'Eldoret Logistics Hub', institution: 'Eldoret Gov', location: 'Eldoret', status: 'draft', scope: 'Regional logistics hub for Rift Valley. Capacity 12,000 KES/month.' },
  'pilot-005': { id: 'pilot-005', label: 'Nakuru Health Supply', institution: 'Nakuru Hospital', location: 'Nakuru', status: 'delivered', scope: 'PPE and medical supplies procurement. 6,800 KES contract, settled and recorded.' },
};

@Component({
  selector: 'app-pilot',
  imports: [RouterLink],
  template: `
    <div class="pilot-page">
      <div class="pilot-breadcrumb">
        <a [routerLink]="['/workspace/workbench']" class="pilot-back">Back to Workbench</a>
      </div>

      <header class="pilot-head">
        <h1 class="pilot-title">{{ pilot().label }}</h1>
        <div class="pilot-meta">
          <span class="pilot-id">{{ pilot().id }}</span>
          <span class="pilot-status">{{ pilot().status }}</span>
        </div>
      </header>

      <div class="pilot-grid">
        <section class="pilot-section">
          <h2 class="pilot-section-title">Institution</h2>
          <div class="pilot-detail">
            <span class="detail-value">{{ pilot().institution }}</span>
            <span class="detail-sub">{{ pilot().location }}</span>
          </div>
        </section>

        <section class="pilot-section">
          <h2 class="pilot-section-title">Scope</h2>
          <p class="pilot-scope">{{ pilot().scope }}</p>
        </section>
      </div>

      <div class="pilot-actions">
        <a [routerLink]="['/workspace/records']" class="pilot-action-btn">View records</a>
        <a [routerLink]="['/workspace/value']" class="pilot-action-btn">View value</a>
      </div>
    </div>
  `,
  styles: [`
    .pilot-page { padding: var(--apt-spacing-s10); max-width: 900px; margin: 0 auto; }
    .pilot-breadcrumb { margin-bottom: var(--apt-spacing-s6); }
    .pilot-back { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); text-decoration: none; }
    .pilot-back:hover { color: var(--apt-module-accent); }
    .pilot-head { margin-bottom: var(--apt-spacing-s10); }
    .pilot-title { font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0; font-family: var(--apt-font-serif); }
    .pilot-meta { display: flex; gap: var(--apt-spacing-s5); margin-top: var(--apt-spacing-s3); font-size: var(--apt-font-size-micro); }
    .pilot-id { font-family: var(--apt-font-mono); color: var(--apt-text-muted); }
    .pilot-status { font-weight: var(--apt-font-weight-medium); color: var(--apt-module-accent); text-transform: capitalize; }
    .pilot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--apt-spacing-s6); margin-bottom: var(--apt-spacing-s10); }
    .pilot-section { padding: var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); background: var(--apt-surface-page); }
    .pilot-section-title { font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s3); }
    .pilot-detail { display: flex; flex-direction: column; gap: var(--apt-spacing-s1); }
    .detail-value { font-weight: var(--apt-font-weight-medium); font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); }
    .detail-sub { font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
    .pilot-scope { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); margin: 0; line-height: var(--apt-line-height-relaxed); }
    .pilot-actions { display: flex; gap: var(--apt-spacing-s4); }
    .pilot-action-btn { padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: var(--apt-surface-raised); color: var(--apt-text-strong); font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); text-decoration: none; }
    .pilot-action-btn:hover { border-color: var(--apt-module-accent); color: var(--apt-module-accent); }
  `],
})
export class PilotComponent {
  private readonly route = inject(ActivatedRoute);


  readonly pilot = signal<PilotDetail>(PILOTS['pilot-001']);
}
