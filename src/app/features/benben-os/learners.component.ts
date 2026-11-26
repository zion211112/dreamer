import { Component, computed, inject, signal } from '@angular/core';
import { BenbenApi, ApiError } from './benben-api.service';
import { BenbenSession } from './benben-session.service';
import { describeError, fullName, kes, percent } from './benben-format';
import type { ClassSummary, LearnerDetail, LearnerRow } from './benben.models';

@Component({
  selector: 'app-benben-learners',
  template: `
    <div class="bb-page-head">
      <div>
        <p class="bb-eyebrow">Register</p>
        <h1>Learners</h1>
        <p class="bb-lede">Admission records, guardians, enrolment, attendance, and fee balance in one place.</p>
      </div>
      @if (session.can('learners.write')) {
        <button type="button" class="bb-btn bb-btn-primary" (click)="toggleForm()">
          {{ formOpen() ? 'Close form' : 'Add learner' }}
        </button>
      }
    </div>

    @if (error()) { <p class="bb-alert" role="alert">{{ error() }}</p> }
    @if (notice()) { <p class="bb-alert bb-alert-ok" role="status">{{ notice() }}</p> }

    @if (formOpen()) {
      <section class="bb-card" aria-labelledby="bb-learner-form-title">
        <h2 id="bb-learner-form-title">New learner</h2>
        <p class="bb-card-sub">Only the admission number is required; you can add a guardian and class now or later.</p>
        @if (formError()) { <p class="bb-alert" role="alert">{{ formError() }}</p> }
        <form class="bb-form" (submit)="create($event)">
          <div class="bb-form-grid">
            <div class="bb-field">
              <label for="bb-l-adm">Admission no.</label>
              <input id="bb-l-adm" required [value]="admissionNo()" (input)="admissionNo.set($any($event.target).value)" placeholder="2026-013" />
            </div>
            <div class="bb-field">
              <label for="bb-l-first">First name</label>
              <input id="bb-l-first" required [value]="firstName()" (input)="firstName.set($any($event.target).value)" />
            </div>
            <div class="bb-field">
              <label for="bb-l-last">Last name</label>
              <input id="bb-l-last" required [value]="lastName()" (input)="lastName.set($any($event.target).value)" />
            </div>
            <div class="bb-field">
              <label for="bb-l-dob">Date of birth</label>
              <input id="bb-l-dob" type="date" [value]="dateOfBirth()" (input)="dateOfBirth.set($any($event.target).value)" />
            </div>
            <div class="bb-field">
              <label for="bb-l-class">Class</label>
              <select id="bb-l-class" [value]="classId()" (change)="classId.set($any($event.target).value)">
                <option value="">Not enrolled yet</option>
                @for (klass of classes(); track klass.id) {
                  <option [value]="klass.id" [selected]="klass.id === classId()">{{ klass.name }}</option>
                }
              </select>
            </div>
            <div class="bb-field">
              <label for="bb-l-guardian">Guardian name</label>
              <input id="bb-l-guardian" [value]="guardianName()" (input)="guardianName.set($any($event.target).value)" placeholder="Optional" />
            </div>
            <div class="bb-field">
              <label for="bb-l-phone">Guardian phone</label>
              <input id="bb-l-phone" [value]="guardianPhone()" (input)="guardianPhone.set($any($event.target).value)" placeholder="+254…" />
            </div>
            <div class="bb-field">
              <label for="bb-l-rel">Relationship</label>
              <input id="bb-l-rel" [value]="guardianRelationship()" (input)="guardianRelationship.set($any($event.target).value)" placeholder="Mother" />
            </div>
          </div>
          <div class="bb-row" style="justify-content: flex-end;">
            <button type="button" class="bb-btn bb-btn-ghost" (click)="toggleForm()">Cancel</button>
            <button type="submit" class="bb-btn bb-btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save learner' }}</button>
          </div>
        </form>
      </section>
    }

    <section class="bb-card" aria-label="Learner filters">
      <div class="bb-row">
        <div class="bb-field" style="flex: 1 1 260px;">
          <label for="bb-search">Search</label>
          <input id="bb-search" type="search" placeholder="Name or admission number"
                 [value]="query()" (input)="query.set($any($event.target).value)" />
        </div>
        <div class="bb-field" style="flex: 0 1 220px;">
          <label for="bb-class-filter">Class</label>
          <select id="bb-class-filter" [value]="classFilter()" (change)="setClassFilter($any($event.target).value)">
            <option value="">All classes</option>
            @for (klass of classes(); track klass.id) { <option [value]="klass.id" [selected]="klass.id === classFilter()">{{ klass.name }}</option> }
          </select>
        </div>
        <span class="bb-hint">{{ filtered().length }} shown</span>
      </div>
    </section>

    @if (loading()) {
      <p class="bb-loading" role="status">Loading learners</p>
    } @else {
      <div class="bb-table-wrap">
        <table class="bb-table bb-learners-table">
          <caption>{{ filtered().length }} learners</caption>
          <thead><tr><th scope="col">Admission</th><th scope="col">Learner</th><th scope="col">Class</th><th scope="col">Status</th></tr></thead>
          <tbody>
            @for (learner of filtered(); track learner.id) {
              <tr>
                <td class="bb-mono">{{ learner.admissionNo }}</td>
                <td><button type="button" class="bb-linklike" (click)="open(learner.id)">{{ fullName(learner) }}</button></td>
                <td>{{ learner.className ?? '—' }}</td>
                <td><span class="bb-badge" [class]="learner.status === 'active' ? 'bb-badge bb-badge-ok' : 'bb-badge bb-badge-neutral'">{{ learner.status }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="4"><div class="bb-empty"><strong>No learners match</strong>Adjust the search, or add a learner to the register.</div></td></tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (detailLoading()) {
      <p class="bb-loading" role="status">Opening learner record</p>
    } @else if (detail(); as record) {
      <section class="bb-card" aria-labelledby="bb-learner-detail-title">
        <div class="bb-card-head">
          <div>
            <p class="bb-eyebrow">{{ record.learner.admissionNo }}</p>
            <h2 id="bb-learner-detail-title">{{ fullName(record.learner) }}</h2>
            <p class="bb-card-sub">{{ record.enrolments[0]?.className ?? 'Not enrolled' }} · attendance {{ percent(record.attendance.rate) }}</p>
          </div>
          <button type="button" class="bb-btn bb-btn-ghost bb-btn-sm" (click)="closeDetail()">Close</button>
        </div>
        <div class="bb-split">
          <div>
            <dl class="bb-dl">
              <dt>Date of birth</dt><dd>{{ record.learner.dateOfBirth ?? '—' }}</dd>
              <dt>Status</dt><dd>{{ record.learner.status }}</dd>
              <dt>Attendance</dt>
              <dd>{{ record.attendance.counts.present }} present · {{ record.attendance.counts.late }} late · {{ record.attendance.counts.absent }} absent</dd>
              <dt>Fees</dt>
              <dd class="bb-mono">{{ kes(record.fees.invoicedCents - record.fees.paidCents) }} outstanding of {{ kes(record.fees.invoicedCents) }}</dd>
            </dl>
            <hr class="bb-divider" />
            <h3 style="font-family: var(--apt-font-serif); font-size: 16px; margin: 0 0 8px;">Enrolment history</h3>
            @if (record.enrolments.length === 0) {
              <p class="bb-muted">No enrolment yet.</p>
            } @else {
              <ul class="bb-list">
                @for (enrolment of record.enrolments; track enrolment.id) {
                  <li><span>{{ enrolment.className }} · Grade {{ enrolment.gradeLevel }}</span><span class="bb-muted">{{ enrolment.yearName }}</span></li>
                }
              </ul>
            }
            @if (session.can('learners.write')) {
              @if (enrolError()) { <p class="bb-alert" role="alert">{{ enrolError() }}</p> }
              <form class="bb-row" style="margin-top: 12px;" (submit)="enrol(record.learner.id, $event)">
                <div class="bb-field" style="flex: 1 1 180px;">
                  <label [for]="'bb-enrol-class-' + record.learner.id">Enrol in class</label>
                  <select [id]="'bb-enrol-class-' + record.learner.id" [value]="enrolClassId()" (change)="enrolClassId.set($any($event.target).value)">
                    <option value="">Choose a class</option>
                    @for (klass of classes(); track klass.id) { <option [value]="klass.id" [selected]="klass.id === enrolClassId()">{{ klass.name }}</option> }
                  </select>
                </div>
                <button type="submit" class="bb-btn bb-btn-sm" [disabled]="enrolBusy() || !enrolClassId()">{{ enrolBusy() ? 'Enrolling…' : 'Enrol' }}</button>
              </form>
            }
          </div>
          <div>
            <h3 style="font-family: var(--apt-font-serif); font-size: 16px; margin: 0 0 8px;">Guardians</h3>
            @if (record.guardians.length === 0) {
              <p class="bb-muted">No guardian recorded.</p>
            } @else {
              <ul class="bb-list">
                @for (guardian of record.guardians; track guardian.id) {
                  <li><span>{{ guardian.name }}<br /><span class="bb-muted">{{ guardian.relationship ?? 'Guardian' }}</span></span><span class="bb-mono" style="font-size: 12px;">{{ guardian.phone ?? '—' }}</span></li>
                }
              </ul>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class BenbenLearnersComponent {
  readonly session = inject(BenbenSession);
  private readonly api = inject(BenbenApi);

  readonly rows = signal<LearnerRow[]>([]);
  readonly classes = signal<ClassSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly query = signal('');
  readonly classFilter = signal('');

  readonly admissionNo = signal('');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly dateOfBirth = signal('');
  readonly classId = signal('');
  readonly guardianName = signal('');
  readonly guardianPhone = signal('');
  readonly guardianRelationship = signal('');

  readonly detail = signal<LearnerDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly enrolClassId = signal('');
  readonly enrolBusy = signal(false);
  readonly enrolError = signal<string | null>(null);

  readonly fullName = fullName;
  readonly kes = kes;
  readonly percent = percent;

  readonly filtered = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const rows = this.rows();
    if (!needle) return rows;
    return rows.filter((row) =>
      `${row.firstName} ${row.lastName}`.toLowerCase().includes(needle)
      || row.admissionNo.toLowerCase().includes(needle));
  });

  constructor() {
    void this.loadClasses();
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const suffix = this.classFilter() ? `?classId=${this.classFilter()}` : '';
      this.rows.set(await this.api.get<LearnerRow[]>(`/learners${suffix}`));
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.loading.set(false);
    }
  }

  async loadClasses(): Promise<void> {
    try {
      this.classes.set(await this.api.get<ClassSummary[]>('/classes'));
    } catch {
      // The class list is only needed for filters and enrolment; the register still renders.
    }
  }

  setClassFilter(value: string): void {
    this.classFilter.set(value);
    void this.load();
  }

  toggleForm(): void {
    this.formOpen.update((open) => !open);
    this.formError.set(null);
  }

  async create(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.saving.set(true);
    this.formError.set(null);
    this.notice.set(null);
    try {
      const created = await this.api.send<{ id: string }>('POST', '/learners', {
        admissionNo: this.admissionNo(),
        firstName: this.firstName(),
        lastName: this.lastName(),
        dateOfBirth: this.dateOfBirth() || null,
        classId: this.classId() || null,
        guardian: this.guardianName() ? {
          name: this.guardianName(),
          phone: this.guardianPhone() || null,
          relationship: this.guardianRelationship() || null,
        } : undefined,
      });
      this.notice.set(`${this.firstName()} ${this.lastName()} added to the register.`);
      this.formOpen.set(false);
      this.admissionNo.set('');
      this.firstName.set('');
      this.lastName.set('');
      this.dateOfBirth.set('');
      this.classId.set('');
      this.guardianName.set('');
      this.guardianPhone.set('');
      this.guardianRelationship.set('');
      await this.load();
      await this.open(created.id);
    } catch (error) {
      this.formError.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.saving.set(false);
    }
  }

  async open(learnerId: string): Promise<void> {
    this.detailLoading.set(true);
    try {
      this.detail.set(await this.api.get<LearnerDetail>(`/learners/${learnerId}`));
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.detailLoading.set(false);
    }
  }

  async enrol(learnerId: string, event: Event): Promise<void> {
    event.preventDefault();
    if (this.enrolBusy()) return;
    this.enrolBusy.set(true);
    this.enrolError.set(null);
    try {
      await this.api.send('POST', '/enrolments', { learnerId, classId: this.enrolClassId() });
      this.notice.set('Learner enrolled.');
      this.enrolClassId.set('');
      await this.open(learnerId);
      await this.load();
    } catch (error) {
      this.enrolError.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.enrolBusy.set(false);
    }
  }

  closeDetail(): void {
    this.detail.set(null);
  }
}
