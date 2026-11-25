import { Routes } from '@angular/router';

/**
 * APT-LABS — Route table (migrated from Vue router)
 *
 * 22 route records: public routes, workspace shell and children, and fallback.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/landing' },

  // Public pages
  { path: 'landing', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'sign-in', loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'sign-up', loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },

  // Workspace shell (parent with nested children)
  {
    path: 'workspace',
    loadComponent: () => import('./features/workspace/workspace-shell.component').then(m => m.WorkspaceShellComponent),
    children: [
      { path: '', loadComponent: () => import('./features/workspace/overview.component').then(m => m.OverviewComponent) },
      { path: 'commons', loadComponent: () => import('./features/commons/commons.component').then(m => m.CommonsComponent) },
      { path: 'network', loadComponent: () => import('./features/network/network.component').then(m => m.NetworkComponent) },
      { path: 'network/people', loadComponent: () => import('./features/network/people.component').then(m => m.PeopleComponent) },
      { path: 'network/institutions', loadComponent: () => import('./features/network/institutions.component').then(m => m.InstitutionsComponent) },
      { path: 'network/capabilities', loadComponent: () => import('./features/network/capabilities.component').then(m => m.CapabilitiesComponent) },
      { path: 'workbench', loadComponent: () => import('./features/workbench/home.component').then(m => m.HomeComponent) },
      { path: 'workbench/:pilot', loadComponent: () => import('./features/workbench/pilot.component').then(m => m.PilotComponent) },
      { path: 'value', loadComponent: () => import('./features/value/value.component').then(m => m.ValueComponent) },
      { path: 'records', loadComponent: () => import('./features/records/records.component').then(m => m.RecordsComponent) },
      { path: 'records/canon', loadComponent: () => import('./features/records/records.component').then(m => m.RecordsComponent) },
      { path: 'records/annals', loadComponent: () => import('./features/records/records.component').then(m => m.RecordsComponent) },
      { path: 'records/roll', loadComponent: () => import('./features/records/records.component').then(m => m.RecordsComponent) },
      { path: 'intelligence', loadComponent: () => import('./features/intelligence/intelligence.component').then(m => m.IntelligenceComponent) },
      { path: 'ontology', loadComponent: () => import('./features/ontology/ontology.component').then(m => m.OntologyComponent) },
      { path: 'sovereignty', loadComponent: () => import('./features/sovereignty/sovereignty.component').then(m => m.SovereigntyComponent) },
    ],
  },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
