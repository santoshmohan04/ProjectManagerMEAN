import { createFeatureSelector, createSelector} from '@ngrx/store';
import { ProjectState } from './reducers';

export const selectProjectState = createFeatureSelector<ProjectState>('projects');

export const selectAllProjects = createSelector(
  selectProjectState,
  (state: ProjectState) => state.projects
);

export const selectProjectById = (projectId: string) => createSelector(
  selectAllProjects,
  (projects) => projects.find((project) => project._id === projectId)
);

export const selectProjectError = createSelector(
  selectProjectState,
  (state: ProjectState) => state.error
);

export const selectAllUsers = createSelector(
  selectProjectState,
  (state: ProjectState) => state.users
);

export const selectUserById = (userId: string) => createSelector(
  selectAllUsers,
  (users) => users.find((user) => user._id === userId)
);

export const selectUserError = createSelector(
  selectProjectState,
  (state: ProjectState) => state.error
);

export const selectAllTasks = createSelector(
  selectProjectState,
  (state: ProjectState) => state.tasks
);

export const selectTaskById = (taskId: string) => createSelector(
  selectAllTasks,
  (tasks) => tasks.find((task) => task._id === taskId)
);

export const selectTaskError = createSelector(
  selectProjectState,
  (state: ProjectState) => state.error
);

export const selectAllParentTasks = createSelector(
  selectProjectState,
  (state: ProjectState) => state.parentTasks
);

export const selectParentTaskById = (parentTaskId: string) => createSelector(
  selectAllParentTasks,
  (parentTasks) => parentTasks.find((parentTask) => parentTask._id === parentTaskId)
);

export const selectParentTaskError = createSelector(
  selectProjectState,
  (state: ProjectState) => state.error
);