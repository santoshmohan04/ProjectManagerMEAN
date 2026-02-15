import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthStore, UserRole } from '../../core/auth.store';

/**
 * Role Guard - Protects routes based on user roles
 * 
 * Usage:
 * {
 *   path: 'users',
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: ['ADMIN'] },
 *   loadComponent: () => import('./features/users/users.component')
 * }
 * 
 * Multiple roles (OR logic):
 * data: { roles: ['ADMIN', 'MANAGER'] } // User can be either ADMIN or MANAGER
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // First check if user is authenticated
  if (!authStore.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as UserRole[] | undefined;
  
  // If no roles are specified, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Get current user's role
  const currentUser = authStore.user();
  const userRole = currentUser?.role;

  // Check if user has one of the required roles
  if (userRole && requiredRoles.includes(userRole)) {
    return true;
  }

  // User doesn't have required role - show error and redirect
  snackBar.open(
    'Unauthorized access. You do not have permission to view this page.',
    'Close',
    {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    }
  );

  router.navigate(['/dashboard']);
  return false;
};
