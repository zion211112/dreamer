<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import { useAuth } from '@/lib/auth/hooks';
import type { UserRole } from '@/lib/auth/types';
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import BrandMark from '@/components/BrandMark.vue';
import ProviderIcon from '@/components/ProviderIcon.vue';

const router = useRouter();
const { signUp, signIn, loading, error: authError, profile } = useAuth();

const workspacePaths = {
  annals: '/workspace',
  people: '/workspace/network/people',
  school: '/workspace/workbench',
  commons: '/workspace/commons',
  workbench: '/workspace/workbench',
  roll: '/workspace/records/roll',
} as const;

const workspaces = [
  { id: 'annals', label: 'Annals' },
  { id: 'people', label: 'Parent' },
  { id: 'school', label: 'School team (Benben-OS)' },
  { id: 'commons', label: 'Community member' },
  { id: 'workbench', label: 'Provider' },
  { id: 'roll', label: 'Coordinator' },
];

type WorkspaceId = keyof typeof workspacePaths;
type SignUpRole = Extract<UserRole, 'founder' | 'institution' | 'coordinator'>;

const isSignUp = computed(() => router.currentRoute.value.path === '/sign-up');

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const displayName = ref('');
const role = ref<SignUpRole>('founder');
const organizationName = ref('');
const workspace = ref<WorkspaceId>('annals');
const workspaceCustomized = ref(false);
const error = ref('');
const fieldErrors = ref<{
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
}>({});

function isWorkspaceId(value: string): value is WorkspaceId {
  return workspaces.some((w) => w.id === value);
}

