/**
 * @apt-labs/features/commons — CommonsComponent
 *
 * The commons projects the live coordination spine. Open inquiries,
 * in-flight commitments and delivered briefs ripple out from one record.
 * Structural Emergence.
 */
import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoordinationService } from '@apt-labs/shared/state';

@Component({
  selector: 'app-commons',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="cm" data-module="commons">
      <div class="cm-pagehead">
        <h1 class="cm-h1">The commons</h1>
        <p class="cm-sub">
          Open inquiries, in-flight commitments, delivered briefs, and the knowledge house —
          what the network has agreed, what is moving, and what has settled, all off one record.
        </p>
        <div class="cm-actions">
          <input
            class="cm-need-input"
            [value]="needText()"
            (input)="needText.set($any($event.target).value)"
            placeholder="Post a need to the commons…"
            aria-label="New need"
          />
          <button class="cm-btn cm-btn--primary" type="button" (click)="onSubmit()">Post to commons</button>
        </div>
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
    </div>
  `,
  styles: [
    `
    .cm {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .cm-pagehead { display: flex; flex-direction: column; gap: var(--apt-space-3); margin-bottom: var(--apt-space-10); padding-left: var(--apt-space-10); }
    .cm-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-3); line-height: 1.05; letter-spacing: -0.02em; }
    .cm-sub { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-relaxed); }
    .cm-actions { display: flex; gap: var(--apt-space-3); margin-top: var(--apt-space-4); align-items: center; }
    .cm-need-input { flex: 1; min-width: 200px; padding: var(--apt-space-3) var(--apt-space-5); border-radius: var(--apt-button-radius); border: 1px solid var(--apt-border); background: var(--apt-surface-raised); color: var(--apt-text-body); font-size: var(--apt-size-body); font-family: inherit; }
    .cm-need-input:focus { outline: none; border-color: var(--apt-accent); }
    .cm-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--apt-space-2);
      padding: var(--apt-button-padding);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-button-font-size);
      font-weight: var(--apt-button-font-weight);
      font-family: inherit;
      cursor: pointer;
    }
    .cm-btn:hover { border-color: var(--apt-accent); }
    .cm-btn--primary { background: var(--apt-accent); color: var(--apt-action-on-accent); border-color: var(--apt-accent); }

    .cm-section { margin-bottom: var(--apt-space-10); }
    .cm-section-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-space-5); position: relative; padding-left: var(--apt-space-5); }
    .cm-section-title::before { content: ''; position: absolute; left: 0; top: 0.35em; width: 3px; height: 0.7em; background: var(--apt-accent); }

    .cm-list { display: flex; flex-direction: column; gap: var(--apt-space-4); }
    .cm-item { display: flex; align-items: flex-start; gap: var(--apt-space-5); padding: var(--apt-space-5) var(--apt-space-6); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); }
    .cm-item:hover { border-color: color-mix(in srgb, var(--apt-accent) 40%, var(--apt-border)); }
    .cm-item--missing { border-left: 3px solid var(--apt-state-risk); }
    .cm-item--pending { border-left: 3px solid var(--apt-state-caution); }
    .cm-item-kicker { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); min-width: 72px; white-space: nowrap; padding-top: 2px; }
    .cm-item--missing .cm-item-kicker { color: var(--apt-state-risk); }
    .cm-item--pending .cm-item-kicker { color: var(--apt-state-caution); }
    .cm-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .cm-item-label { font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; }
    .cm-item-requires { font-size: var(--apt-size-body); color: var(--apt-text-muted); }
    .cm-item-go { font-size: var(--apt-size-body); color: var(--apt-accent); text-decoration: none; white-space: nowrap; padding: var(--apt-space-2) var(--apt-space-3); border-radius: var(--apt-button-radius); align-self: center; }
    .cm-item-go:hover { background: var(--apt-surface-raised); text-decoration: underline; }

    .cm-empty { color: var(--apt-text-muted); font-size: var(--apt-size-body); padding: var(--apt-space-4); border: 1px dashed var(--apt-border); border-radius: var(--apt-radius-md); text-align: center; }

    .cm-knowledge { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--apt-space-5); }
    .cm-knowledge-item { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-page); padding: var(--apt-space-5) var(--apt-space-6); display: flex; flex-direction: column; gap: var(--apt-space-3); }
    .cm-knowledge-head { display: flex; align-items: center; gap: var(--apt-space-3); flex-wrap: wrap; }
    .cm-knowledge-status { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); padding: 1px 6px; }
    .cm-knowledge-status--distilled { color: var(--apt-accent); border-color: color-mix(in srgb, var(--apt-accent) 40%, var(--apt-border)); }
    .cm-knowledge-title { font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; margin: 0; flex: 1; min-width: 0; }
    .cm-knowledge-summary { font-size: var(--apt-size-body); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0; }
    .cm-knowledge-provenance { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); color: var(--apt-text-dim); margin-top: auto; }

    @media (max-width: 900px) {
      .cm-actions { flex-direction: column; align-items: stretch; }
      .cm-need-input { width: 100%; }
    }
    `,
  ],
})
export class CommonsComponent {
  private readonly coordination = inject(CoordinationService);

  readonly needText = signal('');

  readonly openInquiries = computed(() =>
    this.coordination.needs().filter((n) => n.status === 'open')
      .map((n) => ({ id: n.needId, label: n.label, requires: n.requires, status: n.status })),
  );

  readonly inFlight = computed(() =>
    this.coordination.needs().filter((n) => n.status === 'committed')
      .map((n) => ({ id: n.needId, label: n.label, provider: this.institutionName(n.providerActorId), status: n.status })),
  );

  readonly briefs = computed(() =>
    this.coordination.needs().filter((n) => n.status === 'fulfilled')
      .map((n) => ({ id: n.needId, title: n.outcome ?? n.label, institution: this.institutionName(n.providerActorId), status: n.status })),
  );

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

  readonly onSubmit = (): void => {
    const text = this.needText().trim();
    if (!text) return;
    this.coordination.createNeed({ need: text });
    this.needText.set('');
  };
}
