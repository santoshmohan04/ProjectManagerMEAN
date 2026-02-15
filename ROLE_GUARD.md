# RoleGuard Documentation

## Overview

The `roleGuard` is a route guard that provides role-based access control for Angular routes. It checks if the authenticated user has one of the required roles specified in the route's data configuration.

## Features

- ✅ Role-based route protection
- ✅ Multiple role support (OR logic)
- ✅ User feedback via MatSnackBar
- ✅ Automatic redirection to dashboard
- ✅ Integration with existing authentication system
- ✅ TypeScript type safety with UserRole enum

## Installation

The guard is already created at:
```
src/app/shared/guards/role.guard.ts
```

## User Roles

The following roles are available (defined in `AuthStore`):

```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}
```

## Usage

### Basic Usage - Single Role

Protect a route so only ADMIN users can access it:

```typescript
import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';

{
  path: 'users',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () => import('./features/users/userslist.component')
}
```

**Important**: Always include `authGuard` before `roleGuard` to ensure the user is authenticated first.

### Multiple Roles (OR Logic)

Allow either ADMIN or MANAGER to access a route:

```typescript
{
  path: 'reports',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'MANAGER'] },
  loadComponent: () => import('./features/reports/reports.component')
}
```

The user needs to have **at least one** of the specified roles to gain access.

### No Role Restriction

If you don't specify roles in the route data, the guard allows access to all authenticated users:

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard, roleGuard], // roleGuard will allow all authenticated users
  loadComponent: () => import('./features/dashboard/dashboard.component')
}
```

## Complete Route Examples

### App Routes with Role Guards

```typescript
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component')
  },

  // Protected routes - Any authenticated user
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
  },
  {
    path: 'my-tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/tasklist.component')
  },

  // Protected routes - ADMIN only
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/users/userslist.component')
  },
  {
    path: 'audit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/audit/audit.component')
  },

  // Protected routes - ADMIN or MANAGER
  {
    path: 'projects',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () => import('./features/projects/projectslist.component')
  },
  {
    path: 'tasks',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    loadComponent: () => import('./features/tasks/tasklist.component')
  },

  // Catch-all redirect
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
```

## Behavior

### When User Has Required Role
- Guard returns `true`
- User is allowed to access the route
- Navigation proceeds normally

### When User Lacks Required Role
1. **MatSnackBar notification** is displayed:
   - Message: "Unauthorized access. You do not have permission to view this page."
   - Duration: 5 seconds
   - Position: Top center
   - Style: Error styling (can be customized with CSS)
2. **Automatic redirection** to `/dashboard`
3. Guard returns `false`
4. Navigation is blocked

### When User Is Not Authenticated
- Guard checks authentication first
- If not authenticated, redirects to `/login` with `returnUrl` query parameter
- User can return to intended page after logging in

## Guard Logic Flow

```
1. Check if user is authenticated (via AuthStore)
   ├─ No → Redirect to /login with returnUrl
   └─ Yes → Continue

2. Get required roles from route.data['roles']
   ├─ No roles specified → Allow access
   └─ Roles specified → Continue

3. Get current user's role from AuthStore.user()
   
4. Check if user's role is in required roles array
   ├─ Yes → Allow access (return true)
   └─ No → Show error snackbar, redirect to /dashboard (return false)
```

## Integration with AuthStore

The guard uses the following from `AuthStore`:

```typescript
// Check if user is authenticated
authStore.isAuthenticated() // boolean

// Get current user
authStore.user() // User | null

// User interface includes role
interface User {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole; // ADMIN, MANAGER, or USER
  // ...
}
```

## Customizing Error Message

To customize the snackbar message, edit the `role.guard.ts` file:

```typescript
snackBar.open(
  'Custom error message here',
  'Close',
  {
    duration: 5000, // Change duration (milliseconds)
    horizontalPosition: 'center', // left, center, right
    verticalPosition: 'top', // top, bottom
    panelClass: ['error-snackbar', 'custom-class'] // Add CSS classes
  }
);
```

## Styling the Snackbar

Add custom styles in your global `styles.scss`:

```scss
// Error snackbar styling
.error-snackbar {
  background-color: #f44336 !important;
  color: white !important;
  font-weight: 500 !important;

  .mat-mdc-snack-bar-label {
    color: white !important;
  }

  .mat-mdc-button {
    color: white !important;
  }
}
```

## Testing Role Guards

### Test Users with Different Roles

Create test users with different roles for testing:

```typescript
// Admin user
{
  email: 'admin@test.com',
  role: UserRole.ADMIN
}

// Manager user
{
  email: 'manager@test.com',
  role: UserRole.MANAGER
}

// Regular user
{
  email: 'user@test.com',
  role: UserRole.USER
}
```

### Testing Access Control

1. **Login as ADMIN**
   - Should access all routes
   - Can view `/users`, `/audit`, `/projects`, `/tasks`, `/dashboard`

2. **Login as MANAGER**
   - Should access MANAGER and general routes
   - Can view `/projects`, `/tasks`, `/dashboard`
   - Cannot access `/users`, `/audit` (if restricted to ADMIN)

3. **Login as USER**
   - Should access only general routes
   - Can view `/dashboard`, `/my-tasks`
   - Cannot access role-protected routes

## Common Use Cases

### Admin-Only Features
```typescript
// User management
data: { roles: ['ADMIN'] }

// System settings
data: { roles: ['ADMIN'] }

