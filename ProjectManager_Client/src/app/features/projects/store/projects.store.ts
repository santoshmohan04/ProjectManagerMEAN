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
import { pipe, tap, switchMap, catchError, of, debounceTime } from 'rxjs';
import { Project, ProjectPayload } from '../models/project';
import { PaginationMeta, ApiResponse } from '../../../shared/models/shared';
import { environment } from '../../../../environments/environment';

// ============================================================================
// INTERFACES
// ============================================================================

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus | string;
  priority?: number;
  manager?: string;
}

export interface LoadProjectsParams {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: ProjectFilters;
}

export interface ProjectsState {
  projects: Project[];
  pagination: PaginationMeta;
  filters: ProjectFilters;
  loading: boolean;
  error: string | null;
  selectedProject: Project | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ProjectsState = {
  projects: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {},
  loading: false,
  error: null,
  selectedProject: null,
};

// ============================================================================
// PROJECTS SIGNAL STORE
// ============================================================================

export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // Computed Signals
  withComputed((store) => ({
    // Check if there are any projects
    hasProjects: computed(() => store.projects().length > 0),

    // Check if filters are active
    hasActiveFilters: computed(() => {
      const filters = store.filters();
      return !!(filters.search || filters.status || filters.priority || filters.manager);
    }),

    // Get filtered projects (client-side filtering for UI display)
    filteredProjects: computed(() => {
      const projects = store.projects();
      const filters = store.filters();

      return projects.filter(project => {
        // Search filter (case-insensitive)
        if (filters.search) {
          const search = filters.search.toLowerCase();
          if (!project.Project?.toLowerCase().includes(search)) {
            return false;
          }
        }

        // Priority filter
        if (filters.priority !== undefined && project.Priority !== filters.priority) {
          return false;
        }

        return true;
      });
    }),

    // Get projects by status
    planningProjects: computed(() => 
      store.projects().filter(p => (p as any).status === ProjectStatus.PLANNING)
    ),
    activeProjects: computed(() => 
      store.projects().filter(p => (p as any).status === ProjectStatus.ACTIVE)
    ),
    completedProjects: computed(() => 
      store.projects().filter(p => (p as any).status === ProjectStatus.COMPLETED)
    ),

    // Pagination info
    hasMorePages: computed(() => 
      store.pagination().currentPage < store.pagination().totalPages
    ),
    hasPreviousPage: computed(() => 
      store.pagination().currentPage > 1
    ),
  })),

