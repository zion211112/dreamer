/**
 * Workspace Modules - APT-LABS style 5-module organization
 * catalyzes African sovereignty journey through independent software capability
 */
export const workspace = {
  name: 'APT-LABS African Sovereignty',
  modules: [
    { key: 'network', label: 'Network', getStatus: () => github.getModuleStatus('network') },
    { key: 'builds', label: 'Builds', getStatus: () => github.getModuleStatus('builds') },
    { key: 'operations', label: 'Operations', getStatus: () => github.getModuleStatus('operations') },
    { key: 'research', label: 'Research', getStatus: () => github.getModuleStatus('research') },
    { key: 'kernel', label: 'Kernel', getStatus: () => github.getModuleStatus('kernel') }
  ],
  defaultModule: 'network',
  theme: {
    primary: '#3b82f5',
    secondary: '#1d4ed8',
    background: '#f8f9fa'
  }
}