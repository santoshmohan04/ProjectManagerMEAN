import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { Project } from '../features/projects/models/project';
import { User } from '../features/users/models/user';
import { Task } from '../features/tasks/models/task';

export interface AppState {
  projects: Project[];
  users: User[];
  tasks: Task[];
  parentTasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  projects: [],
  users: [],
  tasks: [],
  parentTasks: [],
  loading: false,
  error: null,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
    setProjects(projects: Project[]) {
      patchState(store, { projects, error: null });
    },
    setUsers(users: User[]) {
      patchState(store, { users, error: null });
    },
    setTasks(tasks: Task[]) {
      patchState(store, { tasks, error: null });
    },
    setParentTasks(parentTasks: Task[]) {
      patchState(store, { parentTasks, error: null });
    },
    addProject(project: Project) {
      patchState(store, (state) => ({
        projects: [...state.projects, project]
      }));
    },
    updateProject(updatedProject: Project) {
      patchState(store, (state) => ({
        projects: state.projects.map(p =>
          p._id === updatedProject._id ? updatedProject : p
        )
      }));
    },
    deleteProject(projectId: string) {
      patchState(store, (state) => ({
        projects: state.projects.filter(p => p._id !== projectId)
      }));
    },
    addUser(user: User) {
      patchState(store, (state) => ({
        users: [...state.users, user]
      }));
    },
    updateUser(updatedUser: User) {
      patchState(store, (state) => ({
        users: state.users.map(u =>
          u._id === updatedUser._id ? updatedUser : u
        )
      }));
    },
    deleteUser(userId: string) {
      patchState(store, (state) => ({
        users: state.users.filter(u => u._id !== userId)
      }));
    },
    addTask(task: Task) {
      patchState(store, (state) => ({
        tasks: [...state.tasks, task]
      }));
    },
    updateTask(updatedTask: Task) {
      patchState(store, (state) => ({
        tasks: state.tasks.map(t =>
          t._id === updatedTask._id ? updatedTask : t
        )
      }));
    },
    deleteTask(taskId: string) {
      patchState(store, (state) => ({
        tasks: state.tasks.filter(t => t._id !== taskId)
      }));
    },
  }))
);