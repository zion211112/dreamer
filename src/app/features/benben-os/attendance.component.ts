import { Component, computed, inject, signal } from '@angular/core';
import { BenbenApi, ApiError } from './benben-api.service';
import { describeError, fullName, isoToday } from './benben-format';
import type { AttendanceRosterRow, ClassSummary, Term } from './benben.models';

type Status = 'present' | 'absent' | 'late' | 'excused';
const STATUSES: Status[] = ['present', 'late', 'excused', 'absent'];

@Component({
  selector: 'app-benben-attendance',
  template: `
    <div class="bb-page-head">
      <div>
        <p class="bb-eyebrow">Daily register</p>
        <h1>Attendance</h1>
        <p class="bb-lede">One tap per learner. Marked attendance feeds term reports and the fee follow-up list.</p>
      </div>
    </div>

    @if (error()) { <p class="bb-alert" role="alert">{{ error() }}</p> }
    @if (notice()) { <p class="bb-alert bb-alert-ok" role="status">{{ notice() }}</p> }

    <section class="bb-card" aria-label="Register filters">
      <div class="bb-row">
        <div class="bb-field" style="flex: 1 1 220px;">
          <label for="bb-att-class">Class</label>
          <select id="bb-att-class" [value]="classId()" (change)="chooseClass($any($event.target).value)">
            <option value="">Choose a class</option>
            @for (klass of classes(); track klass.id) { <option [value]="klass.id" [selected]="klass.id === classId()">{{ klass.name }}</option> }
          </select>
        </div>
        <div class="bb-field" style="flex: 0 1 200px;">
          <label for="bb-att-day">Date</label>
          <input id="bb-att-day" type="date" [value]="day()" (change)="chooseDay($any($event.target).value)" />
        </div>
        @if (roster().length > 0) {
          <div class="bb-row" style="margin-left: auto;">
            <button type="button" class="bb-btn bb-btn-sm" (click)="markAll('present')">Mark all present</button>
            <button type="button" class="bb-btn bb-btn-primary bb-btn-sm" [disabled]="saving() || markedCount() === 0" (click)="save()">
              {{ saving() ? 'Saving…' : 'Save register' }}
            </button>
          </div>
        }
      </div>
      @if (term(); as active) {
        <p class="bb-hint" style="margin-top: 10px;">{{ active.name }} · {{ markedCount() }} of {{ roster().length }} marked</p>
      }
    </section>

    @if (loading()) {
      <p class="bb-loading" role="status">Loading the register</p>
    } @else if (classId() && roster().length === 0) {
      <div class="bb-empty"><strong>No active learners in this class</strong>Enrol learners first, then mark the register.</div>
    } @else if (!classId()) {
      <div class="bb-empty"><strong>Choose a class</strong>The register lists every active learner with today’s status.</div>
    } @else {
      <div class="bb-table-wrap">
        <table class="bb-table bb-att-table">
          <caption>{{ day() }} · {{ roster().length }} learners</caption>
          <thead><tr><th scope="col">Admission</th><th scope="col">Learner</th><th scope="col">Status</th></tr></thead>
          <tbody>
            @for (row of roster(); track row.learnerId) {
              <tr>
                <td class="bb-mono">{{ row.admissionNo }}</td>
                <td>{{ fullName(row) }}</td>
                <td>
                  <div class="bb-seg" role="group" [attr.aria-label]="'Attendance for ' + fullName(row)">
                    @for (status of statuses; track status) {
                      <button type="button" [attr.aria-pressed]="statusesFor(row.learnerId) === status"
                              (click)="setStatus(row.learnerId, status)">{{ status }}</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class BenbenAttendanceComponent {
  private readonly api = inject(BenbenApi);

  readonly classes = signal<ClassSummary[]>([]);
  readonly roster = signal<AttendanceRosterRow[]>([]);
  readonly statusesByLearner = signal<Record<string, Status>>({});
  readonly classId = signal('');
  readonly day = signal(isoToday());
  readonly term = signal<Term | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly statuses = STATUSES;
  readonly fullName = fullName;

  readonly markedCount = computed(() => Object.keys(this.statusesByLearner()).length);

  constructor() {
    void this.bootstrap();
  }

  async bootstrap(): Promise<void> {
    try {
      const [classes, years] = await Promise.all([
        this.api.get<ClassSummary[]>('/classes'),
        this.api.get<{ terms: Term[] }>('/years'),
      ]);
      this.classes.set(classes);
      const today = isoToday();
      this.term.set(years.terms.find((term) => term.startsOn <= today && term.endsOn >= today) ?? years.terms[0] ?? null);
      if (classes.length > 0) {
        this.classId.set(classes[0]!.id);
        await this.loadRoster();
      }
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    }
  }

  chooseClass(classId: string): void {
    this.classId.set(classId);
    void this.loadRoster();
  }

  chooseDay(day: string): void {
    this.day.set(day);
    void this.loadRoster();
  }

  async loadRoster(): Promise<void> {
    this.notice.set(null);
    this.error.set(null);
    this.loading.set(true);
    try {
      const payload = await this.api.get<{ roster: AttendanceRosterRow[] }>(
        `/classes/${this.classId()}/attendance?day=${this.day()}`,
      );
      this.roster.set(payload.roster);
      const marks: Record<string, Status> = {};
      for (const row of payload.roster) {
        if (row.status) marks[row.learnerId] = row.status;
      }
      this.statusesByLearner.set(marks);
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.loading.set(false);
    }
  }

  statusesFor(learnerId: string): Status | undefined {
    return this.statusesByLearner()[learnerId];
  }

  setStatus(learnerId: string, status: Status): void {
    this.statusesByLearner.update((current) => ({ ...current, [learnerId]: status }));
    this.notice.set(null);
  }

  markAll(status: Status): void {
    const next: Record<string, Status> = {};
    for (const row of this.roster()) next[row.learnerId] = status;
    this.statusesByLearner.set(next);
    this.notice.set(null);
  }

  async save(): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      const entries = Object.entries(this.statusesByLearner());
      await this.api.send('PUT', `/classes/${this.classId()}/attendance`, {
        day: this.day(),
        records: entries.map(([learnerId, status]) => ({ learnerId, status })),
      });
      await this.loadRoster();
      this.notice.set(`Saved ${entries.length} attendance marks for ${this.day()}.`);
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.saving.set(false);
    }
  }
}
