# UsersStore Usage Guide

## Overview

The `UsersStore` is a centralized NgRx signal store for managing user state in the Project Manager application. It provides a reactive, type-safe way to handle user data with built-in support for pagination, filtering, searching, and CRUD operations.

## Features

- ✅ Server-side pagination
- ✅ Filter by role (ADMIN, MANAGER, USER)
- ✅ Filter by active status
- ✅ Search by name or email
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Activate/Deactivate users
- ✅ Computed signals for derived state
- ✅ Automatic loading states and error handling
- ✅ Role-based access control (enforced at component level)

---

## Quick Start

### 1. Import and Inject the Store

```typescript
import { Component, inject } from '@angular/core';
import { UsersStore } from '@features/users/store/users.store';
import { UserRole } from '@features/users/models/user';

@Component({
  selector: 'app-users-list',
  template: `...`,
})
export class UsersListComponent {
  readonly store = inject(UsersStore);

  ngOnInit() {
    // Load users on component initialization
    this.store.loadUsers();
  }
}
```

### 2. Access State in Templates

```html
<!-- Display users -->
@if (store.loading()) {
  <mat-spinner></mat-spinner>
} @else if (store.hasError()) {
  <div class="error">{{ store.error() }}</div>
} @else {
  <div class="users-list">
    @for (user of store.users(); track user._id) {
      <div class="user-card">
        <h3>{{ user.First_Name }} {{ user.Last_Name }}</h3>
        <p>{{ user.email }} - {{ user.role }}</p>
        <mat-chip [class.inactive]="!user.isActive">
          {{ user.isActive ? 'Active' : 'Inactive' }}
        </mat-chip>
      </div>
    }
  </div>
}

<!-- Pagination info -->
<div class="pagination-info">
  {{ store.paginationInfo().showing }}
</div>
```

---

## State Properties

### Core State

| Property | Type | Description |
|----------|------|-------------|
| `users()` | `User[]` | Array of users |
| `selectedUser()` | `User \| null` | Currently selected user |
| `loading()` | `boolean` | Loading state |
| `error()` | `string \| null` | Error message if any |
| `searchTerm()` | `string` | Current search term |

### Filters

| Property | Type | Description |
|----------|------|-------------|
| `filters().role` | `UserRole \| undefined` | Filter by role |
| `filters().isActive` | `boolean \| undefined` | Filter by active status |

### Pagination

| Property | Type | Description |
|----------|------|-------------|
| `pagination().currentPage` | `number` | Current page number |
| `pagination().totalPages` | `number` | Total number of pages |
| `pagination().totalItems` | `number` | Total number of users |
| `pagination().itemsPerPage` | `number` | Items per page |
| `pagination().hasNextPage` | `boolean` | Has next page |
| `pagination().hasPreviousPage` | `boolean` | Has previous page |

---

## Computed Signals

### User Lists

```typescript
// Get only active users
const activeUsers = this.store.activeUsers();

// Get only inactive users
const inactiveUsers = this.store.inactiveUsers();

// Get users grouped by role
const byRole = this.store.usersByRole();
console.log(byRole.admins);    // Admin users
console.log(byRole.managers);  // Manager users
console.log(byRole.users);     // Regular users
```

### Counts and Statistics

```typescript
// Get count of users by role
const counts = this.store.userCountsByRole();
console.log(`Admins: ${counts.admins}`);
console.log(`Managers: ${counts.managers}`);
console.log(`Users: ${counts.users}`);

// Get active vs inactive counts
const statusCounts = this.store.userStatusCounts();
console.log(`Active: ${statusCounts.active}`);
console.log(`Inactive: ${statusCounts.inactive}`);
console.log(`Total: ${statusCounts.total}`);
```

### UI Helpers

```typescript
// Check if filters are applied
const hasFilters = this.store.hasActiveFilters();

// Check loading state
const isLoading = this.store.isLoading();

// Check for errors
const hasError = this.store.hasError();

// Get formatted pagination info
const info = this.store.paginationInfo();
console.log(info.showing); // "1-10 of 45"
```

