import { Routes } from '@angular/router';
import { requireSession } from './auth/auth.guard';

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
    canActivate: [requireSession],
    loadComponent: () => import('./features/workspace/workspace-shell.component').then(m => m.WorkspaceShellComponent),
    children: [
      { path: '', loadComponent: () => import('./features/workspace/overview.component').then(m => m.OverviewComponent) },
      { path: 'commons', loadComponent: () => import('./features/commons/commons.component').then(m => m.CommonsComponent) },
      {
        path: 'network',
        loadComponent: () => import('./features/network/network.component').then(m => m.NetworkComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'people' },
          { path: 'people', loadComponent: () => import('./features/network/people.component').then(m => m.PeopleComponent) },
          { path: 'institutions', loadComponent: () => import('./features/network/institutions.component').then(m => m.InstitutionsComponent) },
          { path: 'capabilities', loadComponent: () => import('./features/network/capabilities.component').then(m => m.CapabilitiesComponent) },
        ],
      },
      { path: 'workbench', loadComponent: () => import('./features/workbench/workbench.component').then(m => m.WorkbenchComponent) },
      { path: 'workbench/value', loadComponent: () => import('./features/workbench/value.component').then(m => m.ValueComponent) },
      { path: 'workbench/:undertakingId', loadComponent: () => import('./features/workbench/undertaking.component').then(m => m.UndertakingComponent) },
      {
        path: 'records',
        loadComponent: () => import('./features/records/records.component').then(m => m.RecordsComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'canon' },
          { path: 'canon', loadComponent: () => import('./features/records/canon.component').then(m => m.CanonComponent) },
          { path: 'annals', loadComponent: () => import('./features/records/annals.component').then(m => m.AnnalsComponent) },
          { path: 'roll', loadComponent: () => import('./features/records/roll.component').then(m => m.RollComponent) },
        ],
      },
      { path: 'reference', loadComponent: () => import('./features/reference/reference.component').then(m => m.ReferenceComponent) },

      // Legacy URLs, kept so bookmarks and older links still resolve.
      { path: 'value', pathMatch: 'full', redirectTo: 'workbench/value' },
      { path: 'ontology', pathMatch: 'full', redirectTo: 'reference' },
      { path: 'sovereignty', pathMatch: 'full', redirectTo: 'reference' },
      { path: 'intelligence', pathMatch: 'full', redirectTo: 'records/annals' },
    ],
  },
  // Benben-OS: standalone school console. Its own shell, deliberately outside
  // the workspace chrome so it can later nest into APT-LABS without rewriting.
  {
    path: 'benben-os',
    canActivate: [requireSession],
    loadChildren: () => import('./features/benben-os/benben.routes').then(m => m.BENBEN_ROUTES),
  },

  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
