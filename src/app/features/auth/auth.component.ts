import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

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
        <a [routerLink]="['/']" class="auth-brand-mark" aria-label="APT Labs home">aptlabs</a>
      </header>

      <div class="auth-wrap">
        <section class="auth-panel" aria-labelledby="auth-title">
          <header class="auth-heading">
            <h1 id="auth-title">{{ isSignUp() ? 'Create your account' : 'Welcome back' }}</h1>
            <p class="auth-caption">
              {{ isSignUp() ? 'Start with your personal APT identity. Choose how to participate later.' : 'Sign in to continue to your personal APT workspace.' }}
            </p>
          </header>

          <nav class="auth-mode-switch" aria-label="Account access">
            <a [routerLink]="['/sign-in']" [class.auth-mode-active]="!isSignUp()" [attr.aria-current]="!isSignUp() ? 'page' : null">Sign in</a>
            <a [routerLink]="['/sign-up']" [class.auth-mode-active]="isSignUp()" [attr.aria-current]="isSignUp() ? 'page' : null">Create account</a>
          </nav>

          <form (submit)="onSubmit($event)" class="auth-form" autocomplete="on" novalidate>
            @if (isSignUp()) {
              <div class="auth-field">
                <label for="auth-display-name">Your name</label>
                <input
                  id="auth-display-name"
                  name="displayName"
                  type="text"
                  placeholder="Name"
                  [value]="displayName()"
                  (input)="displayName.set($any($event.target).value)"
                  (blur)="onBlurDisplayName()"
                  autocomplete="name"
                  required
                  [attr.aria-invalid]="!!fieldErrors().displayName ? 'true' : null"
                  [attr.aria-describedby]="fieldErrors().displayName ? 'auth-display-name-error' : null"
                />
                @if (fieldErrors().displayName) {
                  <p id="auth-display-name-error" class="auth-field-error" role="alert">{{ fieldErrors().displayName }}</p>
                }
              </div>
            }

            <div class="auth-field">
              <label for="auth-email">Email</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="you@example.org"
                [value]="email()"
                (input)="email.set($any($event.target).value)"
                (blur)="onBlurEmail()"
                autocomplete="email"
                inputmode="email"
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
                placeholder="Password"
                [value]="password()"
                (input)="password.set($any($event.target).value)"
                (blur)="onBlurPassword()"
                [attr.autocomplete]="isSignUp() ? 'new-password' : 'current-password'"
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
                  placeholder="Re-enter password"
                  [value]="confirmPassword()"
                  (input)="confirmPassword.set($any($event.target).value)"
                  (blur)="onBlurConfirm()"
                  autocomplete="new-password"
                  required
                  [attr.aria-invalid]="!!fieldErrors().confirmPassword ? 'true' : null"
                  [attr.aria-describedby]="fieldErrors().confirmPassword ? 'auth-confirm-error' : null"
                />
                @if (fieldErrors().confirmPassword) {
                  <p id="auth-confirm-error" class="auth-field-error" role="alert">{{ fieldErrors().confirmPassword }}</p>
                }
              </div>
            }

            <button type="submit" class="auth-submit" [disabled]="loading()">
              {{ loading() ? 'Please wait...' : (isSignUp() ? 'Create account' : 'Sign in') }}
            </button>
          </form>
        </section>
      </div>

      <footer class="auth-footer">
        <p class="auth-footer-note">Demo mode. Authentication is not connected.</p>
      </footer>
    </div>
  `,
  styles: [
    `