---

## CRUD Operations

### Load Users

```typescript
// Load users with current filters
this.store.loadUsers();

// The store automatically applies:
// - Current pagination (page, limit)
// - Active filters (role, isActive)
// - Search term
```

### Load Single User

```typescript
// Load a specific user by ID
this.store.loadUser(userId);

// Access the loaded user
const user = this.store.selectedUser();
```

### Create User (ADMIN Only)

```typescript
import { CreateUserRequest, UserRole } from '@features/users/models/user';

createUser() {
  const newUser: CreateUserRequest = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    employeeId: 'EMP001',
    role: UserRole.USER,
  };

  this.store.createUser(newUser);
  
  // Store automatically reloads users after creation
}
```

### Update User

```typescript
import { UpdateUserRequest, UserRole } from '@features/users/models/user';

updateUser(userId: string) {
  const updates: UpdateUserRequest = {
    firstName: 'Jane',
    role: UserRole.MANAGER,
  };

  this.store.updateUser({ id: userId, data: updates });
  
  // User is updated in the list automatically
}
```

### Delete User

```typescript
deleteUser(userId: string) {
  this.store.deleteUser(userId);
  
  // User is removed from the list automatically
}
```

### Activate/Deactivate User

```typescript
// Deactivate a user (set isActive to false)
deactivateUser(userId: string) {
  this.store.deactivateUser(userId);
}

// Activate a user (set isActive to true)
activateUser(userId: string) {
  this.store.activateUser(userId);
}
```

---

## Filtering and Search

### Filter by Role

```typescript
import { UserRole } from '@features/users/models/user';

// Filter by specific role
filterAdmins() {
  this.store.setRoleFilter(UserRole.ADMIN);
}

filterManagers() {
  this.store.setRoleFilter(UserRole.MANAGER);
}

filterUsers() {
  this.store.setRoleFilter(UserRole.USER);
}

// Clear role filter
showAllRoles() {
  this.store.setRoleFilter(undefined);
}
```

### Filter by Active Status

```typescript
// Show only active users
showActiveUsers() {
  this.store.setActiveFilter(true);
}

// Show only inactive users
showInactiveUsers() {
  this.store.setActiveFilter(false);
}

// Show all users
showAllUsers() {
  this.store.setActiveFilter(undefined);
}
```

### Search by Name or Email

```typescript
// Search users (debounced by 300ms)
searchUsers(term: string) {
  this.store.setSearchTerm(term);
}

// Example with input binding
<mat-form-field>
  <input matInput 
         placeholder="Search users..." 
         (input)="store.setSearchTerm($event.target.value)">
</mat-form-field>
```

### Clear All Filters

```typescript
// Reset all filters and search
clearAllFilters() {
  this.store.clearFilters();
}
```

---

## Pagination

### Change Page

```typescript
// Go to next page
nextPage() {
  const current = this.store.pagination().currentPage;
  this.store.setPage(current + 1);
}

// Go to previous page
previousPage() {
  const current = this.store.pagination().currentPage;
  this.store.setPage(current - 1);
}

// Go to specific page
goToPage(page: number) {
  this.store.setPage(page);
}
```

### Change Page Size

```typescript
// Change items per page
changePageSize(size: number) {
  this.store.setPageSize(size);
}

// Example with mat-paginator
<mat-paginator 
  [length]="store.pagination().totalItems"
  [pageSize]="store.pagination().itemsPerPage"
  [pageIndex]="store.pagination().currentPage - 1"
  [pageSizeOptions]="[5, 10, 25, 50]"
  (page)="onPageChange($event)">
</mat-paginator>

onPageChange(event: PageEvent) {
  this.store.setPage(event.pageIndex + 1);
  this.store.setPageSize(event.pageSize);
}
```

---

