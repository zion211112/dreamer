<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const isWorkspace = computed(() => {
  const path = route.path;
  return path.startsWith('/workspace') || path === '/benben-os';
});

const railItems = [
  { label: 'Coordination', to: '/workspace/coordination', module: 'coordination' },
  { label: 'Workbench', to: '/workspace/workbench', module: 'workbench' },
  { label: 'Commons', to: '/workspace/commons', module: 'commons' },
  { label: 'Network', to: '/workspace/network', module: 'network' },
  { label: 'Records', to: '/workspace/records', module: 'records' },
  { label: 'Intelligence', to: '/workspace/intelligence', module: 'intelligence' },
];

const isActive = (to: string) => route.path === to || (to !== '/' && route.path.startsWith(to + '/'));
</script>

<template>
  <div class="app-shell">
    <!-- Workspace shell (workspace / benben-os routes) -->
    <div v-if="isWorkspace" class="app-shell--workspace">
      <aside class="app-shell-rail">
        <div class="app-shell-rail-brand">
          <RouterLink to="/" class="app-shell-wordmark">aptlabs</RouterLink>
        </div>
        <nav class="app-shell-rail-nav">
          <RouterLink
            v-for="item in railItems"
            :key="item.to"
            :to="item.to"
            class="app-shell-rail-item"
            :data-module="item.module"
            :class="{ 'app-shell-rail-item--active': isActive(item.to) }"
          >
            <span class="app-shell-rail-item-label">{{ item.label }}</span>
          </RouterLink>
        </nav>
        <div class="app-shell-rail-footer">
          <RouterLink to="/sign-out" class="app-shell-rail-signout">Sign out</RouterLink>
        </div>
      </aside>

      <div class="app-shell-body">
        <header class="app-shell-header app-shell-header--workspace">
          <div class="app-shell-header-left">
            <button class="app-shell-rail-toggle" aria-label="Toggle navigation">☰</button>
            <RouterLink to="/" class="app-shell-wordmark">aptlabs</RouterLink>
          </div>
          <div class="app-shell-header-right">
            <span class="app-shell-user">Workspace</span>
          </div>
        </header>

        <main class="app-shell-main">
          <RouterView />
        </main>

        <footer class="app-shell-footer">
          <p class="app-shell-footer-line">
            APT-LABS — local-first coordination. No live institutional, payment, tracking,
            or account connections.
          </p>
        </footer>
      </div>
    </div>

    <!-- Public routes (landing / auth): the page renders its own full-page chrome -->
    <RouterView v-else />
  </div>
</template>

<style scoped>
/* Base shell */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--apt-font-sans);
  color: var(--apt-text-body);
  background: var(--apt-surface-default);
}

.app-shell-main {
  flex: 1;
}

/* Shared header (workspace) */
.app-shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--apt-spacing-s6) var(--apt-spacing-s16);
  background: var(--apt-surface-page);
  border-bottom: 1px solid var(--apt-border);
}

.app-shell-wordmark {
  font-family: var(--apt-font-serif);
  font-size: var(--apt-font-size-title-2);
  font-weight: var(--apt-font-weight-semibold);
  color: var(--apt-color-brand-primary);
  text-decoration: none;
  letter-spacing: -0.01em;
}

/* Workspace shell */
.app-shell--workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-shell-rail {
  width: var(--apt-block-workspace-rail-width);
  flex-shrink: 0;
  background: var(--apt-surface-page);
  border-right: 1px solid var(--apt-border);
  display: flex;
  flex-direction: column;
}

.app-shell-rail-brand {
  padding: var(--apt-spacing-s8) var(--apt-spacing-s12);
  border-bottom: 1px solid var(--apt-border);
}

.app-shell-rail-brand .app-shell-wordmark {
  font-size: var(--apt-font-size-title-2);
  color: var(--apt-color-brand-primary);
}

.app-shell-rail-nav {
  display: flex;
  flex-direction: column;
  padding: var(--apt-spacing-s8) 0;
  gap: var(--apt-spacing-s2);
}

.app-shell-rail-item {
  display: flex;
  align-items: center;
  padding: var(--apt-spacing-s5) var(--apt-spacing-s12);
  color: var(--apt-text-muted);
  text-decoration: none;
  font-size: var(--apt-font-size-body-md);
  font-weight: var(--apt-font-weight-medium);
  border-radius: 0;
  white-space: nowrap;
  transition: all var(--apt-animation-fast);
}

.app-shell-rail-item:hover {
  background: var(--apt-surface-raised);
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
}

.app-shell-rail-item--active {
  background: var(--apt-surface-raised);
  color: var(--apt-module-accent, var(--apt-color-brand-primary));
  font-weight: var(--apt-font-weight-semibold);
  border-left: 4px solid var(--apt-module-accent, var(--apt-color-brand-primary));
  padding-left: calc(var(--apt-spacing-s12) - 4px);
}

.app-shell-rail-footer {
  margin-top: auto;
  padding: var(--apt-spacing-s8) var(--apt-spacing-s12);
  border-top: 1px solid var(--apt-border);
}

.app-shell-rail-signout {
  font-size: var(--apt-font-size-body-sm);
  font-family: var(--apt-font-mono);
  color: var(--apt-text-dim);
  text-decoration: none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: color var(--apt-animation-fast);
}

.app-shell-rail-signout:hover {
  color: var(--apt-color-brand-primary);
}

.app-shell-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-shell-header--workspace {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--apt-spacing-s4) var(--apt-spacing-s12);
  background: var(--apt-surface-page);
  border-bottom: 1px solid var(--apt-border);
  flex-shrink: 0;
}

.app-shell-header-left {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
}

.app-shell-rail-toggle {
  display: none;
  padding: var(--apt-spacing-s2);
  border: 1px solid var(--apt-border);
  border-radius: var(--apt-radius-r1);
  background: var(--apt-surface-page);
  color: var(--apt-text-strong);
  font-size: var(--apt-font-size-h3);
  line-height: 1;
  cursor: pointer;
  transition: all var(--apt-animation-fast);
}

.app-shell-header-left .app-shell-wordmark {
  font-size: var(--apt-font-size-title-2);
  color: var(--apt-color-brand-primary);
}

.app-shell-header-right {
  display: flex;
  align-items: center;
  gap: var(--apt-spacing-s6);
}

.app-shell-user {
  font-size: var(--apt-font-size-body-sm);
  color: var(--apt-text-muted);
  font-weight: var(--apt-font-weight-medium);
}

.app-shell-main {
  padding: var(--apt-spacing-s12) var(--apt-spacing-s16);
  overflow-y: auto;
}

.app-shell-footer {
  padding: var(--apt-spacing-s6) var(--apt-spacing-s16);
  border-top: 1px solid var(--apt-border);
  background: var(--apt-surface-page);
  flex-shrink: 0;
}

.app-shell-footer-line {
  font-size: var(--apt-font-size-sm-3);
  color: var(--apt-text-dim);
  margin: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .app-shell-rail {
    position: fixed;
    inset: 0;
    z-index: var(--apt-z-index-modal);
    transform: translateX(-100%);
    transition: transform var(--apt-animation-normal);
    height: 100vh;
    overflow-y: auto;
  }

  .app-shell-rail-toggle {
    display: block;
  }

  .app-shell-header--workspace {
    padding: var(--apt-spacing-s4) var(--apt-spacing-s8);
  }

  .app-shell-main {
    padding: var(--apt-spacing-s12) var(--apt-spacing-s8);
  }

  .app-shell-footer {
    padding: var(--apt-spacing-s6) var(--apt-spacing-s8);
  }
}
</style>

