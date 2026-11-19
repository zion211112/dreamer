<script setup lang="ts">
import { RouterLink } from 'vue-router';

const MODULES = [
  { id: 'workbench', label: 'Workbench', hint: 'Coordinate work across five pilot lanes', to: '/workspace/workbench', hero: true, image: '/.playwright-mcp/workbench-home.png' },
  { id: 'commons', label: 'Commons', hint: 'Record needs, offers, and opportunities', to: '/workspace/commons', image: '/.playwright-mcp/commons.png' },
  { id: 'network', label: 'Network', hint: 'Connect people, crews, and institutions', to: '/workspace/network', image: '/.playwright-mcp/network-people-v2.png' },
  { id: 'records', label: 'Records', hint: 'Review history and delivery evidence', to: '/workspace/records', image: '/.playwright-mcp/records-1440.png' },
  { id: 'intelligence', label: 'Intelligence', hint: 'Match capacity and plan next steps', to: '/workspace/intelligence', image: '/.playwright-mcp/intelligence-1440.png' },
];

const ONTOLOGY = [
  { id: 'actors', label: 'Actors', detail: 'Who can act?' },
  { id: 'resources', label: 'Resources', detail: 'What enables work?' },
  { id: 'intentions', label: 'Intentions', detail: 'What needs to change?' },
  { id: 'commitments', label: 'Commitments', detail: 'Who undertakes what?' },
  { id: 'activity', label: 'Activity', detail: 'What work is happening?' },
  { id: 'knowledge', label: 'Knowledge', detail: 'What is retained and reused?' },
];

const PATH = [
  { num: '01', title: 'Need defined' },
  { num: '02', title: 'Work coordinated' },
  { num: '03', title: 'Delivery evidenced' },
  { num: '04', title: 'Record retained' },
];
</script>

<template>
  <div class="landing">
    <header class="landing-header">
      <div class="landing-brand">
        <RouterLink to="/" class="landing-wordmark">aptlabs</RouterLink>
      </div>
      <nav class="landing-nav">
        <RouterLink to="/workspace" class="landing-nav-link">Workspace</RouterLink>
        <RouterLink to="/workspace/workbench" class="landing-nav-link">Workbench</RouterLink>
        <RouterLink to="/workspace/commons" class="landing-nav-link">Commons</RouterLink>
        <RouterLink to="/workspace/network" class="landing-nav-link">Network</RouterLink>
        <RouterLink to="/workspace/records" class="landing-nav-link">Records</RouterLink>
      </nav>
      <div class="landing-actions">
        <a href="/investor-memo/s/aptlabs-investor-deck" class="landing-investor">
          Investor slides
        </a>
        <RouterLink to="/sign-in?next=/workspace" class="landing-start">
          Start building
        </RouterLink>
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
              <RouterLink to="/sign-in?next=/workspace" class="hero-primary">
                Start building
              </RouterLink>
            </div>
          </div>
          <div class="hero-image">
            <img src="/.playwright-mcp/landing-desktop-final.png" alt="APT-LABS workspace" class="hero-img" />
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
            <li v-for="stage in PATH" :key="stage.num" class="path-stage">
              <span class="path-num">{{ stage.num }}</span>
              <span class="path-title-text">{{ stage.title }}</span>
            </li>
          </ol>
          <div class="path-visual">
            <img src="/imagesinspo-1.jpg" alt="Work coordination interface" class="path-img" />
          </div>
        </div>
      </section>

      <section class="structures" aria-labelledby="structures-title">
        <div class="structures-inner">
          <div class="structures-head">
            <h2 id="structures-title" class="structures-title">The six registers</h2>
            <p class="structures-lede">
              The same structure for a school, a laboratory, or a community.
            </p>
          </div>
          <div class="structures-grid">
            <article v-for="structure in ONTOLOGY" :key="structure.id" class="structure-card">
              <h3 class="structure-title">{{ structure.label }}</h3>
              <p class="structure-detail">{{ structure.detail }}</p>
            </article>
          </div>
          <div class="structures-visual">
            <img src="/palantir-ontology-overview.png" alt="Ontology management interface" class="structures-img" />
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
            <div
              v-for="m in MODULES"
              :key="m.id"
              :class="['module-cell', m.hero ? 'module-cell--hero' : '']"
              :data-module="m.id"
            >
              <div class="module-copy">
                <h3 class="module-title">{{ m.label }}</h3>
                <p class="module-hint">{{ m.hint }}</p>
                <RouterLink v-if="m.hero" :to="m.to" class="module-link module-link--hero">Open {{ m.label }} →</RouterLink>
                <img v-if="m.image && !m.hero" :src="m.image" :alt="`${m.label} module`" class="module-img" />
              </div>
              <img v-if="m.image && m.hero" :src="m.image" :alt="`${m.label} module`" class="module-img module-img--hero" />
            </div>
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
            <RouterLink to="/sign-in?next=/workspace" class="cta-primary">
              Start building
            </RouterLink>
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
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

