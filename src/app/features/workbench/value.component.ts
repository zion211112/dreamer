import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ValueService } from '@apt-labs/shared/state';
import { SectionTabsComponent, type SectionTab } from '../workspace/section-tabs.component';

/**
 * Workbench · Value. Value appears only when an explicit value record exists
 * against an undertaking. Work status, offers and reports never imply that
 * money moved, so nothing here is inferred from them.
 */
@Component({
  selector: 'app-value',
  standalone: true,
  imports: [RouterLink, SectionTabsComponent],
  template: `
    <section class="wb-value" data-module="value">
      <header class="wb-head">
        <p class="wb-eyebrow">APT-LABS · Workbench</p>
        <h1 class="wb-title">Value</h1>
        <p class="wb-lede">
          Value records are entered explicitly against an undertaking: an amount, who settled it, and when.
          Work status does not show that money moved, so this list stays empty until such a record exists.
        </p>
      </header>

      <app-section-tabs label="Workbench sections" [tabs]="tabs" />

      @if (rows().length === 0) {
        <p class="wb-value-empty">No value records are visible to you yet.</p>
      } @else {
        <div class="wb-value-wrap">
          <table class="wb-value-table">
            <thead>
              <tr>
                <th scope="col">Undertaking</th>
                <th scope="col">Organization</th>
                <th scope="col">Location</th>
                <th scope="col">Amount</th>
                <th scope="col">Settlement</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.key) {
                <tr>
                  <td><a class="wb-value-link" [routerLink]="['/workspace/workbench', row.key]">{{ row.label }}</a></td>
                  <td>{{ row.institution }}</td>
                  <td>{{ row.location }}</td>
                  <td>{{ amount(row.amount) }} {{ row.currency }}</td>
                  <td>{{ row.settled ? 'Settled' : 'Not settled' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: [
    `
    :host { display: block; font-family: var(--apt-font-sans); color: var(--apt-text-body); }
    .wb-value { max-width: 1120px; margin: 0 auto; padding: var(--apt-space-8) var(--apt-space-10); }
    .wb-eyebrow { margin: 0 0 var(--apt-space-2); font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); letter-spacing: 0.1em; text-transform: uppercase; color: var(--apt-text-dim); }
    .wb-title { margin: 0 0 var(--apt-space-3); font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); line-height: 1.1; }
    .wb-lede { margin: 0 0 var(--apt-space-6); max-width: 72ch; font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); }
    .wb-value-empty { padding: var(--apt-space-5); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-md); color: var(--apt-text-muted); font-size: var(--apt-size-body); }
    .wb-value-wrap { overflow-x: auto; border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); }
    .wb-value-table { width: 100%; border-collapse: collapse; font-size: var(--apt-size-body); }
    .wb-value-table th, .wb-value-table td { padding: var(--apt-space-3) var(--apt-space-4); border-bottom: 1px solid var(--apt-border); text-align: left; }
    .wb-value-table th { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); font-weight: normal; letter-spacing: 0.06em; text-transform: uppercase; color: var(--apt-text-dim); background: var(--apt-surface-raised); }
    .wb-value-link { color: var(--apt-text-strong); text-decoration: underline; text-underline-offset: 3px; }
    @media (max-width: 760px) { .wb-value { padding: var(--apt-space-6) var(--apt-space-4); } }
    `,
  ],
})
export class ValueComponent {
  private readonly service = inject(ValueService);

  readonly tabs: readonly SectionTab[] = [
    { label: 'Undertakings', path: '/workspace/workbench' },
    { label: 'Value', path: '/workspace/workbench/value' },
  ];

  readonly rows = this.service.rows;

  amount(value: number | null): string {
    return value === null ? '—' : value.toLocaleString('en-KE');
  }
}
