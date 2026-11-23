import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

type WorkspaceId = 'annals' | 'people' | 'school' | 'commons' | 'workbench' | 'roll';
type SignUpRole = 'founder' | 'institution' | 'coordinator';

const WORKSPACE_PATHS: Record<WorkspaceId, string> = {
  annals: '/workspace',
  people: '/workspace/network/people',
  school: '/workspace/workbench',
  commons: '/workspace/commons',
  workbench: '/workspace/workbench',
  roll: '/workspace/records/roll',
};

const WORKSPACES: { id: WorkspaceId; label: string }[] = [
  { id: 'annals', label: 'Annals' },
  { id: 'people', label: 'Parent' },
  { id: 'school', label: 'School team (Benben-OS)' },
  { id: 'commons', label: 'Community member' },
  { id: 'workbench', label: 'Provider' },
  { id: 'roll', label: 'Coordinator' },
];

function defaultWorkspaceForRole(role: SignUpRole): WorkspaceId {
  switch (role) {
    case 'coordinator':
      return 'workbench';
    case 'institution':
      return 'commons';
    case 'founder':
      return 'commons';
    default:
      return 'annals';
  }
}

@Component({
  selector: 'app-auth',
  imports: [RouterLink],
  template: `
    <div class="auth-layout">
      <svg class="auth-ubuntu-pattern" viewBox="0 0 1000 800" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="auth-community-weave" width="192" height="192" patternUnits="userSpaceOnUse">
            <g fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M96 0C96 30 132 32 132 62C132 80 114 92 96 96C78 100 60 112 60 130C60 160 96 162 96 192" stroke="#40573d" stroke-width="2" stroke-opacity=".24" />
              <path d="M0 96C30 96 32 60 62 60C80 60 92 78 96 96C100 114 112 132 130 132C160 132 162 96 192 96" stroke="#263d56" stroke-width="1.5" stroke-opacity=".2" />
              <path d="M96 0C104 32 128 42 150 64C172 86 150 106 128 108C106 110 84 128 64 150C44 172 32 152 24 128" stroke="#b89a72" stroke-width="1" stroke-opacity=".24" />
              <path d="M96 0C104 32 128 42 150 64C172 86 150 106 128 108C106 110 84 128 64 150C44 172 32 152 24 128" stroke="#b89a72" stroke-width="1" stroke-opacity=".24" transform="rotate(90 96 96)" />
              <path d="M96 0C104 32 128 42 150 64C172 86 150 106 128 108C106 110 84 128 64 150C44 172 32 152 24 128" stroke="#b89a72" stroke-width="1" stroke-opacity=".24" transform="rotate(180 96 96)" />
              <path d="M96 0C104 32 128 42 150 64C172 86 150 106 128 108C106 110 84 128 64 150C44 172 32 152 24 128" stroke="#b89a72" stroke-width="1" stroke-opacity=".24" transform="rotate(270 96 96)" />
            </g>
            <circle cx="96" cy="96" r="7" fill="#bd863d" fill-opacity=".36" />
            <circle cx="96" cy="12" r="2.5" fill="#40573d" fill-opacity=".38" />
            <circle cx="180" cy="96" r="2" fill="#263d56" fill-opacity=".34" />
            <circle cx="96" cy="180" r="2.5" fill="#bd863d" fill-opacity=".34" />
            <circle cx="12" cy="96" r="2" fill="#40573d" fill-opacity=".3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-community-weave)" />
      </svg>

      <header class="auth-header">
        <div class="auth-brand">
          <a [routerLink]="['/']" class="auth-brand-mark">aptlabs</a>
        </div>
      </header>

      <div class="auth-wrap">
        <main class="auth-main">
          <section class="auth-panel" aria-labelledby="auth-title">
            <header class="auth-heading">
              <h1 id="auth-title">{{ isSignUp() ? 'Create your account' : 'Sign in' }}</h1>
            </header>

            <nav class="auth-mode-switch" aria-label="Account">
              <a [routerLink]="['/sign-in']" [class.auth-mode-active]="!isSignUp()">Sign in</a>
              <a [routerLink]="['/sign-up']" [class.auth-mode-active]="isSignUp()">Create account</a>
            </nav>

            <form (submit)="onSubmit($event)" class="auth-form">
              @if (error() || authError()) {
                <p class="auth-error" role="alert">{{ error() || authError() }}</p>
              }

              <div class="auth-providers" role="group" aria-label="Sign in with">
                <button type="button" class="auth-provider-btn" aria-label="Sign in with GitHub">
                  <span class="auth-provider-glyph">GH</span><span>GitHub</span>
                </button>
                <button type="button" class="auth-provider-btn" aria-label="Sign in with Google">
                  <span class="auth-provider-glyph">G</span><span>Google</span>
                </button>
              </div>

              <div class="auth-divider" role="separator" aria-label="or">
                <span>or</span>
              </div>

              @if (isSignUp()) {
                <div class="auth-field">
                  <label for="auth-display-name">Display name</label>
                  <input
                    id="auth-display-name"
                    name="displayName"
                    type="text"
                    placeholder="Your name or venture name"
                    [value]="displayName()"
                    (input)="displayName.set($any($event.target).value)"
                    (blur)="onBlurDisplayName()"
                    auto-complete="name"
                    required
                    [attr.aria-invalid]="!!fieldErrors().displayName ? 'true' : null"
                    [attr.aria-describedby]="fieldErrors().displayName ? 'auth-display-name-error' : null"
                  />
                  @if (fieldErrors().displayName) {
                    <p id="auth-display-name-error" class="auth-field-error" role="alert">{{ fieldErrors().displayName }}</p>
                  }
                </div>
              }

              @if (isSignUp() && role() === 'institution') {
                <div class="auth-field">
                  <label for="auth-org-name">Organization name</label>
                  <input
                    id="auth-org-name"
                    name="organizationName"
                    type="text"
                    placeholder="School, cooperative, company name"
                    [value]="organizationName()"
                    (input)="organizationName.set($any($event.target).value)"
                    auto-complete="organization"
                  />
                </div>
              }

              <div class="auth-field">
                <label for="auth-email">Email</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  placeholder="you@domain.org"
                  [value]="email()"
                  (input)="email.set($any($event.target).value)"
                  (blur)="onBlurEmail()"
                  auto-complete="email"
                  required
                  [attr.aria-invalid]="!!fieldErrors().email ? 'true' : null"
                  [attr.aria-describedby]="fieldErrors().email ? 'auth-email-error' : null"
                />
                @if (fieldErrors().email) {
                  <p id="auth-email-error" class="auth-field-error" role="alert">{{ fieldErrors().email }}</p>
                }
              </div>

              <div class="auth-field">
                <label for="auth-password">Password</label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  [value]="password()"
                  (input)="password.set($any($event.target).value)"
                  (blur)="onBlurPassword()"
                  [attr.auto-complete]="isSignUp() ? 'new-password' : 'current-password'"
                  required
                  [attr.aria-invalid]="!!fieldErrors().password ? 'true' : null"
                  [attr.aria-describedby]="fieldErrors().password ? 'auth-password-error' : null"
                />
                @if (fieldErrors().password) {
                  <p id="auth-password-error" class="auth-field-error" role="alert">{{ fieldErrors().password }}</p>
                }
              </div>

              @if (isSignUp()) {
                <div class="auth-field">
                  <label for="auth-confirm-password">Confirm password</label>
                  <input
                    id="auth-confirm-password"
                    name="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    [value]="confirmPassword()"
                    (input)="confirmPassword.set($any($event.target).value)"
                    (blur)="onBlurConfirm()"
                    auto-complete="new-password"
                    required
                    [attr.aria-invalid]="!!fieldErrors().confirmPassword ? 'true' : null"
                    [attr.aria-describedby]="fieldErrors().confirmPassword ? 'auth-confirm-error' : null"
                  />
                  @if (fieldErrors().confirmPassword) {
                    <p id="auth-confirm-error" class="auth-field-error" role="alert">{{ fieldErrors().confirmPassword }}</p>
                  }
                </div>
              }

              <div [class]="'auth-onboarding-bar' + (isSignUp() ? '' : ' auth-onboarding-bar-single')">
                @if (isSignUp()) {
                  <div class="auth-field">
                    <label for="auth-role">Role</label>
                    <select
                      id="auth-role"
                      name="role"
                      [value]="role()"
                      (change)="onRoleChange($event)"
                      required
                    >
                      <option value="founder">Founder / business / crew</option>
                      <option value="institution">School / institution</option>
                      <option value="coordinator">Coordinator</option>
                    </select>
                  </div>
                }
                <div class="auth-field">
                  <label for="auth-workspace">Start in</label>
                  <select
                    id="auth-workspace"
                    name="workspace"
                    [value]="workspace()"
                    (change)="onWorkspaceChange($event)"
                    required
                  >
                    @for (item of workspaces; track item.id) {
                      <option [value]="item.id">{{ item.label }}</option>
                    }
                  </select>
                </div>
              </div>

              <button type="submit" class="auth-submit" [disabled]="loading()">
                {{ loading() ? 'Please wait...' : (isSignUp() ? 'Create account' : 'Sign in') }}
              </button>
            </form>
          </section>
        </main>
      </div>

      <footer class="auth-footer">
        <div class="auth-footer-inner">
          <div class="auth-footer-brand">aptlabs</div>
          <p class="auth-footer-note">
            Browser-local. No live institutional, payment, tracking, or account connections.
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
.auth-layout {
  min-height: 100vh; display: flex; flex-direction: column;
  font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default);
}
.auth-ubuntu-pattern { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; }
.auth-header { position: relative; z-index: 1; padding: var(--apt-spacing-s8) var(--apt-spacing-s13); display: flex; align-items: center; justify-content: space-between; }
.auth-brand { display: flex; align-items: center; gap: var(--apt-spacing-s2); }
.auth-brand-mark { font-family: var(--apt-font-serif); font-weight: var(--apt-font-weight-semibold); font-size: var(--apt-font-size-title-2); color: var(--apt-color-brand-primary); text-decoration: none; }
.auth-wrap { position: relative; z-index: 1; flex: 1; padding: var(--apt-spacing-s20) var(--apt-spacing-s10); display: flex; justify-content: center; }
.auth-main { max-width: var(--apt-block-landing-content-max-width); width: 100%; }
.auth-panel { padding: var(--apt-spacing-s10) var(--apt-spacing-s10); background: var(--apt-color-neutral-n0); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r3); box-shadow: var(--apt-shadow-sh1); }
.auth-heading h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-h1); font-weight: var(--apt-font-weight-semibold); margin: 0 0 var(--apt-spacing-s4) 0; color: var(--apt-text-body); letter-spacing: -0.01em; }
.auth-mode-switch { display: flex; gap: var(--apt-spacing-s10); margin-bottom: var(--apt-spacing-s10); font-size: var(--apt-font-size-body-md); }
.auth-mode-switch a { color: var(--apt-text-muted); text-decoration: none; padding: var(--apt-spacing-s6) 0; line-height: 20px; }
.auth-mode-switch a.auth-mode-active { color: var(--apt-color-brand-primary); font-weight: var(--apt-font-weight-semibold); }
.auth-error { font-size: var(--apt-font-size-body-sm); color: var(--apt-color-brand-geist-alert); margin: 0 0 var(--apt-spacing-s6) 0; padding: var(--apt-spacing-s3) var(--apt-spacing-s6); background: var(--apt-color-ramp-geist-alert-50); border: 1px solid var(--apt-color-ramp-geist-alert-100); border-radius: var(--apt-radius-r1); }
.auth-providers { display: flex; flex-direction: column; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s6); }
.auth-provider-btn {
  display: flex; align-items: center; gap: var(--apt-spacing-s3); width: 100%; min-height: var(--apt-spacing-s15);
  padding: var(--apt-spacing-s4) var(--apt-spacing-s8); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1);
  background: var(--apt-color-neutral-n0); color: var(--apt-text-body); font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium); cursor: pointer; font-family: inherit;
}
.auth-provider-btn:hover { background: var(--apt-surface-raised); }
.auth-provider-glyph { font-family: var(--apt-font-mono); font-weight: var(--apt-font-weight-semibold); font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); }
.auth-divider { display: flex; align-items: center; text-align: center; margin: var(--apt-spacing-s6) 0; color: var(--apt-text-dim); font-size: var(--apt-font-size-sm-3); }
.auth-divider span { padding: 0 var(--apt-spacing-s3); }
.auth-form input, .auth-form select {
  width: 100%; box-sizing: border-box; min-height: var(--apt-spacing-s15);
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  border: var(--apt-input-border-width) var(--apt-input-border-style) var(--apt-input-border);
  border-radius: var(--apt-input-radius); background: var(--apt-input-bg); color: var(--apt-input-text);
  font-size: var(--apt-input-font-size); font-family: inherit;
}
.auth-form input:focus, .auth-form select:focus { outline: none; border-color: var(--apt-color-brand-primary); }
.auth-field { margin-bottom: var(--apt-spacing-s6); display: flex; flex-direction: column; gap: var(--apt-spacing-s2); }
.auth-field label { font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); color: var(--apt-text-body); }
.auth-field-error { font-size: var(--apt-font-size-sm-3); color: var(--apt-color-brand-geist-alert); margin: 0; }
.auth-onboarding-bar { display: flex; gap: var(--apt-spacing-s6); margin-bottom: var(--apt-spacing-s8); }
.auth-onboarding-bar-single { flex-direction: column; gap: var(--apt-spacing-s4); }
.auth-submit {
  width: 100%; min-height: var(--apt-spacing-s15); padding: var(--apt-spacing-s4) var(--apt-spacing-s8);
  border: 1px solid var(--apt-color-brand-primary); border-radius: var(--apt-radius-r1);
  background: var(--apt-color-brand-primary); color: var(--apt-action-on-primary, #fff);
  font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-medium); cursor: pointer; font-family: inherit;
}
.auth-submit:disabled { opacity: 0.6; cursor: default; }
.auth-footer { padding: var(--apt-spacing-s10); border-top: 1px solid var(--apt-border); background: var(--apt-color-neutral-n0); }
.auth-footer-inner { display: flex; justify-content: space-between; align-items: baseline; max-width: 960px; margin: 0 auto; }
.auth-footer-brand { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-1); font-weight: var(--apt-font-weight-semibold); color: var(--apt-color-brand-primary); }
.auth-footer-note { font-size: var(--apt-font-size-sm-3); color: var(--apt-text-dim); margin: 0; }
@media (max-width: 600px) {
  .auth-wrap { padding: var(--apt-spacing-s14) var(--apt-spacing-s6); }
  .auth-panel { padding: var(--apt-spacing-s8) var(--apt-spacing-s8); }
  .auth-header { padding: var(--apt-spacing-s8); }
  .auth-footer { padding: var(--apt-spacing-s8); flex-direction: column; gap: var(--apt-spacing-s6); text-align: center; }
}
`,
  ],
})
export class AuthComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSignUp = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly authError = signal('');

  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly displayName = signal('');
  readonly role = signal<SignUpRole>('founder');
  readonly organizationName = signal('');
  readonly workspace = signal<WorkspaceId>('annals');
  readonly workspaceCustomized = signal(false);
  readonly fieldErrors = signal<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    displayName?: string;
  }>({});

  readonly workspaces = WORKSPACES;

  ngOnInit(): void {
    const seg = this.route.snapshot.url.length
      ? this.route.snapshot.url[this.route.snapshot.url.length - 1].path
      : '';
    this.isSignUp.set(seg === 'sign-up');
    if (this.isSignUp()) this.workspace.set(defaultWorkspaceForRole(this.role()));
  }

  private validateEmail(value: string): string {
    if (!value) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
    return '';
  }

  private validatePassword(value: string, isSignup: boolean): string {
    if (!value) return 'Password is required.';
    if (isSignup && value.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  private validateConfirmPassword(value: string, pwd: string): string {
    if (!value) return 'Confirm your password.';
    if (value !== pwd) return 'Passwords do not match.';
    return '';
  }

  private validateDisplayName(value: string): string {
    if (!value.trim()) return 'Display name is required.';
    return '';
  }

  onBlurEmail(): void {
    this.fieldErrors.update((f) => ({ ...f, email: this.validateEmail(this.email()) }));
  }
  onBlurPassword(): void {
    this.fieldErrors.update((f) => ({ ...f, password: this.validatePassword(this.password(), this.isSignUp()) }));
  }
  onBlurConfirm(): void {
    this.fieldErrors.update((f) => ({ ...f, confirmPassword: this.validateConfirmPassword(this.confirmPassword(), this.password()) }));
  }
  onBlurDisplayName(): void {
    this.fieldErrors.update((f) => ({ ...f, displayName: this.validateDisplayName(this.displayName()) }));
  }

  onRoleChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value as SignUpRole;
    this.role.set(v);
    if (!this.workspaceCustomized()) this.workspace.set(defaultWorkspaceForRole(v));
  }

  onWorkspaceChange(event: Event): void {
    this.workspace.set((event.target as HTMLSelectElement).value as WorkspaceId);
    this.workspaceCustomized.set(true);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.fieldErrors.set({});

    const emailError = this.validateEmail(this.email());
    const passwordError = this.validatePassword(this.password(), this.isSignUp());
    const confirmError = this.isSignUp() ? this.validateConfirmPassword(this.confirmPassword(), this.password()) : '';
    const displayNameError = this.isSignUp() ? this.validateDisplayName(this.displayName()) : '';

    if (emailError || passwordError || confirmError || displayNameError) {
      this.fieldErrors.set({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmError,
        displayName: displayNameError,
      });
      return;
    }

    const destination = this.workspaceCustomized() ? this.workspace() : defaultWorkspaceForRole(this.role());
    this.loading.set(true);
    // No live auth in the browser-local demo: validate, then land the user in their workspace.
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate([WORKSPACE_PATHS[destination]]);
    }, 200);
  }
}
