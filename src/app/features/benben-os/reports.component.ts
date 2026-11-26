import { Component, computed, inject, signal } from '@angular/core';
import { BenbenApi, ApiError } from './benben-api.service';
import { BenbenSession } from './benben-session.service';
import { describeError, day, fullName, levelClass, percent } from './benben-format';
import type { ClassSummary, ReportLearner, ReportPayload, Term } from './benben.models';

@Component({
  selector: 'app-benben-reports',
  template: `
    <div class="bb-page-head">
      <div>
        <p class="bb-eyebrow">Confirmed marks only</p>
        <h1>Term reports</h1>
        <p class="bb-lede">CBC levels per subject, overall standing, and attendance — printable for parents and file copies.</p>
      </div>
      @if (report()) {
        <button type="button" class="bb-btn" (click)="print()">Print</button>
      }
    </div>

    @if (error()) { <p class="bb-alert" role="alert">{{ error() }}</p> }

    <section class="bb-card" aria-label="Report filters">
      <div class="bb-row">
        <div class="bb-field" style="flex: 1 1 220px;">
          <label for="bb-r-class">Class</label>
          <select id="bb-r-class" [value]="classId()" (change)="classId.set($any($event.target).value)">
            <option value="">Choose a class</option>
            @for (klass of classes(); track klass.id) { <option [value]="klass.id" [selected]="klass.id === classId()">{{ klass.name }}</option> }
          </select>
        </div>
        <div class="bb-field" style="flex: 1 1 220px;">
          <label for="bb-r-term">Term</label>
          <select id="bb-r-term" [value]="termId()" (change)="termId.set($any($event.target).value)">
            @for (term of terms(); track term.id) { <option [value]="term.id" [selected]="term.id === termId()">{{ term.name }}</option> }
          </select>
        </div>
        <button type="button" class="bb-btn bb-btn-primary" [disabled]="busy() || !classId() || !termId()" (click)="generate()">
          {{ busy() ? 'Building…' : 'Build reports' }}
        </button>
      </div>
      <p class="bb-hint" style="margin-top: 10px;">Draft marks never appear here. Confirm marks on an assessment first.</p>
    </section>

    @if (loading()) {
      <p class="bb-loading" role="status">Building reports</p>
    } @else if (report(); as data) {
      <section class="bb-grid bb-grid-3 bb-stats-row" aria-label="Cohort summary">
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Learners reported</span>
          <span class="bb-stat-value">{{ data.learners.length }}</span>
          <span class="bb-stat-note">{{ data.class.name }} · {{ data.term.name }}</span>
        </div>
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Class average</span>
          <span class="bb-stat-value">{{ percent(averagePercent()) }}</span>
          <span class="bb-stat-note">Mean of learners with marks</span>
        </div>
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Average attendance</span>
          <span class="bb-stat-value">{{ percent(averageAttendance()) }}</span>
          <span class="bb-stat-note">Present or late, term to date</span>
        </div>
      </section>

      @if (data.learners.length === 0) {
        <div class="bb-empty"><strong>No active learners in this class</strong>Enrol learners before building reports.</div>
      } @else {
        <div class="bb-table-wrap">
          <table class="bb-table">
            <caption>{{ data.class.name }} · {{ data.term.name }}</caption>
            <thead>
              <tr>
                <th scope="col">Learner</th>
                @for (subject of subjects(); track subject.subjectCode) { <th scope="col" class="bb-num">{{ subject.subjectCode }}</th> }
                <th scope="col" class="bb-num">Overall</th>
                <th scope="col" class="bb-num">Attendance</th>
                <th scope="col" class="bb-col-action"></th>
              </tr>
            </thead>
            <tbody>
              @for (learner of data.learners; track learner.learnerId) {
                <tr>
                  <td>
                    <button type="button" class="bb-linklike" (click)="select(learner)">{{ fullName(learner) }}</button><br />
                    <span class="bb-hint bb-mono">{{ learner.admissionNo }}</span>
                  </td>
                  @for (subject of subjects(); track subject.subjectCode) {
                    <td class="bb-num">{{ subjectPercent(learner, subject.subjectCode) }}</td>
                  }
                  <td class="bb-num">
                    @if (learner.overallLevel) {
                      <span [class]="levelClass(learner.overallLevel)">{{ learner.overallLevel }}</span>
                      <br /><span class="bb-hint">{{ percent(learner.overallPercent) }}</span>
                    } @else { <span class="bb-muted">—</span> }
                  </td>
                  <td class="bb-num">{{ percent(learner.attendanceRate) }}</td>
                  <td class="bb-col-action"><button type="button" class="bb-btn bb-btn-sm" (click)="select(learner)">Report card</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }

    @if (selected(); as learner) {
      <section id="bb-report-card" class="bb-card bb-report-card" aria-labelledby="bb-report-title">
        <div class="bb-card-head">
          <div>
            <p class="bb-eyebrow">{{ session.me()?.school?.name }} · {{ report()?.term?.name }}</p>
            <h2 id="bb-report-title">{{ fullName(learner) }}</h2>
            <p class="bb-card-sub">{{ report()?.class?.name }} · {{ learner.admissionNo }}</p>
          </div>
          <button type="button" class="bb-btn bb-btn-ghost bb-btn-sm" (click)="selected.set(null)">Close</button>
        </div>
        <div class="bb-table-wrap" style="border: 0;">
          <table class="bb-table">
            <thead><tr><th scope="col">Subject</th><th scope="col" class="bb-num">Papers</th><th scope="col" class="bb-num">Percent</th><th scope="col">Level</th></tr></thead>
            <tbody>
              @for (subject of learner.subjects; track subject.subjectCode) {
                <tr>
                  <td>{{ subject.subjectName }}</td>
                  <td class="bb-num">{{ subject.assessments }}</td>
                  <td class="bb-num">{{ percent(subject.percent) }}</td>
                  <td><span [class]="levelClass(subject.level)">{{ subject.level }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="4"><div class="bb-empty"><strong>No confirmed marks</strong>Marks for this term have not been confirmed for this learner.</div></td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="bb-split" style="margin-top: 16px;">
          <dl class="bb-dl">
            <dt>Overall</dt><dd>{{ percent(learner.overallPercent) }}{{ learner.overallLevel ? ' · ' + learner.overallLevel : '' }}</dd>
            <dt>Attendance</dt><dd>{{ percent(learner.attendanceRate) }} ({{ learner.attendance.present }} present, {{ learner.attendance.absent }} absent)</dd>
            <dt>Term</dt><dd>{{ day(report()?.term?.startsOn) }} – {{ day(report()?.term?.endsOn) }}</dd>
          </dl>
          <div>
            <span class="bb-field-label">Term remark</span>
            <p style="margin: 6px 0 0; font-family: var(--apt-font-serif); font-size: 17px;">{{ remark(learner) }}</p>
          </div>
        </div>
        <p class="bb-hint" style="margin-top: 18px;">Levels: EE exceeding · ME meeting · AE approaching · BE below expectation. Generated from confirmed marks only.</p>
      </section>
    }
  `,
})
export class BenbenReportsComponent {
  readonly session = inject(BenbenSession);
  private readonly api = inject(BenbenApi);

