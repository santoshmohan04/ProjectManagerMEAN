import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';

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
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
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
    path: 'task/:uuid/history',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/components/task-history/task-history.component').then(
        (m) => m.TaskHistoryComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'archived-projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/components/archived-projects/archived-projects.component').then(
        (m) => m.ArchivedProjectsComponent
      ),
  },
  {
    path: 'recent-activity',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/recent-activity/recent-activity.component').then(
        (m) => m.RecentActivityComponent
      ),
  },
  {
    path: 'audit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/audit/audit.component').then(
        (m) => m.AuditComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'recent',
        pathMatch: 'full',
      },
      {
        path: 'recent',
        loadComponent: () =>
          import('./features/audit/components/recent-activity/recent-activity.component').then(
            (m) => m.RecentActivityComponent
          ),
      },
      {
        path: 'entity',
        loadComponent: () =>
          import('./features/audit/components/entity-history/entity-history.component').then(
            (m) => m.EntityHistoryComponent
          ),
      },
      {
        path: 'user',
        loadComponent: () =>
          import('./features/audit/components/user-activity/user-activity.component').then(
            (m) => m.UserActivityComponent
          ),
      },
    ],
  },
];
