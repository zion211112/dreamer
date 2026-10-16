/**
 * GithubDashboard - APT-LABS 5-module dashboard
 * Displays GitHub-connected module status for African sovereignty journey
 */
import { github } from '../lib/github-connector'
import { workspace } from '../lib/workspace-modules'

export const GithubDashboard = {
  name: 'GithubDashboard',
  template: `<div class="dashboard-page" style="background: var(--background, #f8f9fa); font-family: system-ui, -apple-system, sans-serif">
    <header class="page-header" style="background: var(--surface, #fff); padding: 1.5rem; border-radius: 12px; margin: -1.5rem -1.5rem 1rem">
      <div class="avatar-container" style="text-align: center">
        ${github.user
          ? `<img src="${github.avatar_url}" alt="${github.login}" class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border, #e2e8f1)" />`
          : `<div class="avatar-placeholder" style="width: 40px; height: 40px; background: #e2e8f1; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #64748b; font-size: 1.2rem">👤</div>`}
      </div>
      <h1 class="page-title" style="margin: 0.5rem 0 0; color: var(--on-surface, #1e293b)">APT-LABS African Sovereignty</h1>
      <p class="page-subtitle" style="margin: 0.25rem 0 0; color: #64748b; font-size: 0.875rem">
        ${github.connected ? `Connected as ${github.login}` : 'Disconnected from GitHub'}
      </p>
    </header>

    <main class="modules-grid" style="padding: 1rem; gap: 1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1)); gap: 1rem">
      ${workspace.modules.map(module => `
        <article class="module-card" key="${module.key}" style="background: var(--surface, #fff); border: 1px solid var(--border, #e2e8f1); border-radius: 9999px; padding: 1rem; transition: transform 0.2s">
          <h2 class="module-label" style="margin: 0 0 0.5rem; color: var(--on-surface, #1e293b); font-size: 0.875rem;">${module.label}</h2>
          <div class="status-indicator" id="status-${module.key}" style="width: 100%; height: 8px; background: rgba(28,28,28,0.03); border-radius: 9999px; overflow: hidden; margin-top: 0.5rem">
            ${module.getStatus()}
          </div>
        </article>
      `).join('')}
    </main>
  </div>`,
  props: { id: { type: String, required: true } },
  events: { click: { detail: { target: String } } }
}