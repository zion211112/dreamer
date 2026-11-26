import { Component, computed, inject, signal } from '@angular/core';
import { BenbenApi, ApiError } from './benben-api.service';
import { BenbenSession } from './benben-session.service';
import { describeError, fullName } from './benben-format';
import type {
  AssessmentDetail, AssessmentRow, ClassSummary, SchemeQuestion, Subject, Term,
} from './benben.models';

type SchemeRow = { type: 'mcq' | 'keyword'; marks: number; correctOption: number; keywords: string };
type AnswerValue = string | number;

@Component({
  selector: 'app-benben-assessments',
  template: `
    <div class="bb-page-head">
      <div>
        <p class="bb-eyebrow">Teaching &amp; marking</p>
        <h1>Assessments</h1>
        <p class="bb-lede">Auto-mark objective questions, then a principal or registrar confirms before marks count in reports.</p>
      </div>
      @if (session.can('marks.write')) {
        <button type="button" class="bb-btn bb-btn-primary" (click)="toggleCreate()">
          {{ createOpen() ? 'Close' : 'New assessment' }}
        </button>
      }
    </div>

    @if (error()) { <p class="bb-alert" role="alert">{{ error() }}</p> }
    @if (notice()) { <p class="bb-alert bb-alert-ok" role="status">{{ notice() }}</p> }

    @if (createOpen()) {
      <section class="bb-card" aria-labelledby="bb-assessment-form-title">
        <h2 id="bb-assessment-form-title">New assessment</h2>
        <p class="bb-card-sub">Add questions only when you want auto-marking; otherwise enter scores by hand.</p>
        @if (formError()) { <p class="bb-alert" role="alert">{{ formError() }}</p> }
        <form class="bb-form" (submit)="create($event)">
          <div class="bb-form-grid">
            <div class="bb-field">
              <label for="bb-a-class">Class</label>
              <select id="bb-a-class" required [value]="newClassId()" (change)="newClassId.set($any($event.target).value)">
                <option value="">Choose a class</option>
                @for (klass of classes(); track klass.id) { <option [value]="klass.id" [selected]="klass.id === newClassId()">{{ klass.name }}</option> }
              </select>
            </div>
            <div class="bb-field">
              <label for="bb-a-subject">Subject</label>
              <select id="bb-a-subject" required [value]="newSubjectId()" (change)="newSubjectId.set($any($event.target).value)">
                <option value="">Choose a subject</option>
                @for (subject of subjects(); track subject.id) { <option [value]="subject.id" [selected]="subject.id === newSubjectId()">{{ subject.name }}</option> }
              </select>
            </div>
            <div class="bb-field">
              <label for="bb-a-term">Term</label>
              <select id="bb-a-term" required [value]="newTermId()" (change)="newTermId.set($any($event.target).value)">
                @for (term of terms(); track term.id) { <option [value]="term.id" [selected]="term.id === newTermId()">{{ term.name }}</option> }
              </select>
            </div>
            <div class="bb-field">
              <label for="bb-a-title">Title</label>
              <input id="bb-a-title" required maxlength="160" [value]="newTitle()" (input)="newTitle.set($any($event.target).value)" placeholder="Numbers: end of topic" />
            </div>
            <div class="bb-field">
              <label for="bb-a-kind">Kind</label>
              <select id="bb-a-kind" [value]="newKind()" (change)="newKind.set($any($event.target).value === 'summative' ? 'summative' : 'formative')">
                <option value="formative" [selected]="newKind() === 'formative'">Formative</option>
                <option value="summative" [selected]="newKind() === 'summative'">Summative</option>
              </select>
            </div>
            <div class="bb-field">
              <label for="bb-a-max">Maximum score</label>
              <input id="bb-a-max" type="number" min="1" max="1000" [value]="newMaxScore()" (input)="newMaxScore.set(+$any($event.target).value)" />
            </div>
          </div>

          <fieldset style="border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); padding: 14px;">
            <legend class="bb-field-label">Auto-marking key (optional)</legend>
            @for (row of scheme(); track $index; let index = $index) {
              <div class="bb-scheme-row">
                <div class="bb-field">
                  <label [for]="'bb-q-type-' + index">Type</label>
                  <select [id]="'bb-q-type-' + index" [value]="row.type" (change)="updateScheme(index, 'type', $any($event.target).value)">
                    <option value="mcq">MCQ</option>
                    <option value="keyword">Keyword</option>
                  </select>
                </div>
                <div class="bb-field">
                  <label [for]="'bb-q-marks-' + index">Marks</label>
                  <input [id]="'bb-q-marks-' + index" type="number" min="1" [value]="row.marks" (input)="updateScheme(index, 'marks', +$any($event.target).value)" />
                </div>
                @if (row.type === 'mcq') {
                  <div class="bb-field">
                    <label [for]="'bb-q-option-' + index">Correct option</label>
                    <input [id]="'bb-q-option-' + index" type="number" min="0" [value]="row.correctOption" (input)="updateScheme(index, 'correctOption', +$any($event.target).value)" />
                  </div>
                } @else {
                  <div class="bb-field">
                    <label [for]="'bb-q-keywords-' + index">Keywords</label>
                    <input [id]="'bb-q-keywords-' + index" [value]="row.keywords" (input)="updateScheme(index, 'keywords', $any($event.target).value)" placeholder="photosynthesis, chlorophyll" />
                  </div>
                }
                <div></div>
                <button type="button" class="bb-btn bb-btn-ghost bb-btn-sm" (click)="removeScheme(index)" [attr.aria-label]="'Remove question ' + (index + 1)">Remove</button>
              </div>
            }
            <div class="bb-row" style="margin-top: 10px;">
              <button type="button" class="bb-btn bb-btn-sm" (click)="addScheme('mcq')">Add multiple choice</button>
              <button type="button" class="bb-btn bb-btn-sm" (click)="addScheme('keyword')">Add keyword</button>
              @if (scheme().length > 0) {
                <span class="bb-hint">Question marks total {{ schemeTotal() }}; must equal {{ newMaxScore() }}.</span>
              }
            </div>
          </fieldset>

          <div class="bb-row" style="justify-content: flex-end;">
            <button type="button" class="bb-btn bb-btn-ghost" (click)="toggleCreate()">Cancel</button>
            <button type="submit" class="bb-btn bb-btn-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Create assessment' }}</button>
          </div>
        </form>
      </section>
    }

    <section class="bb-card" aria-label="Assessment filters">
      <div class="bb-row">
        <div class="bb-field" style="flex: 1 1 220px;">
          <label for="bb-a-filter-class">Class</label>
          <select id="bb-a-filter-class" [value]="filterClassId()" (change)="setFilter('class', $any($event.target).value)">
            <option value="">All classes</option>
            @for (klass of classes(); track klass.id) { <option [value]="klass.id" [selected]="klass.id === filterClassId()">{{ klass.name }}</option> }
          </select>
        </div>
        <div class="bb-field" style="flex: 0 1 220px;">
          <label for="bb-a-filter-term">Term</label>
          <select id="bb-a-filter-term" [value]="filterTermId()" (change)="setFilter('term', $any($event.target).value)">
            <option value="">All terms</option>
            @for (term of terms(); track term.id) { <option [value]="term.id" [selected]="term.id === filterTermId()">{{ term.name }}</option> }
          </select>
        </div>
        <button type="button" class="bb-btn bb-btn-sm" (click)="loadAssessments()">Refresh</button>
      </div>
    </section>

    @if (listLoading()) {
      <p class="bb-loading" role="status">Loading assessments</p>
    } @else if (assessments().length === 0) {
      <div class="bb-empty"><strong>No assessments yet</strong>Create one to start marking. Auto-marked scores stay drafts until confirmed.</div>
    } @else {
      <div class="bb-table-wrap">
        <table class="bb-table">
          <caption>{{ assessments().length }} assessments</caption>
          <thead><tr><th scope="col">Assessment</th><th scope="col" class="bb-col-class">Class</th><th scope="col" class="bb-col-subject">Subject</th><th scope="col" class="bb-num">Marks</th><th scope="col"></th></tr></thead>
          <tbody>
            @for (row of assessments(); track row.id) {
              <tr>
                <td>
                  <button type="button" class="bb-linklike" (click)="openAssessment(row.id)">{{ row.title }}</button><br />
                  <span class="bb-hint">{{ row.className }} · {{ row.subjectName }} · {{ row.kind }}{{ row.hasScheme ? ' · auto-marking key' : '' }}</span>
                </td>
                <td class="bb-col-class">{{ row.className }}</td>
                <td class="bb-col-subject">{{ row.subjectName }}</td>
                <td class="bb-num">{{ row.marked }} marked<br /><span class="bb-hint">{{ row.confirmed }} confirmed · {{ row.drafts }} draft</span></td>
                <td><button type="button" class="bb-btn bb-btn-sm" (click)="openAssessment(row.id)">Open</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (detailLoading()) {
      <p class="bb-loading" role="status">Opening assessment</p>
    } @else if (detail(); as record) {
      <section id="bb-assessment-detail" class="bb-card" aria-labelledby="bb-assessment-detail-title">
        <div class="bb-card-head">
          <div>
            <p class="bb-eyebrow">{{ record.assessment.kind }} · max {{ record.assessment.maxScore }}</p>
            <h2 id="bb-assessment-detail-title">{{ record.assessment.title }}</h2>
            <p class="bb-card-sub">{{ record.roster.length }} learners on the roster</p>
          </div>
          <div class="bb-row">
            @if (session.can('marks.confirm')) {
              <button type="button" class="bb-btn bb-btn-sm" (click)="confirmAll()" [disabled]="busy()">Confirm drafts</button>
              <button type="button" class="bb-btn bb-btn-sm" (click)="reopen()" [disabled]="busy()">Reopen</button>
            }
            <button type="button" class="bb-btn bb-btn-ghost bb-btn-sm" (click)="closeDetail()">Close</button>
          </div>
        </div>

        @if (record.assessment.scheme) {
          <div class="bb-row" style="margin-bottom: 12px;">
            <div class="bb-seg" role="group" aria-label="Marking mode">
              <button type="button" [attr.aria-pressed]="mode() === 'auto'" (click)="mode.set('auto')">Answer sheets</button>
              <button type="button" [attr.aria-pressed]="mode() === 'manual'" (click)="mode.set('manual')">Scores</button>
            </div>
          </div>
        }

        @if (mode() === 'auto' && record.assessment.scheme; as scheme) {
          <p class="bb-hint" style="margin-bottom: 10px;">
            Enter each learner’s answers; the key marks them, and every result lands as a draft.
          </p>
          <div class="bb-table-wrap">
            <table class="bb-table bb-mark-table">
              <thead>
                <tr>
                  <th scope="col">Learner</th>
                  @for (question of scheme; track question.id; let index = $index) {
                    <th scope="col">{{ question.type === 'mcq' ? 'Q' + (index + 1) + ' option' : 'Q' + (index + 1) + ' answer' }}</th>
                  }
                  <th scope="col">Saved</th>
                </tr>
              </thead>
              <tbody>
                @for (row of record.roster; track row.learnerId) {
                  <tr>
                    <td>{{ fullName(row) }}<br /><span class="bb-hint bb-mono">{{ row.admissionNo }}</span></td>
                    @for (question of scheme; track question.id; let index = $index) {
                      <td [attr.data-label]="question.type === 'mcq' ? 'Q' + (index + 1) + ' option' : 'Q' + (index + 1) + ' answer'">
                        @if (question.type === 'mcq') {
                          <select class="bb-input" style="min-width: 88px;" [value]="answer(row.learnerId, question.id) ?? ''" (change)="setAnswer(row.learnerId, question.id, $any($event.target).value)" [disabled]="!session.can('marks.write') || row.mark?.status === 'confirmed'" [attr.aria-label]="fullName(row) + ' ' + question.id">
                            <option value="">—</option>
                            <option value="0" [selected]="optionSelected(row.learnerId, question.id, '0')">A</option>
                            <option value="1" [selected]="optionSelected(row.learnerId, question.id, '1')">B</option>
                            <option value="2" [selected]="optionSelected(row.learnerId, question.id, '2')">C</option>
                            <option value="3" [selected]="optionSelected(row.learnerId, question.id, '3')">D</option>
                          </select>
                        } @else {
                          <input class="bb-input" [value]="answer(row.learnerId, question.id) ?? ''" (input)="setAnswer(row.learnerId, question.id, $any($event.target).value)" [disabled]="!session.can('marks.write') || row.mark?.status === 'confirmed'" [attr.aria-label]="fullName(row) + ' ' + question.id" placeholder="Answer" />
                        }
                      </td>
                    }
                    <td>
                      @if (row.mark) {
                        <span class="bb-badge" [class]="row.mark.status === 'confirmed' ? 'bb-badge bb-badge-ok' : 'bb-badge bb-badge-warn'">{{ row.mark.score }}/{{ record.assessment.maxScore }} {{ row.mark.status }}</span>
                      } @else { <span class="bb-muted">—</span> }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (session.can('marks.write')) {
            <div class="bb-row" style="margin-top: 12px; justify-content: flex-end;">
              <button type="button" class="bb-btn bb-btn-primary" [disabled]="busy()" (click)="autoMark(scheme)">
                {{ busy() ? 'Marking…' : 'Auto-mark entered sheets' }}
              </button>
            </div>
          }
        } @else {
          <div class="bb-table-wrap">
            <table class="bb-table bb-mark-table">
              <thead><tr><th scope="col">Learner</th><th scope="col">Score / {{ record.assessment.maxScore }}</th><th scope="col">Saved</th></tr></thead>
              <tbody>
                @for (row of record.roster; track row.learnerId) {
                  <tr>
                    <td>{{ fullName(row) }}<br /><span class="bb-hint bb-mono">{{ row.admissionNo }}</span></td>
                    <td [attr.data-label]="'Score / ' + record.assessment.maxScore"><input class="bb-input" style="max-width: 100px;" type="number" min="0" [max]="record.assessment.maxScore" [value]="score(row.learnerId) ?? row.mark?.score ?? ''" (input)="setScore(row.learnerId, $any($event.target).value)" [disabled]="!session.can('marks.write') || row.mark?.status === 'confirmed'" [attr.aria-label]="'Score for ' + fullName(row)" /></td>
                    <td>
                      @if (row.mark) {
                        <span class="bb-badge" [class]="row.mark.status === 'confirmed' ? 'bb-badge bb-badge-ok' : 'bb-badge bb-badge-warn'">{{ row.mark.score }}/{{ record.assessment.maxScore }} {{ row.mark.status }}</span>
                      } @else { <span class="bb-muted">—</span> }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (session.can('marks.write')) {
            <div class="bb-row" style="margin-top: 12px; justify-content: flex-end;">
              <button type="button" class="bb-btn bb-btn-primary" [disabled]="busy()" (click)="saveScores()">
                {{ busy() ? 'Saving…' : 'Save scores as drafts' }}
              </button>
            </div>
          }
        }
      </section>
    }
  `,
})
export class BenbenAssessmentsComponent {
  readonly session = inject(BenbenSession);
  private readonly api = inject(BenbenApi);

