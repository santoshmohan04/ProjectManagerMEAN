import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiResponse } from '../shared/models/shared';
import { Project, ProjectPayload } from '../project/models/project';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../user/models/user';

export const ProjectDataActions = createActionGroup({
  source: 'Project Data',
  events: {
    'Load Projects': props<{ searchKey?: string; sortKey?: string }>(),
    'Load Projects Success': props<{ data: ApiResponse<Project[]> }>(),
    'Load Projects Failure': props<{ error: HttpErrorResponse }>(),
    'Add Project': props<{ newProject: ProjectPayload }>(),
    'Add Project Success': props<{ data: ApiResponse<Project> }>(),
    'Add Project Failure': props<{ error: HttpErrorResponse }>(),
    'Update Project': props<{ updateProject: ProjectPayload; id: string }>(),
    'Update Project Success': props<{ data: ApiResponse<Project> }>(),
    'Update Project Failure': props<{ error: HttpErrorResponse }>(),
    'Delete Project': props<{ projectId: string }>(),
    'Delete Project Success': props<{ data: ApiResponse<Project> }>(),
    'Delete Project Failure': props<{ error: HttpErrorResponse }>(),
    'Get Project': props<{ projectId: string }>(),
    'Get Project Success': props<{ data: ApiResponse<Project> }>(),
    'Get Project Failure': props<{ error: HttpErrorResponse }>(),
    'Clear Projects': emptyProps()
  },
});

export const UsersDataActions = createActionGroup({
  source: 'Users Data',
  events: {
    'Load Users': props<{ searchKey?: string; sortKey?: string }>(),
    'Load Users Success': props<{ data: ApiResponse<User[]> }>(),
    'Load Users Failure': props<{ error: HttpErrorResponse }>(),
    'Add User': props<{ newUser: User }>(),
    'Add User Success': props<{ data: ApiResponse<User> }>(),
    'Add User Failure': props<{ error: HttpErrorResponse }>(),
    'Update User': props<{ updateUser: User }>(),
    'Update User Success': props<{ data: ApiResponse<User> }>(),
    'Update User Failure': props<{ error: HttpErrorResponse }>(),
    'Delete User': props<{ userId: string }>(),
    'Delete User Success': props<{ data: ApiResponse<User> }>(),
    'Delete User Failure': props<{ error: HttpErrorResponse }>(),
    'Get User': props<{ userId: string }>(),
    'Get User Success': props<{ data: ApiResponse<User> }>(),
    'Get User Failure': props<{ error: HttpErrorResponse }>(),
    'Clear Users': emptyProps()
  }
});
