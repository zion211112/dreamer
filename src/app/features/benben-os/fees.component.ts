import { Component, computed, inject, signal } from '@angular/core';
import { BenbenApi, ApiError } from './benben-api.service';
import { BenbenSession } from './benben-session.service';
import { describeError, fullName, kes } from './benben-format';
import type { AcademicYear, ClassSummary, FeeStructure, Ledger, LearnerRow, Term } from './benben.models';

@Component({
  selector: 'app-benben-fees',
  template: `
    <div class="bb-page-head">
      <div>
        <p class="bb-eyebrow">Ledger</p>
        <h1>Fees</h1>
        <p class="bb-lede">Invoice a term in one action, then record payments against the same ledger the report card reads.</p>
      </div>
    </div>

    @if (error()) { <p class="bb-alert" role="alert">{{ error() }}</p> }
    @if (notice()) { <p class="bb-alert bb-alert-ok" role="status">{{ notice() }}</p> }

    <section class="bb-card" aria-label="Term selector">
      <div class="bb-row">
        <div class="bb-field" style="flex: 0 1 260px;">
          <label for="bb-f-term">Term</label>
          <select id="bb-f-term" [value]="termId()" (change)="chooseTerm($any($event.target).value)">
            @for (term of terms(); track term.id) { <option [value]="term.id" [selected]="term.id === termId()">{{ term.name }}</option> }
          </select>
        </div>
        @if (ledger(); as data) {
          <span class="bb-hint">Invoiced across {{ data.learners.length }} active learners</span>
        }
      </div>
    </section>

    @if (loading()) {
      <p class="bb-loading" role="status">Loading the ledger</p>
    } @else if (ledger(); as data) {
      <section class="bb-grid bb-grid-3 bb-stats-row bb-stats-money" aria-label="Fee totals">
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Invoiced</span>
          <span class="bb-stat-value">{{ kes(data.totals.invoicedCents) }}</span>
          <span class="bb-stat-note">{{ data.term.name }}</span>
        </div>
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Collected</span>
          <span class="bb-stat-value">{{ kes(data.totals.paidCents) }}</span>
          <span class="bb-stat-note">All payments on record</span>
        </div>
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Outstanding</span>
          <span class="bb-stat-value">{{ kes(data.totals.balanceCents) }}</span>
          <span class="bb-stat-note">Invoiced less paid</span>
        </div>
      </section>

      <div class="bb-split">
        <div class="bb-table-wrap">
          <table class="bb-table bb-fees-table">
            <caption>Learner ledger</caption>
            <thead><tr><th scope="col">Learner</th><th scope="col" class="bb-num">Invoiced</th><th scope="col" class="bb-num">Paid</th><th scope="col" class="bb-num">Balance</th></tr></thead>
            <tbody>
              @for (row of data.learners; track row.learnerId) {
                <tr>
                  <td>{{ fullName(row) }}<br /><span class="bb-hint">{{ row.className ?? '—' }} · <span class="bb-mono">{{ row.admissionNo }}</span></span></td>
                  <td class="bb-num" data-label="Invoiced">{{ kes(row.invoicedCents) }}</td>
                  <td class="bb-num" data-label="Paid">{{ kes(row.paidCents) }}</td>
                  <td class="bb-num" data-label="Balance">
                    @if (row.balanceCents > 0) { <span class="bb-badge bb-badge-warn">{{ kes(row.balanceCents) }}</span> }
                    @else if (row.balanceCents < 0) { <span class="bb-badge bb-badge-info">credit {{ kes(-row.balanceCents) }}</span> }
                    @else { <span class="bb-badge bb-badge-ok">settled</span> }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="4"><div class="bb-empty"><strong>No learners on the ledger</strong>Enrol learners and generate invoices first.</div></td></tr>
              }
            </tbody>
          </table>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          @if (session.can('fees.write')) {
            <section class="bb-card" aria-labelledby="bb-pay-title">
              <h2 id="bb-pay-title">Record a payment</h2>
              <p class="bb-card-sub">Bank slip, M-Pesa, or cash received at the office.</p>
              @if (payError()) { <p class="bb-alert" role="alert">{{ payError() }}</p> }
              <form class="bb-form" (submit)="recordPayment($event)">
                <div class="bb-field">
                  <label for="bb-pay-learner">Learner</label>
                  <select id="bb-pay-learner" required [value]="payLearnerId()" (change)="payLearnerId.set($any($event.target).value)">
                    <option value="">Choose a learner</option>
                    @for (learner of learners(); track learner.id) {
                      <option [value]="learner.id" [selected]="learner.id === payLearnerId()">{{ learner.lastName }}, {{ learner.firstName }} · {{ learner.admissionNo }}</option>
                    }
                  </select>
                </div>
                <div class="bb-form-grid">
                  <div class="bb-field">
                    <label for="bb-pay-amount">Amount (KES)</label>
                    <input id="bb-pay-amount" required inputmode="decimal" [value]="payAmount()" (input)="payAmount.set($any($event.target).value)" placeholder="12500" />
                  </div>
                  <div class="bb-field">
                    <label for="bb-pay-method">Method</label>
                    <select id="bb-pay-method" [value]="payMethod()" (change)="payMethod.set($any($event.target).value)">
                      <option value="mpesa" [selected]="payMethod() === 'mpesa'">M-Pesa</option>
                      <option value="bank" [selected]="payMethod() === 'bank'">Bank</option>
                      <option value="cash" [selected]="payMethod() === 'cash'">Cash</option>
                      <option value="cheque" [selected]="payMethod() === 'cheque'">Cheque</option>
                    </select>
                  </div>
                  <div class="bb-field">
                    <label for="bb-pay-ref">Reference</label>
                    <input id="bb-pay-ref" [value]="payReference()" (input)="payReference.set($any($event.target).value)" placeholder="Optional slip no." />
                  </div>
                </div>
                <button type="submit" class="bb-btn bb-btn-primary" [disabled]="paying()">{{ paying() ? 'Recording…' : 'Record payment' }}</button>
              </form>
            </section>

            <section class="bb-card" aria-labelledby="bb-invoice-title">
              <h2 id="bb-invoice-title">Generate invoices</h2>
              <p class="bb-card-sub">Idempotent: learners already billed for this term are skipped.</p>
              <form class="bb-form" (submit)="generateInvoices($event)">
                <div class="bb-field">
                  <label for="bb-inv-fee">Fee structure</label>
                  <select id="bb-inv-fee" required [value]="invoiceFeeId()" (change)="invoiceFeeId.set($any($event.target).value)">
                    <option value="">Choose a fee structure</option>
                    @for (fee of structures(); track fee.id) {
                      <option [value]="fee.id" [selected]="fee.id === invoiceFeeId()">{{ fee.name }} · {{ kes(fee.amountCents) }}{{ fee.gradeLevel ? ' · Grade ' + fee.gradeLevel : '' }}</option>
                    }
                  </select>
                </div>
                <div class="bb-field">
                  <label for="bb-inv-class">Class (optional)</label>
                  <select id="bb-inv-class" [value]="invoiceClassId()" (change)="invoiceClassId.set($any($event.target).value)">
                    <option value="">All classes</option>
                    @for (klass of classes(); track klass.id) { <option [value]="klass.id" [selected]="klass.id === invoiceClassId()">{{ klass.name }}</option> }
                  </select>
                </div>
                <button type="submit" class="bb-btn" [disabled]="invoicing()">{{ invoicing() ? 'Generating…' : 'Generate for term' }}</button>
              </form>
            </section>
          }
        </div>
      </div>
    }

    <section class="bb-card" aria-labelledby="bb-structures-title">
      <div class="bb-card-head">
        <div>
          <h2 id="bb-structures-title">Fee structures</h2>
          <p class="bb-card-sub">What a term costs, by grade or whole school.</p>
        </div>
      </div>
      @if (structures().length === 0) {
        <div class="bb-empty"><strong>No fee structure yet</strong>Add one below before generating invoices.</div>
      } @else {
        <ul class="bb-list">
          @for (fee of structures(); track fee.id) {
            <li>
              <span>{{ fee.name }} · {{ fee.gradeLevel ? 'Grade ' + fee.gradeLevel : 'All grades' }}</span>
              <span class="bb-mono">{{ kes(fee.amountCents) }} · {{ fee.yearName }}</span>
            </li>
          }
        </ul>
      }
      @if (session.can('fees.write')) {
        @if (feeError()) { <p class="bb-alert" role="alert" style="margin-top: 12px;">{{ feeError() }}</p> }
        <form class="bb-form" style="margin-top: 16px;" (submit)="createStructure($event)">
          <div class="bb-form-grid">
            <div class="bb-field">
              <label for="bb-fee-year">Academic year</label>
              <select id="bb-fee-year" required [value]="feeYearId()" (change)="feeYearId.set($any($event.target).value)">
                @for (year of years(); track year.id) { <option [value]="year.id" [selected]="year.id === feeYearId()">{{ year.name }}</option> }
              </select>
            </div>
            <div class="bb-field">
              <label for="bb-fee-name">Name</label>
              <input id="bb-fee-name" required [value]="feeName()" (input)="feeName.set($any($event.target).value)" placeholder="Term 1 tuition" />
            </div>
            <div class="bb-field">
              <label for="bb-fee-grade">Grade</label>
              <select id="bb-fee-grade" [value]="feeGrade()" (change)="feeGrade.set(+$any($event.target).value)">
                <option value="0" [selected]="feeGrade() === 0">All grades</option>
                <option value="4" [selected]="feeGrade() === 4">Grade 4</option>
                <option value="5" [selected]="feeGrade() === 5">Grade 5</option>
                <option value="6" [selected]="feeGrade() === 6">Grade 6</option>
                <option value="7" [selected]="feeGrade() === 7">Grade 7</option>
                <option value="8" [selected]="feeGrade() === 8">Grade 8</option>
                <option value="9" [selected]="feeGrade() === 9">Grade 9</option>
              </select>
            </div>
            <div class="bb-field">
              <label for="bb-fee-amount">Amount (KES)</label>
              <input id="bb-fee-amount" required inputmode="decimal" [value]="feeAmount()" (input)="feeAmount.set($any($event.target).value)" placeholder="12500" />
            </div>
          </div>
          <div class="bb-row" style="justify-content: flex-end;">
            <button type="submit" class="bb-btn" [disabled]="feeSaving()">{{ feeSaving() ? 'Saving…' : 'Add fee structure' }}</button>
          </div>
        </form>
      }
    </section>
  `,
})
export class BenbenFeesComponent {
  readonly session = inject(BenbenSession);
  private readonly api = inject(BenbenApi);

