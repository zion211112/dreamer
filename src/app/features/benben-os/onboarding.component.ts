import { Component, inject, signal } from '@angular/core';
import { ApiError } from './benben-api.service';
import { describeError } from './benben-format';
import { BenbenSession } from './benben-session.service';

/** First-run screen: creates the school, its year, and three terms. */
@Component({
  selector: 'app-benben-onboarding',
  template: `
    <section class="bb-onboard bb-card" aria-labelledby="bb-onboard-title">
      <p class="bb-eyebrow">First run</p>
      <h1 id="bb-onboard-title" style="font-family: var(--apt-font-serif); font-weight: 500; font-size: 28px; margin: 0 0 8px;">
        Set up your school
      </h1>
      <p class="bb-lede">
        This account is not linked to a school yet. Create one to start enrolling learners,
        marking attendance, and issuing term reports. You become its principal.
      </p>

      @if (error()) {
        <p class="bb-alert" role="alert" style="margin-top: 16px;">{{ error() }}</p>
      }

      <form class="bb-form" style="margin-top: 20px;" (submit)="submit($event)">
        <div class="bb-form-grid">
          <div class="bb-field" style="grid-column: 1 / -1;">
            <label for="bb-onboard-name">School name</label>
            <input id="bb-onboard-name" name="name" required maxlength="200"
                   [value]="name()" (input)="name.set($any($event.target).value)"
                   placeholder="Benben Primary School" />
          </div>
          <div class="bb-field">
            <label for="bb-onboard-code">School code</label>
            <input id="bb-onboard-code" name="code" required minlength="3" maxlength="30"
                   [value]="code()" (input)="code.set($any($event.target).value.toUpperCase())"
                   placeholder="BENBEN-001" autocomplete="off" />
          </div>
          <div class="bb-field">
            <label for="bb-onboard-county">County</label>
            <input id="bb-onboard-county" name="county" maxlength="80"
                   [value]="county()" (input)="county.set($any($event.target).value)"
                   placeholder="Nairobi" />
          </div>
        </div>

        <h2 style="font-family: var(--apt-font-serif); font-weight: 500; font-size: 18px; margin: 8px 0 0;">Academic year</h2>
        <p class="bb-hint" style="margin: 0;">We split the year into three terms. You can add classes and learners straight after.</p>
        <div class="bb-form-grid">
          <div class="bb-field">
            <label for="bb-onboard-year">Year label</label>
            <input id="bb-onboard-year" name="yearName" required maxlength="40"
                   [value]="yearName()" (input)="yearName.set($any($event.target).value)"
                   placeholder="2026" />
          </div>
          <div class="bb-field">
            <label for="bb-onboard-start">Year starts</label>
            <input id="bb-onboard-start" name="startsOn" type="date" required
                   [value]="startsOn()" (input)="startsOn.set($any($event.target).value)" />
          </div>
          <div class="bb-field">
            <label for="bb-onboard-end">Year ends</label>
            <input id="bb-onboard-end" name="endsOn" type="date" required
                   [value]="endsOn()" (input)="endsOn.set($any($event.target).value)" />
          </div>
        </div>

        <div class="bb-row" style="justify-content: flex-end;">
          <button type="submit" class="bb-btn bb-btn-primary" [disabled]="busy()">
            {{ busy() ? 'Creating school…' : 'Create school' }}
          </button>
        </div>
      </form>
    </section>
  `,
})
export class BenbenOnboardingComponent {
  private readonly session = inject(BenbenSession);

  readonly name = signal('');
  readonly code = signal('');
  readonly county = signal('');
  readonly yearName = signal(String(new Date().getFullYear()));
  readonly startsOn = signal(`${new Date().getFullYear()}-01-05`);
  readonly endsOn = signal(`${new Date().getFullYear()}-11-27`);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.session.createSchool({
        name: this.name(),
        code: this.code(),
        county: this.county() || null,
        year: { name: this.yearName(), startsOn: this.startsOn(), endsOn: this.endsOn() },
        terms: splitTerms(this.startsOn(), this.endsOn()),
      });
    } catch (error) {
      this.error.set(describeError(error instanceof ApiError ? error.code : null));
    } finally {
      this.busy.set(false);
    }
  }
}

/** Splits a school year into three terms with calendar boundaries. */
export function splitTerms(startsOn: string, endsOn: string): { name: string; ordinal: number; startsOn: string; endsOn: string }[] {
  const start = new Date(`${startsOn}T00:00:00Z`).getTime();
  const end = new Date(`${endsOn}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  const third = Math.floor((end - start) / 3);
  const boundaryOne = start + third;
  const boundaryTwo = start + third * 2;
  const iso = (value: number) => new Date(value).toISOString().slice(0, 10);
  return [
    { name: 'Term 1', ordinal: 1, startsOn: iso(start), endsOn: iso(boundaryOne - 86_400_000) },
    { name: 'Term 2', ordinal: 2, startsOn: iso(boundaryOne), endsOn: iso(boundaryTwo - 86_400_000) },
    { name: 'Term 3', ordinal: 3, startsOn: iso(boundaryTwo), endsOn: iso(end) },
  ];
}
