/**
 * Workspace Modules - APT-LABS style module organization
 * Fusion element from dreamer project
 */
export const workspace = {
  name: 'GitHub Sparkle Link',
  modules: [
    { key: 'network', label: 'Network', getStatus: () => github.getModuleStatus('network') },
    { key: 'builds', label: 'Builds', getStatus: () => github.getModuleStatus('builds') },
    { key: 'operations', label: 'Operations', getStatus: () => github.getModuleStatus('operations') },
    { key: 'research', label: 'Research', getStatus: () => github.getModuleStatus('research') },
    { key: 'kernel', label: 'Kernel', getStatus: () => github.getModuleStatus('kernel') }
  ],
  defaultModule: 'network',
  theme: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    background: '#f3f4f6'
  }
}