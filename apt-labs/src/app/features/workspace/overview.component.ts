import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OPERATIONAL_PILOTS } from '@apt-labs/domain';
import {
  FAMILY,
  EVIDENCE_STANDING,
  EVIDENCE_STANDING_LABELS,
  CANONICAL_DISTINCTIONS,
  RELATIONSHIP_KIND,
} from '@apt-labs/ontology';

@Component({
  selector: 'app-overview',
  imports: [RouterLink],
  template: `
    <div class="ov" data-module="overview">
      <div class="ov-body">
        <main class="ov-main">
          <div class="ov-pagehead">
            <p class="ov-eyebrow">WORKSPACE · LIVE OPERATIONS</p>
            <h1 class="ov-h1">The chain is working</h1>
            <p class="ov-sub">
              This board reads the live record — undertakings in flight, the value they disclose, the
              people claiming capability, and the verbs that move them. Open one and start.
            </p>
          </div>

          <div class="ov-board">
            <div class="ov-board-metrics">
              @for (m of metrics(); track m.label) {
                <div class="ov-metric">
                  <div class="ov-metric-num">{{ m.display }}</div>
                  <div class="ov-metric-unit">{{ m.unit }}</div>
                  <div class="ov-metric-label">{{ m.label }}</div>
                </div>
              }
            </div>

            <div class="ov-board-lead">
              <div class="ov-board-kicker">In flight</div>
              <p class="ov-board-sub">
                {{ undertakings() }} undertakings across {{ institutionCount() }} institutions. Each row is a
                live work unit — open it, verify it, or settle it.
              </p>
            </div>

            <ul class="ov-board-list">
              @for (row of inFlight(); track row.id) {
                <li class="ov-row">
                  <span class="ov-row-type" [class]="'is-' + row.type">{{ row.type }}</span>
                  <div class="ov-row-main">
                    <span class="ov-row-label">{{ row.label }}</span>
                    <span class="ov-row-meta">{{ row.institution }} · {{ row.location }} · settled {{ row.acceptedAt }}</span>
                  </div>
                  <div class="ov-row-stats">
                    <span class="ov-row-stat"><b>{{ row.deliverables }}</b> deliverables</span>
                    <span class="ov-row-stat"><b>{{ row.evidence }}</b> evidence</span>
                    <span class="ov-row-stat ov-row-cost">{{ row.cost }}</span>
                  </div>
                  <a [routerLink]="['/workspace', 'workbench']" class="ov-row-go">Open in workbench <span class="ov-row-arrow" aria-hidden="true">→</span></a>
                  <a [routerLink]="['/workspace', 'records', 'roll']" class="ov-row-verify">Verify</a>
                </li>
              }
            </ul>
          </div>

          <div class="ov-moves">
            @for (m of moves(); track m.to) {
              <a [routerLink]="[m.to]" class="ov-move">
                <span class="ov-move-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="m.icon" /></svg></span>
                <span class="ov-move-text">
                  <span class="ov-move-verb">{{ m.verb }}</span>
                  <span class="ov-move-consequence">{{ m.consequence }}</span>
                </span>
                <span class="ov-move-go" aria-hidden="true">→</span>
              </a>
            }
          </div>

          <details class="ov-ref">
            <summary class="ov-ref-summary">
              <span class="ov-ref-title">The reference</span>
              <span class="ov-ref-count">{{ familyCount }} families · {{ relationKindCount }} relation kinds · {{ standingStates.length }} standings · {{ canonicalDistinctions.length }} distinctions</span>
              <span class="ov-ref-caret" aria-hidden="true">▸</span>
            </summary>

            <div class="ov-ref-body">
              <div class="ov-ref-tools">
                <div class="ov-search">
                  <svg class="ov-search-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 1-4.8 13.3L3 19.1 4.4 20.5l2.8-2.8A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" /></svg>
                  <input class="ov-search-input" type="search" placeholder="Filter the reference — families, relations, distinctions…" aria-label="Filter the reference" [value]="query()" (input)="query.set($any($event.target).value)" />
                </div>
                <a [routerLink]="['/workspace', 'intelligence']" class="ov-quiet">Open Intelligence →</a>
              </div>

              @if (noMatches()) {
                <p class="ov-empty">Nothing in the reference matches “{{ query() }}”. Clear the field to see the full structure.</p>
              }

              @for (g of visibleGroups(); track g.key) {
                <section [attr.id]="'group-' + g.key" class="ov-group" [attr.aria-labelledby]="'group-' + g.key + '-title'" [style]="'--group-accent:' + g.accent">
                  <div class="ov-group-head">
                    <h3 [attr.id]="'group-' + g.key + '-title'" class="ov-group-title">{{ g.label }}</h3>
                    <span class="ov-group-count">{{ g.families.length }} families</span>
                  </div>
                  <p class="ov-group-note">{{ g.note }}</p>
                  <ul class="ov-cards">
                    @for (f of g.families; track f) {
                      <li class="ov-card" [style]="'--family-accent:' + familyAccent(f)">
                        <div class="ov-card-head">
                          <span class="ov-card-icon" aria-hidden="true">{{ familyIcon(f) }}</span>
                          <h4 class="ov-card-name">{{ familyLabels[f] }}</h4>
                        </div>
                        <p class="ov-card-rellead" aria-hidden="true">{{ (relations[f] ?? []).length }} defined relations</p>
                        <ul class="ov-chips">
                          @for (r of (relations[f] ?? []); track r) {
                            <li class="ov-chip">{{ r.replace(/_/g, ' ') }}</li>
                          }
                        </ul>
                      </li>
                    }
                  </ul>
                </section>
              }

              <section id="context" class="ov-context" aria-labelledby="context-title">
                <div class="ov-context-lead">
                  <span class="ov-context-icon" aria-hidden="true">{{ familyIcon(contextFamily) }}</span>
                  <div>
                    <h3 id="context-title" class="ov-context-title">Context — {{ familyLabels[contextFamily] }}</h3>
                    <p class="ov-context-note">
                      Not a fourth column. Every actor, resource and commitment above is situated somewhere,
                      and that situation is recorded rather than assumed.
                    </p>
                  </div>
                </div>
                <ul class="ov-chips">
                  @for (r of (relations[contextFamily] ?? []); track r) {
                    <li class="ov-chip">{{ r.replace(/_/g, ' ') }}</li>
                  }
                </ul>
              </section>

              <section id="distinctions" class="ov-panel" aria-labelledby="distinctions-title">
                <div class="ov-panel-head">
                  <h3 id="distinctions-title" class="ov-panel-title">What we refuse to collapse</h3>
                  <span class="ov-panel-count">{{ visibleDistinctions().length }}</span>
                </div>
                <p class="ov-panel-note">
                  Named distinctions are enforced in schema and surfaced in the interface. An interface
                  that merges any two of these has stopped representing the domain.
                </p>
                <ul class="ov-distinctions">
                  @for (d of visibleDistinctions(); track d) {
                    <li class="ov-distinction">{{ d }}</li>
                  }
                </ul>
              </section>

              <section id="standing" class="ov-panel" aria-labelledby="standing-title">
                <div class="ov-panel-head">
                  <h3 id="standing-title" class="ov-panel-title">Standing, not a score</h3>
                  <span class="ov-panel-count">{{ standingStates.length }}</span>
                </div>
                <p class="ov-panel-note">
                  Seven states, held apart on purpose. They are shown side by side and never averaged into a
                  single number, because a number gets quoted and the disagreement is the signal.
                </p>
                <ul class="ov-standing">
                  @for (s of standingStates; track s) {
                    <li class="ov-standing-item" [style]="'--standing-accent:' + standingAccent(s)">
                      <span class="ov-standing-swatch" aria-hidden="true"></span>
                      <span class="ov-standing-label">{{ standingLabels[s] }}</span>
                      <span class="ov-standing-meaning">{{ standingMeaning[s] }}</span>
                    </li>
                  }
                </ul>
              </section>
            </div>
          </details>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
.ov { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }
.ov-body { display: flex; flex: 1; min-height: 0; }
.ov-main { flex: 1; min-width: 0; padding: var(--apt-spacing-s12) var(--apt-spacing-s16) var(--apt-spacing-s22); max-width: 1180px; }
.ov-pagehead { margin-bottom: var(--apt-spacing-s8); }
.ov-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0 0 var(--apt-spacing-s2); }
.ov-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); letter-spacing: -0.022em; line-height: 1.05; color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); }
.ov-sub { font-size: var(--apt-font-size-body-md); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; max-width: 64ch; }
.ov-board { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); overflow: hidden; background: var(--apt-surface-page); margin-bottom: var(--apt-spacing-s10); }
.ov-board-metrics { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 1px; background: var(--apt-border); }
.ov-metric { background: var(--apt-surface-page); padding: var(--apt-spacing-s6); border-left: 3px solid var(--apt-module-accent, var(--apt-color-brand-primary)); }
.ov-metric-num { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); line-height: 1; letter-spacing: -0.01em; }
.ov-metric-unit { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-body-sm); letter-spacing: 0.04em; color: var(--apt-text-muted); margin-top: var(--apt-spacing-s1); }
.ov-metric-label { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.08em; text-transform: uppercase; color: var(--apt-text-dim); margin-top: var(--apt-spacing-s3); }
.ov-board-lead { padding: var(--apt-spacing-s7) var(--apt-spacing-s8) var(--apt-spacing-s4); }
.ov-board-kicker { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; text-transform: uppercase; color: var(--apt-text-dim); }
.ov-board-sub { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: var(--apt-spacing-s2) 0 0; max-width: 72ch; }
.ov-board-list { list-style: none; margin: 0; padding: 0; }
.ov-row { display: grid; grid-template-columns: 96px minmax(0, 1.4fr) auto auto; align-items: center; gap: var(--apt-spacing-s6); padding: var(--apt-spacing-s5) var(--apt-spacing-s8); border-top: 1px solid var(--apt-border-faint, var(--apt-border)); }
.ov-row:hover { background: var(--apt-surface-raised); }
.ov-row-type { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); letter-spacing: 0.03em; text-transform: lowercase; color: var(--apt-text-muted); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 2px 7px; white-space: nowrap; }
.ov-row-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ov-row-label { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; }
.ov-row-meta { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); }
.ov-row-stats { display: flex; gap: var(--apt-spacing-s5); font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); white-space: nowrap; }
.ov-row-stat b { font-family: var(--apt-font-serif); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-body); }
.ov-row-cost { color: var(--apt-module-accent, var(--apt-color-brand-primary)); font-weight: var(--apt-font-weight-medium); }
.ov-row-go { font-size: var(--apt-font-size-body-sm); font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); text-decoration: none; display: inline-flex; align-items: center; gap: var(--apt-spacing-s2); padding: var(--apt-spacing-s2) var(--apt-spacing-s4); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); background: var(--apt-surface-raised); white-space: nowrap; }
.ov-row-go:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); box-shadow: var(--apt-shadow-sh1); }
.ov-row-arrow { color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.ov-row-verify { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); text-decoration: none; padding: var(--apt-spacing-s2) var(--apt-spacing-s3); border-radius: var(--apt-radius-r1); white-space: nowrap; }
.ov-row-verify:hover { color: var(--apt-module-accent, var(--apt-color-brand-primary)); background: var(--apt-surface-raised); }
.ov-moves { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--apt-spacing-s4); margin-bottom: var(--apt-spacing-s4); }
.ov-move { display: flex; align-items: flex-start; gap: var(--apt-spacing-s4); padding: var(--apt-spacing-s6); background: var(--apt-surface-page); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); text-decoration: none; color: var(--apt-text-body); }
.ov-move:hover { border-color: color-mix(in srgb, var(--apt-module-accent, var(--apt-color-brand-primary)) 40%, var(--apt-border)); box-shadow: var(--apt-shadow-sh2); transform: translateY(-1px); }
.ov-move-icon { width: 24px; height: 24px; flex: none; color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.ov-move-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.ov-move-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ov-move-verb { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); letter-spacing: -0.01em; }
.ov-move-consequence { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); }
.ov-move-go { margin-left: auto; align-self: center; flex: none; color: var(--apt-module-accent, var(--apt-color-brand-primary)); font-size: var(--apt-font-size-title-2); }
.ov-empty { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); border: 1px dashed var(--apt-border); padding: var(--apt-spacing-s6); margin: 0 0 var(--apt-spacing-s8); }
.ov-ref { margin-top: var(--apt-spacing-s10); border-top: 1px solid var(--apt-border); padding-top: var(--apt-spacing-s4); }
.ov-ref-summary { display: flex; align-items: center; gap: var(--apt-spacing-s4); cursor: pointer; list-style: none; padding: var(--apt-spacing-s3) 0; user-select: none; }
.ov-ref-summary::-webkit-details-marker { display: none; }
.ov-ref-summary:hover .ov-ref-title { color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
.ov-ref-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); }
.ov-ref-count { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); color: var(--apt-text-dim); letter-spacing: 0.02em; }
.ov-ref-caret { margin-left: auto; color: var(--apt-text-dim); transition: transform var(--apt-animation-fast); }
.ov-ref[open] .ov-ref-caret { transform: rotate(90deg); }
.ov-ref-body { padding-top: var(--apt-spacing-s4); }
.ov-ref-tools { display: flex; align-items: center; justify-content: space-between; gap: var(--apt-spacing-s4); margin-bottom: var(--apt-spacing-s8); }
.ov-search { display: flex; align-items: center; gap: var(--apt-spacing-s3); flex: 1; max-width: 460px; padding: 0 var(--apt-spacing-s4); height: 30px; background: var(--apt-surface-page); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); }
.ov-search-icon { width: 14px; height: 14px; color: var(--apt-text-dim); flex: none; }
.ov-search-input { flex: 1; min-width: 0; border: 0; background: transparent; font: inherit; font-size: var(--apt-font-size-body-md); color: var(--apt-text-body); outline: none; }
.ov-group { margin-bottom: var(--apt-spacing-s12); }
.ov-group-head { display: flex; align-items: baseline; gap: var(--apt-spacing-s3); border-bottom: 1px solid var(--apt-border); padding-bottom: var(--apt-spacing-s2); margin-bottom: var(--apt-spacing-s3); }
.ov-group-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0; position: relative; padding-left: var(--apt-spacing-s4); }
.ov-group-title::before { content: ''; position: absolute; left: 0; top: 0.32em; width: 3px; height: 0.78em; background: var(--group-accent); }
.ov-group-count { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); }
.ov-group-note { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s6); max-width: 78ch; }
.ov-cards { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--apt-spacing-s4); }
.ov-card { border: 1px solid var(--apt-border); border-top: 2px solid var(--family-accent); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s5) var(--apt-spacing-s6) var(--apt-spacing-s6); display: flex; flex-direction: column; gap: var(--apt-spacing-s3); }
.ov-card-head { display: flex; align-items: center; gap: var(--apt-spacing-s3); }
.ov-card-icon { width: 30px; height: 30px; display: grid; place-items: center; flex: none; color: var(--family-accent); background: color-mix(in srgb, var(--family-accent) 12%, transparent); border-radius: var(--apt-radius-r0); }
.ov-card-name { font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); letter-spacing: -0.01em; color: var(--apt-text-strong); margin: 0; }
.ov-card-rellead { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.07em; color: var(--apt-text-muted); margin: 0; padding-top: var(--apt-spacing-s3); border-top: 1px solid var(--apt-border-faint, var(--apt-border)); }
.ov-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s2); }
.ov-chip { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-sm-3); text-transform: lowercase; letter-spacing: 0.01em; color: var(--apt-text-body); background: var(--apt-surface-raised); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 2px 6px; white-space: nowrap; }
.ov-context { display: flex; align-items: center; justify-content: space-between; gap: var(--apt-spacing-s8); flex-wrap: wrap; padding: var(--apt-spacing-s6); margin-bottom: var(--apt-spacing-s12); background: var(--apt-surface-page); border: 1px solid var(--apt-border); border-left: 3px solid var(--apt-family-place); border-radius: var(--apt-radius-r2); }
.ov-context-lead { display: flex; align-items: flex-start; gap: var(--apt-spacing-s4); max-width: 70ch; }
.ov-context-icon { color: var(--apt-family-place); margin-top: 2px; }
.ov-context-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-2); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s1); }
.ov-context-note { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0; }
.ov-panel { border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); background: var(--apt-surface-page); padding: var(--apt-spacing-s8); margin-bottom: var(--apt-spacing-s8); }
.ov-panel-head { display: flex; align-items: center; gap: var(--apt-spacing-s3); margin-bottom: var(--apt-spacing-s2); }
.ov-panel-title { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-title-1); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0; }
.ov-panel-count { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r0); padding: 0 5px; }
.ov-panel-note { font-size: var(--apt-font-size-body-sm); line-height: var(--apt-line-height-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s6); max-width: 82ch; }
.ov-distinctions { list-style: none; margin: 0; padding: 0; columns: 2; column-gap: var(--apt-spacing-s12); }
.ov-distinction { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-body-sm); color: var(--apt-text-body); padding: var(--apt-spacing-s1) 0; border-bottom: 1px solid var(--apt-border-faint, var(--apt-border)); break-inside: avoid; }
.ov-standing { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(272px, 1fr)); gap: var(--apt-spacing-s2) var(--apt-spacing-s8); }
.ov-standing-item { display: grid; grid-template-columns: 10px auto; grid-template-rows: auto auto; column-gap: var(--apt-spacing-s3); padding: var(--apt-spacing-s2) 0; border-bottom: 1px solid var(--apt-border-faint, var(--apt-border)); }
.ov-standing-swatch { grid-row: 1 / span 2; width: 3px; height: 100%; background: var(--standing-accent); align-self: stretch; }
.ov-standing-label { font-size: var(--apt-font-size-body-md); font-weight: var(--apt-font-weight-medium); color: var(--apt-text-strong); }
.ov-standing-meaning { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); line-height: var(--apt-line-height-normal); }
.ov-quiet { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-muted); text-decoration: none; border-bottom: 1px solid var(--apt-border); padding-bottom: 1px; }
.ov-quiet:hover { color: var(--apt-module-accent, var(--apt-color-brand-primary)); border-bottom-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
@media (max-width: 1000px) {
  .ov-main { padding: var(--apt-spacing-s8); }
  .ov-board-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ov-row { grid-template-columns: 1fr auto; row-gap: var(--apt-spacing-s3); }
  .ov-row-type { grid-column: 1 / -1; width: fit-content; }
  .ov-row-stats { grid-column: 1 / -1; }
  .ov-row-go { grid-column: 1 / -1; justify-content: center; }
  .ov-row-verify { grid-column: 1 / -1; text-align: center; }
  .ov-distinctions { columns: 1; }
}
@media (max-width: 760px) {
  .ov-board-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ov-moves { grid-template-columns: 1fr; }
  .ov-cards { grid-template-columns: 1fr; }
  .ov-ref-summary { flex-wrap: wrap; }
}
`,
  ],
})
export class OverviewComponent {
  readonly pilots = OPERATIONAL_PILOTS;
  readonly undertakings = computed(() => this.pilots.length);
  readonly institutionCount = computed(() => new Set(this.pilots.map((p) => p.institution.id)).size);
  readonly peopleCount = computed(() => new Set(this.pilots.flatMap((p) => p.participants).map((x) => x.personId)).size);
  readonly evidenceCount = computed(() => this.pilots.reduce((n, p) => n + p.evidence.length, 0));
  readonly deliverableCount = computed(() => this.pilots.reduce((n, p) => n + p.deliverables.length, 0));
  readonly valueDisclosed = computed(() => this.pilots.reduce((n, p) => n + (p.acceptance.costDisclosed?.amount ?? 0), 0));

