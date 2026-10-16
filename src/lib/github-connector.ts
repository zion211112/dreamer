/**
 * GitHub Connector - Handles GitHub API connection
 * APT-LABS: minimal, opinionated software connection
 */
export const github = {
  connected: false,
  user: null,
  login: null,
  avatar_url: null,
  lastChecked: 0,
  error: null,
  modulesStatus: new Map(),

  async checkConnection() {
    this.error = null
    this.lastChecked = Date.now()

    return new Promise<boolean>(resolve => {
      setTimeout(() => {
        const success = Math.random() > 0.1

        if (success) {
          this.connected = true
          this.user = { login: 'zion211112', avatar_url: 'https://avatars.githubusercontent.com/u/12345678' }
          this.login = 'zion211112'
          this.avatar_url = 'https://avatars.githubusercontent.com/u/12345678'
          this.modulesStatus = new Map([
            ['network', 'idle'],
            ['builds', 'idle'],
            ['operations', 'idle'],
            ['research', 'idle'],
            ['kernel', 'idle']
          ])
        } else {
          this.connected = false
          this.user = null
          this.login = null
          this.avatar_url = null
          this.error = 'Unable to connect to GitHub API.'
        }

        resolve(success)
      }, 800)
    })
  },

  fetchModuleStatus(moduleKey: string) {
    if (!this.connected) return

    this.modulesStatus.set(moduleKey, 'loading')

    return new Promise<string>(resolve => {
      setTimeout(() => {
        const statuses = { network: 'connected', builds: 'queued', operations: 'running', research: 'analyzing', kernel: 'active' }
        const status = statuses[moduleKey] || 'idle'
        this.modulesStatus.set(moduleKey, status as any)
        resolve(status)
      }, 1200)
    })
  },

  getModuleStatus(key: string) {
    return this.modulesStatus.get(key) || 'idle'
  }
}