  readonly terms = signal<Term[]>([]);
  readonly years = signal<AcademicYear[]>([]);
  readonly classes = signal<ClassSummary[]>([]);
  readonly learners = signal<LearnerRow[]>([]);
  readonly structures = signal<FeeStructure[]>([]);
  readonly ledger = signal<Ledger | null>(null);
  readonly termId = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly payLearnerId = signal('');
  readonly payAmount = signal('');
  readonly payMethod = signal('mpesa');
  readonly payReference = signal('');
  readonly paying = signal(false);
  readonly payError = signal<string | null>(null);

  readonly invoiceFeeId = signal('');
  readonly invoiceClassId = signal('');
  readonly invoicing = signal(false);

  readonly feeYearId = signal('');
  readonly feeName = signal('');
  readonly feeGrade = signal(0);
  readonly feeAmount = signal('');
  readonly feeSaving = signal(false);
  readonly feeError = signal<string | null>(null);

  readonly fullName = fullName;
  readonly kes = kes;

  readonly outstandingLearners = computed(() =>
    (this.ledger()?.learners ?? []).filter((row) => row.balanceCents > 0).length);

  constructor() {
    void this.bootstrap();
  }

  async bootstrap(): Promise<void> {
    this.loading.set(true);
    try {
      const [years, classes, learners, structures] = await Promise.all([
        this.api.get<{ years: AcademicYear[]; terms: Term[]; currentTermId: string | null }>('/years'),
        this.api.get<ClassSummary[]>('/classes'),
        this.api.get<LearnerRow[]>('/learners'),
        this.api.get<FeeStructure[]>('/fees/structures'),
      ]);
      this.years.set(years.years);
      this.terms.set(years.terms);
      this.classes.set(classes);
      this.learners.set(learners);
      this.structures.set(structures);
      this.feeYearId.set(years.years[0]?.id ?? '');
      const termId = years.currentTermId ?? years.terms[0]?.id ?? '';
      if (termId) {
        this.termId.set(termId);
        await this.loadLedger();
      }
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.loading.set(false);
    }
  }

