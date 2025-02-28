import { Routes } from '@angular/router';
import { CreateComponent as UserCreateComponent } from './user/components/create/create.component';
import { CreateComponent as ProjectComponent } from './project/components/create/create.component';
import { CreateComponent as TaskCreateComponent } from './task/components/create/create.component';
import { ViewComponent as TaskViewComponent } from './task/components/view/view.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'project/add',
    pathMatch: 'full',
  },
  {
    path: 'user',
    children: [{ path: 'add', component: UserCreateComponent }],
  },
  {
    path: 'project',
    children: [{ path: 'add', component: ProjectComponent }],
  },
  {
    path: 'task',
    children: [
      { path: 'add', component: TaskCreateComponent },
      { path: 'view', component: TaskViewComponent },
    ],
  },
];