  readonly assessments = signal<AssessmentRow[]>([]);
  readonly classes = signal<ClassSummary[]>([]);
  readonly subjects = signal<Subject[]>([]);
  readonly terms = signal<Term[]>([]);
  readonly listLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly filterClassId = signal('');
  readonly filterTermId = signal('');

  readonly createOpen = signal(false);
  readonly newClassId = signal('');
  readonly newSubjectId = signal('');
  readonly newTermId = signal('');
  readonly newTitle = signal('');
  readonly newKind = signal<'formative' | 'summative'>('formative');
  readonly newMaxScore = signal(10);
  readonly scheme = signal<SchemeRow[]>([]);
  readonly formError = signal<string | null>(null);
  readonly saving = signal(false);

  readonly detail = signal<AssessmentDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly busy = signal(false);
  readonly mode = signal<'auto' | 'manual'>('auto');
  readonly answers = signal<Record<string, Record<string, AnswerValue>>>({});
  readonly scores = signal<Record<string, string>>({});

  readonly fullName = fullName;
  readonly schemeTotal = computed(() => this.scheme().reduce((total, row) => total + (Number(row.marks) || 0), 0));

  constructor() {
    void this.bootstrap();
  }

  async bootstrap(): Promise<void> {
    try {
      const [classes, subjects, years] = await Promise.all([
        this.api.get<ClassSummary[]>('/classes'),
        this.api.get<Subject[]>('/subjects'),
        this.api.get<{ terms: Term[]; currentTermId: string | null }>('/years'),
      ]);
      this.classes.set(classes);
      this.subjects.set(subjects);
      this.terms.set(years.terms);
      const current = years.currentTermId ?? years.terms[0]?.id ?? '';
      this.newTermId.set(current);
      this.filterTermId.set(current);
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    }
    await this.loadAssessments();
  }