  async chooseTerm(termId: string): Promise<void> {
    this.termId.set(termId);
    await this.loadLedger();
  }

  async loadLedger(): Promise<void> {
    if (!this.termId()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      this.ledger.set(await this.api.get<Ledger>(`/fees/ledger?termId=${this.termId()}`));
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.loading.set(false);
    }
  }

  async recordPayment(event: Event): Promise<void> {
    event.preventDefault();
    if (this.paying()) return;
    this.payError.set(null);
    this.paying.set(true);
    try {
      await this.api.send('POST', '/fees/payments', {
        learnerId: this.payLearnerId(),
        amountKes: this.payAmount(),
        method: this.payMethod(),
        reference: this.payReference() || null,
      });
      this.notice.set(`Payment of ${kes(this.amountCents())} recorded.`);
      this.payAmount.set('');
      this.payReference.set('');
      await this.loadLedger();
    } catch (error) {
      this.payError.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.paying.set(false);
    }
  }

  amountCents(): number {
    const parsed = Number(this.payAmount().replaceAll(',', ''));
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  }

  async generateInvoices(event: Event): Promise<void> {
    event.preventDefault();
    if (this.invoicing()) return;
    this.invoicing.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      const result = await this.api.send<{ created: number; skipped: number }>('POST', '/fees/invoices', {
        termId: this.termId(),
        feeStructureId: this.invoiceFeeId(),
        classId: this.invoiceClassId() || null,
      });
      this.notice.set(`${result.created} invoices created; ${result.skipped} already existed.`);
      await this.loadLedger();
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.invoicing.set(false);
    }
  }

  async createStructure(event: Event): Promise<void> {
    event.preventDefault();
    if (this.feeSaving()) return;
    this.feeSaving.set(true);
    this.feeError.set(null);
    this.notice.set(null);
    try {
      await this.api.send('POST', '/fees/structures', {
        yearId: this.feeYearId(),
        name: this.feeName(),
        gradeLevel: this.feeGrade() === 0 ? null : this.feeGrade(),
        amountKes: this.feeAmount(),
      });
      this.notice.set('Fee structure added.');
      this.feeName.set('');
      this.feeAmount.set('');
      this.structures.set(await this.api.get<FeeStructure[]>('/fees/structures'));
    } catch (error) {
      this.feeError.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.feeSaving.set(false);
    }
  }
}