/* Base */
.landing {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
}

main {
  flex: 1;
}

/* Header */
.landing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--apt-spacing-s8) var(--apt-spacing-s16);
  background: var(--apt-surface-page);
  border-bottom: 1px solid var(--apt-border);
  position: sticky;
  top: 0;
  z-index: var(--apt-z-index-dropdown);
}

.landing-brand {
  display: flex;
  align-items: center;
  gap: 0;
}

.landing-wordmark {
  display: inline-flex;
  align-items: center;
  min-height: var(--apt-spacing-s15);
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-color-brand-primary);
  text-decoration: none;
  letter-spacing: -0.01em;
}

.landing-nav {
  display: flex;
  gap: var(--apt-spacing-s13);
  align-items: center;
}

.landing-nav-link {
  display: inline-flex;
  align-items: center;
  min-height: var(--apt-spacing-s15);
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-text-muted);
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: color var(--apt-animation-fast);
}

.landing-nav-link:hover {
  color: var(--apt-color-brand-primary);
}

.landing-actions {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
}

.landing-investor {
  display: inline-flex;
  align-items: center;
  min-height: var(--apt-spacing-s15);
  font-size: var(--apt-font-size-sm-3);
  font-family: var(--apt-font-mono);
  color: var(--apt-text-dim);
  text-decoration: none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: var(--apt-spacing-s1) 0;
  transition: color var(--apt-animation-fast);
}

.landing-investor:hover {
  color: var(--apt-color-brand-primary);
}

.landing-start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--apt-spacing-s15);
  padding: var(--apt-spacing-s4) var(--apt-spacing-s10);
  background: var(--apt-color-brand-accent);
  color: var(--apt-action-on-primary);
  text-decoration: none;
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium);
  font-family: var(--apt-font-sans);
  border-radius: var(--apt-radius-r1);
  letter-spacing: -0.01em;
  transition: background-color var(--apt-animation-fast);
}

.landing-start:hover {
  background: var(--apt-color-neutral-n950);
}

/* Hero */
.hero {
  padding: var(--apt-spacing-s18) var(--apt-spacing-s16);
  background: var(--apt-surface-page);
  border-bottom: 1px solid var(--apt-border);
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--apt-spacing-s16);
  align-items: center;
  max-width: var(--apt-block-landing-max-width);
  margin: 0 auto;
}

.hero-copy {
  max-width: var(--apt-block-landing-content-max-width);
}

.hero-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-display-xl);
  font-weight: var(--apt-font-weight-semibold);
  line-height: var(--apt-line-height-tight);
  margin: 0 0 var(--apt-spacing-s10) 0;
  color: var(--apt-text-strong);
  letter-spacing: -0.02em;
}

.hero-lede {
  font-size: var(--apt-font-size-body-md);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s12) 0;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: var(--apt-spacing-s6);
}

.hero-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--apt-spacing-s15);
  padding: var(--apt-spacing-s5) var(--apt-spacing-s11);
  background: var(--apt-color-brand-accent);
  color: var(--apt-action-on-primary);
  text-decoration: none;
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-medium);
  font-family: var(--apt-font-sans);
  border-radius: var(--apt-radius-r1);
  letter-spacing: -0.01em;
  transition: background-color var(--apt-animation-fast);
}

.hero-primary:hover {
  background: var(--apt-color-neutral-n950);
}

.hero-image {
  display: flex;
  justify-content: center;
}

.hero-img {
  width: 100%;
  max-width: 560px;
  height: auto;
  border-radius: var(--apt-block-landing-radius-lg);
  border: 1px solid var(--apt-border);
  box-shadow: var(--apt-shadow-sh2);
  display: block;
}

/* Path */
.path {
  padding: var(--apt-spacing-s18) var(--apt-spacing-s16);
  background: var(--apt-surface-default);
}