  async loadAssessments(): Promise<void> {
    this.listLoading.set(true);
    this.error.set(null);
    try {
      const params = new URLSearchParams();
      if (this.filterClassId()) params.set('classId', this.filterClassId());
      if (this.filterTermId()) params.set('termId', this.filterTermId());
      const query = params.size > 0 ? `?${params.toString()}` : '';
      this.assessments.set(await this.api.get<AssessmentRow[]>(`/assessments${query}`));
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.listLoading.set(false);
    }
  }

  setFilter(kind: 'class' | 'term', value: string): void {
    if (kind === 'class') this.filterClassId.set(value);
    else this.filterTermId.set(value);
    void this.loadAssessments();
  }

  toggleCreate(): void {
    this.createOpen.update((open) => !open);
    this.formError.set(null);
  }

  addScheme(type: 'mcq' | 'keyword'): void {
    this.scheme.update((rows) => [...rows, { type, marks: 1, correctOption: 0, keywords: '' }]);
  }

  removeScheme(index: number): void {
    this.scheme.update((rows) => rows.filter((_, position) => position !== index));
  }

  updateScheme(index: number, field: keyof SchemeRow, value: string | number): void {
    this.scheme.update((rows) => rows.map((row, position) => position === index ? { ...row, [field]: value } : row));
  }