  // Methods
  withMethods((store, http = inject(HttpClient)) => ({

    // ========================================================================
    // LOAD PROJECTS (with pagination and filters)
    // ========================================================================
    loadProjects: rxMethod<LoadProjectsParams>(
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

          if (filters.manager) {
            httpParams = httpParams.set('manager', filters.manager);
          }

          return http.get<ApiResponse<{ data: Project[]; meta: any }>>(
            `${environment.apiBaseUri}${environment.endpoint_project_get}`,
            { params: httpParams }
          ).pipe(
            tap((response: ApiResponse<{ data: Project[]; meta: any }>) => {
              const result = response.data;
              const projects = Array.isArray(result) ? result : result.data || [];
              const meta = result.meta || {
                page: page,
                limit: limit,
                total: projects.length,
                totalPages: Math.ceil(projects.length / limit),
              };

              patchState(store, {
                projects,
                pagination: {
                  currentPage: meta.page || page,
                  totalPages: meta.totalPages || 1,
                  totalItems: meta.total || projects.length,
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
                error: error.error?.message || 'Failed to load projects',
              });
              return of(null);
            })
          );
        })
      )
    ),

    // ========================================================================
    // LOAD SINGLE PROJECT
    // ========================================================================
    loadProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((projectId) =>
          http.get<ApiResponse<Project>>(
            `${environment.apiBaseUri}${environment.endpoint_project_get}/${projectId}`
          ).pipe(
            tap((response: ApiResponse<Project>) => {
              patchState(store, {
                selectedProject: response.data,
                loading: false,
                error: null,
              });
            }),
            catchError((error: any) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Failed to load project',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // ========================================================================
    // CREATE PROJECT
    // ========================================================================
    createProject: rxMethod<ProjectPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) =>
          http.post<ApiResponse<Project>>(
            `${environment.apiBaseUri}${environment.endpoint_project_add}`,
            payload
          ).pipe(
            tap((response: ApiResponse<Project>) => {
              const newProject = response.data;

              // Add to the beginning of the projects array
              patchState(store, (state) => ({
                projects: [newProject, ...state.projects],
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
                error: error.error?.message || 'Failed to create project',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // ========================================================================
    // UPDATE PROJECT
    // ========================================================================
    updateProject: rxMethod<{ uuid: string; payload: Partial<ProjectPayload> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ uuid, payload }) =>
          http.put<ApiResponse<Project>>(
            `${environment.apiBaseUri}${environment.endpoint_project_edit}/${uuid}`,
            payload
          ).pipe(
            tap((response: ApiResponse<Project>) => {
              const updatedProject = response.data;

              // Update the project in the array
              patchState(store, (state) => ({
                projects: state.projects.map(p =>
                  p._id === uuid ? updatedProject : p
                ),
                selectedProject: state.selectedProject?._id === uuid 
                  ? updatedProject 
                  : state.selectedProject,
                loading: false,
                error: null,
              }));
            }),
            catchError((error: any) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Failed to update project',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // ========================================================================
    // DELETE PROJECT
    // ========================================================================
    deleteProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((uuid) =>
          http.delete<ApiResponse<Project>>(
            `${environment.apiBaseUri}${environment.endpoint_project_delete}/${uuid}`
          ).pipe(
            tap(() => {
              // Remove from projects array
              patchState(store, (state) => ({
                projects: state.projects.filter(p => p._id !== uuid),
                pagination: {
                  ...state.pagination,
                  totalItems: Math.max(0, state.pagination.totalItems - 1),
                },
                selectedProject: state.selectedProject?._id === uuid 
                  ? null 
                  : state.selectedProject,
                loading: false,
                error: null,
              }));
            }),
            catchError((error: any) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Failed to delete project',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // ========================================================================
    // ARCHIVE PROJECT (soft delete)
    // ========================================================================
    archiveProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((uuid) =>
          http.put<ApiResponse<Project>>(
            `${environment.apiBaseUri}${environment.endpoint_project_edit}/${uuid}`,
            { isArchived: true }
          ).pipe(
            tap((response: ApiResponse<Project>) => {
              const archivedProject = response.data;

              // Update or remove from array based on current filters
              patchState(store, (state) => ({
                projects: state.projects.map(p =>
                  p._id === uuid ? archivedProject : p
                ),
                loading: false,
                error: null,
              }));
            }),
            catchError((error: any) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Failed to archive project',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // ========================================================================
    // FILTER MANAGEMENT
    // ========================================================================
    setFilters(filters: ProjectFilters): void {
      patchState(store, { filters });
      
      // Automatically reload projects with new filters
      const currentPagination = store.pagination();
      this.loadProjects({
        page: 1, // Reset to first page when filters change
        limit: currentPagination.itemsPerPage,
        filters,
      });
    },

    clearFilters(): void {
      patchState(store, { filters: {} });
      
      // Reload projects without filters
      const currentPagination = store.pagination();
      this.loadProjects({
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

      this.loadProjects({
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
      this.loadProjects({
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

    setSelectedProject(project: Project | null): void {
      patchState(store, { selectedProject: project });
    },

    // ========================================================================
    // UTILITY
    // ========================================================================
    refreshProjects(): void {
      const currentPagination = store.pagination();
      this.loadProjects({
        page: currentPagination.currentPage,
        limit: currentPagination.itemsPerPage,
        filters: store.filters(),
      });
    },
  })),

  // Auto-load projects on initialization
  withHooks({
    onInit(store) {
      // Load first page of projects
      store.loadProjects({ page: 1, limit: 10 });
    },
  })
);
