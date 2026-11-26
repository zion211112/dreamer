import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceDataService, type UndertakingStatus } from '@apt-labs/shared/state';
import { UNDERTAKING_STATUS_LABEL } from './records-labels';

/** Canon: the structure of organizations and undertakings visible to you. */
@Component({
  selector: 'app-records-canon',
  standalone: true,
  imports: [RouterLink, DatePipe],
  styleUrl: './records-lens.css',
  template: `
    <section class="lens-section" aria-labelledby="canon-orgs">
      <h2 class="lens-title" id="canon-orgs">Organizations</h2>
      <p class="lens-note">Organizations you belong to, with the role you hold in each. Standing is the organization's recorded position; it is not authority over other organizations.</p>
      @if (orgs().length === 0) {
        <p class="lens-empty">No organization memberships are visible to you yet.</p>
      } @else {
        <div class="lens-table-wrap">
          <table class="lens-table">
            <thead><tr><th scope="col">Organization</th><th scope="col">Your role</th><th scope="col">Standing</th></tr></thead>
            <tbody>
              @for (org of orgs(); track org.id) {
                <tr>
                  <td>{{ org.name }}</td>
                  <td class="lens-muted">{{ org.role }}</td>
                  <td class="lens-muted">{{ humanise(org.standing) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    <section class="lens-section" aria-labelledby="canon-undertakings">
      <h2 class="lens-title" id="canon-undertakings">Undertakings</h2>
      <p class="lens-note">Scoped pieces of work, each owned by one organization. Open the undertaking in Workbench for its interest, offer, report and review chain.</p>
      @if (undertakings().length === 0) {
        <p class="lens-empty">No undertakings are visible to you yet.</p>
      } @else {
        <div class="lens-table-wrap">
          <table class="lens-table">
            <thead><tr><th scope="col">Undertaking</th><th scope="col">Organization</th><th scope="col">Status</th><th scope="col">Opened</th></tr></thead>
            <tbody>
              @for (u of undertakings(); track u.id) {
                <tr>
                  <td><a class="lens-link" [routerLink]="['/workspace/workbench', u.id]">{{ u.title }}</a></td>
                  <td class="lens-muted">{{ u.organizationName }}</td>
                  <td><span class="lens-pill">{{ statusLabel(u.status) }}</span></td>
                  <td class="lens-mono">{{ u.createdAt | date: 'd MMM y' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class CanonComponent {
  private readonly data = inject(WorkspaceDataService);
  readonly orgs = this.data.organizationsState;
  readonly undertakings = () => this.data.recordsState().undertakings;

  statusLabel(status: UndertakingStatus): string {
    return UNDERTAKING_STATUS_LABEL[status] ?? status;
  }

  humanise(value: string): string {
    return value.replaceAll('_', ' ');
  }
}
