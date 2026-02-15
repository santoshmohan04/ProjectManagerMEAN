import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  // Auth routes (login/register) - use AuthLayoutComponent
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
    ],
  },
  // Authenticated routes - use MainLayoutComponent
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/components/projectslist/projectslist.component').then(
            (m) => m.ProjectslistComponent
          ),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/users/components/userslist/userslist.component').then(
            (m) => m.UserslistComponent
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/components/tasklist/tasklist.component').then(
            (m) => m.TasklistComponent
          ),
      },
      {
        path: 'my-tasks',
        loadComponent: () =>
          import('./features/tasks/components/tasklist/tasklist.component').then(
            (m) => m.TasklistComponent
          ),
      },
      {
        path: 'task/:uuid/history',
        loadComponent: () =>
          import('./features/tasks/components/task-history/task-history.component').then(
            (m) => m.TaskHistoryComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'archived-projects',
        loadComponent: () =>
          import('./features/projects/components/archived-projects/archived-projects.component').then(
            (m) => m.ArchivedProjectsComponent
          ),
      },
      {
        path: 'recent-activity',
        loadComponent: () =>
          import('./features/recent-activity/recent-activity.component').then(
            (m) => m.RecentActivityComponent
          ),
      },
      {
        path: 'audit',
        canActivate: [roleGuard],
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
    ],
  },
];
