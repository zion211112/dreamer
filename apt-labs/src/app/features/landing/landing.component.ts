/**
 * @apt-labs/features/landing — LandingComponent
 *
 * Landing page: the public entry point. Structural Emergence design — warm
 * ivory base, serif headings, mono interface, selective deep-forest / brass /
 * sage accents.
 */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const PATH = [
  { num: '01', title: 'Need defined' },
  { num: '02', title: 'Work coordinated' },
  { num: '03', title: 'Delivery evidenced' },
  { num: '04', title: 'Record retained' },
];

const REGISTERS = [
  { id: 'actors', label: 'Actors', detail: 'Who can act' },
  { id: 'resources', label: 'Resources', detail: 'What enables work' },
  { id: 'intentions', label: 'Intentions', detail: 'What needs to change' },
  { id: 'commitments', label: 'Commitments', detail: 'Who undertakes what' },
  { id: 'activity', label: 'Activity', detail: 'What work is happening' },
  { id: 'knowledge', label: 'Knowledge', detail: 'What is retained and reused' },
];

const MODULES = [
  { id: 'workbench', label: 'Workbench', hint: 'Scope, assemble, coordinate productive work', to: '/workspace/workbench' },
  { id: 'commons', label: 'Commons', hint: 'Discover needs, offers, and knowledge', to: '/workspace/commons' },
  { id: 'network', label: 'Network', hint: 'People, crews, institutions, capabilities', to: '/workspace/network' },
  { id: 'records', label: 'Records', hint: 'Canon, annals, and the immutable roll', to: '/workspace/records' },
  { id: 'intelligence', label: 'Intelligence', hint: 'Matching, forecasting, and running agents', to: '/workspace/intelligence' },
];

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing" data-module="landing">
      <header class="landing-header">
        <div class="landing-brand">
          <a [routerLink]="['/']" class="landing-wordmark">aptlabs</a>
        </div>
        <nav class="landing-nav">
          <a [routerLink]="['/workspace']" class="landing-nav-link">Home</a>
          <a [routerLink]="['/workspace', 'workbench']" class="landing-nav-link">Workbench</a>
          <a [routerLink]="['/workspace', 'commons']" class="landing-nav-link">Commons</a>
          <a [routerLink]="['/workspace', 'network']" class="landing-nav-link">Network</a>
          <a [routerLink]="['/workspace', 'records']" class="landing-nav-link">Records</a>
          <a [routerLink]="['/workspace', 'intelligence']" class="landing-nav-link">Intelligence</a>
        </nav>
        <div class="landing-actions">
          <a [routerLink]="['/sign-in', { queryParams: { next: '/workspace' } }]" class="landing-start">Start building</a>
        </div>
      </header>

      <main>
        <section class="hero" aria-labelledby="hero-title">
          <div class="hero-inner">
            <div class="hero-copy">
              <h1 id="hero-title" class="hero-title">
                The common ground for African productive capacity.
              </h1>
              <p class="hero-lede">
                Skills, knowledge, and people that can't see each other meet here — and work stays on record.
              </p>
              <div class="hero-actions">
                <a [routerLink]="['/sign-in', { queryParams: { next: '/workspace' } }]" class="hero-primary">Start building</a>
              </div>
            </div>
            <div class="hero-image">
              <div class="hero-frame" role="img" aria-label="Preview of the APT-LABS workspace shell">
                <div class="hf-topbar">
                  <span class="hf-wordmark">aptlabs</span>
                  <span class="hf-chip">Workbench</span>
                  <span class="hf-dot"></span>
                </div>
                <div class="hf-body">
                  <div class="hf-rail">
                    @for (r of [0,1,2,3,4,5]; track r) {
                      <span class="hf-rail-item" [class.hf-rail-item--active]="r === 1"></span>
                    }
                  </div>
                  <div class="hf-main">
                    <div class="hf-headline"></div>
                    <div class="hf-subline"></div>
                    @for (row of [86, 72, 91, 64, 78]; track row) {
                      <div class="hf-row">
                        <span class="hf-row-dot"></span>
                        <span class="hf-row-line" [style.width.%]="row"></span>
                        <span class="hf-row-state"></span>
                      </div>
                    }
                  </div>
                  <div class="hf-inspector">
                    <span class="hf-insp-head"></span>
                    <span class="hf-insp-line"></span>
                    <span class="hf-insp-line hf-insp-line--short"></span>
                  </div>
                </div>
                <div class="hf-status">
                  <span class="hf-status-cell"></span>
                  <span class="hf-status-cell hf-status-cell--filled"></span>
                  <span class="hf-status-note">on record</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="path" aria-labelledby="path-title">
          <div class="path-inner">
            <h2 id="path-title" class="path-title">How work moves</h2>
            <p class="path-lede">
              One cycle: a need becomes an intention, capacity connects, commitments organise the work,
              evidence records the outcome, and knowledge makes the next move easier.
            </p>
            <ol class="path-lane">
              @for (stage of PATH; track stage.num) {
                <li class="path-stage">
                  <span class="path-num">{{ stage.num }}</span>
                  <span class="path-title-text">{{ stage.title }}</span>
                </li>
              }
            </ol>
            <div class="path-visual">
              <svg viewBox="0 0 920 150" class="path-svg" role="img" aria-label="Diagram: need becomes work, work becomes evidence, evidence becomes record">
                <line x1="90" y1="56" x2="330" y2="56" class="pv-link" />
                <line x1="380" y1="56" x2="620" y2="56" class="pv-link" />
                <line x1="670" y1="56" x2="830" y2="56" class="pv-link" />
                <polygon points="330,56 322,52 322,60" class="pv-arrow" />
                <polygon points="620,56 612,52 612,60" class="pv-arrow" />
                <polygon points="830,56 822,52 822,60" class="pv-arrow" />
                <circle cx="62" cy="56" r="26" class="pv-node pv-node--intention" />
                <circle cx="356" cy="56" r="26" class="pv-node pv-node--work" />
                <circle cx="646" cy="56" r="26" class="pv-node pv-node--evidence" />
                <circle cx="858" cy="56" r="26" class="pv-node pv-node--knowledge" />
                <text x="62" y="61" class="pv-glyph">N</text>
                <text x="356" y="61" class="pv-glyph">W</text>
                <text x="646" y="61" class="pv-glyph">E</text>
                <text x="858" y="61" class="pv-glyph">R</text>
                <text x="62" y="106" class="pv-label">Need defined</text>
                <text x="356" y="106" class="pv-label">Work coordinated</text>
                <text x="646" y="106" class="pv-label">Delivery evidenced</text>
                <text x="858" y="106" class="pv-label">Record retained</text>
              </svg>
            </div>
          </div>
        </section>

        <section class="registers" aria-labelledby="registers-title">
          <div class="registers-inner">
            <div class="registers-head">
              <h2 id="registers-title" class="registers-title">The six registers</h2>
              <p class="registers-lede">
                The same structure for a school, a laboratory, or a community.
              </p>
            </div>
            <div class="registers-grid">
              @for (r of REGISTERS; track r.id) {
                <article class="register-card">
                  <h3 class="register-title">{{ r.label }}</h3>
                  <p class="register-detail">{{ r.detail }}</p>
                </article>
              }
            </div>
          </div>
        </section>

        <section class="modules" aria-labelledby="modules-title">
          <div class="modules-inner">
            <div class="modules-head">
              <h2 id="modules-title" class="modules-title">Explore the tools</h2>
              <p class="modules-lede">
                Five modules, one shared record.
              </p>
            </div>
            <div class="modules-grid">
              @for (m of MODULES; track m.id) {
                <div class="module-cell" [class.module-cell--hero]="m.id === 'workbench'" [attr.data-module]="m.id">
                  <div class="module-copy">
                    <h3 class="module-title">{{ m.label }}</h3>
                    <p class="module-hint">{{ m.hint }}</p>
                    <a [routerLink]="m.to" class="module-link module-link--hero">Open {{ m.label }} →</a>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>

        <section class="cta" aria-labelledby="cta-title">
          <div class="cta-inner">
            <h2 id="cta-title" class="cta-title">Start building.</h2>
            <p class="cta-lede">
              Open the local demo to follow a request through delivery and evidence.
              Browser-local. No live institutional, payment, tracking, or account connections.
            </p>
            <div class="cta-actions">
              <a [routerLink]="['/sign-in', { queryParams: { next: '/workspace' } }]" class="cta-primary">Start building</a>
            </div>
          </div>
        </section>
      </main>

      <footer class="landing-footer">
        <div class="landing-footer-inner">
          <div class="landing-footer-brand">aptlabs</div>
          <p class="landing-footer-note">
            Browser-local. No live institutional, payment, tracking, or account connections.
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
    .landing {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
    }
    main { flex: 1; }
    .landing-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--apt-space-8) var(--apt-space-16);
      background: var(--apt-surface-page);
      border-bottom: 1px solid var(--apt-border);
      position: sticky; top: 0; z-index: var(--apt-z-dropdown);
    }
    .landing-brand { display: flex; align-items: center; gap: 0; }
    .landing-wordmark {
      display: inline-flex; align-items: center; min-height: 36px;
      font-family: var(--apt-font-serif); font-size: var(--apt-size-title);
      font-weight: var(--apt-weight-semibold); color: var(--apt-accent);
      text-decoration: none; letter-spacing: -0.01em;
    }
    .landing-nav { display: flex; gap: var(--apt-space-5); align-items: center; }
    .landing-nav-link {
      display: inline-flex; align-items: center; min-height: 36px;
      font-size: var(--apt-size-body); font-weight: var(--apt-weight-medium);
      color: var(--apt-text-muted); text-decoration: none; letter-spacing: -0.01em;
      transition: color var(--apt-motion-fast);
    }
    .landing-nav-link:hover { color: var(--apt-accent); }
    .landing-actions { display: flex; align-items: center; gap: var(--apt-space-6); }
    .landing-start {
      display: inline-flex; align-items: center; justify-content: center; min-height: 36px;
      padding: var(--apt-space-4) var(--apt-space-10); background: var(--apt-accent-2);
      color: var(--apt-action-on-accent); text-decoration: none; font-size: var(--apt-size-md);
      font-weight: var(--apt-weight-medium); font-family: var(--apt-font-sans);
      border-radius: var(--apt-button-radius); letter-spacing: -0.01em;
    }
    .landing-start:hover { background: var(--apt-accent-2-hover); }
    .hero { padding: var(--apt-space-18) var(--apt-space-16); background: var(--apt-surface-page); border-bottom: 1px solid var(--apt-border); }
    .hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: var(--apt-space-16); align-items: center; max-width: var(--apt-block-landing-max-width); margin: 0 auto; }
    .hero-copy { max-width: var(--apt-block-landing-content-max-width); }
    .hero-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-display); font-weight: var(--apt-weight-semibold); line-height: var(--apt-line-tight); margin: 0 0 var(--apt-space-10) 0; color: var(--apt-text-strong); letter-spacing: -0.02em; }
    .hero-lede { font-size: var(--apt-size-md); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-space-12) 0; max-width: 520px; }
    .hero-actions { display: flex; gap: var(--apt-space-6); }
    .hero-primary {
      display: inline-flex; align-items: center; justify-content: center; min-height: 36px;
      padding: var(--apt-space-5) var(--apt-space-11); background: var(--apt-accent-2);
      color: var(--apt-action-on-accent); text-decoration: none; font-size: var(--apt-size-title);
      font-weight: var(--apt-weight-medium); font-family: var(--apt-font-sans); border-radius: var(--apt-button-radius); letter-spacing: -0.01em;
    }
    .hero-primary:hover { background: var(--apt-accent-2-hover); }
    .hero-image { display: flex; justify-content: center; }
    .hero-frame {
      width: 100%; max-width: 560px; display: flex; flex-direction: column;
      border-radius: var(--apt-block-landing-radius-lg); border: 1px solid var(--apt-border);
      box-shadow: var(--apt-shadow-1); background: var(--apt-surface-page); overflow: hidden;
    }
    .hf-topbar {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      background: var(--apt-surface-raised); border-bottom: 1px solid var(--apt-border);
    }
    .hf-wordmark { font-family: var(--apt-font-serif); font-size: var(--apt-size-md); font-weight: var(--apt-weight-semibold); color: var(--apt-accent); }
    .hf-chip {
      font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--apt-text-muted); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-pill); padding: 2px 8px;
    }
    .hf-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--apt-accent-2); margin-left: auto; }
    .hf-body { display: grid; grid-template-columns: 34px 1fr 108px; min-height: 232px; }
    .hf-rail {
      display: flex; flex-direction: column; align-items: center; gap: 10px; padding-top: 14px;
      background: var(--apt-surface-raised); border-right: 1px solid var(--apt-border);
    }
    .hf-rail-item { width: 12px; height: 12px; border-radius: 3px; background: var(--apt-border-strong); }
    .hf-rail-item--active { background: var(--apt-accent); }
    .hf-main { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
    .hf-headline { height: 13px; width: 58%; border-radius: 3px; background: var(--apt-text-strong); opacity: 0.85; }
    .hf-subline { height: 7px; width: 40%; border-radius: 3px; background: var(--apt-border-strong); }
    .hf-row { display: flex; align-items: center; gap: 9px; padding: 7px 0; border-bottom: 1px solid var(--apt-border-faint); }
    .hf-row-dot { width: 8px; height: 8px; border-radius: 2px; background: var(--apt-accent); opacity: 0.55; flex: none; }
    .hf-row-line { height: 7px; border-radius: 3px; background: color-mix(in srgb, var(--apt-text-body) 28%, transparent); }
    .hf-row-state { margin-left: auto; width: 34px; height: 11px; border-radius: var(--apt-radius-pill); background: color-mix(in srgb, var(--apt-group-continuity) 18%, transparent); flex: none; }
    .hf-inspector {
      border-left: 1px solid var(--apt-border); background: var(--apt-surface-raised);
      padding: 14px 12px; display: flex; flex-direction: column; gap: 9px;
    }
    .hf-insp-head { height: 9px; width: 70%; border-radius: 3px; background: var(--apt-text-strong); opacity: 0.8; }
    .hf-insp-line { height: 6px; width: 90%; border-radius: 3px; background: var(--apt-border-strong); }
    .hf-insp-line--short { width: 55%; }
    .hf-status {
      display: flex; align-items: center; gap: 8px; padding: 7px 14px;
      border-top: 1px solid var(--apt-border); background: var(--apt-surface-page);
    }
    .hf-status-cell { width: 26px; height: 5px; border-radius: 3px; background: var(--apt-border-strong); }
    .hf-status-cell--filled { background: var(--apt-accent); }
    .hf-status-note { font-family: var(--apt-font-mono); font-size: var(--apt-size-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--apt-text-dim); margin-left: auto; }
    .path { padding: var(--apt-space-18) var(--apt-space-16); background: var(--apt-surface-default); }
    .path-inner { max-width: 960px; margin: 0 auto; }
    .path-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-h1); font-weight: var(--apt-weight-semibold); margin: 0 0 var(--apt-space-6) 0; color: var(--apt-text-strong); letter-spacing: -0.01em; }
    .path-lede { font-size: var(--apt-size-md); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-space-12) 0; max-width: 600px; }
    .path-lane { display: flex; gap: var(--apt-space-18); list-style: none; margin: 0; padding: 0; }
    .path-stage { display: flex; flex-direction: column; gap: var(--apt-space-4); }
    .path-num { font-family: var(--apt-font-mono); font-size: var(--apt-size-md); font-weight: var(--apt-weight-medium); color: var(--apt-accent); letter-spacing: 0.08em; }
    .path-title-text { font-size: var(--apt-size-title); color: var(--apt-text-muted); line-height: 1.5; }
    .path-visual { margin-top: var(--apt-space-12); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); overflow: hidden; background: var(--apt-surface-page); padding: var(--apt-space-6) var(--apt-space-4); }
    .path-svg { width: 100%; height: auto; display: block; }
    .pv-link { stroke: var(--apt-border-strong); stroke-width: 1.5; }
    .pv-arrow { fill: var(--apt-border-strong); }
    .pv-node { fill: var(--apt-surface-page); stroke-width: 2; }
    .pv-node--intention { stroke: #c9a227; }
    .pv-node--work { stroke: #16a34a; }
    .pv-node--evidence { stroke: #0891b2; }
    .pv-node--knowledge { stroke: #7d8f9a; }
    .pv-glyph { font-family: var(--apt-font-mono); font-size: 15px; fill: var(--apt-text-strong); text-anchor: middle; }
    .pv-label { font-family: var(--apt-font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; fill: var(--apt-text-muted); text-anchor: middle; }
    .registers { padding: var(--apt-space-18) var(--apt-space-16); background: var(--apt-surface-page); border-bottom: 1px solid var(--apt-border); }
    .registers-inner { max-width: 960px; margin: 0 auto; }
    .registers-head { margin-bottom: var(--apt-space-10); }
    .registers-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-h1); font-weight: var(--apt-weight-semibold); margin: 0 0 var(--apt-space-4) 0; color: var(--apt-text-strong); letter-spacing: -0.01em; }
    .registers-lede { font-size: var(--apt-size-md); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0; max-width: 600px; }
    .registers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--apt-space-10); }
    .register-card { padding: var(--apt-space-11); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-md); background: var(--apt-surface-raised); display: flex; flex-direction: column; gap: var(--apt-space-4); }
    .register-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); margin: 0; color: var(--apt-text-strong); }
    .register-detail { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; line-height: 1.5; flex: 1; }
    .modules { padding: var(--apt-space-18) var(--apt-space-16); background: var(--apt-surface-default); }
    .modules-inner { max-width: 960px; margin: 0 auto; }
    .modules-head { margin-bottom: var(--apt-space-10); }
    .modules-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-h1); font-weight: var(--apt-weight-semibold); margin: 0 0 var(--apt-space-4) 0; color: var(--apt-text-strong); letter-spacing: -0.01em; }
    .modules-lede { font-size: var(--apt-size-md); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0; max-width: 600px; }
    .modules-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
    .module-cell { padding: var(--apt-space-12); border-bottom: 1px solid var(--apt-border); background: var(--apt-surface-page); display: flex; flex-direction: column; gap: var(--apt-space-4); }
    .module-cell--hero { background: var(--apt-module-accent, var(--apt-accent)); color: var(--apt-action-on-accent); border-bottom: none; flex-direction: row; align-items: center; justify-content: space-between; padding: var(--apt-space-14) var(--apt-space-16); gap: var(--apt-space-13); }
    .module-cell--hero .module-copy { flex: 1; min-width: 0; }
    .module-cell--hero .module-title { color: var(--apt-action-on-accent); }
    .module-cell--hero .module-hint { color: color-mix(in srgb, var(--apt-action-on-accent) 75%, transparent); }
    .module-link--hero {
      display: inline-flex; align-items: center; justify-content: center; min-height: 36px;
      margin-top: var(--apt-space-6); padding: var(--apt-button-padding); background: var(--apt-action-on-accent);
      color: var(--apt-accent); border-radius: var(--apt-button-radius); font-size: var(--apt-button-font-size-lg);
      font-weight: var(--apt-weight-medium); text-decoration: none;
    }
    .module-copy h3 { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); margin: 0 0 var(--apt-space-2) 0; color: var(--apt-text-strong); }
    .module-copy p { font-size: var(--apt-size-body); color: var(--apt-text-muted); margin: 0; line-height: 1.5; }
    .module-link { font-size: var(--apt-size-body); font-weight: var(--apt-weight-medium); color: var(--apt-accent); text-decoration: underline; align-self: flex-start; }
    .module-link:hover { text-decoration: none; }
    .cta { padding: var(--apt-space-20) var(--apt-space-16); background: var(--apt-surface-page); }
    .cta-inner { max-width: 640px; margin: 0 auto; text-align: center; }
    .cta-title { font-family: var(--apt-font-serif); font-size: var(--apt-size-h2); font-weight: var(--apt-weight-semibold); margin: 0 0 var(--apt-space-6) 0; color: var(--apt-text-strong); letter-spacing: -0.01em; }
    .cta-lede { font-size: var(--apt-size-md); line-height: var(--apt-line-relaxed); color: var(--apt-text-muted); margin: 0 0 var(--apt-space-12) 0; max-width: 520px; }
    .cta-primary {
      display: inline-flex; align-items: center; justify-content: center; min-height: 36px;
      padding: var(--apt-space-5) var(--apt-space-12); background: var(--apt-accent-2);
      color: var(--apt-action-on-accent); text-decoration: none; font-size: var(--apt-size-title);
      font-weight: var(--apt-weight-medium); font-family: var(--apt-font-sans); border-radius: var(--apt-button-radius); letter-spacing: -0.01em;
    }
    .cta-primary:hover { background: var(--apt-accent-2-hover); }
    .landing-footer { padding: var(--apt-space-10) var(--apt-space-16); border-top: 1px solid var(--apt-border); background: var(--apt-surface-page); }
    .landing-footer-inner { display: flex; justify-content: space-between; align-items: baseline; max-width: 960px; margin: 0 auto; }
    .landing-footer-brand { font-family: var(--apt-font-serif); font-size: var(--apt-size-title); font-weight: var(--apt-weight-semibold); color: var(--apt-accent); }
    .landing-footer-note { font-size: var(--apt-size-sm); color: var(--apt-text-dim); margin: 0; }
    @media (max-width: 900px) {
      .landing-header { padding: var(--apt-space-6) var(--apt-space-10); }
      .landing-nav { display: none; }
      .hero-inner { grid-template-columns: 1fr; gap: var(--apt-space-10); }
      .hero-title { font-size: var(--apt-size-h2); }
      .hero-actions { flex-direction: column; gap: var(--apt-space-4); }
      .hero-primary { width: 100%; }
      .hero-image { order: -1; }
    }
    `,
  ],
})
export class LandingComponent {
  readonly PATH = PATH;
  readonly REGISTERS = REGISTERS;
  readonly MODULES = MODULES;
}
