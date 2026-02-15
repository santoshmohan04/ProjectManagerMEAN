# App Shell Implementation

## Overview
Modern enterprise application shell with Angular Material components, featuring role-based navigation and signal-based state management.

## Features

### 1. Layout Components
- **Left Sidebar Navigation**: Collapsible side navigation with Material Design
- **Top Toolbar**: Displays app name, current user info, and logout button
- **Main Content Area**: Router outlet for feature modules
- **Responsive Design**: Mobile-friendly with adaptive layouts

### 2. Angular Material Components Used
- `mat-sidenav-container`: Main layout container
- `mat-sidenav`: Side navigation drawer
- `mat-toolbar`: Top application toolbar
- `mat-nav-list`: Navigation menu list
- `mat-icon`: Material icons throughout
- `mat-button`: Action buttons

### 3. Role-Based Navigation

#### Admin Role
- Dashboard
- Projects
- Tasks
- Users
- Audit Log

#### Manager Role
- Dashboard
- Projects
- Tasks

#### User Role
- Dashboard
- My Tasks

### 4. Signal-Based State Management

The app uses `@ngrx/signals` for reactive state management:

#### AuthStore Signals
```typescript
- currentUser: CurrentUser | null
- isAuthenticated: boolean
- isSidebarOpen: boolean
- isAdmin: computed
- isManager: computed
- isUser: computed
- userFullName: computed
```

#### AuthStore Methods
```typescript
- setCurrentUser(user: CurrentUser | null)
- toggleSidebar()
- setSidebarOpen(isOpen: boolean)
- logout()
```

## Usage

### Setting Current User
```typescript
import { AuthStore } from './core/auth.store';

constructor() {
  const authStore = inject(AuthStore);
  
  authStore.setCurrentUser({
    uuid: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: UserRole.ADMIN,
    fullName: 'John Doe'
  });
}
```

### Checking User Role
```typescript
const authStore = inject(AuthStore);

if (authStore.isAdmin()) {
  // Admin-specific logic
}
```

### Toggle Sidebar
```typescript
authStore.toggleSidebar();
// or
authStore.setSidebarOpen(false);
```

## Styling

The app shell uses a modern dark sidebar with a light blue accent color:
- Sidebar: Dark gray (#263238)
- Active Link: Light blue (#4fc3f7)
- Content Area: Light gray background (#f5f5f5)
- Toolbar: Material primary color

## File Structure

```
src/app/
├── core/
│   ├── auth.store.ts          # Authentication state management
│   └── app.store.ts           # Global app state
├── app.component.ts           # Main app shell component
├── app.component.html         # App shell template
├── app.component.scss         # App shell styles
└── app.routes.ts              # Application routing
```

## Next Steps

1. **Implement Real Authentication**: Replace mock user data with actual authentication service
2. **Add Auth Guards**: Protect routes based on user roles
3. **Persist Auth State**: Use localStorage or session storage for auth persistence
4. **Add Loading States**: Show loading indicators during navigation
5. **Implement Logout Logic**: Add proper logout functionality with API calls
6. **Enhance Dashboard**: Add real metrics and data visualization
7. **Add User Profile**: Create user profile component accessible from toolbar

## Development Notes

- The current implementation uses a mock user (Admin role) for demonstration
- Navigation items are filtered based on the current user's role
- The sidebar state is reactive and persists during the session
- All components are standalone for better tree-shaking
