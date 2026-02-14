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
import { pipe, switchMap, tap, debounceTime, catchError, of } from 'rxjs';

import { UserService, UserFilters, UserQueryParams } from '../services/user.service';
import { User, UserRole, CreateUserRequest, UpdateUserRequest } from '../models/user';
import { PaginationMeta } from '@shared/models/shared';

// State interface
export interface UsersState {
  users: User[];
  selectedUser: User | null;
  filters: UserFilters;
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

// Initial state
const initialState: UsersState = {
  users: [],
  selectedUser: null,
  filters: {
    role: undefined,
    isActive: undefined,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  loading: false,
  error: null,
  searchTerm: '',
};

/**
 * UsersSignalStore
 * 
 * A centralized signal store for managing user state with pagination, filtering, and search.
 * 
 * Features:
 * - Server-side pagination
 * - Filter by role (ADMIN, MANAGER, USER)
 * - Filter by active status
 * - Search by name/email
 * - Activate/deactivate users
 * - Create user (ADMIN only - enforced at component level)
 * - Edit user
 * - Delete user
 * 
 * @example
 * ```typescript
 * export class UsersListComponent {
 *   readonly store = inject(UsersStore);
 * 
 *   ngOnInit() {
 *     this.store.loadUsers();
 *   }
 * 
 *   filterByRole(role: UserRole) {
 *     this.store.setRoleFilter(role);
 *   }
 * 
 *   searchUsers(term: string) {
 *     this.store.setSearchTerm(term);
 *   }
 * }
 * ```
 */
export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // Computed signals for derived state
  withComputed((store) => ({
    /**
     * Returns only active users
     */
    activeUsers: computed(() => 
      store.users().filter((user) => user.isActive !== false)
    ),

    /**
     * Returns only inactive users
     */
    inactiveUsers: computed(() => 
      store.users().filter((user) => user.isActive === false)
    ),

    /**
     * Returns users grouped by role
     */
    usersByRole: computed(() => {
      const users = store.users();
      return {
        admins: users.filter((u) => u.role === UserRole.ADMIN),
        managers: users.filter((u) => u.role === UserRole.MANAGER),
        users: users.filter((u) => u.role === UserRole.USER),
      };
    }),

    /**
     * Returns count of users by role
     */
    userCountsByRole: computed(() => {
      const users = store.users();
      const admins = users.filter((u) => u.role === UserRole.ADMIN);
      const managers = users.filter((u) => u.role === UserRole.MANAGER);
      const regularUsers = users.filter((u) => u.role === UserRole.USER);
      
      return {
        admins: admins.length,
        managers: managers.length,
        users: regularUsers.length,
      };
    }),

    /**
     * Returns count of active vs inactive users
     */
    userStatusCounts: computed(() => {
      const users = store.users();
      const active = users.filter((u) => u.isActive !== false);
      const inactive = users.filter((u) => u.isActive === false);
      
      return {
        active: active.length,
        inactive: inactive.length,
        total: users.length,
      };
    }),

    /**
     * Returns true if there are any filters applied
     */
    hasActiveFilters: computed(() => {
      const filters = store.filters();
      return filters.role !== undefined || 
             filters.isActive !== undefined || 
             store.searchTerm().length > 0;
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
     * Returns pagination info
     */
    paginationInfo: computed(() => {
      const pagination = store.pagination();
      return {
        ...pagination,
        showing: `${(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-${
          Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)
        } of ${pagination.totalItems}`,
      };
    }),
  })),

  // Methods for state updates and API calls
  withMethods((store, userService = inject(UserService)) => ({
    /**
     * Load users with current filters and pagination
     */
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        debounceTime(300),
        switchMap(() => {
          const params: UserQueryParams = {
            page: store.pagination.currentPage(),
            limit: store.pagination.itemsPerPage(),
            ...store.filters(),
          };

          // Add search term if present
          const searchTerm = store.searchTerm();
          if (searchTerm) {
            params.search = searchTerm;
          }

          return userService.getUsersList(params).pipe(
            tap((response) => {
              patchState(store, {
                users: response.data || [],
                pagination: response.meta || initialState.pagination,
                loading: false,
                error: null,
              });
            }),
            catchError((error: any) => {
              console.error('Error loading users:', error);
              patchState(store, {
                users: [],
                loading: false,
                error: error?.message || 'Failed to load users',
              });
              return of(null);
            })
          );
        })
      )
    ),

    /**
     * Load a single user by ID
     */
    loadUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) =>
          userService.getUser(userId).pipe(
            tap((response) => {
              patchState(store, {
                selectedUser: response.data || null,
                loading: false,
                error: null,
              });
            }),
            catchError((error: any) => {
              console.error('Error loading user:', error);
              patchState(store, {
                selectedUser: null,
                loading: false,
                error: error?.message || 'Failed to load user',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Create a new user
     */
    createUser: rxMethod<CreateUserRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userData) =>
          userService.addUser(userData).pipe(
            tap((response) => {
              // Add new user to the list
              const newUser = response.data;
              if (newUser) {
                patchState(store, {
                  users: [...store.users(), newUser],
                  loading: false,
                  error: null,
                });
              }
            }),
            catchError((error: any) => {
              console.error('Error creating user:', error);
              patchState(store, {
                loading: false,
                error: error?.message || 'Failed to create user',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Update an existing user
     */
    updateUser: rxMethod<{ id: string; data: UpdateUserRequest }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, data }) =>
          userService.editUser(data, id).pipe(
            tap((response) => {
              const updatedUser = response.data;
              if (updatedUser) {
                patchState(store, {
                  users: store.users().map((user) =>
                    user._id === id || user.uuid === id ? updatedUser : user
                  ),
                  selectedUser:
                    store.selectedUser()?._id === id ||
                    store.selectedUser()?.uuid === id
                      ? updatedUser
                      : store.selectedUser(),
                  loading: false,
                  error: null,
                });
              }
            }),
            catchError((error: any) => {
              console.error('Error updating user:', error);
              patchState(store, {
                loading: false,
                error: error?.message || 'Failed to update user',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Delete a user
     */
    deleteUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) =>
          userService.deleteUser(userId).pipe(
            tap(() => {
              patchState(store, {
                users: store.users().filter(
                  (user) => user._id !== userId && user.uuid !== userId
                ),
                loading: false,
                error: null,
              });
            }),
            catchError((error: any) => {
              console.error('Error deleting user:', error);
              patchState(store, {
                loading: false,
                error: error?.message || 'Failed to delete user',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Deactivate a user (set isActive to false)
     */
    deactivateUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) =>
          userService.deactivateUser(userId).pipe(
            tap((response) => {
              const updatedUser = response.data;
              if (updatedUser) {
                patchState(store, {
                  users: store.users().map((user) =>
                    user._id === userId || user.uuid === userId
                      ? updatedUser
                      : user
                  ),
                  loading: false,
                  error: null,
                });
              }
            }),
            catchError((error: any) => {
              console.error('Error deactivating user:', error);
              patchState(store, {
                loading: false,
                error: error?.message || 'Failed to deactivate user',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Activate a user (set isActive to true)
     */
    activateUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) =>
          userService.activateUser(userId).pipe(
            tap((response) => {
              const updatedUser = response.data;
              if (updatedUser) {
                patchState(store, {
                  users: store.users().map((user) =>
                    user._id === userId || user.uuid === userId
                      ? updatedUser
                      : user
                  ),
                  loading: false,
                  error: null,
                });
              }
            }),
            catchError((error: any) => {
              console.error('Error activating user:', error);
              patchState(store, {
                loading: false,
                error: error?.message || 'Failed to activate user',
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Set role filter and reload users
     */
    setRoleFilter(role: UserRole | undefined) {
      patchState(store, {
        filters: { ...store.filters(), role },
        pagination: { ...store.pagination(), currentPage: 1 },
      });
      // Trigger reload by calling loadUsers as a function
      (this as any).loadUsers();
    },

    /**
     * Set active status filter and reload users
     */
    setActiveFilter(isActive: boolean | undefined) {
      patchState(store, {
        filters: { ...store.filters(), isActive },
        pagination: { ...store.pagination(), currentPage: 1 },
      });
      (this as any).loadUsers();
    },

    /**
     * Set search term and reload users
     */
    setSearchTerm(searchTerm: string) {
      patchState(store, {
        searchTerm,
        pagination: { ...store.pagination(), currentPage: 1 },
      });
      (this as any).loadUsers();
    },

    /**
     * Clear all filters and reload
     */
    clearFilters() {
      patchState(store, {
        filters: initialState.filters,
        searchTerm: '',
        pagination: { ...store.pagination(), currentPage: 1 },
      });
      (this as any).loadUsers();
    },

    /**
     * Change page
     */
    setPage(page: number) {
      patchState(store, {
        pagination: { ...store.pagination(), currentPage: page },
      });
      (this as any).loadUsers();
    },

    /**
     * Change page size
     */
    setPageSize(pageSize: number) {
      patchState(store, {
        pagination: {
          ...store.pagination(),
          itemsPerPage: pageSize,
          currentPage: 1,
        },
      });
      (this as any).loadUsers();
    },

    /**
     * Clear error
     */
    clearError() {
      patchState(store, { error: null });
    },

    /**
     * Clear selected user
     */
    clearSelectedUser() {
      patchState(store, { selectedUser: null });
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
      // Optionally load users on initialization
      // store.loadUsers();
    },
    onDestroy() {
      // Cleanup if needed
    },
  })
);
