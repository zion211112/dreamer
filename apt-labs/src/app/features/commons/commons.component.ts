/**
 * @apt-labs/features/commons — CommonsComponent
 *
 * The commons is not a static fixture: it projects the live coordination spine
 * (the same `JourneyStore` the Workbench and Records read). Open inquiries,
 * in-flight commitments and delivered briefs are all the read-model of one
 * store, and the contribute form posts a real Need that ripples out to Records
 * (annals + roll) and Value in the same tick.
 */

import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoordinationService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-commons',
  imports: [RouterLink],
  template: `
    <div class="cm" data-module="commons">
      <div class="cm-body">
        <main class="cm-main">
          <div class="cm-pagehead">
            <p class="cm-eyebrow">WORKSPACE · COMMONS</p>
            <h1 class="cm-h1">The commons</h1>
            <p class="cm-sub">
              Open inquiries, in-flight commitments, delivered briefs, and the knowledge house —
              what the network has agreed, what is moving, and what has settled, all off one record.
            </p>
          </div>

          <div class="cm-section">
            <h2 class="cm-section-title">Open inquiries</h2>
            <div class="cm-list">
              @for (need of openInquiries(); track need.id) {
                <article class="cm-item cm-item--missing">
                  <span class="cm-item-kicker">open</span>
                  <div class="cm-item-main">
                    <span class="cm-item-label">{{ need.label }}</span>
                    @if (need.requires.length > 0) {
                      <span class="cm-item-requires">Requires: {{ need.requires.join(', ') }}</span>
                    }
                  </div>
                  <a [routerLink]="['/workspace', 'network']" class="cm-item-go">Find →</a>
                </article>
              }
              @if (openInquiries().length === 0) {
                <p class="cm-empty">No open inquiries — every posted need has a provider.</p>
              }
            </div>
          </div>

          <div class="cm-section">
            <h2 class="cm-section-title">In flight</h2>
            <div class="cm-list">
              @for (row of inFlight(); track row.id) {
                <article class="cm-item cm-item--pending">
                  <span class="cm-item-kicker">committed</span>
                  <div class="cm-item-main">
                    <span class="cm-item-label">{{ row.label }}</span>
                    <span class="cm-item-requires">Provider: {{ row.provider }}</span>
                  </div>
                </article>
              }
              @if (inFlight().length === 0) {
                <p class="cm-empty">No commitments in flight right now.</p>
              }
            </div>
          </div>

          <div class="cm-section">
            <h2 class="cm-section-title">Delivered briefs</h2>
            <div class="cm-list">
              @for (out of briefs(); track out.id) {
                <article class="cm-item">
                  <span class="cm-item-kicker">delivered</span>
                  <div class="cm-item-main">
                    <span class="cm-item-label">{{ out.title }}</span>
                    <span class="cm-item-requires">Accepted by {{ out.institution }}</span>
                  </div>
                </article>
              }
            </div>
          </div>

          <div class="cm-section">
            <h2 class="cm-section-title">Knowledge house</h2>
            <div class="cm-knowledge">
              @for (k of knowledge(); track k.id) {
                <article class="cm-knowledge-item">
                  <div class="cm-knowledge-head">
                    <span class="cm-knowledge-status cm-knowledge-status--distilled">distilled</span>
                    <h3 class="cm-knowledge-title">{{ k.title }}</h3>
                  </div>
                  <p class="cm-knowledge-summary">{{ k.summary }}</p>
                  <span class="cm-knowledge-provenance">On the roll · {{ k.provenance }}</span>
                </article>
              }
            </div>
          </div>

          <div class="cm-section">
            <h2 class="cm-section-title">Contribute to the commons</h2>
            <form class="cm-form" (ngSubmit)="onSubmit()">
              <div class="cm-form-row">
                <label class="cm-label" for="cm-need">What is the need?</label>
                <input id="cm-need" type="text" class="cm-input" placeholder="Describe the need you're posting to the record" [value]="needText()" (input)="needText.set($any($event.target).value)" />
              </div>
              <button type="submit" class="cm-submit">Post to commons</button>
              <p class="cm-note">Posting writes an open inquiry to the record — it appears above and in Records.</p>
            </form>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
.cm { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }
.cm-body { display: flex; flex: 1; min-height: 0; }
.cm-main { flex: 1; min-width: 0; padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22); max-width: 1180px; }
.cm-pagehead { margin-bottom: var(--apt-spacing-s10); }
.cm-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0 0 var(--apt-spacing-s2); }
.cm-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); letter-spacing: -0.022em; line-height: 1.05; color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); }
.cm-sub { font-size: var(--apt-font-size-body-md); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; max-width: 72ch; }
.cm-section { margin-bottom: var(--apt-spacing-s10); }
.cm-section-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s5); position: relative; padding-left: var(--apt-spacing-s5); }
.cm-section-title::before { content: ''; position: absolute; left: 0; top: 0.35em; width: 3px; height: 0.7em; background: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.cm-list { display: flex; flex-direction: column; gap: var(--apt-spacing-s4); }
.cm-item { display: flex; align-items: flex-start; gap: var(--apt-spacing-s5); padding: var(--apt-spacing-s5) var(--apt-spacing-s6); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); }
.cm-item:hover { border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 40%, var(--apt-border)); }
.cm-item--missing { border-left: 3px solid var(--apt-color-error-base, #b91c1c); }
.cm-item--pending { border-left: 3px solid var(--apt-color-warning-base, #92400e); }
.cm-item-kicker { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); min-width: 72px; white-space: nowrap; padding-top: 2px; }
.cm-item--missing .cm-item-kicker { color: var(--apt-color-error-base, #b91c1c); }
.cm-item--pending .cm-item-kicker { color: var(--apt-color-warning-base, #92400e); }
.cm-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.cm-item-label { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; }
.cm-item-requires { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); }
.cm-item-go { font-size: var(--apt-font-size-body-sm); color: var(--apt-module-accent, var(--apt-color-brand-primary)); text-decoration: none; white-space: nowrap; padding: var(--apt-spacing-s2) var(--apt-spacing-s3); border-radius: var(--apt-radius-r1); align-self: center; }
.cm-item-go:hover { background: var(--apt-surface-raised); text-decoration: underline; }
.cm-empty { color: var(--apt-text-muted); font-size: var(--apt-font-size-body-sm); padding: var(--apt-spacing-s4); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-r2); text-align: center; }
.cm-knowledge { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--apt-spacing-s5); }
.cm-knowledge-item { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s5) var(--apt-spacing-s6); display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
.cm-knowledge-head { display: flex; align-items: center; gap: var(--apt-spacing-s3); flex-wrap: wrap; }
.cm-knowledge-status { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 1px 6px; }
.cm-knowledge-status--distilled { color: var(--apt-module-accent, var(--apt-color-brand-primary)); border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 40%, var(--apt-border)); }
.cm-knowledge-title { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0; flex: 1; min-width: 0; }
.cm-knowledge-summary { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; }
.cm-knowledge-provenance { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); margin-top: auto; }
.cm-form { display: flex; flex-direction: column; gap: var(--apt-spacing-s5); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s7); max-width: 560px; }
.cm-form-row { display: flex; flex-direction: column; gap: var(--apt-spacing-s2); }
.cm-label { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
.cm-input { width: 100%; padding: var(--apt-spacing-s3) var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); background: var(--apt-surface-raised); font-size: var(--apt-font-size-body-md); color: var(--apt-text-body); outline: none; }
.cm-input:focus { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.cm-note { font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); margin: 0; }
.cm-submit { align-self: flex-start; padding: var(--apt-spacing-s3) var(--apt-spacing-s7); background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border: 0; border-radius: var(--apt-radius-r1); font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-medium); cursor: pointer; }
.cm-submit:hover { background: var(--apt-color-neutral-n950); }
@media (max-width: 900px) { .cm-main { padding: var(--apt-spacing-s8); } .cm-knowledge { grid-template-columns: 1fr; } }
`,
  ],
})
export class CommonsComponent {
  private readonly coordination = inject(CoordinationService);

