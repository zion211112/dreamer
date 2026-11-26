import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WorkspaceDataService } from '@apt-labs/shared/state';
import { formatAction } from './records-labels';

/** Annals: the dated sequence of recorded events visible to you, newest first. */
@Component({
  selector: 'app-records-annals',
  standalone: true,
  imports: [DatePipe],
  styleUrl: './records-lens.css',
  template: `
    <section class="lens-section" aria-labelledby="annals-events">
      <h2 class="lens-title" id="annals-events">Recorded events</h2>
      <p class="lens-note">Each entry is an action the audit trail recorded, with who entered it and when. An entry shows that the action was recorded; it does not show that the underlying work was completed.</p>
      @if (events().length === 0) {
        <p class="lens-empty">No recorded events are visible to you yet. Events appear as work is posted, interest is expressed, offers are decided, reports are filed and reviews are recorded.</p>
      } @else {
        <div class="lens-table-wrap">
          <table class="lens-table">
            <thead><tr><th scope="col">When</th><th scope="col">Action</th><th scope="col">Recorded by</th><th scope="col">Organization</th><th scope="col">Subject</th></tr></thead>
            <tbody>
              @for (e of events(); track e.id) {
                <tr>
                  <td class="lens-mono">{{ e.occurredAt | date: 'd MMM y, HH:mm' }}</td>
                  <td>{{ action(e.action) }}</td>
                  <td class="lens-muted">{{ e.actorName }}</td>
                  <td class="lens-muted">{{ e.organizationName ?? 'Shared network' }}</td>
                  <td class="lens-mono">{{ e.subjectType }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class AnnalsComponent {
  private readonly data = inject(WorkspaceDataService);

  readonly events = computed(() =>
    [...this.data.recordsState().events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
  );

  action(value: string): string {
    return formatAction(value);
  }
}
