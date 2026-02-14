import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
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
];
