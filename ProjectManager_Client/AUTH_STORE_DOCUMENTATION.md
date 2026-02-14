# Auth Signal Store Documentation

## Overview

Comprehensive authentication state management using NgRx Signal Store with built-in localStorage persistence, automatic state restoration, and reactive auth methods.

## Features

✅ **Signal-based state management** with NgRx Signals  
✅ **Automatic localStorage persistence** for tokens and user data  
✅ **Auto-restore authentication** state on app initialization  
✅ **HTTP interceptor** for automatic token injection  
✅ **Route guards** for protected and guest routes  
✅ **Reactive auth methods** using rxMethod (no manual subscriptions needed)  
✅ **Type-safe** User and Role interfaces  
✅ **Error handling** with user-friendly error messages  

---

## State Structure

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  isSidebarOpen: boolean;
}
```

### User Interface

```typescript
interface User {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  role: UserRole;
  fullName?: string;
  isActive?: boolean;
}

enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}
```

---

## Computed Signals

The store provides the following computed signals:

```typescript
// Authentication status
authStore.isAuthenticated() // boolean

// Role checks
authStore.isAdmin()         // boolean
authStore.isManager()       // boolean  
authStore.isUser()          // boolean

// User info
authStore.userFullName()    // string - "John Doe" or "Guest"
authStore.userInitials()    // string - "JD" or "G"
```

---

## Authentication Methods

### 1. Login

```typescript
// In component
const authStore = inject(AuthStore);

// Call login - store handles everything (no manual subscription!)
authStore.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check loading state in template
@if (authStore.loading()) {
  <mat-spinner></mat-spinner>
}

// Display error if any
@if (authStore.error()) {
  <div class="error">{{ authStore.error() }}</div>
}
```

**What happens automatically:**
- Sets `loading` to true
- Makes HTTP POST request to `/auth/login`
- On success:
  - Stores token in localStorage
  - Stores user in localStorage
  - Updates state with user and token
  - Navigates to `/dashboard`
- On error:
  - Sets error message in state
  - Sets loading to false

### 2. Register

```typescript
authStore.register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'securePassword',
  employeeId: 'EMP001',
  role: UserRole.USER
});
```

**Behavior:** Same as login - automatic state management and navigation.

### 3. Logout

```typescript
authStore.logout();
```

**What happens:**
- Clears localStorage (token + user)
- Resets state to initial values
- Navigates to `/login`

### 4. Refresh Token

```typescript
authStore.refreshToken();
```

**Use case:** Refresh expired JWT tokens without logging out

**Behavior:**
- Sends current token to `/auth/refresh` endpoint
- On success: Updates token in state and localStorage
- On failure: Logs out user and redirects to login

### 5. Load Current User

```typescript
authStore.loadCurrentUser();
```

**Use case:** Fetch fresh user data from `/auth/me` endpoint

**Behavior:**
- Fetches user data using current token
- Updates user in state and localStorage
- On failure: Clears auth state

### 6. Restore Auth State

```typescript
authStore.restoreAuthState();
```

**Note:** This is called automatically via `withHooks.onInit` - you don't need to call it manually!

**Behavior:**
- Checks localStorage for saved token and user
- If found, restores them to state
- Runs on app initialization

---

## UI State Methods

```typescript
// Toggle sidebar
authStore.toggleSidebar();

// Set sidebar state
authStore.setSidebarOpen(true);  // or false

// Clear error message
authStore.clearError();

// Manually set user
authStore.setUser(userObject);
```

---

## Usage Examples

### Component with Login Form

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../core/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" placeholder="Email">
      <input formControlName="password" type="password" placeholder="Password">
      
      @if (authStore.error()) {
        <div class="error">{{ authStore.error() }}</div>
      }
      
      <button 
        type="submit" 
        [disabled]="loginForm.invalid || authStore.loading()">
        @if (authStore.loading()) {
          Loading...
        } @else {
          Login
        }
      </button>
    </form>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  authStore = inject(AuthStore);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      // No subscription needed! Store handles everything
      this.authStore.login(this.loginForm.value);
    }
  }
}
```

### Checking Auth Status in Template

```typescript
// app.component.html
@if (authStore.isAuthenticated()) {
  <app-header>
    <span>Welcome, {{ authStore.userFullName() }}</span>
    <button (click)="authStore.logout()">Logout</button>
  </app-header>
  <router-outlet></router-outlet>
} @else {
  <router-outlet></router-outlet>
}
```

### Role-Based UI