  private buildScheme(): SchemeQuestion[] | null {
    const rows = this.scheme();
    if (rows.length === 0) return null;
    return rows.map((row, index) => row.type === 'mcq'
      ? { id: `q${index + 1}`, type: 'mcq', marks: Number(row.marks), correctOption: Number(row.correctOption) }
      : { id: `q${index + 1}`, type: 'keyword', marks: Number(row.marks), keywords: row.keywords.split(',').map((word) => word.trim()).filter(Boolean) });
  }

  async create(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.formError.set(null);
    const scheme = this.buildScheme();
    if (scheme && this.schemeTotal() !== this.newMaxScore()) {
      this.formError.set(`Question marks total ${this.schemeTotal()}; set the maximum to match, or adjust the questions.`);
      return;
    }
    this.saving.set(true);
    try {
      await this.api.send('POST', '/assessments', {
        classId: this.newClassId(),
        subjectId: this.newSubjectId(),
        termId: this.newTermId(),
        title: this.newTitle(),
        kind: this.newKind(),
        maxScore: this.newMaxScore(),
        scheme,
      });
      this.notice.set('Assessment created.');
      this.createOpen.set(false);
      this.newTitle.set('');
      this.scheme.set([]);
      await this.loadAssessments();
    } catch (error) {
      this.formError.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.saving.set(false);
    }
  }