## Complete Component Example

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsersStore } from '@features/users/store/users.store';
import { UserRole } from '@features/users/models/user';
import { AuthStore } from '@features/auth/store/auth.store';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="users-container">
      <!-- Filters -->
      <div class="filters">
        <mat-form-field>
          <mat-label>Search</mat-label>
          <input matInput 
                 [value]="store.searchTerm()"
                 (input)="store.setSearchTerm($any($event.target).value)">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Role</mat-label>
          <mat-select [value]="store.filters().role"
                      (selectionChange)="store.setRoleFilter($event.value)">
            <mat-option [value]="undefined">All Roles</mat-option>
            <mat-option [value]="UserRole.ADMIN">Admin</mat-option>
            <mat-option [value]="UserRole.MANAGER">Manager</mat-option>
            <mat-option [value]="UserRole.USER">User</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Status</mat-label>
          <mat-select [value]="store.filters().isActive"
                      (selectionChange)="store.setActiveFilter($event.value)">
            <mat-option [value]="undefined">All Users</mat-option>
            <mat-option [value]="true">Active</mat-option>
            <mat-option [value]="false">Inactive</mat-option>
          </mat-select>
        </mat-form-field>

        @if (store.hasActiveFilters()) {
          <button mat-stroked-button (click)="store.clearFilters()">
            Clear Filters
          </button>
        }
      </div>

      <!-- Stats -->
      <div class="stats">
        <div class="stat">
          <span class="label">Active:</span>
          <span class="value">{{ store.userStatusCounts().active }}</span>
        </div>
        <div class="stat">
          <span class="label">Inactive:</span>
          <span class="value">{{ store.userStatusCounts().inactive }}</span>
        </div>
        <div class="stat">
          <span class="label">Admins:</span>
          <span class="value">{{ store.userCountsByRole().admins }}</span>
        </div>
        <div class="stat">
          <span class="label">Managers:</span>
          <span class="value">{{ store.userCountsByRole().managers }}</span>
        </div>
      </div>

      <!-- Table -->
      @if (store.loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (store.hasError()) {
        <div class="error">
          {{ store.error() }}
        </div>
      } @else {
        <table mat-table [dataSource]="store.users()">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let user">
              {{ user.First_Name }} {{ user.Last_Name }}
            </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <!-- Role Column -->
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip [class]="'role-' + user.role?.toLowerCase()">
                {{ user.role }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip [class.active]="user.isActive" 
                        [class.inactive]="!user.isActive">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              @if (canEdit()) {
                <button mat-icon-button (click)="editUser(user._id!)">
                  <mat-icon>edit</mat-icon>
                </button>
              }
              
              @if (canDeactivate()) {
                @if (user.isActive) {
                  <button mat-icon-button 
                          color="warn"
                          (click)="store.deactivateUser(user._id!)">
                    <mat-icon>block</mat-icon>
                  </button>
                } @else {
                  <button mat-icon-button 
                          color="primary"
                          (click)="store.activateUser(user._id!)">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                }
              }

              @if (canDelete()) {
                <button mat-icon-button 
                        color="warn"
                        (click)="deleteUser(user._id!)">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <!-- Paginator -->
        <mat-paginator 
          [length]="store.pagination().totalItems"
          [pageSize]="store.pagination().itemsPerPage"
          [pageIndex]="store.pagination().currentPage - 1"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)">
        </mat-paginator>
      }
    </div>
  `,
})
export class UsersTableComponent {
  readonly store = inject(UsersStore);
  readonly authStore = inject(AuthStore);
  
  readonly UserRole = UserRole;
  readonly displayedColumns = ['name', 'email', 'role', 'status', 'actions'];

  // Role-based permissions
  readonly canEdit = computed(() => {
    const role = this.authStore.currentUser()?.role;
    return role === UserRole.ADMIN || role === UserRole.MANAGER;
  });

  readonly canDeactivate = computed(() => {
    return this.authStore.currentUser()?.role === UserRole.ADMIN;
  });

  readonly canDelete = computed(() => {
    return this.authStore.currentUser()?.role === UserRole.ADMIN;
  });

  ngOnInit() {
    this.store.loadUsers();
  }

  onPageChange(event: PageEvent) {
    if (event.pageSize !== this.store.pagination().itemsPerPage) {
      this.store.setPageSize(event.pageSize);
    } else {
      this.store.setPage(event.pageIndex + 1);
    }
  }

  editUser(userId: string) {
    // Navigate to edit page or open dialog
  }

  deleteUser(userId: string) {
    // Show confirmation dialog then delete
    this.store.deleteUser(userId);
  }
}
```

---

## API Query Parameters

When filters are applied, the store constructs query parameters:

```
GET /api/users?page=1&limit=10&role=ADMIN&isActive=true&search=john
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Current page number (1-indexed) |
| `limit` | number | Items per page |
| `role` | string | Filter by role (ADMIN, MANAGER, USER) |
| `isActive` | boolean | Filter by active status |
| `search` | string | Search term for name/email |

---

## Best Practices

### 1. Use Computed Signals

```typescript
// ✅ Good - reactive and efficient
const activeCount = this.store.userStatusCounts().active;

// ❌ Avoid - manual filtering
const activeCount = this.store.users().filter(u => u.isActive).length;
```

### 2. Single API Call Per Filter Change

```typescript
// ✅ Good - store handles the reload
filterByRole(role: UserRole) {
  this.store.setRoleFilter(role);
  // Store automatically calls loadUsers()
}

// ❌ Avoid - double API call
filterByRole(role: UserRole) {
  this.store.setRoleFilter(role);
  this.store.loadUsers(); // Unnecessary - already called internally
}
```

### 3. Role-Based Access Control

```typescript
// Check user role before showing actions
@Component({
  template: `
    @if (canCreateUser()) {
      <button (click)="createUser()">Create User</button>
    }
  `
})
export class UsersComponent {
  readonly authStore = inject(AuthStore);
  
  canCreateUser = computed(() => 
    this.authStore.currentUser()?.role === UserRole.ADMIN
  );
}
```

### 4. Error Handling

```typescript
// Display errors to users
@if (store.hasError()) {
  <mat-error>{{ store.error() }}</mat-error>
  <button (click)="store.clearError()">Dismiss</button>
}
```

### 5. Cleanup

```typescript
// Clear selected user when leaving detail view
ngOnDestroy() {
  this.store.clearSelectedUser();
}
```

---

## Troubleshooting

### Users Not Loading

```typescript
// Check if loadUsers() is called
ngOnInit() {
  this.store.loadUsers(); // Make sure this is called
}

// Check for errors
console.log('Has Error:', this.store.hasError());
console.log('Error:', this.store.error());
```

### Filters Not Working

```typescript
// Ensure filters trigger reload
this.store.setRoleFilter(UserRole.ADMIN); // Should auto-reload

// Check current filters
console.log('Current filters:', this.store.filters());
```

### Pagination Issues

```typescript
// Page is 1-indexed in store, 0-indexed in mat-paginator
<mat-paginator 
  [pageIndex]="store.pagination().currentPage - 1"  <!-- Note the -1 -->
  (page)="store.setPage($event.pageIndex + 1)">    <!-- Note the +1 -->
</mat-paginator>
```

---

## Migration from Old Service

### Before (Component with UserService)

```typescript
export class UsersComponent {
  users: User[] = [];
  loading = false;

  constructor(private userService: UserService) {}

  loadUsers() {
    this.loading = true;
    this.userService.getUsersList().subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
```

### After (Component with UsersStore)

```typescript
export class UsersComponent {
  readonly store = inject(UsersStore);

  ngOnInit() {
    this.store.loadUsers();
  }
}

// Template
<div>
  @if (store.loading()) {
    <mat-spinner></mat-spinner>
  } @else {
    @for (user of store.users(); track user._id) {
      <div>{{ user.First_Name }}</div>
    }
  }
</div>
```

---

## Related Documentation

- [TasksStore Usage Guide](./TASKS_STORE_USAGE.md)
- [ProjectsStore Documentation](./features/projects/store/README.md)
- [NgRx Signals Documentation](https://ngrx.io/guide/signals)