function defaultWorkspaceForRole(role: UserRole): WorkspaceId {
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

function getWorkspacePath(workspaceId: WorkspaceId): string {
  return workspacePaths[workspaceId];
}

const validateEmail = (value: string) => {
  if (!value) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  return '';
};

const validatePassword = (value: string, isSignup: boolean) => {
  if (!value) return 'Password is required.';
  if (isSignup && value.length < 8) return 'Password must be at least 8 characters.';
  return '';
};

const validateConfirmPassword = (value: string, pwd: string) => {
  if (!value) return 'Confirm your password.';
  if (value !== pwd) return 'Passwords do not match.';
  return '';
};

const validateDisplayName = (value: string) => {
  if (!value.trim()) return 'Display name is required.';
  return '';
};

function clearFieldErrors() {
  error.value = '';
  fieldErrors.value = {};
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  clearFieldErrors();

  const emailError = validateEmail(email.value);
  const passwordError = validatePassword(password.value, isSignUp.value);
  const confirmError = isSignUp.value ? validateConfirmPassword(confirmPassword.value, password.value) : '';
  const displayNameError = isSignUp.value ? validateDisplayName(displayName.value) : '';

  if (emailError || passwordError || confirmError || displayNameError) {
    fieldErrors.value = {
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError,
      displayName: displayNameError,
    };
    return;
  }

  const requestedNext = new URLSearchParams(window.location.search).get('next');
  const validNext =
    requestedNext &&
    requestedNext.startsWith('/') &&
    !requestedNext.startsWith('//') &&
    !requestedNext.includes('\\')
      ? requestedNext
      : null;

  try {
    let result: { error?: string; profile?: { role?: UserRole } };
    if (isSignUp.value) {
      result = await signUp({
        email: email.value,
        password: password.value,
        displayName: displayName.value,
        role: role.value,
        organizationName: organizationName.value,
      });
    } else {
      result = await signIn({ email: email.value, password: password.value });
    }

    if (result.error) {
      error.value = result.error;
      return;
    }

    const defaultWorkspace = defaultWorkspaceForRole(result.profile?.role ?? role.value);
    const destination = workspaceCustomized.value ? workspace.value : defaultWorkspace;
    router.push(validNext ?? getWorkspacePath(destination));
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  }
}
</script>

<template>
  <div class="auth-layout">
    <svg
      class="auth-ubuntu-pattern"
      viewBox="0 0 1000 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="auth-community-weave"
          width="192"
          height="192"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M96 0C96 30 132 32 132 62C132 80 114 92 96 96C78 100 60 112 60 130C60 160 96 162 96 192"
              stroke="#40573d"
              stroke-width="2"
              stroke-opacity=".24"
            />
            <path
              d="M0 96C30 96 32 60 62 60C80 60 92 78 96 96C100 114 112 132 130 132C160 132 162 96 192 96"
              stroke="#263d56"
              stroke-width="1.5"
              stroke-opacity=".2"
            />
            <path
              d="M96 0C104 32 128 42 150 64C172 86 150 106 128 108C106 110 84 128 64 150C44 172 32 152 24 128"
              stroke="#b89a72"
              stroke-width="1"
              stroke-opacity=".24"
            />
            <path
              d="M96 0C104 32 128 42 150 64C172 86 150 106 128 108C106 110 84 128 64 150C44 172 32 152 24 128"
              stroke="#b89a72"
              stroke-width="1"
              stroke-opacity=".24"
              transform="rotate(90 96 96)"
            />
            <path
              d="M96 0C104 32 128 42 150 64C172 86 150 106 128 108C106 110 84 128 64 150C44 172 32 152 24 128"
              stroke="#b89a72"
              stroke-width="1"
              stroke-opacity=".24"
              transform="rotate(180 96 96)"
            />
            <path
              d="M96 0C104 32 128 42 150 64C172 86 150 106 128 108C106 110 84 128 64 150C44 172 32 152 24 128"
              stroke="#b89a72"
              stroke-width="1"
              stroke-opacity=".24"
              transform="rotate(270 96 96)"
            />
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
        <BrandMark size="sm" />
      </div>
    </header>

    <div class="auth-wrap">
      <main class="auth-main">
        <section class="auth-panel" aria-labelledby="auth-title">
          <header class="auth-heading">
            <h1 id="auth-title">{{ isSignUp ? 'Create your account' : 'Sign in' }}</h1>
          </header>

          <nav class="auth-mode-switch" aria-label="Account">
            <a
              :class="{ 'auth-mode-active': !isSignUp }"
              href="/sign-in"
              @click.prevent="router.push('/sign-in')"
            >
              Sign in
            </a>
            <a
              :class="{ 'auth-mode-active': isSignUp }"
              href="/sign-up"
              @click.prevent="router.push('/sign-up')"
            >
              Create account
            </a>
          </nav>

          <form @submit="handleSubmit" class="auth-form">
            <p v-if="error || authError" class="auth-error" role="alert">
              {{ error || authError }}
            </p>

            <div class="auth-providers" role="group" aria-label="Sign in with">
              <button type="button" class="auth-provider-btn" aria-label="Sign in with GitHub">
                <ProviderIcon provider="github" />
                <span>GitHub</span>
              </button>
              <button type="button" class="auth-provider-btn" aria-label="Sign in with Google">
                <ProviderIcon provider="google" />
                <span>Google</span>
              </button>
            </div>

            <div class="auth-divider" role="separator" aria-label="or">
              <span>or</span>
            </div>

            <div v-if="isSignUp" class="auth-field">
              <label for="auth-display-name">Display name</label>
              <Input
                id="auth-display-name"
                name="displayName"
                type="text"
                placeholder="Your name or venture name"
                v-model="displayName"
                @blur="() => { fieldErrors.value = { ...fieldErrors.value, displayName: validateDisplayName(displayName.value) }; }"
                auto-complete="name"
                required
                :aria-invalid="Boolean(fieldErrors.displayName)"
                :aria-describedby="fieldErrors.displayName ? 'auth-display-name-error' : undefined"
              />
              <p v-if="fieldErrors.displayName" id="auth-display-name-error" class="auth-field-error" role="alert">
                {{ fieldErrors.displayName }}
              </p>
            </div>

            <div v-if="isSignUp && role === 'institution'" class="auth-field">
              <label for="auth-org-name">Organization name</label>
              <Input
                id="auth-org-name"
                name="organizationName"
                type="text"
                placeholder="School, cooperative, company name"
                v-model="organizationName"
                auto-complete="organization"
              />
            </div>

            <div class="auth-field">
              <label for="auth-email">Email</label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                placeholder="you@domain.org"
                v-model="email"
                @blur="() => { fieldErrors.value = { ...fieldErrors.value, email: validateEmail(email.value) }; }"
                auto-complete="email"
                required
                :aria-invalid="Boolean(fieldErrors.email)"
                :aria-describedby="fieldErrors.email ? 'auth-email-error' : undefined"
              />
              <p v-if="fieldErrors.email" id="auth-email-error" class="auth-field-error" role="alert">
                {{ fieldErrors.email }}
              </p>
            </div>

            <div class="auth-field">
              <label for="auth-password">Password</label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                v-model="password"
                @blur="() => { fieldErrors.value = { ...fieldErrors.value, password: validatePassword(password.value, isSignUp.value) }; }"
                :auto-complete="isSignUp ? 'new-password' : 'current-password'"
                required
                :aria-invalid="Boolean(fieldErrors.password)"
                :aria-describedby="fieldErrors.password ? 'auth-password-error' : undefined"
              />
              <p v-if="fieldErrors.password" id="auth-password-error" class="auth-field-error" role="alert">
                {{ fieldErrors.password }}
              </p>
            </div>

            <div v-if="isSignUp" class="auth-field">
              <label for="auth-confirm-password">Confirm password</label>
              <Input
                id="auth-confirm-password"
                name="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                v-model="confirmPassword"
                @blur="() => { fieldErrors.value = { ...fieldErrors.value, confirmPassword: validateConfirmPassword(confirmPassword.value, password.value) }; }"
                auto-complete="new-password"
                required
                :aria-invalid="Boolean(fieldErrors.confirmPassword)"
                :aria-describedby="fieldErrors.confirmPassword ? 'auth-confirm-error' : undefined"
              />
              <p v-if="fieldErrors.confirmPassword" id="auth-confirm-error" class="auth-field-error" role="alert">
                {{ fieldErrors.confirmPassword }}
              </p>
            </div>

            <div
              :class="[
                'auth-onboarding-bar',
                isSignUp ? '' : 'auth-onboarding-bar-single',
              ]"
            >
              <div v-if="isSignUp" class="auth-field">
                <label for="auth-role">Role</label>
                <select
                  id="auth-role"
                  name="role"
                  v-model="role"
                  @change="() => { if (!workspaceCustomized.value) workspace.value = defaultWorkspaceForRole(role.value); }"
                  required
                >
                  <option value="founder">Founder / business / crew</option>
                  <option value="institution">School / institution</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
              <div class="auth-field">
                <label for="auth-workspace">Start in</label>
                <select
                  id="auth-workspace"
                  name="workspace"
                  v-model="workspace"
                  @change="() => { workspaceCustomized.value = true; }"
                  required
                >
                  <option v-for="item in workspaces" :key="item.id" :value="item.id">
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </div>

            <Button type="submit" class="auth-submit" size="lg" :disabled="loading">
              {{ loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in' }}
            </Button>
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
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
}

.auth-ubuntu-pattern {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.auth-header {
  position: relative;
  z-index: 1;
  padding: var(--apt-spacing-s8) var(--apt-spacing-s13);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
}

.auth-wrap {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: var(--apt-spacing-s20) var(--apt-spacing-s10);
  display: flex;
  justify-content: center;
}

.auth-main {
  max-width: var(--apt-block-landing-content-max-width);
  width: 100%;
}

.auth-panel {
  padding: var(--apt-spacing-s10) var(--apt-spacing-s10);
  background: var(--apt-color-neutral-n0);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r3);
  box-shadow: var(--apt-shadow-sh1);
}

.auth-heading h1 {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s4) 0;
  color: var(--apt-text-body);
  letter-spacing: -0.01em;
}

