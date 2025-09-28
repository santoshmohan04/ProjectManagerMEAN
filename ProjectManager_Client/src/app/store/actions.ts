import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiResponse } from '../shared/models/shared';
import { Project, ProjectPayload } from '../project/models/project';
import { HttpErrorResponse } from '@angular/common/http';
import { User, UserPayload } from '../user/models/user';
import { ParentTask, Task } from '../task/models/task';

export const ProjectDataActions = createActionGroup({
  source: 'Project Data',
  events: {
    'Load Projects': props<{ searchKey?: string; sortKey?: string }>(),
    'Load Projects Success': props<{ data: ApiResponse<Project[]> }>(),
    'Load Projects Failure': props<{ error: HttpErrorResponse }>(),
    'Add Project': props<{ newProject: ProjectPayload }>(),
    'Add Project Success': props<{
      data: ApiResponse<Project>;
      searchKey: string;
      sortKey: string;
    }>(),
    'Add Project Failure': props<{ error: HttpErrorResponse }>(),
    'Update Project': props<{ updateProject: ProjectPayload; id: string }>(),
    'Update Project Success': props<{
      data: ApiResponse<Project>;
      searchKey: string;
      sortKey: string;
    }>(),
    'Update Project Failure': props<{ error: HttpErrorResponse }>(),
    'Delete Project': props<{ projectId: string }>(),
    'Delete Project Success': props<{
      data: ApiResponse<Project>;
      searchKey: string;
      sortKey: string;
    }>(),
    'Delete Project Failure': props<{ error: HttpErrorResponse }>(),
    'Get Project': props<{ projectId: string }>(),
    'Get Project Success': props<{ data: ApiResponse<Project> }>(),
    'Get Project Failure': props<{ error: HttpErrorResponse }>(),
    'Clear Projects': emptyProps(),
  },
});

export const UsersDataActions = createActionGroup({
  source: 'Users Data',
  events: {
    'Load Users': props<{ searchKey?: string; sortKey?: string }>(),
    'Load Users Success': props<{ data: ApiResponse<User[]> }>(),
    'Load Users Failure': props<{ error: HttpErrorResponse }>(),
    'Add User': props<{ newUser: UserPayload }>(),
    'Add User Success': props<{
      data: ApiResponse<User>;
      searchKey: string;
      sortKey: string;
    }>(),
    'Add User Failure': props<{ error: HttpErrorResponse }>(),
    'Update User': props<{ updateUser: UserPayload; id: string }>(),
    'Update User Success': props<{
      data: ApiResponse<User>;
      searchKey: string;
      sortKey: string;
    }>(),
    'Update User Failure': props<{ error: HttpErrorResponse }>(),
    'Delete User': props<{ userId: string }>(),
    'Delete User Success': props<{
      data: ApiResponse<User>;
      searchKey: string;
      sortKey: string;
    }>(),
    'Delete User Failure': props<{ error: HttpErrorResponse }>(),
    'Get User': props<{ userId: string }>(),
    'Get User Success': props<{ data: ApiResponse<User> }>(),
    'Get User Failure': props<{ error: HttpErrorResponse }>(),
    'Clear Users': emptyProps(),
  },
});

export const TasksDataActions = createActionGroup({
  source: 'Tasks Data',
  events: {
    'Load Tasks': props<{ projectId?: string; sortKey?: string }>(),
    'Load Tasks Success': props<{ data: ApiResponse<Task[]> }>(),
    'Load Tasks Failure': props<{ error: HttpErrorResponse }>(),
    'Add Task': props<{ newTask: Task }>(),
    'Add Task Success': props<{ data: ApiResponse<Task>; sortKey: string }>(),
    'Add Task Failure': props<{ error: HttpErrorResponse }>(),
    'Update Task': props<{ updateTask: Task }>(),
    'Update Task Success': props<{
      data: ApiResponse<Task>;
      sortKey: string;
    }>(),
    'Update Task Failure': props<{ error: HttpErrorResponse }>(),
    'End Task': props<{ taskId: string }>(),
    'End Task Success': props<{ data: ApiResponse<Task>; sortKey: string }>(),
    'End Task Failure': props<{ error: HttpErrorResponse }>(),
    'Get Task': props<{ taskId: string }>(),
    'Get Task Success': props<{ data: ApiResponse<Task> }>(),
    'Get Task Failure': props<{ error: HttpErrorResponse }>(),
    'Clear Tasks': emptyProps(),
  },
});

export const ParentTasksDataActions = createActionGroup({
  source: 'Parent Tasks Data',
  events: {
    'Load Parent Tasks': props<{ searchKey?: string }>(),
    'Load Parent Tasks Success': props<{ data: ApiResponse<ParentTask[]> }>(),
    'Load Parent Tasks Failure': props<{ error: HttpErrorResponse }>(),
    'Add Parent Task': props<{ newParentTask: ParentTask }>(),
    'Add Parent Task Success': props<{ data: ApiResponse<ParentTask> }>(),
    'Add Parent Task Failure': props<{ error: HttpErrorResponse }>(),
    'Get Parent Task': props<{ taskId: string }>(),
    'Get Parent Task Success': props<{ data: ApiResponse<ParentTask> }>(),
    'Get Parent Task Failure': props<{ error: HttpErrorResponse }>(),
    'Clear Parent Tasks': emptyProps(),
  },
});
