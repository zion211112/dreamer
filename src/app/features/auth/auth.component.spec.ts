import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, UrlSegment } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthComponent } from './auth.component';

const routeStub = { snapshot: { url: [] as UrlSegment[] } };

describe('AuthComponent', () => {
  beforeEach(async () => {
    routeStub.snapshot.url = [new UrlSegment('sign-in', {})];
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    }).compileComponents();
  });

  function createFixture(path: 'sign-in' | 'sign-up' = 'sign-in') {
    routeStub.snapshot.url = [new UrlSegment(path, {})];
    const fixture = TestBed.createComponent(AuthComponent);
    fixture.detectChanges();
    return fixture;
  }

  function formInputNames(fixture: ReturnType<typeof createFixture>): string[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('.auth-form input'),
    ).map((input) => input.name);
  }

  it('rendersRoleFreeSignInWithoutProviderActions', () => {
    const fixture = createFixture();
    const form = (fixture.nativeElement as HTMLElement).querySelector('.auth-form');

    expect(formInputNames(fixture)).toEqual(['email', 'password']);
    expect(form?.querySelector('select[name="role"], select[name="workspace"]')).toBeNull();
    expect(form?.querySelector('.auth-provider-btn')).toBeNull();
  });

  it('signupCollectsPersonalFieldsOnly', () => {
    const fixture = createFixture('sign-up');
    const form = (fixture.nativeElement as HTMLElement).querySelector('.auth-form');

    expect(formInputNames(fixture)).toEqual(['displayName', 'email', 'password', 'confirm-password']);
    expect(form?.querySelector('input[name="organizationName"]')).toBeNull();
    expect(form?.querySelector('select')).toBeNull();
    expect(form?.querySelector('.auth-provider-btn')).toBeNull();
  });

  it('keepsDemoDisclosureVisibleInBothModes', () => {
    for (const path of ['sign-in', 'sign-up'] as const) {
      const fixture = createFixture(path);
      const disclosure = (fixture.nativeElement as HTMLElement).querySelector('.auth-footer-note');

      expect(disclosure?.textContent).toContain('Demo mode');
      fixture.destroy();
    }
  });

  it('showsValidationErrorsForInvalidSignup', () => {
    const fixture = createFixture('sign-up');
    const component = fixture.componentInstance;
    component.displayName.set(' ');
    component.email.set('not-an-email');
    component.password.set('short');
    component.confirmPassword.set('different');

    component.onSubmit(new Event('submit'));
    fixture.detectChanges();

    expect(component.fieldErrors()).toMatchObject({
      displayName: 'Display name is required.',
      email: 'Enter a valid email address.',
      password: 'Password must be at least 8 characters.',
      confirmPassword: 'Passwords do not match.',
    });
    expect((fixture.nativeElement as HTMLElement).querySelector('#auth-email')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('validDemoEntryNavigatesToWorkspace', async () => {
    const fixture = createFixture();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const component = fixture.componentInstance;
    component.email.set('person@example.org');
    component.password.set('demo-password');

    component.onSubmit(new Event('submit'));
    await new Promise((resolve) => setTimeout(resolve, 220));

    expect(navigate).toHaveBeenCalledWith(['/workspace']);
  });
});
