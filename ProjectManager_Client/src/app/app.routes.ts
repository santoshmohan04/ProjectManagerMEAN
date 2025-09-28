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
      import('./project/components/projectslist/projectslist.component').then(
        (m) => m.ProjectslistComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./user/components/userslist/userslist.component').then(
        (m) => m.UserslistComponent
      ),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./task/components/tasklist/tasklist.component').then(
        (m) => m.TasklistComponent
      ),
  },
];
