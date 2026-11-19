<script setup lang="ts">
import { RouterLink } from 'vue-router';

const persona = {
  roleLabel: 'Annals viewer',
  actions: [
    { label: 'Workbench', href: '/workspace/workbench' },
    { label: 'Commons', href: '/workspace/commons' },
    { label: 'Network', href: '/workspace/network' },
    { label: 'Records', href: '/workspace/records' },
  ],
};
</script>

<template>
  <div class="workspace-overview" data-module="workbench">
    <header class="workspace-overview-header">
      <h1 class="workspace-overview-title">Workspace</h1>
      <div class="workspace-overview-profile-context">
        <span class="workspace-overview-profile-mark" aria-hidden="true" />
        <span>{{ persona.roleLabel }}</span>
      </div>
    </header>

    <div class="workspace-overview-content">
      <section aria-labelledby="workspace-actions-title" class="workspace-overview-actions">
        <h2 id="workspace-actions-title">Quick actions</h2>
        <ul>
          <li v-for="action in persona.actions" :key="action.href">
            <RouterLink :to="action.href" class="workspace-overview-action-link">
              <span>{{ action.label }}</span>
              <span class="workspace-overview-arrow" aria-hidden="true">→</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section aria-labelledby="workspace-updates-title" class="workspace-overview-updates">
        <h2 id="workspace-updates-title">Updates</h2>
        <p>No linked updates</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Tokens from aptlabs-fused-design-tokens.json — four-layer architecture applied */

.workspace-overview {
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
  min-height: 100vh;
  padding: var(--apt-spacing-s13);
}

.workspace-overview-header {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
  margin-bottom: var(--apt-spacing-s13);
}

.workspace-overview-title {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-h1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0;
  color: var(--apt-text-body);
}

.workspace-overview-profile-context {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s2);
  margin-left: auto;
}

.workspace-overview-profile-mark {
  width: var(--apt-spacing-s2);
  height: var(--apt-spacing-s2);
  border-radius: var(--apt-radius-r10);
  background: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.workspace-overview-profile-context span {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
}

.workspace-overview-content {
  max-width: var(--apt-block-landing-max-width);
}

.workspace-overview-actions {
  margin-bottom: var(--apt-spacing-s13);
}

.workspace-overview-actions h2 {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s4) 0;
  color: var(--apt-text-body);
}

.workspace-overview-actions ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--apt-spacing-s3);
}

.workspace-overview-action-link {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s3);
  padding: var(--apt-spacing-s4) var(--apt-spacing-s6);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r2);
  background: var(--apt-color-neutral-n0);
  color: var(--apt-text-body);
  text-decoration: none;
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium);
  transition: border-color var(--apt-animation-fast), background-color var(--apt-animation-fast);
}

.workspace-overview-action-link:hover {
  border-color: var(--apt-module-accent, var(--apt-color-brand-primary));
  background: var(--apt-color-ramp-stewardship-50);
}

.workspace-overview-arrow {
  margin-left: auto;
  color: var(--apt-text-dim);
  font-size: var(--apt-font-size-sm-3);
}

.workspace-overview-action-link:hover .workspace-overview-arrow {
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.workspace-overview-updates h2 {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-1);
  font-weight: var(--apt-font-weight-semibold);
  margin: 0 0 var(--apt-spacing-s3) 0;
  color: var(--apt-text-body);
}

.workspace-overview-updates p {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  margin: 0;
  line-height: var(--apt-line-height-relaxed);
}
</style>

