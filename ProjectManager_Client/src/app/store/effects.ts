import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProjectService } from '../project/services/project.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { ParentTasksDataActions, ProjectDataActions, TasksDataActions, UsersDataActions } from './actions';
import { AlertService } from '../shared/services/alert.service';
import { UserService } from '../user/services/user.service';
import { TaskService } from '../task/services/task.service';
import { ParentTaskService } from '../task/services/parent-task.service';

@Injectable()
export class ProjectManagementEffects {
  private actions$ = inject(Actions);
  private projectservice = inject(ProjectService);
  private alertService = inject(AlertService);
  private userService = inject(UserService);
  private taskService = inject(TaskService);
  private parentTaskService = inject(ParentTaskService);

// Effect to load projects
  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectDataActions.loadProjects),
      switchMap(action =>
        this.projectservice.getProjects(action.searchKey, action.sortKey).pipe(
          map(data => ProjectDataActions.loadProjectsSuccess({ data })),
          catchError(error => {
            this.alertService.error(
              'Error occurred while fetching projects',
              'Error',
              3000
            );
            return of(ProjectDataActions.loadProjectsFailure({ error }));
          })
        )
      )
    )
  );

  addProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectDataActions.addProject),
      switchMap(action =>
        this.projectservice.addProject(action.newProject).pipe(
          map(data => {
            if (data.Success) {
              this.alertService.success(
                'Project added successfully!',
                'Success',
                3000
              );
            }
            return ProjectDataActions.addProjectSuccess({ data });
          }),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(ProjectDataActions.addProjectFailure({ error }));
          })
        )
      )
    )
  );

  updateProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectDataActions.updateProject),
      switchMap(action =>
        this.projectservice.editProject(action.updateProject, action.id).pipe(
          map(data => { 
            if(data.Success){
              this.alertService.success(
                'Project updated successfully!',
                'Success',
                3000
              );
            }
            return ProjectDataActions.updateProjectSuccess({ data });
          }),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(ProjectDataActions.updateProjectFailure({ error }));
          })
        )
      )
    )
  );

  deleteProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectDataActions.deleteProject),
      switchMap(action =>
        this.projectservice.deleteProject(action.projectId).pipe(
          map(data =>{ 
            if(data.Success){
              this.alertService.success(
                'Project suspended successfully!',
                'Success',
                3000
              );
            }
            return ProjectDataActions.deleteProjectSuccess({ data })
          }),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(ProjectDataActions.deleteProjectFailure({ error }))
          })
        )
      )
    )
  );

  getProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectDataActions.getProject),
      switchMap(action =>
        this.projectservice.getProject(action.projectId).pipe(
          map(data => ProjectDataActions.getProjectSuccess({ data })),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(ProjectDataActions.getProjectFailure({ error }));
          })
        )
      )
    )
  );

  // Effect to load users
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersDataActions.loadUsers),
      switchMap(action =>
        this.userService.getUsersList(action.searchKey, action.sortKey).pipe(
          map(data => UsersDataActions.loadUsersSuccess({ data })),
          catchError(error => {
            this.alertService.error(
              'Error occurred while fetching users',
              'Error',
              3000
            );
            return of(UsersDataActions.loadUsersFailure({ error }));
          })
        )
      )
    )
  );

  addUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersDataActions.addUser),
      switchMap(action =>
        this.userService.addUser(action.newUser).pipe(
          map(data => UsersDataActions.addUserSuccess({ data })),
          catchError(error => of(UsersDataActions.addUserFailure({ error })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersDataActions.updateUser),
      switchMap(action =>
        this.userService.editUser(action.updateUser).pipe(
          map(data => UsersDataActions.updateUserSuccess({ data })),
          catchError(error => of(UsersDataActions.updateUserFailure({ error })))
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersDataActions.deleteUser),
      switchMap(action =>
        this.userService.deleteUser(action.userId).pipe(
          map(data => UsersDataActions.deleteUserSuccess({ data })),
          catchError(error => of(UsersDataActions.deleteUserFailure({ error })))
        )
      )
    )
  );

  getUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersDataActions.getUser),
      switchMap(action =>
        this.userService.getUser(action.userId).pipe(
          map(data => UsersDataActions.getUserSuccess({ data })),
          catchError(error => of(UsersDataActions.getUserFailure({ error })))
        )
      )
    )
  );

  //Effects for Tasks
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksDataActions.loadTasks),
      switchMap(action =>
        this.taskService
          .getTasksList(action.projectId, action.sortKey)
          .pipe(
            map(data => TasksDataActions.loadTasksSuccess({ data })),
            catchError(error => {
              this.alertService.error(error.Message, 'Error', 3000);
              return of(TasksDataActions.loadTasksFailure({ error }));
            })
          )
      )
    )
  );

  addTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksDataActions.addTask),
      switchMap(action =>
        this.taskService.addTask(action.newTask).pipe(
          map(data => TasksDataActions.addTaskSuccess({ data })),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(TasksDataActions.addTaskFailure({ error }));
          })
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksDataActions.updateTask),
      switchMap(action =>
        this.taskService.editTask(action.updateTask).pipe(
          map(data => TasksDataActions.updateTaskSuccess({ data })),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(TasksDataActions.updateTaskFailure({ error }));
          })
        )
      )
    )
  );

  endTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksDataActions.endTask),
      switchMap(action =>
        this.taskService.endTask(action.taskId).pipe(
          map(data => TasksDataActions.endTaskSuccess({ data })),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(TasksDataActions.endTaskFailure({ error }));
          })
        )
      )
    )
  );

  getTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksDataActions.getTask),
      switchMap(action =>
        this.taskService.getTask(action.taskId).pipe(
          map(data => TasksDataActions.getTaskSuccess({ data })),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(TasksDataActions.getTaskFailure({ error }));
          })
        )
      )
    )
  );

  // Effects for Parent Tasks
  loadParentTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ParentTasksDataActions.loadParentTasks),
      switchMap(action =>
        this.parentTaskService.getParentTaskList(action.searchKey).pipe(
          map(data => ParentTasksDataActions.loadParentTasksSuccess({ data })),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(ParentTasksDataActions.loadParentTasksFailure({ error }));
          })
        )
      )
    )
  );

  addParentTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ParentTasksDataActions.addParentTask),
      switchMap(action =>
        this.parentTaskService.addParentTask(action.newParentTask).pipe(
          map(data => ParentTasksDataActions.addParentTaskSuccess({ data })),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(ParentTasksDataActions.addParentTaskFailure({ error }));
          })
        )
      )
    )
  );

  getParentTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ParentTasksDataActions.getParentTask),
      switchMap(action =>
        this.parentTaskService.getParentTask(action.taskId).pipe(
          map(data => ParentTasksDataActions.getParentTaskSuccess({ data })),
          catchError(error => {
            this.alertService.error(error.Message, 'Error', 3000);
            return of(ParentTasksDataActions.getParentTaskFailure({ error }));
          })
        )
      )
    )
  );

}
