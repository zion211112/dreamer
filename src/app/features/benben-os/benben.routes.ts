import type { Routes } from '@angular/router';

export const BENBEN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./benben-shell.component').then((m) => m.BenbenShellComponent),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./overview.component').then((m) => m.BenbenOverviewComponent) },
      { path: 'learners', loadComponent: () => import('./learners.component').then((m) => m.BenbenLearnersComponent) },
      { path: 'attendance', loadComponent: () => import('./attendance.component').then((m) => m.BenbenAttendanceComponent) },
      { path: 'assessments', loadComponent: () => import('./assessments.component').then((m) => m.BenbenAssessmentsComponent) },
      { path: 'reports', loadComponent: () => import('./reports.component').then((m) => m.BenbenReportsComponent) },
      { path: 'fees', loadComponent: () => import('./fees.component').then((m) => m.BenbenFeesComponent) },
      { path: 'setup', loadComponent: () => import('./setup.component').then((m) => m.BenbenSetupComponent) },
      { path: 'staff', loadComponent: () => import('./staff.component').then((m) => m.BenbenStaffComponent) },
      { path: '**', redirectTo: '' },
    ],
  },
];
