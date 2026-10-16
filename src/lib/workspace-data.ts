export const workspace = {
  name: 'APT-LABS Workspace',
  modules: [
    { key: 'network', label: 'Network', component: 'NetworkModule' },
    { key: 'builds', label: 'Builds', component: 'BuildsModule' },
    { key: 'operations', label: 'Operations', component: 'OperationsModule' },
    { key: 'research', label: 'Research', component: 'ResearchModule' },
    { key: 'kernel', label: 'Kernel', component: 'KernelModule' }
  ],
  defaultModule: 'network',
  theme: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    background: '#f3f4f6'
  }
}