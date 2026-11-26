import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BenbenApi, ApiError } from './benben-api.service';
import { BenbenSession } from './benben-session.service';
import { describeError, day, kes, moment, percent } from './benben-format';
import type { Overview } from './benben.models';

@Component({
  selector: 'app-benben-overview',
  imports: [RouterLink],
  template: `
    <div class="bb-page-head">
      <div>
        <p class="bb-eyebrow">School operations</p>
        <h1>Today at {{ session.me()?.school.name ?? 'your school' }}</h1>
        <p class="bb-lede">
          @if (data(); as overview) {
            @if (overview.term) {
              {{ overview.term.name }}, {{ day(overview.term.startsOn) }} – {{ day(overview.term.endsOn) }}.
            }
            Attendance, marking, and fee position at a glance.
          } @else {
            Term dates, attendance, marking, and fee position at a glance.
          }
        </p>
      </div>
      <div class="bb-row">
        @if (session.can('attendance.write')) {
          <a class="bb-btn" routerLink="/benben-os/attendance">Mark attendance</a>
        }
        @if (session.can('marks.write')) {
          <a class="bb-btn bb-btn-primary" routerLink="/benben-os/assessments">Enter marks</a>
        } @else if (session.can('marks.confirm')) {
          <a class="bb-btn bb-btn-primary" routerLink="/benben-os/assessments">Review marks</a>
        } @else if (session.can('reports.read')) {
          <a class="bb-btn bb-btn-primary" routerLink="/benben-os/reports">View reports</a>
        }
      </div>
    </div>

    @if (error()) {
      <p class="bb-alert" role="alert">{{ error() }}</p>
    }

    @if (loading()) {
      <p class="bb-loading" role="status">Loading the school day</p>
    } @else if (data(); as overview) {
      <section class="bb-grid bb-grid-4" aria-label="School totals">
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Active learners</span>
          <span class="bb-stat-value">{{ overview.counts.learners }}</span>
          <a class="bb-stat-note" routerLink="/benben-os/learners">View register</a>
        </div>
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Classes</span>
          <span class="bb-stat-value">{{ overview.counts.classes }}</span>
          <span class="bb-stat-note">{{ overview.counts.staff }} active staff</span>
        </div>
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Draft marks</span>
          <span class="bb-stat-value">{{ overview.counts.draftMarks }}</span>
          <a class="bb-stat-note" routerLink="/benben-os/assessments">Awaiting confirmation</a>
        </div>
        <div class="bb-card bb-stat">
          <span class="bb-stat-label">Term fees outstanding</span>
          <span class="bb-stat-value" style="font-size: 24px;">{{ kes(outstanding()) }}</span>
          <span class="bb-stat-note">{{ kes(overview.fees.paidCents) }} collected</span>
        </div>
      </section>

      <section class="bb-split">
        <div class="bb-card">
          <div class="bb-card-head">
            <div>
              <h2>Attendance today</h2>
              <p class="bb-card-sub">{{ day(overview.attendance.day) }}</p>
            </div>
            <a class="bb-btn bb-btn-sm" routerLink="/benben-os/attendance">Open register</a>
          </div>
          @if (attendanceTotal() === 0) {
            <div class="bb-empty">
              <strong>Not marked yet</strong>
              Mark today’s register so families and reports see an accurate day.
            </div>
          } @else {
            <div class="bb-bar" role="img" [attr.aria-label]="attendanceLabel(overview)">
              <span class="bb-bar-present" [style.width.%]="share(overview.attendance.present)"></span>
              <span class="bb-bar-late" [style.width.%]="share(overview.attendance.late)"></span>
              <span class="bb-bar-excused" [style.width.%]="share(overview.attendance.excused)"></span>
              <span class="bb-bar-absent" [style.width.%]="share(overview.attendance.absent)"></span>
            </div>
            <div class="bb-legend">
              <span><i class="bb-bar-present"></i>{{ overview.attendance.present }} present</span>
              <span><i class="bb-bar-late"></i>{{ overview.attendance.late }} late</span>
              <span><i class="bb-bar-excused"></i>{{ overview.attendance.excused }} excused</span>
              <span><i class="bb-bar-absent"></i>{{ overview.attendance.absent }} absent</span>
            </div>
            <p class="bb-hint" style="margin-top: 12px;">
              {{ percent(presentRate(overview)) }} of marked learners are present or late.
            </p>
          }
        </div>

        <div class="bb-card">
          <div class="bb-card-head">
            <div>
              <h2>Fee position</h2>
              <p class="bb-card-sub">Invoiced this term against payments received</p>
            </div>
          </div>
          <dl class="bb-dl">
            <dt>Invoiced</dt><dd class="bb-mono">{{ kes(overview.fees.invoicedCents) }}</dd>
            <dt>Paid</dt><dd class="bb-mono">{{ kes(overview.fees.paidCents) }}</dd>
            <dt>Outstanding</dt><dd class="bb-mono">{{ kes(outstanding()) }}</dd>
          </dl>
          @if (session.can('fees.read')) {
            <hr class="bb-divider" />
            <a class="bb-btn bb-btn-sm" routerLink="/benben-os/fees">Open fee ledger</a>
          }
        </div>
      </section>

      <section class="bb-card">
        <div class="bb-card-head">
          <div>
            <h2>Recent activity</h2>
            <p class="bb-card-sub">Every change is attributed to a staff member</p>
          </div>
          @if (session.can('audit.read')) {
            <a class="bb-btn bb-btn-sm" routerLink="/benben-os/staff">Full audit trail</a>
          }
        </div>
        @if (overview.recentAudit.length === 0) {
          <div class="bb-empty"><strong>No activity yet</strong>Actions you take will appear here.</div>
        } @else {
          <ul class="bb-list">
            @for (event of overview.recentAudit; track event.id) {
              <li>
                <span>{{ event.memberName ?? 'System' }} · {{ label(event.action) }}</span>
                <span class="bb-muted bb-mono" style="font-size: 11px;">{{ moment(event.occurredAt) }}</span>
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
})
export class BenbenOverviewComponent {
  readonly session = inject(BenbenSession);
  private readonly api = inject(BenbenApi);

  readonly data = signal<Overview | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly kes = kes;
  readonly day = day;
  readonly moment = moment;
  readonly percent = percent;

  readonly outstanding = computed(() => {
    const overview = this.data();
    return overview ? overview.fees.invoicedCents - overview.fees.paidCents : 0;
  });

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.data.set(await this.api.get<Overview>('/overview'));
    } catch (error) {
      this.error.set(error instanceof ApiError ? describeError(error.code) : describeError(null));
    } finally {
      this.loading.set(false);
    }
  }

  attendanceTotal(): number {
    const row = this.data()?.attendance;
    return row ? row.present + row.absent + row.late + row.excused : 0;
  }

  share(count: number): number {
    const total = this.attendanceTotal();
    return total === 0 ? 0 : (count / total) * 100;
  }

  presentRate(overview: Overview): number {
    const total = this.attendanceTotal();
    return total === 0 ? 0 : ((overview.attendance.present + overview.attendance.late) / total) * 100;
  }

  attendanceLabel(overview: Overview): string {
    const a = overview.attendance;
    return `${a.present} present, ${a.late} late, ${a.excused} excused, ${a.absent} absent`;
  }

  label(action: string): string {
    const [, verb] = action.split('.');
    const nouns: Record<string, string> = {
      created: 'created a record', updated: 'updated a record', confirmed: 'confirmed marks', reopened: 'reopened marks',
      marked: 'marked attendance', saved: 'saved marks', recorded: 'recorded a payment',
      invited: 'invited a staff member', removed: 'removed an assignment', enrolled: 'enrolled a learner',
      generated: 'generated invoices',
    };
    return nouns[verb ?? ''] ?? action.replaceAll('.', ' ');
  }
}