.path-inner {
  max-width: 960px;
  margin: 0 auto;
}

.path-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.path-lede {
  font-size: var(--apt-font-size-body-md);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s12) 0;
  max-width: 600px;
}

.path-lane {
  display: flex;
  gap: var(--apt-spacing-s18);
  list-style: none;
  margin: 0;
  padding: 0;
}

.path-stage {
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
}

.path-num {
  font-family: var(--apt-font-mono);
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-color-brand-primary);
  letter-spacing: 0.08em;
}

.path-title-text {
  font-size: var(--apt-font-size-title-2);
  color: var(--apt-text-muted);
  line-height: 1.5;
}

/* Path visual */
.path-visual {
  margin-top: var(--apt-spacing-s12);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  overflow: hidden;
  background: var(--apt-surface-page);
}

.path-img {
  width: 100%;
  height: auto;
  display: block;
}

/* Structures */
.structures {
  padding: var(--apt-spacing-s18) var(--apt-spacing-s16);
  background: var(--apt-surface-page);
  border-bottom: 1px solid var(--apt-border);
}

.structures-inner {
  max-width: 960px;
  margin: 0 auto;
}

.structures-head {
  margin-bottom: var(--apt-spacing-s10);
}

.structures-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s4) 0;
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.structures-lede {
  font-size: var(--apt-font-size-body-md);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0;
  max-width: 600px;
}

.structures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--apt-spacing-s10);
}

.structure-card {
  padding: var(--apt-spacing-s11);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-surface-raised);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
  transition: border-color var(--apt-animation-fast), box-shadow var(--apt-animation-fast);
}

.structure-card:hover {
  border-color: var(--apt-color-brand-primary);
  box-shadow: var(--apt-shadow-sh2);
}

.structure-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-strong);
}

.structure-detail {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: 1.5;
  flex: 1;
}

/* Structures visual */
.structures-visual {
  margin-top: var(--apt-spacing-s12);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  overflow: hidden;
  background: var(--apt-surface-page);
}

.structures-img {
  width: 100%;
  height: auto;
  display: block;
}

/* Modules */
.modules {
  padding: var(--apt-spacing-s18) var(--apt-spacing-s16);
  background: var(--apt-surface-default);
}

.modules-inner {
  max-width: 960px;
  margin: 0 auto;
}

.modules-head {
  margin-bottom: var(--apt-spacing-s10);
}

.modules-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s4) 0;
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.modules-lede {
  font-size: var(--apt-font-size-body-md);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0;
  max-width: 600px;
}

.modules-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.module-cell {
  padding: var(--apt-spacing-s12);
  border-bottom: 1px solid var(--apt-border);
  background: var(--apt-surface-page);
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s4);
  transition: background-color var(--apt-animation-fast);
}

.module-cell:hover {
  background: var(--apt-surface-raised);
}

.module-cell--hero:hover {
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.module-cell--hero {
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
  color: var(--apt-action-on-primary);
  border-bottom: none;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--apt-spacing-s14) var(--apt-spacing-s16);
  gap: var(--apt-spacing-s13);
}

.module-cell--hero .module-copy {
  flex: 1;
  min-width: 0;
}

.module-cell--hero .module-title {
  color: var(--apt-action-on-primary);
}

.module-cell--hero .module-hint {
  color: var(--apt-color-ramp-stewardship-100);
}

.module-link--hero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--apt-spacing-s15);
  margin-top: var(--apt-spacing-s6);
  padding: var(--apt-button-padding-md);
  background: var(--apt-action-on-primary);
  color: var(--apt-color-brand-primary);
  border-radius: var(--apt-button-radius);
  font-size: var(--apt-button-font-size-lg);
  font-weight: var(--apt-button-font-weight);
  text-decoration: none;
  transition: transform var(--apt-button-transition), box-shadow var(--apt-button-transition);
}

@media (hover: hover) and (pointer: fine) {
  .module-link--hero:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
}

.module-copy h3 {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s2) 0;
  color: var(--apt-text-strong);
}

.module-copy p {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: 1.5;
}

.module-link {
  font-size: var(--apt-font-size-body-sm);
  font-weight: var(--apt-font-weight-medium);
  color: var(--apt-color-brand-primary);
  text-decoration: underline;
  text-decoration-color: rgba(43, 89, 69, 0.3);
  text-underline-offset: 2px;
  align-self: flex-start;
  transition: text-decoration-color var(--apt-animation-fast);
}

