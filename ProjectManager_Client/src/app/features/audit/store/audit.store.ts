import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, debounceTime } from 'rxjs';
import { AuditService } from '../services/audit.service';
import {
  AuditLog,
  EntityType,
  DateRangeFilter,
  AuditPaginationInfo,
  AuditQueryParams,
} from '../models/audit';

interface AuditState {
  // Entity history
  entityLogs: AuditLog[];
  entityType: EntityType | null;
  entityId: string | null;

  // User activity
  userLogs: AuditLog[];
  userId: string | null;

  // Recent activity
  recentLogs: AuditLog[];

  // Common state
  loading: boolean;
  error: string | null;

  // Filters
  dateRange: DateRangeFilter;

  // Pagination
  pagination: AuditPaginationInfo;
}

const initialState: AuditState = {
  entityLogs: [],
  entityType: null,
  entityId: null,

  userLogs: [],
  userId: null,

  recentLogs: [],

  loading: false,
  error: null,

  dateRange: {
    startDate: null,
    endDate: null,
  },

  pagination: {
    currentPage: 1,
    pageSize: 50,
    totalItems: 0,
    hasMore: false,
  },
};

export const AuditStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    // Check if loading
    isLoading: computed(() => store.loading()),

    // Check if there is an error
    hasError: computed(() => !!store.error()),

    // Check if there is entity data
    hasEntityLogs: computed(() => store.entityLogs().length > 0),

    // Check if there is user data
    hasUserLogs: computed(() => store.userLogs().length > 0),

    // Check if there is recent data
    hasRecentLogs: computed(() => store.recentLogs().length > 0),

    // Get date range status
    hasDateFilter: computed(() => {
      const range = store.dateRange();
      return range.startDate !== null || range.endDate !== null;
    }),

    // Current page info
    currentPageInfo: computed(() => {
      const pagination = store.pagination();
      const start = (pagination.currentPage - 1) * pagination.pageSize + 1;
      const end = Math.min(
        pagination.currentPage * pagination.pageSize,
        pagination.totalItems
      );
      return { start, end, total: pagination.totalItems };
    }),
  })),

  withMethods((store) => {
    const auditService = inject(AuditService);

    return {
      // Load entity history
      loadEntityHistory: rxMethod<{
        entityType: EntityType;
        entityId: string;
      }>(
        pipe(
          debounceTime(300),
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ entityType, entityId }) => {
            const params: AuditQueryParams = {
              limit: store.pagination().pageSize,
              skip:
                (store.pagination().currentPage - 1) *
                store.pagination().pageSize,
            };

            const dateRange = store.dateRange();
            if (dateRange.startDate) {
              params.startDate = dateRange.startDate.toISOString();
            }
            if (dateRange.endDate) {
              params.endDate = dateRange.endDate.toISOString();
            }

            return auditService.getEntityHistory(entityType, entityId, params).pipe(
              tap((response) => {
                const logs = response.data || [];
                patchState(store, {
                  entityLogs: logs,
                  entityType,
                  entityId,
                  loading: false,
                  pagination: {
                    ...store.pagination(),
                    totalItems: logs.length,
                    hasMore: logs.length === store.pagination().pageSize,
                  },
                });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Failed to load entity history',
                  loading: false,
                });
                return of(null);
              })
            );
          })
        )
      ),

      // Load user activity
      loadUserActivity: rxMethod<string>(
        pipe(
          debounceTime(300),
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((userId) => {
            const params: AuditQueryParams = {
              limit: store.pagination().pageSize,
              skip:
                (store.pagination().currentPage - 1) *
                store.pagination().pageSize,
            };

            const dateRange = store.dateRange();
            if (dateRange.startDate) {
              params.startDate = dateRange.startDate.toISOString();
            }
            if (dateRange.endDate) {
              params.endDate = dateRange.endDate.toISOString();
            }

            return auditService.getUserActivity(userId, params).pipe(
              tap((response) => {
                const logs = response.data || [];
                patchState(store, {
                  userLogs: logs,
                  userId,
                  loading: false,
                  pagination: {
                    ...store.pagination(),
                    totalItems: logs.length,
                    hasMore: logs.length === store.pagination().pageSize,
                  },
                });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Failed to load user activity',
                  loading: false,
                });
                return of(null);
              })
            );
          })
        )
      ),

      // Load recent activity
      loadRecentActivity: rxMethod<number | void>(
        pipe(
          debounceTime(300),
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((limit) => {
            const effectiveLimit = limit || 100;
            return auditService.getRecentActivity(effectiveLimit).pipe(
              tap((response) => {
                const logs = response.data || [];
                patchState(store, {
                  recentLogs: logs,
                  loading: false,
                });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Failed to load recent activity',
                  loading: false,
                });
                return of(null);
              })
            );
          })
        )
      ),

      // Set date range filter
      setDateRange(startDate: Date | null, endDate: Date | null) {
        patchState(store, {
          dateRange: { startDate, endDate },
          pagination: { ...store.pagination(), currentPage: 1 },
        });
      },

      // Clear date range filter
      clearDateRange() {
        patchState(store, {
          dateRange: { startDate: null, endDate: null },
          pagination: { ...store.pagination(), currentPage: 1 },
        });
      },

      // Set page
      setPage(page: number) {
        patchState(store, {
          pagination: { ...store.pagination(), currentPage: page },
        });
      },

      // Set page size
      setPageSize(pageSize: number) {
        patchState(store, {
          pagination: { ...store.pagination(), pageSize, currentPage: 1 },
        });
      },

      // Go to next page
      nextPage() {
        const pagination = store.pagination();
        if (pagination.hasMore) {
          patchState(store, {
            pagination: {
              ...pagination,
              currentPage: pagination.currentPage + 1,
            },
          });
        }
      },

      // Go to previous page
      previousPage() {
        const pagination = store.pagination();
        if (pagination.currentPage > 1) {
          patchState(store, {
            pagination: {
              ...pagination,
              currentPage: pagination.currentPage - 1,
            },
          });
        }
      },

      // Clear error
      clearError() {
        patchState(store, { error: null });
      },

      // Reset store
      reset() {
        patchState(store, initialState);
      },

      // Clear entity logs
      clearEntityLogs() {
        patchState(store, {
          entityLogs: [],
          entityType: null,
          entityId: null,
        });
      },

      // Clear user logs
      clearUserLogs() {
        patchState(store, {
          userLogs: [],
          userId: null,
        });
      },

      // Clear recent logs
      clearRecentLogs() {
        patchState(store, {
          recentLogs: [],
        });
      },
    };
  }),

  withHooks({
    onInit(store) {
      // Optionally load recent activity on initialization
      // Commented out to avoid unnecessary API calls
      // store.loadRecentActivity();
    },
  })
);