```typescript
// In component
@if (authStore.isAdmin()) {
  <app-admin-panel></app-admin-panel>
}

@if (authStore.isManager() || authStore.isAdmin()) {
  <app-reports></app-reports>
}

@if (authStore.isUser()) {
  <app-my-tasks></app-my-tasks>
}
```

---

## HTTP Interceptor

The `authInterceptor` automatically adds the JWT token to all HTTP requests (except auth endpoints).

**Configured in app.config.ts:**

```typescript
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ],
};
```

**How it works:**
- Gets token from `authStore.accessToken()`
- Skips auth endpoints (`/auth/login`, `/auth/register`)
- Adds `Authorization: Bearer <token>` header to all other requests

---

## Route Guards

### Auth Guard (Protected Routes)

Protects routes that require authentication. Redirects to `/login` if not authenticated.

```typescript
import { authGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent
  }
];
```

### Guest Guard (Public Routes)

Prevents authenticated users from accessing auth pages. Redirects to `/dashboard` if already authenticated.

```typescript
import { guestGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginComponent
  }
];
```

---

## LocalStorage Keys

The store uses the following localStorage keys:

- `auth_token` - JWT access token
- `auth_user` - User object (JSON)

**Automatic Management:**
- ✅ Saved on successful login/register
- ✅ Restored on app initialization
- ✅ Cleared on logout
- ✅ Cleared on token refresh failure

---

## API Endpoints

The store expects the following endpoints to be available:

```typescript
// Login
POST /auth/login
Body: { email: string, password: string }
Response: { success: boolean, data: { user: User, token: string }, message: string }

// Register
POST /auth/register
Body: { firstName, lastName, email, password, employeeId?, role? }
Response: { success: boolean, data: { user: User, token: string }, message: string }

// Refresh Token
POST /auth/refresh
Body: { token: string }
Response: { success: boolean, data: { token: string }, message: string }

// Get Current User
GET /auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, data: User, message: string }
```

---

## Best Practices

### ✅ Do's

1. **Use computed signals** for derived state:
   ```typescript
   @if (authStore.isAdmin()) { ... }
   ```

2. **No manual subscriptions** - rxMethod handles observables:
   ```typescript
   authStore.login(credentials); // ✅ Correct
   ```

3. **Check loading state** before actions:
   ```typescript
   [disabled]="authStore.loading()"
   ```

4. **Display errors** to users:
   ```typescript
   @if (authStore.error()) {
     <div>{{ authStore.error() }}</div>
   }
   ```

5. **Use guards** to protect routes:
   ```typescript
   canActivate: [authGuard]
   ```

### ❌ Don'ts

1. **Don't subscribe manually**:
   ```typescript
   // ❌ Wrong
   authStore.login(creds).subscribe();
   
   // ✅ Correct
   authStore.login(creds);
   ```

2. **Don't manage tokens manually**:
   ```typescript
   // ❌ Wrong
   localStorage.setItem('token', token);
   
   // ✅ Correct - Store handles it
   authStore.login(credentials);
   ```

3. **Don't call restoreAuthState manually** - it's automatic via `withHooks`

---

## Troubleshooting

### User not persisting after refresh?
- ✅ Check browser localStorage for `auth_token` and `auth_user`
- ✅ Verify `withHooks.onInit` is calling `restoreAuthState()`

### Token not added to requests?
- ✅ Verify `authInterceptor` is configured in `app.config.ts`
- ✅ Check `authStore.accessToken()` has a value

### Redirects not working?
- ✅ Verify guards are applied to routes
- ✅ Check `Router` is imported and working

### TypeScript errors with store methods?
- ✅ Ensure `AuthStore` is imported from `core/auth.store`
- ✅ Check relative import paths are correct

---

## Files Created

```
src/app/
├── core/
│   └── auth.store.ts                    # Main Auth Signal Store
├── shared/
│   ├── guards/
│   │   └── auth.guard.ts                # Auth + Guest guards
│   └── interceptors/
│       └── auth.interceptor.ts          # JWT token interceptor
└── features/
    └── auth/
        ├── login/
        │   └── login.component.ts       # Login form component
        └── register/
            └── register.component.ts    # Registration form component
```

---

## Summary

The AuthSignalStore provides a complete, production-ready authentication system with:
- ✅ Zero manual subscriptions in components
- ✅ Automatic state persistence and restoration
- ✅ Built-in loading and error states
- ✅ HTTP interceptor for token injection
- ✅ Route guards for access control
- ✅ Type-safe and reactive design

**Everything is handled automatically - just call the methods and use the signals!**
