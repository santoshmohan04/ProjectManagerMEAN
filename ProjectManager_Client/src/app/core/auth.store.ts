import { 
  signalStore, 
  withState, 
  withMethods, 
  patchState, 
  withComputed,
  withHooks
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { pipe, tap, switchMap, catchError, of, map } from 'rxjs';
import { environment } from '../../environments/environment';

// ============================================================================
// INTERFACES
// ============================================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export interface User {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  role: UserRole;
  fullName?: string;
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  employeeId?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  isSidebarOpen: boolean;
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const LocalStorageService = {
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  hasValidAuth(): boolean {
    return !!this.getToken() && !!this.getUser();
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  isSidebarOpen: true,
};

// ============================================================================
// AUTH SIGNAL STORE
// ============================================================================

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  // Computed Signals
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.user() && !!store.accessToken()),
    isAdmin: computed(() => store.user()?.role === UserRole.ADMIN),
    isManager: computed(() => store.user()?.role === UserRole.MANAGER),
    isUser: computed(() => store.user()?.role === UserRole.USER),
    userFullName: computed(() => {
      const user = store.user();
      return user ? `${user.firstName} ${user.lastName}` : 'Guest';
    }),
    userInitials: computed(() => {
      const user = store.user();
      return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'G';
    }),
  })),

  // Methods
  withMethods((store, http = inject(HttpClient), router = inject(Router)) => ({
    
    // ========================================================================
    // LOGIN
    // ========================================================================
    login: rxMethod<LoginCredentials>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((credentials) =>
          http.post<{ success: boolean; data: AuthResponse; message: string }>(
            `${environment.apiBaseUri}${environment.endpoint_auth_login}`,
            credentials
          ).pipe(
            tap((response: { success: boolean; data: AuthResponse; message: string }) => {
              const { user, token } = response.data;
              
              // Store in localStorage
              LocalStorageService.setToken(token);
              LocalStorageService.setUser(user);

              // Update state
              patchState(store, {
                user,
                accessToken: token,
                loading: false,
                error: null,
              });

              // Navigate to dashboard
              router.navigate(['/dashboard']);
            }),
            catchError((error: any) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Login failed. Please try again.',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // ========================================================================
    // REGISTER
    // ========================================================================
    register: rxMethod<RegisterPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) =>
          http.post<{ success: boolean; data: AuthResponse; message: string }>(
            `${environment.apiBaseUri}${environment.endpoint_auth_register}`,
            payload
          ).pipe(
            tap((response: { success: boolean; data: AuthResponse; message: string }) => {
              const { user, token } = response.data;
              
              // Store in localStorage
              LocalStorageService.setToken(token);
              LocalStorageService.setUser(user);

              // Update state
              patchState(store, {
                user,
                accessToken: token,
                loading: false,
                error: null,
              });

              // Navigate to dashboard
              router.navigate(['/dashboard']);
            }),
            catchError((error: any) => {
              patchState(store, {
                loading: false,
                error: error.error?.message || 'Registration failed. Please try again.',
              });
              return of(null);
            })
          )
        )
      )
    ),

    // ========================================================================
    // LOGOUT
    // ========================================================================
    logout(): void {
      // Clear localStorage
      LocalStorageService.clearAuth();

      // Reset state
      patchState(store, {
        user: null,
        accessToken: null,
        loading: false,
        error: null,
      });

      // Navigate to login
      router.navigate(['/login']);
    },

    // ========================================================================
    // REFRESH TOKEN
    // ========================================================================
    refreshToken: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const currentToken = store.accessToken();
          
          if (!currentToken) {
            patchState(store, { loading: false });
            return of(null);
          }

          return http.post<{ success: boolean; data: { token: string }; message: string }>(
            `${environment.apiBaseUri}/auth/refresh`,
            { token: currentToken }
          ).pipe(
            tap((response: { success: boolean; data: { token: string }; message: string }) => {
              const newToken = response.data.token;
              
              // Store new token
              LocalStorageService.setToken(newToken);

              // Update state
              patchState(store, {
                accessToken: newToken,
                loading: false,
                error: null,
              });
            }),
            catchError((error: any) => {
              // Token refresh failed - logout user
              LocalStorageService.clearAuth();
              patchState(store, {
                user: null,
                accessToken: null,
                loading: false,
                error: 'Session expired. Please login again.',
              });
              router.navigate(['/login']);
              return of(null);
            })
          );
        })
      )
    ),

    // ========================================================================
    // LOAD CURRENT USER
    // ========================================================================
    loadCurrentUser: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const token = store.accessToken();
          
          if (!token) {
            patchState(store, { loading: false });
            return of(null);
          }

          return http.get<{ success: boolean; data: User; message: string }>(
            `${environment.apiBaseUri}/auth/me`
          ).pipe(
            tap((response: { success: boolean; data: User; message: string }) => {
              const user = response.data;
              
              // Update localStorage
              LocalStorageService.setUser(user);

              // Update state
              patchState(store, {
                user,
                loading: false,
                error: null,
              });
            }),
            catchError((error: any) => {
              // Failed to load user - clear auth
              LocalStorageService.clearAuth();
              patchState(store, {
                user: null,
                accessToken: null,
                loading: false,
                error: null,
              });
              return of(null);
            })
          );
        })
      )
    ),

    // ========================================================================
    // RESTORE AUTH STATE (from localStorage)
    // ========================================================================
    restoreAuthState(): void {
      if (LocalStorageService.hasValidAuth()) {
        const token = LocalStorageService.getToken();
        const user = LocalStorageService.getUser();

        patchState(store, {
          user,
          accessToken: token,
          loading: false,
          error: null,
        });
      }
    },

    // ========================================================================
    // UI STATE MANAGEMENT
    // ========================================================================
    toggleSidebar(): void {
      patchState(store, (state) => ({ 
        isSidebarOpen: !state.isSidebarOpen 
      }));
    },

    setSidebarOpen(isOpen: boolean): void {
      patchState(store, { isSidebarOpen: isOpen });
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    setUser(user: User | null): void {
      patchState(store, { user });
      if (user) {
        LocalStorageService.setUser(user);
      }
    },

    setAccessToken(token: string): void {
      patchState(store, { accessToken: token });
      LocalStorageService.setToken(token);
    },
  })),

  // Auto-restore auth state on initialization
  withHooks({
    onInit(store) {
      store.restoreAuthState();
    },
  })
);
