import { Component, inject, signal } from '@angular/core';
import { BenbenApi, ApiError } from './benben-api.service';
import { BenbenSession } from './benben-session.service';
import { describeError, day } from './benben-format';
import { splitTerms } from './onboarding.component';
import type { AcademicYear, ClassSummary, Term } from './benben.models';

@Component({
  selector: 'app-benben-setup',
  template: `
    <div class="bb-page-head">
      <div>
        <p class="bb-eyebrow">Academic structure</p>
        <h1>School setup</h1>
        <p class="bb-lede">Years, terms, and classes. Everything else — enrolment, attendance, marking, fees — hangs off this structure.</p>
      </div>
    </div>

    @if (error()) { <p class="bb-alert" role="alert">{{ error() }}</p> }
    @if (notice()) { <p class="bb-alert bb-alert-ok" role="status">{{ notice() }}</p> }

    @if (loading()) {
      <p class="bb-loading" role="status">Loading structure</p>
    } @else {
      <div class="bb-split">
        <section class="bb-card" aria-labelledby="bb-years-title">
          <h2 id="bb-years-title">Academic years</h2>
          <p class="bb-card-sub">Create next year before enrolling; reports are scoped to a term inside a year.</p>
          @if (years().length === 0) {
            <div class="bb-empty"><strong>No academic year</strong>Add one to unlock classes and terms.</div>
          } @else {
            <ul class="bb-list">
              @for (year of years(); track year.id) {
                <li>
                  <span><strong>{{ year.name }}</strong><br /><span class="bb-muted">{{ day(year.startsOn) }} – {{ day(year.endsOn) }}</span></span>
                  <span class="bb-hint">{{ termsFor(year.id).length }} terms</span>
                </li>
              }
            </ul>
          }

          <form class="bb-form" style="margin-top: 16px;" (submit)="createYear($event)">
            <div class="bb-form-grid">
              <div class="bb-field">
                <label for="bb-y-name">Label</label>
                <input id="bb-y-name" required [value]="newYearName()" (input)="newYearName.set($any($event.target).value)" placeholder="2027" />
              </div>
              <div class="bb-field">
                <label for="bb-y-start">Starts</label>
                <input id="bb-y-start" type="date" required [value]="yearStart()" (input)="yearStart.set($any($event.target).value)" />
              </div>
              <div class="bb-field">
                <label for="bb-y-end">Ends</label>
                <input id="bb-y-end" type="date" required [value]="yearEnd()" (input)="yearEnd.set($any($event.target).value)" />
              </div>
            </div>
            <label style="display: flex; gap: 8px; align-items: center; font-size: 13px;">
              <input type="checkbox" [checked]="withTerms()" (change)="withTerms.set($any($event.target).checked)" />
              Split into three terms automatically
            </label>
            <div class="bb-row" style="justify-content: flex-end;">
              <button type="submit" class="bb-btn" [disabled]="savingYear()">{{ savingYear() ? 'Saving…' : 'Add year' }}</button>
            </div>
          </form>
        </section>

        <section class="bb-card" aria-labelledby="bb-terms-title">
          <h2 id="bb-terms-title">Terms</h2>
          <p class="bb-card-sub">Reports and invoices are term-scoped. Three terms per year is the CBC norm.</p>
          @if (terms().length === 0) {
            <div class="bb-empty"><strong>No terms yet</strong>Add a year with automatic terms, or add one below.</div>
          } @else {
            <ul class="bb-list">
              @for (term of terms(); track term.id) {
                <li>
                  <span>{{ term.name }} <span class="bb-muted">{{ yearName(term.yearId) }}</span></span>
                  <span class="bb-muted bb-mono" style="font-size: 11px;">{{ day(term.startsOn) }} – {{ day(term.endsOn) }}</span>
                </li>
              }
            </ul>
          }

          @if (years().length > 0) {
            <form class="bb-form" style="margin-top: 16px;" (submit)="addTerm($event)">
              <div class="bb-form-grid">
                <div class="bb-field">
                  <label for="bb-t-year">Year</label>
                  <select id="bb-t-year" [value]="termYearId()" (change)="termYearId.set($any($event.target).value)">
                    @for (year of years(); track year.id) { <option [value]="year.id" [selected]="year.id === termYearId()">{{ year.name }}</option> }
                  </select>
                </div>
                <div class="bb-field">
                  <label for="bb-t-name">Name</label>
                  <input id="bb-t-name" required [value]="termName()" (input)="termName.set($any($event.target).value)" placeholder="Term 1" />
                </div>
                <div class="bb-field">
                  <label for="bb-t-ordinal">Ordinal</label>
                  <select id="bb-t-ordinal" [value]="termOrdinal()" (change)="termOrdinal.set(+$any($event.target).value)">
                    <option value="1" [selected]="termOrdinal() === 1">1</option><option value="2" [selected]="termOrdinal() === 2">2</option><option value="3" [selected]="termOrdinal() === 3">3</option>
                  </select>
                </div>
                <div class="bb-field">
                  <label for="bb-t-start">Starts</label>
                  <input id="bb-t-start" type="date" required [value]="termStart()" (input)="termStart.set($any($event.target).value)" />
                </div>
                <div class="bb-field">
                  <label for="bb-t-end">Ends</label>
                  <input id="bb-t-end" type="date" required [value]="termEnd()" (input)="termEnd.set($any($event.target).value)" />
                </div>
              </div>
              <div class="bb-row" style="justify-content: flex-end;">
                <button type="submit" class="bb-btn" [disabled]="savingTerm()">{{ savingTerm() ? 'Saving…' : 'Add term' }}</button>
              </div>
            </form>
          }
        </section>
      </div>

      <section class="bb-card" aria-labelledby="bb-classes-title">
        <div class="bb-card-head">
          <div>
            <h2 id="bb-classes-title">Classes</h2>
            <p class="bb-card-sub">Each class belongs to one year and one CBC grade.</p>
          </div>
        </div>
        @if (classes().length === 0) {
          <div class="bb-empty"><strong>No classes yet</strong>Add the first class so learners can be enrolled and marked.</div>
        } @else {
          <div class="bb-table-wrap" style="border: 0;">
            <table class="bb-table">
              <thead><tr><th scope="col">Class</th><th scope="col">Grade</th><th scope="col">Year</th><th scope="col" class="bb-num">Learners</th></tr></thead>
              <tbody>
                @for (klass of classes(); track klass.id) {
                  <tr>
                    <td>{{ klass.name }}</td>
                    <td>{{ klass.gradeLevel }}</td>
                    <td>{{ yearName(klass.yearId) }}</td>
                    <td class="bb-num">{{ klass.learners }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @if (years().length > 0) {
          <form class="bb-form" style="margin-top: 16px;" (submit)="createClass($event)">
            <div class="bb-form-grid">
              <div class="bb-field">
                <label for="bb-c-name">Class name</label>
                <input id="bb-c-name" required [value]="className()" (input)="className.set($any($event.target).value)" placeholder="Grade 6 East" />
              </div>
              <div class="bb-field">
                <label for="bb-c-grade">Grade</label>
                <select id="bb-c-grade" [value]="classGrade()" (change)="classGrade.set(+$any($event.target).value)">
                  <option value="4" [selected]="classGrade() === 4">Grade 4</option><option value="5" [selected]="classGrade() === 5">Grade 5</option><option value="6" [selected]="classGrade() === 6">Grade 6</option>
                  <option value="7" [selected]="classGrade() === 7">Grade 7</option><option value="8" [selected]="classGrade() === 8">Grade 8</option><option value="9" [selected]="classGrade() === 9">Grade 9</option>
                </select>
              </div>
              <div class="bb-field">
                <label for="bb-c-year">Year</label>
                <select id="bb-c-year" [value]="classYearId()" (change)="classYearId.set($any($event.target).value)">
                  @for (year of years(); track year.id) { <option [value]="year.id" [selected]="year.id === classYearId()">{{ year.name }}</option> }
                </select>
              </div>
            </div>
            <div class="bb-row" style="justify-content: flex-end;">
              <button type="submit" class="bb-btn bb-btn-primary" [disabled]="savingClass()">{{ savingClass() ? 'Saving…' : 'Add class' }}</button>
            </div>
          </form>
        }
      </section>
    }
  `,
})
export class BenbenSetupComponent {
  readonly session = inject(BenbenSession);
  private readonly api = inject(BenbenApi);