  readonly classes = signal<ClassSummary[]>([]);
  readonly terms = signal<Term[]>([]);
  readonly classId = signal('');
  readonly termId = signal('');
  readonly report = signal<ReportPayload | null>(null);
  readonly selected = signal<ReportLearner | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  readonly fullName = fullName;
  readonly percent = percent;
  readonly levelClass = levelClass;
  readonly day = day;

  readonly subjects = computed(() => {
    const seen = new Map<string, { subjectCode: string; subjectName: string }>();
    for (const learner of this.report()?.learners ?? []) {
      for (const subject of learner.subjects) seen.set(subject.subjectCode, subject);
    }
    return [...seen.values()].sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));
  });

  readonly averagePercent = computed(() => {
    const rows = (this.report()?.learners ?? []).filter((learner) => learner.overallPercent !== null);
    if (rows.length === 0) return null;
    return rows.reduce((total, learner) => total + (learner.overallPercent ?? 0), 0) / rows.length;
  });

  readonly averageAttendance = computed(() => {
    const rows = (this.report()?.learners ?? []).filter((learner) => learner.attendanceRate !== null);
    if (rows.length === 0) return null;
    return rows.reduce((total, learner) => total + (learner.attendanceRate ?? 0), 0) / rows.length;
  });

  constructor() {
    void this.bootstrap();
  }

  async bootstrap(): Promise<void> {
    try {
      const [classes, years] = await Promise.all([
        this.api.get<ClassSummary[]>('/classes'),
        this.api.get<{ terms: Term[]; currentTermId: string | null }>('/years'),
      ]);
      this.classes.set(classes);
      this.terms.set(years.terms);
      this.classId.set(classes[0]?.id ?? '');
      this.termId.set(years.currentTermId ?? years.terms[0]?.id ?? '');
      if (this.classId() && this.termId()) await this.generate();
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    }
  }

  async generate(): Promise<void> {
    if (!this.classId() || !this.termId() || this.busy()) return;
    this.busy.set(true);
    this.loading.set(true);
    this.error.set(null);
    this.selected.set(null);
    try {
      this.report.set(await this.api.get<ReportPayload>(
        `/reports?classId=${this.classId()}&termId=${this.termId()}`,
      ));
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.busy.set(false);
      this.loading.set(false);
    }
  }

  subjectPercent(learner: ReportLearner, subjectCode: string): string {
    const line = learner.subjects.find((subject) => subject.subjectCode === subjectCode);
    return line ? `${Math.round(line.percent)}%` : '—';
  }

  select(learner: ReportLearner): void {
    this.selected.set(learner);
    setTimeout(() => document.getElementById('bb-report-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }

  remark(learner: ReportLearner): string {
    if (!learner.overallLevel) return 'Awaiting confirmed marks for this term.';
    const level = learner.overallLevel;
    const base: Record<string, string> = {
      EE: 'Exceeding expectations across the term. Keep stretching the work.',
      ME: 'Meeting expectations steadily. A strong, reliable term.',
      AE: 'Approaching expectations. Targeted practice will close the gaps.',
      BE: 'Below expectation this term. A support plan and closer follow-up are needed.',
    };
    return base[level] ?? 'Term complete.';
  }

  print(): void {
    globalThis.print?.();
  }
}