  async openAssessment(id: string): Promise<void> {
    this.detailLoading.set(true);
    this.error.set(null);
    this.answers.set({});
    this.scores.set({});
    try {
      const detail = await this.api.get<AssessmentDetail>(`/assessments/${id}`);
      this.detail.set(detail);
      this.mode.set(detail.assessment.scheme ? 'auto' : 'manual');
      const saved: Record<string, Record<string, AnswerValue>> = {};
      for (const row of detail.roster) {
        const responses = row.mark?.answers?.responses;
        if (!responses) continue;
        for (const [questionId, value] of Object.entries(responses)) {
          if (value === null || value === undefined) continue;
          saved[row.learnerId] = { ...(saved[row.learnerId] ?? {}), [questionId]: value };
        }
      }
      this.answers.set(saved);
      setTimeout(() => document.getElementById('bb-assessment-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.detailLoading.set(false);
    }
  }

  closeDetail(): void {
    this.detail.set(null);
  }

  answer(learnerId: string, questionId: string): AnswerValue | undefined {
    return this.answers()[learnerId]?.[questionId];
  }

  optionSelected(learnerId: string, questionId: string, option: string): boolean {
    return String(this.answer(learnerId, questionId) ?? '') === option;
  }

  setAnswer(learnerId: string, questionId: string, value: string): void {
    this.answers.update((current) => ({
      ...current,
      [learnerId]: { ...(current[learnerId] ?? {}), [questionId]: value },
    }));
  }

  score(learnerId: string): string | undefined {
    return this.scores()[learnerId];
  }

  setScore(learnerId: string, value: string): void {
    this.scores.update((current) => ({ ...current, [learnerId]: value }));
  }

  async autoMark(scheme: SchemeQuestion[]): Promise<void> {
    if (this.busy()) return;
    const detail = this.detail();
    if (!detail) return;
    const confirmed = new Set(detail.roster.filter((row) => row.mark?.status === 'confirmed').map((row) => row.learnerId));
    const entries = [];
    for (const [learnerId, values] of Object.entries(this.answers())) {
      if (confirmed.has(learnerId)) continue;
      const answers: Record<string, AnswerValue> = {};
      let touched = false;
      for (const question of scheme) {
        const raw = values[question.id];
        if (raw === undefined || raw === '') continue;
        touched = true;
        answers[question.id] = question.type === 'mcq' ? Number(raw) : String(raw);
      }
      if (touched) entries.push({ learnerId, answers });
    }
    if (entries.length === 0) {
      this.formError.set(null);
      this.notice.set('Enter at least one answer before auto-marking.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      const result = await this.api.send<{ saved: number }>('POST', `/assessments/${detail.assessment.id}/auto-mark`, { entries });
      this.notice.set(`Auto-marked ${result.saved} sheet${result.saved === 1 ? '' : 's'} as drafts. Confirm when you have checked them.`);
      this.answers.set({});
      await this.openAssessment(detail.assessment.id);
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.busy.set(false);
    }
  }

  async saveScores(): Promise<void> {
    if (this.busy()) return;
    const detail = this.detail();
    if (!detail) return;
    const entries = Object.entries(this.scores())
      .filter(([, value]) => value !== '')
      .map(([learnerId, value]) => ({ learnerId, score: Number(value) }));
    if (entries.length === 0) {
      this.notice.set('Enter at least one score.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.send('PUT', `/assessments/${detail.assessment.id}/marks`, { entries });
      this.notice.set(`Saved ${entries.length} marks as drafts.`);
      this.scores.set({});
      await this.openAssessment(detail.assessment.id);
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.busy.set(false);
    }
  }

  async confirmAll(): Promise<void> {
    const detail = this.detail();
    if (!detail || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      const result = await this.api.send<{ confirmed: number }>('POST', `/assessments/${detail.assessment.id}/confirm`, {});
      this.notice.set(`Confirmed ${result.confirmed} marks. They now count in term reports.`);
      await this.openAssessment(detail.assessment.id);
      await this.loadAssessments();
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.busy.set(false);
    }
  }

  async reopen(): Promise<void> {
    const detail = this.detail();
    if (!detail || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      const result = await this.api.send<{ reopened: number }>('POST', `/assessments/${detail.assessment.id}/reopen`, {});
      this.notice.set(`Reopened ${result.reopened} confirmed marks for correction.`);
      await this.openAssessment(detail.assessment.id);
      await this.loadAssessments();
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.busy.set(false);
    }
  }
}
