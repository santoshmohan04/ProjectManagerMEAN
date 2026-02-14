import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/components/projectslist/projectslist.component').then(
        (m) => m.ProjectslistComponent
      ),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/components/userslist/userslist.component').then(
        (m) => m.UserslistComponent
      ),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/components/tasklist/tasklist.component').then(
        (m) => m.TasklistComponent
      ),
  },
  {
    path: 'my-tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/components/tasklist/tasklist.component').then(
        (m) => m.TasklistComponent
      ),
  },
  {
    path: 'audit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/audit/audit.component').then(
        (m) => m.AuditComponent
      ),
  },
];