  readonly needText = signal('');

  /** Open inquiries — needs with no provider yet. */
  readonly openInquiries = computed(() =>
    this.coordination.needs().filter((n) => n.status === 'open')
      .map((n) => ({ id: n.needId, label: n.label, requires: n.requires, status: n.status })),
  );

  /** In flight — needs a provider has accepted but not yet delivered. */
  readonly inFlight = computed(() =>
    this.coordination.needs().filter((n) => n.status === 'committed')
      .map((n) => ({ id: n.needId, label: n.label, provider: this.institutionName(n.providerActorId), status: n.status })),
  );

  /** Delivered briefs — fulfilled outcomes, keyed by need. */
  readonly briefs = computed(() =>
    this.coordination.needs().filter((n) => n.status === 'fulfilled')
      .map((n) => ({ id: n.needId, title: n.outcome ?? n.label, institution: this.institutionName(n.providerActorId), status: n.status })),
  );

  /** Knowledge house — settled, distilled from the delivered outcomes on the roll. */
  readonly knowledge = computed(() =>
    this.coordination.needs().filter((n) => n.status === 'fulfilled')
      .map((n) => ({
        id: `k-${n.needId}`,
        title: n.outcome ?? n.label,
        summary: `Sealed with ${n.evidenceIds.length} evidence item${n.evidenceIds.length === 1 ? '' : 's'} on the roll.`,
        provenance: this.institutionName(n.providerActorId),
      })),
  );

  readonly institutionName = (id: string | null): string => {
    if (!id) return '—';
    return this.coordination.institutions.get(id) ?? id;
  };

  /** Post a real Need to the record — it ripples into Records and Value. */
  readonly onSubmit = (): void => {
    const text = this.needText().trim();
    if (!text) return;
    this.coordination.createNeed({ need: text });
    this.needText.set('');
  };
}
