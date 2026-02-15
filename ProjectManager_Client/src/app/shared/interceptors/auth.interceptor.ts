import { HttpInterceptorFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { AuthStore } from '../../core/auth.store';
import { environment } from '../../../environments/environment';

/**
 * HTTP Interceptor to automatically add Authorization header with JWT token
 * to all outgoing requests (except auth endpoints)
 * 
 * Handles 401 errors by:
 * 1. Attempting to refresh the token
 * 2. Retrying the original request with new token
 * 3. Forcing logout if refresh fails
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const http = inject(HttpClient);
  
  // Get token from store, fallback to localStorage if not available yet
  let token = authStore.accessToken();
  if (!token) {
    token = localStorage.getItem('auth_token');
  }

  // Skip adding token for auth endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') || 
                         req.url.includes('/auth/register') ||
                         req.url.includes('/auth/refresh');

  // Clone request with Authorization header if token exists
  const authReq = token && !isAuthEndpoint
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  // Send request and handle 401 errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      // Note: Token refresh is disabled until backend implements /auth/refresh endpoint
      // For now, just pass through the error without forcing logout
      if (error.status === 401 && !isAuthEndpoint) {
        console.warn('401 Unauthorized - Token may be invalid or expired');
        // TODO: Implement token refresh when backend supports it
        // return handleTokenRefresh(authStore, http, req, next);
      }

      // For all errors, just throw them (don't force logout)
      return throwError(() => error);
    })
  );
};

/**
 * Helper function to refresh token and retry the original request
 * Uses switchMap to avoid nested subscriptions
 */
function handleTokenRefresh(
  authStore: InstanceType<typeof AuthStore>,
  http: HttpClient,
  originalRequest: any,
  next: any
): Observable<any> {
  const currentToken = authStore.accessToken();
  
  // If no token, logout
  if (!currentToken) {
    authStore.logout();
    return throwError(() => new Error('No token available'));
  }

  // Call refresh token API
  return http.post<{ success: boolean; data: { token: string } }>(
    `${environment.apiBaseUri}/auth/refresh`,
    { token: currentToken }
  ).pipe(
    switchMap((response) => {
      const newToken = response.data.token;
      
      // Update token in store (this also updates localStorage)
      authStore.setAccessToken(newToken);

      // Retry original request with new token
      const retryReq = originalRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${newToken}`
        }
      });

      return next(retryReq);
    }),
    catchError((refreshError) => {
      // Refresh failed - force logout
      authStore.logout();
      return throwError(() => refreshError);
    })
  );
}