  readonly years = signal<AcademicYear[]>([]);
  readonly terms = signal<Term[]>([]);
  readonly classes = signal<ClassSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly newYearName = signal(String(new Date().getFullYear() + 1));
  readonly yearStart = signal(`${new Date().getFullYear() + 1}-01-05`);
  readonly yearEnd = signal(`${new Date().getFullYear() + 1}-11-27`);
  readonly withTerms = signal(true);
  readonly savingYear = signal(false);

  readonly termYearId = signal('');
  readonly termName = signal('Term 1');
  readonly termOrdinal = signal(1);
  readonly termStart = signal('');
  readonly termEnd = signal('');
  readonly savingTerm = signal(false);

  readonly className = signal('');
  readonly classGrade = signal(6);
  readonly classYearId = signal('');
  readonly savingClass = signal(false);

  readonly day = day;

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [years, classes] = await Promise.all([
        this.api.get<{ years: AcademicYear[]; terms: Term[]; currentYearId: string | null }>('/years'),
        this.api.get<ClassSummary[]>('/classes'),
      ]);
      this.years.set(years.years);
      this.terms.set(years.terms);
      this.classes.set(classes);
      const preferred = years.currentYearId ?? years.years[0]?.id ?? '';
      this.classYearId.set(preferred);
      this.termYearId.set(preferred);
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.loading.set(false);
    }
  }

  termsFor(yearId: string): Term[] {
    return this.terms().filter((term) => term.yearId === yearId);
  }

  yearName(yearId: string): string {
    return this.years().find((year) => year.id === yearId)?.name ?? '—';
  }

  async createYear(event: Event): Promise<void> {
    event.preventDefault();
    if (this.savingYear()) return;
    this.savingYear.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      const year = await this.api.send<AcademicYear>('POST', '/years', {
        name: this.newYearName(),
        startsOn: this.yearStart(),
        endsOn: this.yearEnd(),
      });
      if (this.withTerms()) {
        for (const term of splitTerms(this.yearStart(), this.yearEnd())) {
          await this.api.send('POST', '/terms', { ...term, yearId: year.id });
        }
      }
      this.notice.set(`${year.name} created${this.withTerms() ? ' with three terms' : ''}.`);
      await this.load();
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.savingYear.set(false);
    }
  }

  async addTerm(event: Event): Promise<void> {
    event.preventDefault();
    if (this.savingTerm()) return;
    this.savingTerm.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      await this.api.send('POST', '/terms', {
        yearId: this.termYearId(),
        name: this.termName(),
        ordinal: this.termOrdinal(),
        startsOn: this.termStart(),
        endsOn: this.termEnd(),
      });
      this.notice.set(`${this.termName()} added.`);
      await this.load();
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.savingTerm.set(false);
    }
  }

  async createClass(event: Event): Promise<void> {
    event.preventDefault();
    if (this.savingClass()) return;
    this.savingClass.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      await this.api.send('POST', '/classes', {
        name: this.className(),
        gradeLevel: this.classGrade(),
        yearId: this.classYearId(),
      });
      this.notice.set(`${this.className()} created.`);
      this.className.set('');
      await this.load();
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.savingClass.set(false);
    }
  }
}