.module-link:hover {
  text-decoration-color: var(--apt-color-brand-primary);
}

.module-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  margin-top: var(--apt-spacing-s6);
  display: block;
}

.module-img--hero {
  max-width: 420px;
  border-radius: var(--apt-block-landing-radius-lg);
  box-shadow: var(--apt-shadow-sh2);
}

/* CTA */
.cta {
  padding: var(--apt-spacing-s20) var(--apt-spacing-s16);
  background: var(--apt-surface-page);
}

.cta-inner {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h2);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s6) 0;
  color: var(--apt-text-strong);
  letter-spacing: -0.01em;
}

.cta-lede {
  font-size: var(--apt-font-size-body-md);
  line-height: var(--apt-line-height-relaxed);
  color: var(--apt-text-muted);
  margin: 0 0 var(--apt-spacing-s12) 0;
  max-width: 520px;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--apt-spacing-s15);
  padding: var(--apt-spacing-s5) var(--apt-spacing-s12);
  background: var(--apt-color-brand-accent);
  color: var(--apt-action-on-primary);
  text-decoration: none;
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-medium);
  font-family: var(--apt-font-sans);
  border-radius: var(--apt-radius-r1);
  letter-spacing: -0.01em;
  transition: background-color var(--apt-animation-fast);
}

.cta-primary:hover {
  background: var(--apt-color-neutral-n950);
}

/* Footer */
.landing-footer {
  padding: var(--apt-spacing-s10) var(--apt-spacing-s16);
  border-top: 1px solid var(--apt-border);
  background: var(--apt-surface-page);
}

.landing-footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  max-width: 960px;
  margin: 0 auto;
}

.landing-footer-brand {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-color-brand-primary);
}

.landing-footer-note {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  margin: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .landing-header {
    padding: var(--apt-spacing-s6) var(--apt-spacing-s10);
  }

  .landing-nav {
    display: none;
  }

  .hero-inner {
    grid-template-columns: 1fr;
    gap: var(--apt-spacing-s10);
  }

  .hero-title {
    font-size: var(--apt-font-size-h2);
  }

  .hero-actions {
    flex-direction: column;
    gap: var(--apt-spacing-s4);
  }

  .hero-primary {
    width: 100%;
  }

  .hero-image {
    order: -1;
  }

  .hero-img {
    max-width: 100%;
  }

  .path {
    padding: var(--apt-spacing-s14) var(--apt-spacing-s10);
  }

  .structures {
    padding: var(--apt-spacing-s14) var(--apt-spacing-s10);
  }

  .modules {
    padding: var(--apt-spacing-s14) var(--apt-spacing-s10);
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .module-cell--hero {
    flex-direction: column;
    text-align: center;
    padding: var(--apt-spacing-s12);
    gap: var(--apt-spacing-s8);
  }

  .module-cell--hero .module-link {
    align-self: center;
  }

  .cta {
    padding: var(--apt-spacing-s16) var(--apt-spacing-s8);
  }

  .cta-title {
    font-size: var(--apt-font-size-h1);
  }

  .landing-footer-inner {
    flex-direction: column;
    gap: var(--apt-spacing-s6);
    text-align: center;
  }
}

@media (max-width: 600px) {
  .landing-header {
    padding: var(--apt-spacing-s4) var(--apt-spacing-s8);
    flex-direction: column;
    gap: var(--apt-spacing-s6);
  }

  .landing-actions {
    width: 100%;
    justify-content: space-between;
  }

  .hero {
    padding: var(--apt-spacing-s14) var(--apt-spacing-s8);
  }

  .hero-title {
    font-size: var(--apt-font-size-h1);
  }

  .hero-lede {
    font-size: var(--apt-font-size-body);
  }

  .path {
    padding: var(--apt-spacing-s12) var(--apt-spacing-s8);
  }

  .structures {
    padding: var(--apt-spacing-s12) var(--apt-spacing-s8);
  }

  .modules {
    padding: var(--apt-spacing-s12) var(--apt-spacing-s8);
  }

  .cta {
    padding: var(--apt-spacing-s14) var(--apt-spacing-s8);
  }

  .landing-footer {
    padding: var(--apt-spacing-s8) var(--apt-spacing-s8);
  }
}
</style>

