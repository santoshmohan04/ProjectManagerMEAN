import { createReducer, on } from '@ngrx/store';
import {
  ParentTasksDataActions,
  ProjectDataActions,
  TasksDataActions,
  UsersDataActions,
} from './actions';
import { Project } from '../project/models/project';
import { User } from '../user/models/user';
import { Task } from '../task/models/task';

export interface ProjectState {
  projects: Project[];
  users: User[];
  tasks: Task[];
  parentTasks: Task[];
  error: any;
}

export const initialState: ProjectState = {
  projects: [],
  users: [],
  tasks: [],
  parentTasks: [],
  error: null,
};

export const projectReducer = createReducer(
  initialState,
  on(ProjectDataActions.loadProjectsSuccess, (state, { data }) => ({
    ...state,
    projects: data.Data,
    error: null,
  })),
  on(ProjectDataActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ProjectDataActions.addProjectSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(ProjectDataActions.addProjectFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ProjectDataActions.updateProjectSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(ProjectDataActions.updateProjectFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ProjectDataActions.deleteProjectSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(ProjectDataActions.deleteProjectFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ProjectDataActions.getProjectSuccess, (state, { data }) => ({
    ...state,
    projects: state.projects.map((project) =>
      project._id === data.Data._id ? data.Data : project
    ),
    error: null,
  })),
  on(ProjectDataActions.getProjectFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ProjectDataActions.clearProjects, () => ({
    ...initialState,
  })),
  on(UsersDataActions.loadUsersSuccess, (state, { data }) => ({
    ...state,
    users: data.Data,
  })),
  on(UsersDataActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(UsersDataActions.addUserSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(UsersDataActions.addUserFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(UsersDataActions.updateUserSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(UsersDataActions.updateUserFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(UsersDataActions.deleteUserSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(UsersDataActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(UsersDataActions.getUserSuccess, (state, { data }) => ({
    ...state,
    users: state.users.map((user) =>
      user._id === data.Data._id ? data.Data : user
    ),
    error: null,
  })),
  on(UsersDataActions.getUserFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(UsersDataActions.clearUsers, () => ({
    ...initialState,
  })),
  on(TasksDataActions.loadTasksSuccess, (state, { data }) => ({
    ...state,
    tasks: data.Data,
    error: null,
  })),
  on(TasksDataActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(TasksDataActions.clearTasks, () => ({
    ...initialState,
  })),
  on(TasksDataActions.addTaskSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(TasksDataActions.addTaskFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(TasksDataActions.updateTaskSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(TasksDataActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(TasksDataActions.endTaskSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(TasksDataActions.endTaskFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(TasksDataActions.getTaskSuccess, (state, { data }) => ({
    ...state,
    tasks: state.tasks.map((task) =>
      task._id === data.Data._id ? data.Data : task
    ),
    error: null,
  })),
  on(TasksDataActions.getTaskFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(TasksDataActions.clearTasks, () => ({
    ...initialState,
  })),
  on(ParentTasksDataActions.loadParentTasksSuccess, (state, { data }) => ({
    ...state,
    parentTasks: data.Data,
    error: null,
  })),
  on(ParentTasksDataActions.loadParentTasksFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ParentTasksDataActions.addParentTaskSuccess, (state, { data }) => ({
    ...state,
    parentTasks: [...state.parentTasks, data.Data],
    error: null,
  })),
  on(ParentTasksDataActions.addParentTaskFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ParentTasksDataActions.getParentTaskSuccess, (state, { data }) => ({
    ...state,
    error: null,
  })),
  on(ParentTasksDataActions.getParentTaskFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ParentTasksDataActions.clearParentTasks, () => ({
    ...initialState,
  }))
);
