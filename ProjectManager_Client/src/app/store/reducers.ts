import { createReducer, on } from '@ngrx/store';
import { ProjectDataActions, UsersDataActions } from './actions';
import { Project } from '../project/models/project';
import { User } from '../user/models/user';

export interface ProjectState {
  projects: Project[];
  users: User[];
  error: any;
}

export const initialState: ProjectState = {
  projects: [],
  users: [],
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
    projects: [...state.projects, data.Data],
    error: null,
  })),
  on(ProjectDataActions.addProjectFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ProjectDataActions.updateProjectSuccess, (state, { data }) => ({
    ...state,
    projects: state.projects.map((project) =>
      project._id === data.Data._id ? data.Data : project
    ),
    error: null,
  })),
  on(ProjectDataActions.updateProjectFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ProjectDataActions.deleteProjectSuccess, (state, { data }) => ({
    ...state,
    projects: state.projects.filter((project) => project._id !== data.Data._id),
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
    users: [...state.users, data.Data],
  })),
  on(UsersDataActions.addUserFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(UsersDataActions.updateUserSuccess, (state, { data }) => ({
    ...state,
    users: state.users.map((user) =>
      user._id === data.Data._id ? data.Data : user
    ),
    error: null,
  })),
  on(UsersDataActions.updateUserFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(UsersDataActions.deleteUserSuccess, (state, { data }) => ({
    ...state,
    users: state.users.filter((user) => user._id !== data.Data._id),
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
  }))
);
