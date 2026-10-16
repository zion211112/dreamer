import { defineComponent } from '@lubbock/runtime'
import { github } from '../lib/github-connector'
import { workspace } from '../lib/workspace-modules'

export const GithubDashboard = defineComponent({
  name: 'GithubDashboard',
  template: /* jsx */`\n    <div class="dashboard-page" style={{background: 'var(--background, #f7f4ed)'}}>\n      <header class="page-header" style={{background: 'var(--surface, #fff)'}}>\n        <div class="avatar-container">\n          ${github.user\n            ? `<img src="${github.avatar_url}" alt="${github.login}" class="user-avatar" />`\n            : `<div class="avatar-placeholder">👤</div>`}\n        </div>\n        <h1 class="page-title">GitHub Sparkle Link</h1>\n        <p class="page-subtitle">${github.connected ? `Connected as ${github.login}` : 'Disconnected from GitHub'}</p>\n        <button\n          class="connect-btn"\n          onclick="${() => github.checkConnection()}">\n          ${github.connected ? 'Connected' : 'Connect'}\n        </button>\n      </header>\n\n      <main class="modules-grid" style={{gap: '1.5rem'}}>\n        ${workspace.modules.map(module => `\n          <article class="module-card" key="${module.key}" style={{border: '1px solid var(--border, #eceae4)', borderRadius: '9999px'}}\n            >\n            <h2 class="module-label" style={{color: 'var(--on-surface, #1c1c1c)'}}>${module.label}</h2>\n            <div class="status-indicator" id="status-${module.key}" style={{border: '1px solid var(--border, #eceae4)', background: 'rgba(28,28,28,0.03)', borderRadius: '9999px'}}\n              >${module.getStatus()}</div>\n          </article>\n        `).join('')}\n      </main>\n    </div>\n  `,
  props: {
    id: { type: String, required: true }
  },
  events: {
    click: { detail: { target: String } }
  }
})
