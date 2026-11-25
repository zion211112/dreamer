import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing" id="top">
      <a class="skip-link" href="#main">Skip to content</a>

      <header class="site-header">
        <div class="shell header-inner">
          <a class="wordmark" [routerLink]="['/landing']" aria-label="APT-LABS home">
            <svg class="mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
              <path d="M20 3 30 13 20 20 10 13 20 3ZM20 37 10 27 20 20 30 27 20 37ZM3 20 13 10 20 20 13 30 3 20ZM37 20 27 30 20 20 27 10 37 20Z" />
              <path class="mark-core" d="m20 15 5 5-5 5-5-5z" />
            </svg>
            <span>APT-LABS<span class="wordmark-dot">.</span></span>
          </a>

          <nav class="desktop-nav" aria-label="Main navigation">
            <a href="#origin">The origin</a>
            <a href="#foundation">Foundations</a>
            <a href="#circle">Partnerships</a>
          </nav>

          <div class="header-actions">
            <a class="studio-link" [routerLink]="['/sign-in']" [queryParams]="{ next: '/workspace' }">Enter the Studio <span aria-hidden="true">↗</span></a>
            <button
              class="menu-toggle"
              type="button"
              aria-controls="mobile-nav"
              [attr.aria-expanded]="menuOpen()"
              [attr.aria-label]="menuOpen() ? 'Close navigation' : 'Open navigation'"
              (click)="menuOpen.set(!menuOpen())">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                @if (menuOpen()) { <path d="m6 6 12 12M18 6 6 18" /> }
                @else { <path d="M4 7h16M4 12h16M4 17h16" /> }
              </svg>
            </button>
          </div>
        </div>
        @if (menuOpen()) {
          <nav class="mobile-nav" id="mobile-nav" aria-label="Main navigation">
            <a href="#origin" (click)="menuOpen.set(false)">The origin</a>
            <a href="#movement" (click)="menuOpen.set(false)">The movement</a>
            <a href="#foundation" (click)="menuOpen.set(false)">Foundations</a>
            <a href="#circle" (click)="menuOpen.set(false)">Partnerships</a>
            <a href="#entry" (click)="menuOpen.set(false)">Begin with the work</a>
            <a [routerLink]="['/sign-in']" [queryParams]="{ next: '/workspace' }" (click)="menuOpen.set(false)">Enter the Studio ↗</a>
          </nav>
        }
      </header>

      <main id="main">
        <section class="hero" aria-labelledby="hero-title">
          <div class="hero-field" aria-hidden="true">
            <svg viewBox="0 0 900 760" preserveAspectRatio="xMidYMid slice">
              <g fill="none" stroke="currentColor">
                <path d="M-120 560C70 390 168 692 347 530S634 306 1020 478" />
                <path d="M-130 592C65 420 176 720 360 560S650 338 1035 510" />
                <path d="M-140 624C60 450 185 748 372 590S666 370 1050 542" />
                <path d="M-150 656C55 480 194 776 385 620S682 402 1065 574" />
                <path d="M-160 688C50 510 202 804 397 650S698 434 1080 606" />
                <path d="M-170 720C45 540 210 832 410 680S714 466 1095 638" />
                <path d="M-180 752C40 570 218 860 422 710S730 498 1110 670" />
                <path d="M70 202C223 102 325 286 467 190S731 94 870 170" />
                <path d="M54 230C211 126 329 314 476 218S744 120 884 198" />
                <path d="M38 258C199 150 333 342 485 246S757 146 898 226" />
                <path d="M22 286C187 174 337 370 494 274S770 172 912 254" />
              </g>
              <path class="field-axis" d="M450 78v570" />
              <circle class="field-point" cx="450" cy="362" r="5" />
              <circle class="field-ring" cx="450" cy="362" r="20" />
            </svg>
          </div>
          <div class="shell hero-inner">
            <div class="hero-copy">
              <p class="eyebrow"><span class="eyebrow-rule"></span>Productive infrastructure. East Africa.</p>
              <h1 id="hero-title">The ground<br>is an <em>advantage.</em></h1>
              <p class="hero-intro">APT-LABS is an operating environment for turning grounded capability into organised enterprise, stronger institutions and lasting value.</p>
              <p class="hero-origin">Rooted in East Africa. Built to operate across a wider world.</p>
              <div class="hero-actions">
                <a class="button button-gold" [routerLink]="['/sign-in']" [queryParams]="{ next: '/workspace' }">Enter the Studio <span aria-hidden="true">↗</span></a>
                <a class="quiet-link" href="#origin">Discover APT-LABS <span aria-hidden="true">↓</span></a>
              </div>
            </div>
            <div class="hero-index" aria-label="Productive infrastructure rooted in East Africa">
              <span>APT-LABS</span><span>East Africa</span><span>Open to the world</span>
            </div>
          </div>
          <div class="hero-baseline" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        </section>

        <section class="origin section-shell" id="origin" aria-labelledby="origin-title">
          <div class="section-marker"><span>01</span><span>The origin</span></div>
          <div class="origin-content">
            <h2 id="origin-title">An economy<br>already in <em>motion.</em></h2>
            <div class="origin-copy">
              <p class="lead">Across East Africa, people are building, producing, teaching, organising and solving.</p>
              <p>The ambition exists. The capabilities exist. The opportunity is to bring them into an architecture capable of carrying their work further.</p>
              <p>APT-LABS is being built around that opportunity: a foundation for productive enterprise that can grow, coordinate and endure.</p>
            </div>
          </div>
          <div class="origin-rule" aria-hidden="true"><span>From capability</span><i></i><span>To lasting value</span></div>
        </section>

        <section class="movement" id="movement" aria-labelledby="movement-title">
          <div class="shell movement-inner">
            <div class="section-marker section-marker-light"><span>02</span><span>The movement</span></div>
            <h2 id="movement-title">From capability<br>to lasting <em>advantage.</em></h2>
            <div class="movement-steps">
              <article class="movement-step">
                <span class="step-index">01 <i></i></span>
                <h3>Organise</h3>
                <p>Bring people, resources and ambition into a shared operating environment.</p>
              </article>
              <article class="movement-step">
                <span class="step-index">02 <i></i></span>
                <h3>Execute</h3>
                <p>Give consequential work the structure, coordination and continuity it needs.</p>
              </article>
              <article class="movement-step">
                <span class="step-index">03 <i></i></span>
                <h3>Compound</h3>
                <p>Let experience, results and institutional knowledge strengthen what comes next.</p>
              </article>
            </div>
            <p class="movement-conclusion">The objective is not simply to complete more work.<br><em>It is to build the capacity to do greater work.</em></p>
          </div>
        </section>

        <section class="foundation section-shell" id="foundation" aria-labelledby="foundation-title">
          <div class="section-marker"><span>03</span><span>The foundation</span></div>
          <div class="foundation-heading">
            <p class="eyebrow">Capacity that carries forward</p>
            <h2 id="foundation-title">Built for what<br>comes <em>next.</em></h2>
          </div>
          <div class="foundation-grid">
            <article class="foundation-item"><span>01</span><h3>Agency</h3><p>Those closest to the work remain central to its direction.</p></article>
            <article class="foundation-item"><span>02</span><h3>Grounded intelligence</h3><p>Decisions draw on actual conditions, contextual understanding and evidence.</p></article>
            <article class="foundation-item"><span>03</span><h3>Continuity</h3><p>Each undertaking should leave behind something that strengthens the next.</p></article>
            <article class="foundation-item"><span>04</span><h3>Enduring value</h3><p>Build productive capacity that can grow beyond individual projects and temporary arrangements.</p></article>
          </div>
        </section>

        <section class="circle" id="circle" aria-labelledby="circle-title">
          <div class="shell circle-inner">
            <div class="section-marker section-marker-light"><span>04</span><span>The circle</span></div>
            <div class="circle-content">
              <div>
                <p class="eyebrow">A shared interest in what lasts</p>
                <h2 id="circle-title">Serious work deserves<br>serious <em>infrastructure.</em></h2>
              </div>
              <div class="circle-copy">
                <p>APT-LABS brings together builders, enterprises, educators, researchers, institutions and capital partners around the development of productive capacity.</p>
                <p>Different fields. Different ambitions. A shared interest in building things that last.</p>
                <p class="circle-note">We are establishing relationships with people and institutions ready to contribute to this next phase.</p>
                <a class="circle-link" href="#entry">Explore a partnership <span aria-hidden="true">↓</span></a>
              </div>
            </div>
            <div class="circle-register" aria-hidden="true"><span>Builders</span><i></i><span>Institutions</span><i></i><span>Capital</span></div>
          </div>
        </section>

        <section class="entry section-shell" id="entry" aria-labelledby="entry-title">
          <div class="section-marker"><span>05</span><span>The entry</span></div>
          <div class="entry-inner">
            <div class="entry-copy">
              <p class="eyebrow">An undertaking takes shape</p>
              <h2 id="entry-title">Begin with<br>the <em>work.</em></h2>
            </div>
            <div class="entry-action">
              <p>An enterprise to build. An institution to strengthen. A problem worth solving. An opportunity worth developing.</p>
              <p class="entry-line">Bring the undertaking.</p>
              <p>APT-LABS is where the next move takes form.</p>
              <a class="button button-dark" [routerLink]="['/sign-in']" [queryParams]="{ next: '/workspace' }">Enter the Studio <span aria-hidden="true">↗</span></a>
              <p class="account-note">New to APT-LABS? <a [routerLink]="['/sign-up']">Create an account</a></p>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="shell footer-main">
          <a class="wordmark footer-wordmark" [routerLink]="['/landing']" aria-label="APT-LABS home">
            <svg class="mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
              <path d="M20 3 30 13 20 20 10 13 20 3ZM20 37 10 27 20 20 30 27 20 37ZM3 20 13 10 20 20 13 30 3 20ZM37 20 27 30 20 20 27 10 37 20Z" />
              <path class="mark-core" d="m20 15 5 5-5 5-5-5z" />
            </svg><span>APT-LABS<span class="wordmark-dot">.</span></span>
          </a>
          <p class="footer-line">Productive infrastructure, rooted in East Africa.</p>
          <nav class="footer-nav" aria-label="Footer navigation">
            <a [routerLink]="['/sign-in']" [queryParams]="{ next: '/workspace' }">The Studio</a><a href="#foundation">Foundations</a><a href="#circle">Partnerships</a><a href="#entry">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      --ink: #171914;
      --ink-soft: #292b25;
      --paper: #f2f0e9;
      --paper-deep: #e6e3d9;
      --white: #faf9f5;
      --muted: #716f64;
      --line: #c9c6ba;
      --forest: #34473a;
      --olive: #76806a;
      --brass: #b69a62;
      display: block;
      color: var(--ink);
      background: var(--paper);
      font-family: var(--apt-font-sans);
      -webkit-font-smoothing: antialiased;
    }
    *, *::before, *::after { box-sizing: border-box; }
    :host { scroll-behavior: smooth; }
    a { color: inherit; text-decoration: none; }
    a:focus-visible, button:focus-visible { outline: 2px solid var(--brass); outline-offset: 4px; }
    .shell, .section-shell { width: min(calc(100% - 112px), 1240px); margin-inline: auto; }
    .skip-link { position: absolute; z-index: 200; top: 8px; left: 16px; transform: translateY(-160%); padding: 12px 16px; color: var(--white); background: var(--forest); }
    .skip-link:focus { transform: none; }

    .site-header { position: sticky; z-index: 100; top: 0; background: color-mix(in srgb, var(--paper) 95%, transparent); border-bottom: 1px solid var(--line); backdrop-filter: blur(12px); }
    .header-inner { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
    .wordmark { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; font: 600 17px/1 var(--apt-font-sans); letter-spacing: .09em; white-space: nowrap; }
    .mark { width: 27px; height: 27px; fill: none; stroke: var(--forest); stroke-width: 1.45; stroke-linejoin: miter; }
    .mark-core { fill: var(--brass); stroke: none; }
    .wordmark-dot { color: var(--brass); }
    .desktop-nav { display: flex; align-items: center; gap: clamp(22px, 3.4vw, 48px); }
    .desktop-nav a, .footer-nav a { min-height: 44px; display: inline-flex; align-items: center; color: var(--ink-soft); font-size: 11px; letter-spacing: .025em; transition: color 160ms ease; }
    .desktop-nav a:hover, .footer-nav a:hover { color: var(--brass); }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .studio-link { display: inline-flex; align-items: center; gap: 12px; min-height: 44px; padding-inline: 16px; color: var(--white); background: var(--ink); font: 10px var(--apt-font-mono); letter-spacing: .04em; transition: background 160ms ease; }
    .studio-link span { color: var(--brass); }
    .studio-link:hover { background: var(--forest); }
    .menu-toggle { display: none; width: 44px; height: 44px; padding: 10px; border: 1px solid var(--line); background: transparent; color: var(--forest); cursor: pointer; }
    .menu-toggle svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: square; }
    .mobile-nav { display: none; }

    .hero { position: relative; overflow: hidden; min-height: min(790px, calc(100svh - 76px)); display: flex; align-items: center; color: var(--white); background: var(--ink); }
    .hero-inner { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-content: center; padding-block: 86px 68px; }
    .hero-copy { max-width: 790px; }
    .hero-field { position: absolute; inset: 0 0 0 40%; overflow: hidden; color: #c8c2ac; opacity: .15; }
    .hero-field svg { position: absolute; width: min(100%, 1050px); height: 100%; right: -6%; top: 0; }
    .hero-field g { stroke-width: 1; }
    .field-axis { stroke: var(--brass); stroke-width: 1; stroke-dasharray: 2 8; }
    .field-point { fill: var(--brass); stroke: none; }
    .field-ring { stroke: var(--brass); stroke-width: 1; stroke-dasharray: 2 6; }
    .eyebrow { margin: 0; display: flex; align-items: center; gap: 13px; color: var(--brass); font: 10px/1.6 var(--apt-font-mono); letter-spacing: .14em; text-transform: uppercase; }
    .eyebrow-rule { width: 28px; height: 1px; background: var(--brass); }
    .hero h1 { max-width: 900px; margin: 32px 0 27px; font: 400 clamp(76px, 11.3vw, 156px)/.82 var(--apt-font-serif); letter-spacing: -.075em; }
    .hero h1 em, .origin h2 em, .movement h2 em, .foundation h2 em, .circle h2 em, .entry h2 em { color: var(--brass); font-weight: 400; }
    .hero-intro { max-width: 620px; margin: 0; color: #e2dfd6; font: 17px/1.72 var(--apt-font-sans); }
    .hero-origin { margin: 18px 0 0; color: #aaa99e; font: 11px var(--apt-font-mono); letter-spacing: .04em; }
    .hero-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 28px; margin-top: 37px; }
    .button { min-height: 50px; display: inline-flex; align-items: center; justify-content: space-between; gap: 28px; padding: 0 18px; font: 10px var(--apt-font-mono); letter-spacing: .035em; transition: background 160ms ease, color 160ms ease, transform 160ms ease; }
    .button:hover { transform: translateY(-1px); }
    .button-gold { color: var(--ink); background: var(--brass); }
    .button-gold:hover { background: #c5aa73; }
    .button-dark { color: var(--white); background: var(--ink); }
    .button-dark:hover { background: var(--forest); }
    .quiet-link { min-height: 46px; display: inline-flex; align-items: center; gap: 14px; color: #e2dfd6; border-bottom: 1px solid #79796f; font-size: 12px; }
    .quiet-link span { color: var(--brass); }
    .hero-index { display: flex; flex-direction: column; align-self: end; gap: 10px; padding: 0 0 3px 20px; border-left: 1px solid #5b5b51; color: #c5c1b4; font: 8px var(--apt-font-mono); letter-spacing: .11em; text-transform: uppercase; white-space: nowrap; }
    .hero-index span:first-child { color: var(--brass); }
    .hero-baseline { position: absolute; right: 0; bottom: 0; left: 0; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; height: 5px; }
    .hero-baseline span:nth-child(1) { background: #b69a62; }
    .hero-baseline span:nth-child(2) { background: #7a816c; }
    .hero-baseline span:nth-child(3) { background: #a09b86; }
    .hero-baseline span:nth-child(4) { background: #4b5a4b; }

    .section-marker { display: flex; align-items: center; gap: 14px; color: var(--muted); font: 9px var(--apt-font-mono); letter-spacing: .11em; text-transform: uppercase; }
    .section-marker span:first-child { color: var(--brass); }
    .section-marker span + span { padding-left: 14px; border-left: 1px solid var(--line); }
    .origin { padding-block: 110px 96px; }
    .origin-content { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(44px, 9vw, 142px); align-items: start; margin-top: 46px; }
    .origin h2, .movement h2, .foundation h2, .circle h2, .entry h2 { margin: 0; font: 400 clamp(54px, 7.6vw, 98px)/.9 var(--apt-font-serif); letter-spacing: -.065em; }
    .origin-copy { max-width: 500px; padding-top: 5px; }
    .origin-copy p { margin: 0 0 18px; color: #59584f; font: 14px/1.85 var(--apt-font-sans); }
    .origin-copy .lead { color: var(--ink); font: 400 21px/1.5 var(--apt-font-serif); }
    .origin-rule { display: flex; align-items: center; gap: 16px; margin-top: 65px; color: var(--muted); font: 8px var(--apt-font-mono); letter-spacing: .1em; text-transform: uppercase; }
    .origin-rule i { height: 1px; flex: 1; background: var(--line); }
    .origin-rule span:last-child { color: var(--forest); }

    .movement { position: relative; color: var(--white); background: var(--forest); }
    .movement-inner { padding-block: 82px 78px; }
    .section-marker-light { color: #c6c9bc; }
    .section-marker-light span + span { border-color: #748176; }
    .movement h2 { margin-top: 38px; max-width: 900px; }
    .movement-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 67px; border-top: 1px solid #79877b; border-bottom: 1px solid #79877b; }
    .movement-step { min-height: 212px; padding: 23px 30px 28px 0; }
    .movement-step + .movement-step { padding-left: 30px; border-left: 1px solid #79877b; }
    .step-index { display: flex; align-items: center; gap: 13px; color: #e0c995; font: 9px var(--apt-font-mono); letter-spacing: .08em; }
    .step-index i { display: block; width: 35px; height: 1px; background: #b69a62; }
    .movement-step h3 { margin: 31px 0 10px; color: var(--white); font: 400 31px/1.1 var(--apt-font-serif); letter-spacing: -.03em; }
    .movement-step p { max-width: 280px; margin: 0; color: #d6dbd2; font-size: 12px; line-height: 1.8; }
    .movement-conclusion { margin: 28px 0 0; color: #c6c9bc; font: 13px/1.8 var(--apt-font-sans); }
    .movement-conclusion em { color: var(--white); font-family: var(--apt-font-serif); font-size: 17px; }

    .foundation { display: grid; grid-template-columns: .8fr 1.2fr; column-gap: clamp(36px, 7vw, 104px); padding-block: 107px 112px; }
    .foundation > .section-marker { grid-column: 1 / -1; margin-bottom: 48px; }
    .foundation-heading .eyebrow { color: var(--muted); font-size: 8px; }
    .foundation h2 { margin-top: 20px; font-size: clamp(52px, 6.4vw, 82px); }
    .foundation h2 em { color: var(--forest); }
    .foundation-grid { display: grid; grid-template-columns: 1fr 1fr; align-self: end; border-top: 1px solid var(--line); }
    .foundation-item { min-height: 145px; padding: 17px 22px 18px 0; border-bottom: 1px solid var(--line); }
    .foundation-item:nth-child(even) { padding-left: 22px; border-left: 1px solid var(--line); }
    .foundation-item > span { color: var(--brass); font: 8px var(--apt-font-mono); }
    .foundation-item h3 { margin: 17px 0 8px; font: 400 19px/1.2 var(--apt-font-serif); }
    .foundation-item p { max-width: 290px; margin: 0; color: var(--muted); font-size: 11px; line-height: 1.7; }

    .circle { overflow: hidden; color: var(--white); background: var(--ink); }
    .circle-inner { padding-block: 78px 65px; }
    .circle-content { display: grid; grid-template-columns: 1.12fr .88fr; gap: clamp(44px, 8vw, 118px); margin-top: 43px; }
    .circle .eyebrow { color: var(--brass); font-size: 8px; }
    .circle h2 { margin-top: 23px; font-size: clamp(48px, 6vw, 76px); }
    .circle-copy { max-width: 465px; padding-top: 5px; }
    .circle-copy p { margin: 0 0 16px; color: #dedbd2; font-size: 12px; line-height: 1.8; }
    .circle-copy .circle-note { margin-top: 26px; color: #aaa99e; font: 11px/1.75 var(--apt-font-mono); }
    .circle-link { display: inline-flex; align-items: center; gap: 14px; min-height: 44px; margin-top: 9px; border-bottom: 1px solid #77756b; color: var(--white); font: 10px var(--apt-font-mono); }
    .circle-link span { color: var(--brass); }
    .circle-register { display: flex; align-items: center; gap: 18px; margin-top: 68px; padding-top: 16px; border-top: 1px solid #55564f; color: #aaa99e; font: 8px var(--apt-font-mono); letter-spacing: .11em; text-transform: uppercase; }
    .circle-register i { width: 36px; height: 1px; background: var(--brass); }

    .entry { padding-block: 98px 112px; }
    .entry-inner { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(42px, 8vw, 120px); margin-top: 46px; }
    .entry .eyebrow { color: var(--muted); font-size: 8px; }
    .entry h2 { margin-top: 23px; font-size: clamp(66px, 9vw, 116px); }
    .entry h2 em { color: var(--forest); }
    .entry-action { max-width: 470px; padding-top: 9px; }
    .entry-action > p { margin: 0 0 15px; color: #59584f; font-size: 13px; line-height: 1.8; }
    .entry-action > .entry-line { margin-top: 25px; color: var(--ink); font: 400 22px var(--apt-font-serif); }
    .entry-action .button { min-width: 190px; margin-top: 16px; }
    .account-note { margin-top: 16px !important; color: var(--muted) !important; font: 10px var(--apt-font-mono); }
    .account-note a { color: var(--forest); text-decoration: underline; text-underline-offset: 3px; }

    .site-footer { border-top: 1px solid var(--line); }
    .footer-main { display: grid; grid-template-columns: auto 1fr auto; gap: 28px; align-items: center; min-height: 84px; }
    .footer-wordmark { font-size: 13px; }
    .footer-wordmark .mark { width: 23px; height: 23px; }
    .footer-line { margin: 0; color: var(--muted); font: 10px var(--apt-font-serif); }
    .footer-nav { display: flex; gap: 23px; }
    .footer-nav a { font-size: 9px; }

    @media (prefers-reduced-motion: reduce) {
      :host { scroll-behavior: auto; }
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
    @media (max-width: 900px) {
      .shell, .section-shell { width: calc(100% - 64px); }
      .hero-inner { grid-template-columns: 1fr; min-height: 670px; padding-block: 76px 64px; }
      .hero-copy { max-width: 760px; }
      .hero-index { position: absolute; right: 0; bottom: 65px; flex-direction: row; padding: 0; border: 0; }
      .hero-field { left: 30%; opacity: .13; }
      .origin-content, .circle-content, .entry-inner { grid-template-columns: 1fr 1fr; gap: 40px; }
      .foundation { grid-template-columns: 1fr; row-gap: 36px; }
      .foundation-grid { margin-left: 28%; }
      .footer-main { grid-template-columns: auto 1fr; padding-block: 18px; }
      .footer-nav { grid-column: 1 / -1; }
    }
    @media (max-width: 620px) {
      .shell, .section-shell { width: calc(100% - 40px); }
      .header-inner { min-height: 64px; gap: 10px; }
      .wordmark { font-size: 14px; gap: 8px; }
      .mark { width: 24px; height: 24px; }
      .desktop-nav { display: none; }
      .header-actions { margin-left: auto; }
      .studio-link { min-height: 40px; padding-inline: 10px; font-size: 8px; gap: 7px; }
      .menu-toggle { display: block; }
      .mobile-nav { display: grid; grid-template-columns: 1fr 1fr; padding: 8px 20px 15px; background: var(--paper); border-top: 1px solid var(--line); }
      .mobile-nav a { display: flex; align-items: center; min-height: 44px; border-bottom: 1px solid var(--line); color: var(--ink-soft); font-size: 11px; }
      .mobile-nav a:nth-child(even) { padding-left: 12px; border-left: 1px solid var(--line); }
      .mobile-nav a:last-child { grid-column: 1 / -1; padding-left: 0; border-left: 0; color: var(--forest); }
      .hero { min-height: 680px; min-height: min(760px, calc(100svh - 64px)); }
      .hero-inner { min-height: 630px; min-height: min(710px, calc(100svh - 64px)); align-content: center; padding-block: 68px 80px; }
      .hero-field { inset: 15% -38% 0 9%; opacity: .13; }
      .hero h1 { margin-block: 27px 24px; font-size: clamp(66px, 15.6vw, 98px); }
      .hero-intro { max-width: 470px; font-size: 14px; }
      .hero-origin { font-size: 9px; line-height: 1.7; }
      .hero-actions { gap: 12px 20px; margin-top: 28px; }
      .hero-index { right: auto; bottom: 32px; left: 0; gap: 14px; font-size: 7px; }
      .hero-baseline { height: 4px; }
      .origin { padding-block: 70px 62px; }
      .origin-content { grid-template-columns: 1fr; gap: 24px; margin-top: 35px; }
      .origin h2, .movement h2 { font-size: clamp(53px, 12vw, 72px); }
      .origin-copy { padding: 0; }
      .origin-copy .lead { font-size: 19px; }
      .origin-copy p { font-size: 12px; }
      .origin-rule { gap: 10px; margin-top: 41px; font-size: 7px; }
      .movement-inner { padding-block: 58px 52px; }
      .movement h2 { margin-top: 31px; }
      .movement-steps { grid-template-columns: 1fr; margin-top: 38px; }
      .movement-step, .movement-step + .movement-step { min-height: 0; padding: 17px 0 21px; border-left: 0; border-bottom: 1px solid #79877b; }
      .movement-step:last-child { border-bottom: 0; }
      .movement-step h3 { margin: 19px 0 6px; font-size: 27px; }
      .movement-step p { max-width: 360px; font-size: 11px; }
      .movement-conclusion { font-size: 11px; }
      .movement-conclusion em { font-size: 15px; }
      .foundation { padding-block: 69px 73px; row-gap: 28px; }
      .foundation > .section-marker { margin-bottom: 2px; }
      .foundation-grid { margin-left: 0; }
      .foundation h2 { font-size: 60px; }
      .foundation-item { min-height: 140px; padding-right: 12px; }
      .foundation-item:nth-child(even) { padding-left: 14px; }
      .foundation-item h3 { font-size: 16px; }
      .foundation-item p { font-size: 10px; }
      .circle-inner { padding-block: 58px 48px; }
      .circle-content { grid-template-columns: 1fr; gap: 26px; margin-top: 34px; }
      .circle h2 { font-size: clamp(44px, 10.2vw, 62px); }
      .circle-copy p { font-size: 11px; }
      .circle-copy .circle-note { font-size: 9px; }
      .circle-register { gap: 10px; margin-top: 44px; font-size: 7px; }
      .circle-register i { width: 22px; }
      .entry { padding-block: 68px 75px; }
      .entry-inner { grid-template-columns: 1fr; gap: 24px; margin-top: 34px; }
      .entry h2 { font-size: 80px; }
      .entry-action { padding-top: 0; }
      .entry-action > p { font-size: 12px; }
      .footer-main { gap: 8px; }
      .footer-line { grid-column: 1 / -1; grid-row: 2; font-size: 9px; }
      .footer-nav { grid-row: 3; flex-wrap: wrap; gap: 4px 15px; }
      .footer-nav a { font-size: 8px; }
    }
    @media (max-width: 360px) {
      .shell, .section-shell { width: calc(100% - 32px); }
      .wordmark { font-size: 12px; }
      .studio-link { font-size: 7px; padding-inline: 8px; }
      .hero h1 { font-size: 62px; }
      .hero-index { gap: 8px; font-size: 6px; }
      .foundation h2 { font-size: 53px; }
      .circle h2 { font-size: 42px; }
      .circle-register { gap: 7px; font-size: 6px; }
      .circle-register i { width: 15px; }
    }
  `],
})
export class LandingComponent {
  readonly menuOpen = signal(false);
}
