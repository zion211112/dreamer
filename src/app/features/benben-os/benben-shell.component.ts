import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { authClient } from '../../auth/auth-client';
import { BenbenSession } from './benben-session.service';
import { BenbenOnboardingComponent } from './onboarding.component';
import { day, roleLabel } from './benben-format';

@Component({
  selector: 'app-benben-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BenbenOnboardingComponent],
  styleUrl: './benben-os.css',
  encapsulation: ViewEncapsulation.None,
  template: `
    <a class="bb-skip" href="#bb-main">Skip to content</a>
    <div class="bb-app">
      <aside class="bb-side" aria-label="School console">
        <a class="bb-brand" routerLink="/benben-os" aria-label="Benben-OS home">
          <span class="bb-brand-mark">benben<span>·</span>os</span>
          <span class="bb-brand-tag">school console</span>
        </a>

        @if (session.me(); as me) {
          <div class="bb-school">
            <div class="bb-school-name">{{ me.school.name }}</div>
            <div class="bb-school-meta">
              <span>{{ me.school.code }}{{ me.school.county ? ' · ' + me.school.county : '' }}</span>
              <span>{{ roleLabel(me.member.role) }} · {{ me.member.displayName }}</span>
            </div>
          </div>
        }

        <nav class="bb-nav" aria-label="Sections">
          <span class="bb-nav-label">School</span>
          @for (item of nav(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bb-nav-active"
               [routerLinkActiveOptions]="{ exact: item.exact }"
               [attr.aria-label]="item.label">
              <span class="bb-nav-glyph" aria-hidden="true">{{ item.glyph }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="bb-side-foot">
          @if (session.me(); as me) {
            <div class="bb-user">
              <span class="bb-user-name">{{ me.member.displayName }}</span>
              <span class="bb-user-role">{{ roleLabel(me.member.role) }}</span>
            </div>
          }
          <button type="button" class="bb-btn bb-btn-ghost bb-btn-sm" (click)="signOut()">Sign out</button>
        </div>
      </aside>

      <div class="bb-main">
        <header class="bb-topbar">
          <span class="bb-crumbs">{{ today }} · school operations</span>
          @if (session.me(); as me) {
            <div class="bb-topbar-right">
              <span class="bb-badge bb-badge-neutral">{{ me.school.code }}</span>
              <span class="bb-badge bb-badge-info">{{ roleLabel(me.member.role) }}</span>
            </div>
          }
        </header>

        <main id="bb-main" class="bb-content">
          @if (session.loading()) {
            <p class="bb-loading" role="status">Opening your school</p>
          } @else if (session.needsSchool()) {
            <app-benben-onboarding />
          } @else if (session.error()) {
            <div class="bb-alert" role="alert">
              We could not open the console. <button type="button" class="bb-btn bb-btn-sm" (click)="session.load()">Retry</button>
            </div>
          } @else {
            <router-outlet />
          }
        </main>
      </div>
    </div>
  `,
})
export class BenbenShellComponent {
  readonly session = inject(BenbenSession);
  private readonly router = inject(Router);
  readonly today = day(new Date().toISOString().slice(0, 10));
  readonly roleLabel = roleLabel;

  constructor() {
    void this.session.load();
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          const nav = document.querySelector<HTMLElement>('.bb-nav');
          const active = nav?.querySelector<HTMLElement>('a.bb-nav-active');
          if (nav && active) {
            const left = active.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
            nav.scrollTo({ left: left - (nav.clientWidth - active.clientWidth) / 2, behavior: 'smooth' });
          }
        }, 60);
      }
    });
  }

  readonly nav = computed(() => {
    const can = (capability: string) => this.session.can(capability);
    const items: { path: string; label: string; exact: boolean }[] = [
      { path: '/benben-os', label: 'Overview', exact: true },
    ];
    if (can('learners.read')) items.push({ path: '/benben-os/learners', label: 'Learners', exact: false });
    if (can('attendance.write')) items.push({ path: '/benben-os/attendance', label: 'Attendance', exact: false });
    if (can('marks.write') || can('marks.confirm')) items.push({ path: '/benben-os/assessments', label: 'Assessments', exact: false });
    if (can('reports.read')) items.push({ path: '/benben-os/reports', label: 'Term reports', exact: false });
    if (can('fees.read')) items.push({ path: '/benben-os/fees', label: 'Fees', exact: false });
    if (can('classes.write')) items.push({ path: '/benben-os/setup', label: 'School setup', exact: false });
    if (can('staff.manage')) items.push({ path: '/benben-os/staff', label: 'Staff & access', exact: false });
    return items.map((item, index) => ({ ...item, glyph: String(index + 1).padStart(2, '0') }));
  });

  async signOut(): Promise<void> {
    await authClient.signOut();
    await this.router.navigate(['/sign-in']);
  }
}
