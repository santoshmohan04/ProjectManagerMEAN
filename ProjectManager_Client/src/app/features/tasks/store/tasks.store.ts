import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { pipe, tap, switchMap, catchError, of, debounceTime, forkJoin } from 'rxjs';
import { Task, TaskStatus } from '../models/task';
import { PaginationMeta, ApiResponse } from '../../../shared/models/shared';
import { environment } from '../../../../environments/environment';

// ============================================================================
// INTERFACES
// ============================================================================

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | string;
  priority?: number;
  project?: string;
  assignedTo?: string;
}

export interface LoadTasksParams {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: TaskFilters;
}

export interface TaskPayload {
  Title: string;
  Description: string;
  Start_Date: string;
  End_Date: string;
  Priority: number;
  Status: TaskStatus;
  Parent?: string | null;
  Project?: string | null;
  User?: string | null;
}

export interface BulkUpdatePayload {
  taskIds: string[];
  updates: Partial<TaskPayload>;
}

export interface TasksState {
  tasks: Task[];
  pagination: PaginationMeta;
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: TasksState = {
  tasks: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {},
  loading: false,
  error: null,
  selectedTask: null,
};

// ============================================================================
// TASKS SIGNAL STORE
// ============================================================================

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // Computed Signals
  withComputed((store) => ({
    // Check if there are any tasks
    hasTasks: computed(() => store.tasks().length > 0),

    // Check if filters are active
    hasActiveFilters: computed(() => {
      const filters = store.filters();
      return !!(
        filters.search ||
        filters.status ||
        filters.priority !== undefined ||
        filters.project ||
        filters.assignedTo
      );
    }),

    // Get filtered tasks (client-side filtering for UI display)
    filteredTasks: computed(() => {
      const tasks = store.tasks();
      const filters = store.filters();

      return tasks.filter((task) => {
        // Search filter (case-insensitive)
        if (filters.search) {
          const search = filters.search.toLowerCase();
          if (!task.Title?.toLowerCase().includes(search)) {
            return false;
          }
        }

        // Status filter
        if (filters.status && task.Status !== filters.status) {
          return false;
        }

        // Priority filter
        if (filters.priority !== undefined && task.Priority !== filters.priority) {
          return false;
        }

        // Project filter
        if (filters.project && task.Project?._id !== filters.project) {
          return false;
        }

        // AssignedTo filter
        if (filters.assignedTo && task.User?._id !== filters.assignedTo) {
          return false;
        }

        return true;
      });
    }),

    // Get tasks by status
    openTasks: computed(() =>
      store.tasks().filter((t) => t.Status === TaskStatus.Open)
    ),
    inProgressTasks: computed(() =>
      store.tasks().filter((t) => t.Status === TaskStatus.InProgress)
    ),
    completedTasks: computed(() =>
      store.tasks().filter((t) => t.Status === TaskStatus.Completed)
    ),
    blockedTasks: computed(() =>
      store.tasks().filter((t) => t.Status === TaskStatus.Blocked)
    ),

    // Get overdue tasks
    overdueTasks: computed(() => {
      const now = new Date();
      return store.tasks().filter((task) => {
        const endDate = new Date(task.End_Date);
        return (
          task.Status !== TaskStatus.Completed &&
          endDate < now
        );
      });
    }),

    // Get tasks by priority
    highPriorityTasks: computed(() =>
      store.tasks().filter((t) => t.Priority >= 8)
    ),
    mediumPriorityTasks: computed(() =>
      store.tasks().filter((t) => t.Priority >= 4 && t.Priority < 8)
    ),
    lowPriorityTasks: computed(() =>
      store.tasks().filter((t) => t.Priority < 4)
    ),

    // Pagination info
    hasMorePages: computed(() =>
      store.pagination().currentPage < store.pagination().totalPages
    ),
    hasPreviousPage: computed(() => store.pagination().currentPage > 1),
  })),

