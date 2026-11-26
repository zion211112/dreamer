import { Component, computed, inject, signal } from '@angular/core';
import { BenbenApi, ApiError } from './benben-api.service';
import { BenbenSession } from './benben-session.service';
import { describeError, moment, roleLabel } from './benben-format';
import type { AssignmentRow, AuditRow, BBRole, ClassSummary, StaffRow, Subject } from './benben.models';

@Component({
  selector: 'app-benben-staff',
  template: `
    <div class="bb-page-head">
      <div>
        <p class="bb-eyebrow">People &amp; authority</p>
        <h1>Staff &amp; access</h1>
        <p class="bb-lede">Invite by email, set the role that governs what the server allows, and scope teachers to their classes.</p>
      </div>
    </div>

    @if (error()) { <p class="bb-alert" role="alert">{{ error() }}</p> }
    @if (notice()) { <p class="bb-alert bb-alert-ok" role="status">{{ notice() }}</p> }

    <section class="bb-card" aria-labelledby="bb-invite-title">
      <h2 id="bb-invite-title">Invite a staff member</h2>
      <p class="bb-card-sub">They claim the invitation by signing up with this email. Authority always comes from the school membership, never the browser.</p>
      @if (inviteError()) { <p class="bb-alert" role="alert">{{ inviteError() }}</p> }
      <form class="bb-form" (submit)="invite($event)">
        <div class="bb-form-grid">
          <div class="bb-field">
            <label for="bb-s-name">Full name</label>
            <input id="bb-s-name" required [value]="newName()" (input)="newName.set($any($event.target).value)" placeholder="Amina Otieno" />
          </div>
          <div class="bb-field">
            <label for="bb-s-email">Email</label>
            <input id="bb-s-email" type="email" required [value]="newEmail()" (input)="newEmail.set($any($event.target).value)" placeholder="amina@school.ac.ke" />
          </div>
          <div class="bb-field">
            <label for="bb-s-role">Role</label>
            <select id="bb-s-role" [value]="newRole()" (change)="newRole.set($any($event.target).value)">
              <option value="registrar" [selected]="newRole() === 'registrar'">Registrar</option>
              <option value="teacher" [selected]="newRole() === 'teacher'">Teacher</option>
              <option value="bursar" [selected]="newRole() === 'bursar'">Bursar</option>
            </select>
          </div>
        </div>
        <div class="bb-row" style="justify-content: flex-end;">
          <button type="submit" class="bb-btn bb-btn-primary" [disabled]="inviting()">{{ inviting() ? 'Inviting…' : 'Send invitation' }}</button>
        </div>
      </form>
    </section>

    @if (loading()) {
      <p class="bb-loading" role="status">Loading staff</p>
    } @else {
      <div class="bb-table-wrap">
        <table class="bb-table">
          <caption>{{ staff().length }} members</caption>
          <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Assignments</th><th scope="col"></th></tr></thead>
          <tbody>
            @for (member of staff(); track member.id) {
              <tr>
                <td>{{ member.displayName }}<br /><span class="bb-hint">{{ member.linked ? 'signed in' : 'invitation pending' }}</span></td>
                <td class="bb-mono" style="font-size: 12px;">{{ member.email }}</td>
                <td>
                  <select class="bb-input" [value]="draftRole(member)" (change)="setDraftRole(member.id, $any($event.target).value)" [attr.aria-label]="'Role for ' + member.displayName">
                    <option value="principal" [selected]="draftRole(member) === 'principal'">Principal</option>
                    <option value="registrar" [selected]="draftRole(member) === 'registrar'">Registrar</option>
                    <option value="teacher" [selected]="draftRole(member) === 'teacher'">Teacher</option>
                    <option value="bursar" [selected]="draftRole(member) === 'bursar'">Bursar</option>
                  </select>
                </td>
                <td>
                  <select class="bb-input" [value]="draftStatus(member)" (change)="setDraftStatus(member.id, $any($event.target).value)" [attr.aria-label]="'Status for ' + member.displayName">
                    <option value="invited" [selected]="draftStatus(member) === 'invited'">Invited</option>
                    <option value="active" [selected]="draftStatus(member) === 'active'">Active</option>
                    <option value="disabled" [selected]="draftStatus(member) === 'disabled'">Disabled</option>
                  </select>
                </td>
                <td class="bb-num">{{ member.assignments }}</td>
                <td><button type="button" class="bb-btn bb-btn-sm" [disabled]="savingId() === member.id" (click)="saveMember(member)">Save</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <section class="bb-card" aria-labelledby="bb-assign-title">
      <div class="bb-card-head">
        <div>
          <h2 id="bb-assign-title">Teaching assignments</h2>
          <p class="bb-card-sub">A teacher can only write marks and attendance for their assigned class and subject.</p>
        </div>
      </div>
      @if (assignments().length === 0) {
        <div class="bb-empty"><strong>No assignments yet</strong>Assign a teacher to a class and subject so they can mark.</div>
      } @else {
        <ul class="bb-list">
          @for (assignment of assignments(); track assignment.id) {
            <li>
              <span>{{ assignment.memberName }} · {{ assignment.className }} · {{ assignment.subjectName }}</span>
              <button type="button" class="bb-btn bb-btn-ghost bb-btn-sm" (click)="removeAssignment(assignment.id)">Remove</button>
            </li>
          }
        </ul>
      }
      <form class="bb-form" style="margin-top: 16px;" (submit)="addAssignment($event)">
        <div class="bb-form-grid">
          <div class="bb-field">
            <label for="bb-as-member">Teacher</label>
            <select id="bb-as-member" required [value]="assignMemberId()" (change)="assignMemberId.set($any($event.target).value)">
              <option value="">Choose a teacher</option>
              @for (member of teachers(); track member.id) { <option [value]="member.id" [selected]="member.id === assignMemberId()">{{ member.displayName }}</option> }
            </select>
          </div>
          <div class="bb-field">
            <label for="bb-as-class">Class</label>
            <select id="bb-as-class" required [value]="assignClassId()" (change)="assignClassId.set($any($event.target).value)">
              <option value="">Choose a class</option>
              @for (klass of classes(); track klass.id) { <option [value]="klass.id" [selected]="klass.id === assignClassId()">{{ klass.name }}</option> }
            </select>
          </div>
          <div class="bb-field">
            <label for="bb-as-subject">Subject</label>
            <select id="bb-as-subject" required [value]="assignSubjectId()" (change)="assignSubjectId.set($any($event.target).value)">
              <option value="">Choose a subject</option>
              @for (subject of subjects(); track subject.id) { <option [value]="subject.id" [selected]="subject.id === assignSubjectId()">{{ subject.name }}</option> }
            </select>
          </div>
          <div style="display: flex; align-items: flex-end;">
            <button type="submit" class="bb-btn" [disabled]="assigning()">{{ assigning() ? 'Assigning…' : 'Assign' }}</button>
          </div>
        </div>
      </form>
    </section>

    @if (session.can('audit.read')) {
      <section class="bb-card" aria-labelledby="bb-audit-title">
        <div class="bb-card-head">
          <div>
            <h2 id="bb-audit-title">Audit trail</h2>
            <p class="bb-card-sub">Append-only record of who changed what.</p>
          </div>
        </div>
        @if (audit().length === 0) {
          <div class="bb-empty"><strong>Nothing recorded yet</strong>Changes will appear here as staff work.</div>
        } @else {
          <ul class="bb-list">
            @for (event of audit(); track event.id) {
              <li>
                <span>{{ event.memberName ?? 'System' }} · {{ event.action }} <span class="bb-muted">{{ event.subjectType }}</span></span>
                <span class="bb-muted bb-mono" style="font-size: 11px;">{{ moment(event.occurredAt) }}</span>
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
})
export class BenbenStaffComponent {
  readonly session = inject(BenbenSession);
  private readonly api = inject(BenbenApi);

  readonly staff = signal<StaffRow[]>([]);
  readonly assignments = signal<AssignmentRow[]>([]);
  readonly classes = signal<ClassSummary[]>([]);
  readonly subjects = signal<Subject[]>([]);
  readonly audit = signal<AuditRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly newName = signal('');
  readonly newEmail = signal('');
  readonly newRole = signal<BBRole>('teacher');
  readonly inviting = signal(false);
  readonly inviteError = signal<string | null>(null);

  readonly drafts = signal<Record<string, { role: BBRole; status: string }>>({});
  readonly savingId = signal<string | null>(null);

  readonly assignMemberId = signal('');
  readonly assignClassId = signal('');
  readonly assignSubjectId = signal('');
  readonly assigning = signal(false);

  readonly roleLabel = roleLabel;
  readonly moment = moment;

  readonly teachers = computed(() => this.staff().filter((member) => member.role === 'teacher' && member.status !== 'disabled'));

  constructor() {
    void this.bootstrap();
  }

  async bootstrap(): Promise<void> {
    this.loading.set(true);
    try {
      const [staff, assignments, classes, subjects] = await Promise.all([
        this.api.get<StaffRow[]>('/staff'),
        this.api.get<AssignmentRow[]>('/assignments'),
        this.api.get<ClassSummary[]>('/classes'),
        this.api.get<Subject[]>('/subjects'),
      ]);
      this.staff.set(staff);
      this.assignments.set(assignments);
      this.classes.set(classes);
      this.subjects.set(subjects);
      if (this.session.can('audit.read')) {
        try {
          this.audit.set(await this.api.get<AuditRow[]>('/audit?limit=50'));
        } catch {
          // The audit panel is additive; staff administration still works.
        }
      }
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.loading.set(false);
    }
  }

  draftRole(member: StaffRow): string {
    return this.drafts()[member.id]?.role ?? member.role;
  }

  draftStatus(member: StaffRow): string {
    return this.drafts()[member.id]?.status ?? member.status;
  }

  setDraftRole(memberId: string, role: string): void {
    this.drafts.update((current) => ({ ...current, [memberId]: { role: role as BBRole, status: current[memberId]?.status ?? this.statusOf(memberId) } }));
  }

  setDraftStatus(memberId: string, status: string): void {
    this.drafts.update((current) => ({ ...current, [memberId]: { role: current[memberId]?.role ?? this.roleOf(memberId), status } }));
  }

  private roleOf(memberId: string): BBRole {
    return this.staff().find((member) => member.id === memberId)?.role ?? 'teacher';
  }

  private statusOf(memberId: string): string {
    return this.staff().find((member) => member.id === memberId)?.status ?? 'invited';
  }

  async invite(event: Event): Promise<void> {
    event.preventDefault();
    if (this.inviting()) return;
    this.inviting.set(true);
    this.inviteError.set(null);
    this.notice.set(null);
    try {
      await this.api.send('POST', '/staff', {
        displayName: this.newName(),
        email: this.newEmail(),
        role: this.newRole(),
      });
      this.notice.set(`Invitation created for ${this.newEmail()}.`);
      this.newName.set('');
      this.newEmail.set('');
      this.staff.set(await this.api.get<StaffRow[]>('/staff'));
    } catch (error) {
      this.inviteError.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.inviting.set(false);
    }
  }

  async saveMember(member: StaffRow): Promise<void> {
    this.savingId.set(member.id);
    this.error.set(null);
    this.notice.set(null);
    try {
      await this.api.send('PATCH', `/staff/${member.id}`, {
        role: this.draftRole(member),
        status: this.draftStatus(member),
      });
      this.notice.set(`${member.displayName} updated.`);
      this.staff.set(await this.api.get<StaffRow[]>('/staff'));
      this.drafts.update((current) => {
        const next = { ...current };
        delete next[member.id];
        return next;
      });
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.savingId.set(null);
    }
  }

  async addAssignment(event: Event): Promise<void> {
    event.preventDefault();
    if (this.assigning()) return;
    this.assigning.set(true);
    this.error.set(null);
    this.notice.set(null);
    try {
      await this.api.send('POST', '/assignments', {
        memberId: this.assignMemberId(),
        classId: this.assignClassId(),
        subjectId: this.assignSubjectId(),
      });
      this.notice.set('Teaching assignment added.');
      this.assignments.set(await this.api.get<AssignmentRow[]>('/assignments'));
      this.staff.set(await this.api.get<StaffRow[]>('/staff'));
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.assigning.set(false);
    }
  }

  async removeAssignment(id: string): Promise<void> {
    this.error.set(null);
    try {
      await this.api.send('DELETE', `/assignments/${id}`);
      this.assignments.update((rows) => rows.filter((row) => row.id !== id));
      this.notice.set('Assignment removed.');
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    }
  }
}