.auth-lede {
  font-size: var(--apt-font-size-body);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s10) 0;
  max-width: 380px;
}

.auth-mode-switch {
  display: flex;
  gap: var(--apt-spacing-s10);
  margin-bottom: var(--apt-spacing-s10);
  font-size: var(--apt-font-size-body-md);
}

.auth-mode-switch a {
  color: var(--apt-text-muted);
  text-decoration: none;
  padding: var(--apt-spacing-s6) 0;
  line-height: 20px;
}

.auth-mode-switch a.auth-mode-active {
  color: var(--apt-color-brand-primary);
  font-weight: var(--apt-font-weight-semibold);
}

.auth-error {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-color-brand-geist-alert);
  margin: 0 0 var(--apt-spacing-s6) 0;
  padding: var(--apt-spacing-s3) var(--apt-spacing-s6);
  background: var(--apt-color-ramp-geist-alert-50);
  border: 1px solid var(--apt-color-ramp-geist-alert-100);
  border-radius: var(--apt-radius-r1);
}

.auth-providers {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s3);
  margin-bottom: var(--apt-spacing-s6);
}

.auth-provider-btn {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  width: 100%;
  min-height: var(--apt-spacing-s15);
  padding: var(--apt-spacing-s4) var(--apt-spacing-s8);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium);
  cursor: pointer;
  transition: background-color var(--apt-animation-fast);
}

.auth-provider-btn:hover {
  background: var(--apt-surface-raised);
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: var(--apt-spacing-s6) 0;
  color: var(--apt-text-dim);
  font-size: var(--apt-font-size-sm-3);
}

.auth-divider span {
  padding: 0 var(--apt-spacing-s3);
}

.auth-form input {
  min-height: var(--apt-spacing-s15);
}

.auth-form select {
  width: 100%;
  min-height: var(--apt-spacing-s15);
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  border: var(--apt-input-border-width) var(--apt-input-border-style) var(--apt-input-border);
  border-radius: var(--apt-input-radius);
  background: var(--apt-input-bg);
  color: var(--apt-input-text);
  font-size: var(--apt-input-font-size);
  font-family: inherit;
}

.auth-field {
  margin-bottom: var(--apt-spacing-s6);
}

.auth-field label {
  display: block;
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-body);
  margin-bottom: var(--apt-spacing-s2);
}

.auth-field-error {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-color-brand-geist-alert);
  margin-top: var(--apt-spacing-s1);
}

.auth-onboarding-bar {
  display: flex;
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s8);
}

.auth-onboarding-bar-single {
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.auth-submit {
  width: 100%;
  min-height: var(--apt-spacing-s15);
}

/* Footer */
.auth-footer {
  padding: var(--apt-spacing-s10);
  border-top: 1px solid var(--apt-border);
  background: var(--apt-color-neutral-n0);
}

.auth-footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  max-width: 960px;
  margin: 0 auto;
}

.auth-footer-brand {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-color-brand-primary);
}

.auth-footer-note {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  margin: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .auth-wrap {
    padding: var(--apt-spacing-s14) var(--apt-spacing-s6);
  }

  .auth-panel {
    padding: var(--apt-spacing-s8) var(--apt-spacing-s8);
  }

  .auth-header {
    padding: var(--apt-spacing-s8);
  }

  .auth-footer {
    padding: var(--apt-spacing-s8);
    flex-direction: column;
    gap: var(--apt-spacing-s6);
    text-align: center;
  }
}
</style>