  readonly metrics = computed(() => [
    { display: String(this.undertakings()), unit: 'undertakings', label: 'In flight' },
    { display: String(this.institutionCount()), unit: 'institutions', label: 'Commissioning' },
    { display: String(this.peopleCount()), unit: 'people', label: 'Claiming capability' },
    { display: String(this.evidenceCount()), unit: 'evidence items', label: 'On the record' },
    { display: this.valueDisclosed().toLocaleString('en-KE'), unit: 'KES disclosed', label: 'Value settled' },
  ]);

  readonly inFlight = computed(() => this.pilots.map((p) => ({
    id: p.id,
    label: p.label,
    institution: p.institution.name,
    location: p.location,
    type: p.undertakingType,
    deliverables: p.deliverables.length,
    evidence: p.evidence.length,
    cost: p.acceptance.costDisclosed ? p.acceptance.costDisclosed.amount.toLocaleString('en-KE') + ' ' + p.acceptance.costDisclosed.currency : 'Undisclosed',
    acceptedAt: (p.acceptance.acceptedAt ?? '').slice(0, 10) || '—',
  })));

  readonly moves = computed(() => [
    { to: '/workspace/workbench', verb: 'Open the workbench', consequence: `${this.undertakings()} undertakings across ${this.institutionCount()} institutions — pick one up and see exactly what blocks it.`, icon: 'M4 5h16M4 12h16M4 19h10' },
    { to: '/workspace/records/roll', verb: 'Verify evidence', consequence: `${this.evidenceCount()} items on the ledger — move a claim up a standing, or dispute one that has drifted.`, icon: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z M9 12l2 2 4-4' },
    { to: '/workspace/records', verb: 'File a record', consequence: `Put a claim in provenance intact — ${this.deliverableCount()} deliverables and ${this.evidenceCount()} evidence items back the ledger.`, icon: 'M7 4h7l4 4v12H7zM14 4v4h4M10 12h5M10 16h4' },
    { to: '/workspace/commons', verb: 'Start an inquiry', consequence: `KES ${this.valueDisclosed().toLocaleString('en-KE')} disclosed across the settlements — bind the next one to a testable proposition.`, icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  ] as const);

  // The reference is the real ontology, not a private copy.
  readonly familyCount = Object.keys(FAMILY).length;
  readonly relationKindCount = Object.keys(RELATIONSHIP_KIND).length;
  readonly standingStates = Object.values(EVIDENCE_STANDING);
  readonly standingLabels: Record<string, string> = EVIDENCE_STANDING_LABELS as unknown as Record<string, string>;
  readonly canonicalDistinctions = CANONICAL_DISTINCTIONS;

  readonly standingMeaning: Record<string, string> = {
    [EVIDENCE_STANDING.UNASSESSED]: 'Recorded, nobody has looked yet.',
    [EVIDENCE_STANDING.REPORTED]: 'Someone said so. No artefact behind it.',
    [EVIDENCE_STANDING.SUPPORTED]: 'Artefacts exist and were checked.',
    [EVIDENCE_STANDING.VERIFIED]: 'An authorised party confirmed it.',
    [EVIDENCE_STANDING.DISPUTED]: 'Challenged, and not yet resolved.',
    [EVIDENCE_STANDING.REJECTED]: 'Challenged, and found wanting.',
    [EVIDENCE_STANDING.EXPIRED]: 'Was true. The conditions moved.',
  };

  readonly query = signal('');
  readonly familyLabels: Record<string, string> = {
    ACTOR: 'Actor', CAPABILITY: 'Capability', RESOURCE: 'Resource', PLACE: 'Place', INTENTION: 'Intention',
    COMMITMENT: 'Commitment', WORK: 'Work', ACTIVITY: 'Activity', EVENT: 'Event', OUTPUT_OUTCOME: 'Output/Outcome',
    EXCHANGE: 'Exchange', VALUE: 'Value', EVIDENCE: 'Evidence', KNOWLEDGE: 'Knowledge', GOVERNANCE: 'Governance',
  };

  readonly visibleGroups = computed(() => {
    const groups: { key: string; label: string; accent: string; families: string[]; note: string }[] = [
      { key: 'core', label: 'Operational core', accent: 'var(--apt-group-core)', families: ['ACTOR','CAPABILITY','RESOURCE','INTENTION','COMMITMENT','WORK'], note: 'Who acts, what they can do, what they hold, what they want, what they promise, what is done.' },
      { key: 'continuity', label: 'Continuity & learning', accent: 'var(--apt-group-continuity)', families: ['ACTIVITY','EVENT','OUTPUT_OUTCOME','EVIDENCE','KNOWLEDGE'], note: 'How work is carried out, what results, what can be shown, what is retained.' },
      { key: 'value', label: 'Value & legitimacy', accent: 'var(--apt-group-value)', families: ['EXCHANGE','VALUE','GOVERNANCE','PLACE'], note: 'What circulates between parties, and who had the standing to authorise it.' },
    ];
    const q = this.query();
    if (!q) return groups;
    const hay = (s: string[]) => s.join(' ').toLowerCase();
    return groups.map((g) => ({ ...g, families: g.families.filter((f) => hay([this.familyLabels[f] ?? f, f].concat(this.relations[f] ?? [])).includes(q)) })).filter((g) => g.families.length > 0);
  });

  readonly visibleDistinctions = computed(() => this.canonicalDistinctions.filter((d) => !this.query() || d.toLowerCase().includes(this.query())));

  readonly noMatches = computed(() => this.query().length > 0 && this.visibleGroups().length === 0 && this.visibleDistinctions().length === 0);

  private readonly relations: Record<string, string[]> = {
    ACTOR: ['AFFILIATED_WITH','ACTS_ON_BEHALF_OF'], CAPABILITY: ['HOLDS_CAPABILITY','OFFERS_CAPACITY','OPERATES'],
    RESOURCE: ['CONTROLS_RESOURCE','CUSTODIES','REQUIRES'], PLACE: ['LOCATED_AT'], INTENTION: ['RESPONDS_TO','DERIVED_FROM'],
    COMMITMENT: ['COMMITTED_TO','AUTHORIZED_BY','FULFILLS'], WORK: ['ASSIGNED_TO','USES','PRODUCES'],
    ACTIVITY: ['DEPENDS_ON','USES'], EVENT: ['OCCURS_IN','TIMES','TRIGGERS'],
    OUTPUT_OUTCOME: ['PRODUCES','DERIVED_FROM'], EXCHANGE: ['SETTLES','FUNDS'],
    VALUE: ['VALUED_AT','ALLOCATES','RECONCILES'],
    EVIDENCE: ['SUPPORTED_BY','VERIFIED_BY','ATTESTS'], KNOWLEDGE: ['DERIVED_FROM','CONTRIBUTES_TO'], GOVERNANCE: ['GOVERNED_BY','AUTHORIZED_BY'],
  };
  readonly contextFamily = 'PLACE';

  readonly familyIcon = (f: string) => {
    const m: Record<string, string> = { ACTOR:'A', CAPABILITY:'C', RESOURCE:'R', PLACE:'P', INTENTION:'I', COMMITMENT:'M', WORK:'W', ACTIVITY:'Y', EVENT:'T', OUTPUT_OUTCOME:'O', EXCHANGE:'X', VALUE:'$' , EVIDENCE:'E', KNOWLEDGE:'K', GOVERNANCE:'G' };
    return m[f] ?? '?';
  };

  readonly familyAccent = (f: string) => `var(--apt-family-${f.toLowerCase().replace('_outcome', '')}, var(--apt-module-accent))`;

  readonly standingAccent = (s: string) => `var(--apt-standing-${s}, var(--apt-module-accent))`;

  readonly contextLabel = () => this.contextFamily;
}