// Audit logs
data: { roles: ['ADMIN'] }
```

### Manager-Level Features
```typescript
// Project management
data: { roles: ['ADMIN', 'MANAGER'] }

// Task assignment
data: { roles: ['ADMIN', 'MANAGER'] }

// Reports and analytics
data: { roles: ['ADMIN', 'MANAGER'] }
```

### All Authenticated Users
```typescript
// Personal dashboard
canActivate: [authGuard] // No roleGuard needed

// My tasks
canActivate: [authGuard]

// Profile settings
canActivate: [authGuard]
```

## Troubleshooting

### Guard Not Working

1. **Ensure guard is imported**:
   ```typescript
   import { roleGuard } from './shared/guards/role.guard';
   ```

2. **Check guard order**:
   ```typescript
   canActivate: [authGuard, roleGuard] // authGuard FIRST
   ```

3. **Verify role data**:
   ```typescript
   data: { roles: ['ADMIN'] } // Must be array of UserRole values
   ```

### Snackbar Not Showing

1. **Ensure MatSnackBarModule is imported**:
   ```typescript
   // In app.config.ts or component
   import { MatSnackBarModule } from '@angular/material/snack-bar';
   ```

2. **Check if snackbar is being hidden** by other UI elements (z-index issues)

### User Has Role But Can't Access

1. **Check role value in AuthStore**:
   ```typescript
   console.log(authStore.user()?.role); // Should be 'ADMIN', 'MANAGER', or 'USER'
   ```

2. **Verify role is set during login**:
   - Backend must include role in auth response
   - AuthStore must store role correctly

### Always Redirected to Dashboard

1. **Check if user is authenticated**:
   ```typescript
   console.log(authStore.isAuthenticated());
   ```

2. **Verify route data configuration**:
   ```typescript
   data: { roles: ['ADMIN'] } // Not data: { role: 'ADMIN' }
   ```

## Advanced Usage

### Dynamic Role Checks in Components

While guards protect routes, you may also want to hide/show UI elements based on roles:

```typescript
// In component
import { AuthStore, UserRole } from '@app/core/auth.store';

export class MyComponent {
  private authStore = inject(AuthStore);

  // Computed signals from AuthStore
  isAdmin = this.authStore.isAdmin;
  isManager = this.authStore.isManager;
  isUser = this.authStore.isUser;

  // Custom role check
  hasRole(role: UserRole): boolean {
    return this.authStore.user()?.role === role;
  }

  // Check multiple roles
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.authStore.user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }
}
```

```html
<!-- In template -->
@if (isAdmin()) {
  <button mat-raised-button>Admin Action</button>
}

@if (isManager() || isAdmin()) {
  <button mat-raised-button>Manager Action</button>
}

<!-- Using hasAnyRole method -->
@if (hasAnyRole(['ADMIN', 'MANAGER'])) {
  <button mat-raised-button>Privileged Action</button>
}
```

### Role-Based Navigation Menu

```typescript
// In header component
menuItems = computed(() => {
  const items = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/my-tasks', label: 'My Tasks', icon: 'task' },
  ];

  // Add manager-level items
  if (this.isManager() || this.isAdmin()) {
    items.push(
      { path: '/projects', label: 'Projects', icon: 'folder' },
      { path: '/tasks', label: 'All Tasks', icon: 'list' }
    );
  }

  // Add admin-only items
  if (this.isAdmin()) {
    items.push(
      { path: '/users', label: 'Users', icon: 'people' },
      { path: '/audit', label: 'Audit Logs', icon: 'history' }
    );
  }

  return items;
});
```

```html
@for (item of menuItems(); track item.path) {
  <a mat-list-item [routerLink]="item.path">
    <mat-icon>{{ item.icon }}</mat-icon>
    <span>{{ item.label }}</span>
  </a>
}
```

## Security Considerations

### Backend Validation Required

**Important**: Route guards provide UI-level protection only. Always validate roles on the backend:

```typescript
// Backend API example
app.get('/api/users', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  // Handler
});
```

### Token-Based Role Storage

- User role is stored in the JWT token
- AuthStore reads role from token payload
- Role is also stored in localStorage for persistence
- Token should be refreshed regularly to update role changes

### Role Changes

If a user's role changes:
1. User must log out and log in again to get new token
2. Or implement token refresh mechanism
3. Or force logout when admin changes user role

## API Reference

### Guard Function

```typescript
export const roleGuard: CanActivateFn = (route, state) => boolean
```

### Parameters

- `route: ActivatedRouteSnapshot` - Current route being accessed
- `state: RouterStateSnapshot` - Current router state

### Returns

- `true` - User has required role, allow access
- `false` - User lacks required role, block access

### Route Data Configuration

```typescript
interface RouteData {
  roles?: UserRole[]; // Array of allowed roles (OR logic)
}
```

## Related Guards

- **authGuard**: Checks if user is authenticated
- **guestGuard**: Prevents authenticated users from accessing auth pages

## File Location

```
src/app/shared/guards/role.guard.ts
```

## Dependencies

- `@angular/router` - Router and CanActivateFn
- `@angular/material/snack-bar` - MatSnackBar for notifications
- `../../core/auth.store` - AuthStore and UserRole enum

## TypeScript Types

```typescript
// From auth.store.ts
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
  role: UserRole;
  // ...
}
```

## Change Log

- **v1.0.0** - Initial release with role-based access control
