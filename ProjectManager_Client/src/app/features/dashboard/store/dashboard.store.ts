import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

import { DashboardService } from '../services/dashboard.service';
import { 
  DashboardOverview, 
  TaskDistribution, 
  ChartData,
  ProjectStats,
  TaskStats 
} from '../models/dashboard';

// State interface
export interface DashboardState {
  overview: DashboardOverview | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Initial state
const initialState: DashboardState = {
  overview: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

/**
 * DashboardStore
 * 
 * A centralized signal store for managing dashboard state and overview data.
 * 
 * Features:
 * - Load dashboard overview with project, task, and user statistics
 * - Computed signals for chart data and metrics
 * - Task distribution calculations
 * - Overdue task tracking
 * - Auto-refresh capability
 * 
 * @example
 * ```typescript
 * export class DashboardComponent {
 *   readonly store = inject(DashboardStore);
 * 
 *   ngOnInit() {
 *     this.store.loadOverview();
 *   }
 * 
 *   refresh() {
 *     this.store.refreshOverview();
 *   }
 * }
 * ```
 */
export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // Computed signals for derived state
  withComputed((store) => ({
    /**
     * Returns project statistics
     */
    projectStats: computed(() => store.overview()?.projects || null),

    /**
     * Returns task statistics
     */
    taskStats: computed(() => store.overview()?.tasks || null),

    /**
     * Returns user statistics
     */
    userStats: computed(() => store.overview()?.users || null),

    /**
     * Returns recent projects list
     */
    recentProjects: computed(() => store.overview()?.recentProjects || []),

    /**
     * Returns overdue task count
     */
    overdueCount: computed(() => store.overview()?.overdueCount || 0),

    /**
     * Returns task distribution data for charts
     */
    taskDistribution: computed((): TaskDistribution[] => {
      const tasks = store.overview()?.tasks;
      if (!tasks) return [];

      return [
        { name: 'Open', value: tasks.open, color: '#2196F3' },
        { name: 'In Progress', value: tasks.inProgress, color: '#FF9800' },
        { name: 'Completed', value: tasks.completed, color: '#4CAF50' },
        { name: 'Blocked', value: tasks.blocked, color: '#F44336' },
      ].filter(item => item.value > 0);
    }),

    /**
     * Returns project distribution data for charts
     */
    projectDistribution: computed((): ChartData[] => {
      const projects = store.overview()?.projects;
      if (!projects) return [];

      return [
        { name: 'Active', value: projects.active },
        { name: 'Completed', value: projects.completed },
        { name: 'Archived', value: projects.archived },
      ].filter(item => item.value > 0);
    }),

    /**
     * Returns task completion percentage
     */
    taskCompletionRate: computed(() => {
      const tasks = store.overview()?.tasks;
      if (!tasks || tasks.total === 0) return 0;
      return Math.round((tasks.completed / tasks.total) * 100);
    }),

    /**
     * Returns project completion percentage
     */
    projectCompletionRate: computed(() => {
      const projects = store.overview()?.projects;
      if (!projects || projects.total === 0) return 0;
      return Math.round((projects.completed / projects.total) * 100);
    }),

    /**
     * Returns active task count (open + in progress)
     */
    activeTaskCount: computed(() => {
      const tasks = store.overview()?.tasks;
      if (!tasks) return 0;
      return tasks.open + tasks.inProgress;
    }),

    /**
     * Returns true if currently loading
     */
    isLoading: computed(() => store.loading()),

    /**
     * Returns true if there's an error
     */
    hasError: computed(() => store.error() !== null),

    /**
     * Returns true if overview data is loaded
     */
    hasData: computed(() => store.overview() !== null),

    /**
     * Returns formatted last updated time
     */
    lastUpdatedFormatted: computed(() => {
      const lastUpdated = store.lastUpdated();
      if (!lastUpdated) return null;
      return lastUpdated.toLocaleTimeString();
    }),
  })),

  // Methods for state updates and API calls
  withMethods((store, dashboardService = inject(DashboardService)) => ({
    /**
     * Load dashboard overview data
     */
    loadOverview: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          dashboardService.getOverview().pipe(
            tap((response) => {
              patchState(store, {
                overview: response.data || null,
                loading: false,
                error: null,
                lastUpdated: new Date(),
              });
            }),
            catchError((error: any) => {
              console.error('Error loading dashboard overview:', error);
              patchState(store, {
                overview: null,
                loading: false,
                error: error?.message || 'Failed to load dashboard data',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Refresh dashboard data (alias for loadOverview)
     */
    refreshOverview() {
      (this as any).loadOverview();
    },

    /**
     * Clear error
     */
    clearError() {
      patchState(store, { error: null });
    },

    /**
     * Reset store to initial state
     */
    reset() {
      patchState(store, initialState);
    },
  })),

  // Lifecycle hooks
  withHooks({
    onInit(store) {
      // Auto-load overview on initialization
      store.loadOverview();
    },
    onDestroy() {
      // Cleanup if needed
    },
  })
);