  // Methods
  withMethods((store, http = inject(HttpClient)) => ({
    // ========================================================================
    // LOAD TASKS (with pagination and filters)
    // ========================================================================
    loadTasks: rxMethod<LoadTasksParams>(
      pipe(
        debounceTime(300), // Debounce search input
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((params) => {
          const { page = 1, limit = 10, sort, filters = {} } = params;

          // Build query parameters
          let httpParams = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

          if (sort) {
            httpParams = httpParams.set('sort', sort);
          }

          if (filters.search) {
            httpParams = httpParams.set('search', filters.search);
          }

          if (filters.status) {
            httpParams = httpParams.set('status', filters.status);
          }

          if (filters.priority !== undefined) {
            httpParams = httpParams.set('priority', filters.priority.toString());
          }

          if (filters.project) {
            httpParams = httpParams.set('project', filters.project);
          }

          if (filters.assignedTo) {
            httpParams = httpParams.set('assignedTo', filters.assignedTo);
          }

          return http
            .get<ApiResponse<{ data: Task[]; meta: any }>>(
              `${environment.apiBaseUri}${environment.endpoint_task_get}`,
              { params: httpParams }
            )
            .pipe(
              tap((response: ApiResponse<{ data: Task[]; meta: any }>) => {
                const result = response.data;
                const tasks = Array.isArray(result) ? result : result.data || [];
                const meta = result.meta || {
                  page: page,
                  limit: limit,
                  total: tasks.length,
                  totalPages: Math.ceil(tasks.length / limit),
                };

                patchState(store, {
                  tasks,
                  pagination: {
                    currentPage: meta.page || page,
                    totalPages: meta.totalPages || 1,
                    totalItems: meta.total || tasks.length,
                    itemsPerPage: meta.limit || limit,
                  },
                  filters,
                  loading: false,
                  error: null,
                });
              }),
              catchError((error: any) => {
                patchState(store, {
                  loading: false,
                  error: error.error?.message || 'Failed to load tasks',
                });
                return of(null);
              })
            );
        })
      )
    ),

    // ========================================================================
    // LOAD SINGLE TASK
    // ========================================================================
    loadTask: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((taskId) =>
          http
            .get<ApiResponse<Task>>(
              `${environment.apiBaseUri}${environment.endpoint_task_get}/${taskId}`
            )
            .pipe(
              tap((response: ApiResponse<Task>) => {
                patchState(store, {
                  selectedTask: response.data,
                  loading: false,
                  error: null,
                });
              }),
              catchError((error: any) => {
                patchState(store, {
                  loading: false,
                  error: error.error?.message || 'Failed to load task',
                });
                return of(null);
              })
            )
        )
      )
    ),

    // ========================================================================
    // CREATE TASK
    // ========================================================================
    createTask: rxMethod<TaskPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) =>
          http
            .post<ApiResponse<Task>>(
              `${environment.apiBaseUri}${environment.endpoint_task_add}`,
              payload
            )
            .pipe(
              tap((response: ApiResponse<Task>) => {
                const newTask = response.data;

                // Add to the beginning of the tasks array
                patchState(store, (state) => ({
                  tasks: [newTask, ...state.tasks],
                  pagination: {
                    ...state.pagination,
                    totalItems: state.pagination.totalItems + 1,
                  },
                  loading: false,
                  error: null,
                }));
              }),
              catchError((error: any) => {
                patchState(store, {
                  loading: false,
                  error: error.error?.message || 'Failed to create task',
                });
                return of(null);
              })
            )
        )
      )
    ),

    // ========================================================================
    // UPDATE TASK
    // ========================================================================
    updateTask: rxMethod<{ uuid: string; payload: Partial<TaskPayload> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ uuid, payload }) =>
          http
            .put<ApiResponse<Task>>(
              `${environment.apiBaseUri}${environment.endpoint_task_edit}/${uuid}`,
              payload
            )
            .pipe(
              tap((response: ApiResponse<Task>) => {
                const updatedTask = response.data;

                // Update the task in the array
                patchState(store, (state) => ({
                  tasks: state.tasks.map((t) =>
                    t._id === uuid ? updatedTask : t
                  ),
                  selectedTask:
                    state.selectedTask?._id === uuid
                      ? updatedTask
                      : state.selectedTask,
                  loading: false,
                  error: null,
                }));
              }),
              catchError((error: any) => {
                patchState(store, {
                  loading: false,
                  error: error.error?.message || 'Failed to update task',
                });
                return of(null);
              })
            )
        )
      )
    ),

    // ========================================================================
    // DELETE TASK
    // ========================================================================
    deleteTask: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((uuid) =>
          http
            .delete<ApiResponse<Task>>(
              `${environment.apiBaseUri}${environment.endpoint_task_delete}/${uuid}`
            )
            .pipe(
              tap(() => {
                // Remove from tasks array
                patchState(store, (state) => ({
                  tasks: state.tasks.filter((t) => t._id !== uuid),
                  pagination: {
                    ...state.pagination,
                    totalItems: Math.max(0, state.pagination.totalItems - 1),
                  },
                  selectedTask:
                    state.selectedTask?._id === uuid
                      ? null
                      : state.selectedTask,
                  loading: false,
                  error: null,
                }));
              }),
              catchError((error: any) => {
                patchState(store, {
                  loading: false,
                  error: error.error?.message || 'Failed to delete task',
                });
                return of(null);
              })
            )
        )
      )
    ),

    // ========================================================================
    // BULK UPDATE TASKS
    // ========================================================================
    bulkUpdateTasks: rxMethod<BulkUpdatePayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ taskIds, updates }) => {
          // Create an array of update requests
          const updateRequests = taskIds.map((taskId) =>
            http.put<ApiResponse<Task>>(
              `${environment.apiBaseUri}${environment.endpoint_task_edit}/${taskId}`,
              updates
            )
          );

          // Execute all updates in parallel
          return forkJoin(updateRequests).pipe(
            tap((responses) => {
              const updatedTasks = responses.map((res) => res.data);

              // Update all affected tasks in the array
              patchState(store, (state) => ({
                tasks: state.tasks.map((task) => {
                  const updated = updatedTasks.find((ut) => ut._id === task._id);
                  return updated || task;
                }),
                loading: false,
                error: null,
              }));
            }),
            catchError((error: any) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Failed to bulk update tasks',
              });
              return of(null);
            })
          );
        })
      )
    ),

    // ========================================================================
    // BULK DELETE TASKS
    // ========================================================================
    bulkDeleteTasks: rxMethod<string[]>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((taskIds) => {
          // Create an array of delete requests
          const deleteRequests = taskIds.map((taskId) =>
            http.delete<ApiResponse<Task>>(
              `${environment.apiBaseUri}${environment.endpoint_task_delete}/${taskId}`
            )
          );

          // Execute all deletes in parallel
          return forkJoin(deleteRequests).pipe(
            tap(() => {
              // Remove all deleted tasks from array
              patchState(store, (state) => ({
                tasks: state.tasks.filter((t) => !taskIds.includes(t._id)),
                pagination: {
                  ...state.pagination,
                  totalItems: Math.max(
                    0,
                    state.pagination.totalItems - taskIds.length
                  ),
                },
                loading: false,
                error: null,
              }));
            }),
            catchError((error: any) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Failed to bulk delete tasks',
              });
              return of(null);
            })
          );
        })
      )
    ),

    // ========================================================================
    // FILTER MANAGEMENT
    // ========================================================================
    setFilters(filters: TaskFilters): void {
      patchState(store, { filters });

      // Automatically reload tasks with new filters
      const currentPagination = store.pagination();
      this.loadTasks({
        page: 1, // Reset to first page when filters change
        limit: currentPagination.itemsPerPage,
        filters,
      });
    },

    clearFilters(): void {
      patchState(store, { filters: {} });

      // Reload tasks without filters
      const currentPagination = store.pagination();
      this.loadTasks({
        page: 1,
        limit: currentPagination.itemsPerPage,
        filters: {},
      });
    },

    // ========================================================================
    // PAGINATION
    // ========================================================================
    goToPage(page: number): void {
      const currentPagination = store.pagination();
      if (page < 1 || page > currentPagination.totalPages) {
        return;
      }

      this.loadTasks({
        page,
        limit: currentPagination.itemsPerPage,
        filters: store.filters(),
      });
    },

    nextPage(): void {
      const currentPagination = store.pagination();
      if (currentPagination.currentPage < currentPagination.totalPages) {
        this.goToPage(currentPagination.currentPage + 1);
      }
    },

    previousPage(): void {
      const currentPagination = store.pagination();
      if (currentPagination.currentPage > 1) {
        this.goToPage(currentPagination.currentPage - 1);
      }
    },

    setItemsPerPage(itemsPerPage: number): void {
      this.loadTasks({
        page: 1,
        limit: itemsPerPage,
        filters: store.filters(),
      });
    },

    // ========================================================================
    // UI STATE MANAGEMENT
    // ========================================================================
    clearError(): void {
      patchState(store, { error: null });
    },

    setSelectedTask(task: Task | null): void {
      patchState(store, { selectedTask: task });
    },

    // ========================================================================
    // UTILITY
    // ========================================================================
    refreshTasks(): void {
      const currentPagination = store.pagination();
      this.loadTasks({
        page: currentPagination.currentPage,
        limit: currentPagination.itemsPerPage,
        filters: store.filters(),
      });
    },

    // ========================================================================
    // STATUS TRANSITIONS
    // ========================================================================
    markTaskAsInProgress(taskId: string): void {
      this.updateTask({
        uuid: taskId,
        payload: { Status: TaskStatus.InProgress },
      });
    },

    markTaskAsCompleted(taskId: string): void {
      this.updateTask({
        uuid: taskId,
        payload: { Status: TaskStatus.Completed },
      });
    },

    markTaskAsBlocked(taskId: string): void {
      this.updateTask({
        uuid: taskId,
        payload: { Status: TaskStatus.Blocked },
      });
    },

    reopenTask(taskId: string): void {
      this.updateTask({
        uuid: taskId,
        payload: { Status: TaskStatus.Open },
      });
    },
  })),

  // Auto-load tasks on initialization
  withHooks({
    onInit(store) {
      // Load first page of tasks
      store.loadTasks({ page: 1, limit: 10 });
    },
  })
);