.auth-layout {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  color: var(--apt-text-body);
  background: var(--apt-neutral-50);
  font-family: var(--apt-font-sans);
}
.auth-ubuntu-pattern {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.2;
  pointer-events: none;
}
.auth-header {
  position: relative;
  z-index: 1;
  width: min(100% - 48px, 1120px);
  margin: 0 auto;
  padding: 28px 0;
}
.auth-brand-mark {
  color: var(--apt-accent);
  font-family: var(--apt-font-serif);
  font-size: 1.375rem;
  font-weight: var(--apt-weight-semibold);
  text-decoration: none;
}
.auth-wrap {
  position: relative;
  z-index: 1;
  flex: 1;
  display: grid;
  place-items: center;
  padding: 40px 24px;
}
.auth-panel {
  width: min(100%, 440px);
  box-sizing: border-box;
  padding: 36px;
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-lg);
  background: var(--apt-neutral-0);
  box-shadow: var(--apt-shadow-1);
}
.auth-heading h1 {
  margin: 0;
  color: var(--apt-text-strong);
  font-family: var(--apt-font-serif);
  font-size: 1.75rem;
  font-weight: var(--apt-weight-semibold);
  line-height: 1.2;
}
.auth-caption {
  margin: 10px 0 0;
  color: var(--apt-neutral-600);
  font-size: 0.9375rem;
  line-height: 1.5;
}
.auth-mode-switch {
  display: flex;
  gap: 24px;
  margin: 28px 0 24px;
  border-bottom: 1px solid var(--apt-border);
}
.auth-mode-switch a {
  margin-bottom: -1px;
  padding: 0 0 12px;
  border-bottom: 2px solid transparent;
  color: var(--apt-neutral-600);
  font-size: 0.875rem;
  text-decoration: none;
}
.auth-mode-switch a.auth-mode-active {
  border-color: var(--apt-accent);
  color: var(--apt-accent);
  font-weight: var(--apt-weight-semibold);
}
.auth-form input {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-input-radius);
  background: var(--apt-neutral-0);
  color: var(--apt-text-body);
  font: inherit;
  font-size: 0.9375rem;
}
.auth-form input:focus-visible,
.auth-mode-switch a:focus-visible,
.auth-brand-mark:focus-visible,
.auth-submit:focus-visible {
  outline: 3px solid var(--apt-accent-2);
  outline-offset: 3px;
}
.auth-form input[aria-invalid="true"] { border-color: var(--apt-text-danger); }
.auth-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
.auth-field label {
  color: var(--apt-text-body);
  font-size: 0.875rem;
  font-weight: var(--apt-weight-medium);
}
.auth-field-error { margin: 0; color: var(--apt-text-danger); font-size: 0.8125rem; }
.auth-submit {
  width: 100%;
  min-height: 48px;
  margin-top: 4px;
  padding: 12px 16px;
  border: 1px solid var(--apt-accent);
  border-radius: var(--apt-button-radius);
  background: var(--apt-accent);
  color: var(--apt-accent-on);
  cursor: pointer;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: var(--apt-weight-semibold);
}
.auth-submit:hover:not(:disabled) { background: var(--apt-accent-hover); }
.auth-submit:disabled { cursor: wait; opacity: 0.65; }
.auth-footer {
  position: relative;
  z-index: 1;
  padding: 20px 24px;
  color: var(--apt-neutral-600);
  font-size: 0.8125rem;
  text-align: center;
}
.auth-footer-note { margin: 0; }
@media (max-width: 600px) {
  .auth-header { width: calc(100% - 40px); padding: 20px 0; }
  .auth-wrap { padding: 24px 20px; }
  .auth-panel { padding: 28px 24px; }
  .auth-footer { padding: 16px 20px; }
}
`,
  ],
})
export class AuthComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSignUp = signal(false);
  readonly loading = signal(false);
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly displayName = signal('');
  readonly fieldErrors = signal<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    displayName?: string;
  }>({});

  ngOnInit(): void {
    const seg = this.route.snapshot.url.length
      ? this.route.snapshot.url[this.route.snapshot.url.length - 1].path
      : '';
    this.isSignUp.set(seg === 'sign-up');
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

  onSubmit(event: Event): void {
    event.preventDefault();
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

    this.loading.set(true);
    // No live auth in the browser-local demo: validate, then land the user in their workspace.
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/workspace']);
    }, 200);
  }
}
