# ProjectsStore Usage Guide

## Overview

The `ProjectsStore` is a NgRx Signal Store that manages all project-related state including projects list, pagination, filters, and CRUD operations. It follows the same patterns as `AuthStore` for consistency across the application.

## Key Features

- ✅ **Pagination**: Backend pagination with customizable page size
- ✅ **Filters**: Search, status, priority, and manager filters with debounce
- ✅ **CRUD Operations**: Create, Read, Update, Delete, and Archive projects
- ✅ **Computed Signals**: Derived state for filtered projects and statistics
- ✅ **Auto-loading**: Projects load automatically on initialization
- ✅ **Type-safe**: Full TypeScript support with enums and interfaces

## Getting Started

### 1. Inject the Store

```typescript
import { Component, inject } from '@angular/core';
import { ProjectsStore } from './features/projects/store/projects.store';

@Component({
  // ...
})
export class MyComponent {
  projectsStore = inject(ProjectsStore);
}
```

### 2. Access State via Signals

```typescript
// Get projects array
const projects = this.projectsStore.projects();

// Check loading state
const isLoading = this.projectsStore.loading();

// Get error message
const error = this.projectsStore.error();

// Get pagination info
const pagination = this.projectsStore.pagination();
console.log(pagination.currentPage, pagination.totalPages);

// Get current filters
const filters = this.projectsStore.filters();
```

### 3. Use Computed Signals

```typescript
// Check if projects exist
const hasProjects = this.projectsStore.hasProjects();

// Check if filters are active
const hasFilters = this.projectsStore.hasActiveFilters();

// Get filtered projects by status
const planningProjects = this.projectsStore.planningProjects();
const activeProjects = this.projectsStore.activeProjects();
const completedProjects = this.projectsStore.completedProjects();

// Check pagination state
const canGoNext = this.projectsStore.hasMorePages();
const canGoPrev = this.projectsStore.hasPreviousPage();
```

## CRUD Operations

### Load Projects

```typescript
// Load first page with default filters
this.projectsStore.loadProjects({ page: 1, limit: 10 });

// Load with custom filters
this.projectsStore.loadProjects({
  page: 1,
  limit: 25,
  filters: {
    search: 'website',
    status: ProjectStatus.ACTIVE,
    priority: 10
  }
});

// Refresh current page
this.projectsStore.refreshProjects();
```

### Load Single Project

```typescript
this.projectsStore.loadProject(projectId);
// Selected project will be available in: this.projectsStore.selectedProject()
```

### Create Project

```typescript
const newProject: ProjectPayload = {
  Project: 'New Website',
  Start_Date: new Date().toISOString(),
  End_Date: new Date('2024-12-31').toISOString(),
  Priority: 10,
  Manager_ID: managerId
};

this.projectsStore.createProject(newProject);
```

### Update Project

```typescript
const updates: Partial<ProjectPayload> = {
  Priority: 5,
  End_Date: new Date('2024-06-30').toISOString()
};

this.projectsStore.updateProject(projectId, updates);
```

### Archive Project

```typescript
// Soft delete - sets isArchived flag
this.projectsStore.archiveProject(projectId);
```

### Delete Project

```typescript
// Hard delete - removes from database
this.projectsStore.deleteProject(projectId);
```

## Filtering & Pagination

### Set Filters

```typescript
// Set individual filters (debounced search)
this.projectsStore.setFilters({
  search: 'website',
  status: ProjectStatus.ACTIVE,
  priority: 10
});

// Clear all filters
this.projectsStore.clearFilters();
```

### Navigate Pages

```typescript
// Go to specific page
this.projectsStore.goToPage(3);

// Next/Previous page
this.projectsStore.nextPage();
this.projectsStore.previousPage();

// Change page size
this.projectsStore.setItemsPerPage(25);
```

## Template Usage

### Display Loading State

```typescript
@if (projectsStore.loading()) {
  <mat-spinner></mat-spinner>
}
```

### Display Error

```typescript
@if (projectsStore.error()) {
  <div class="error">{{ projectsStore.error() }}</div>
}
```

### Display Projects

```typescript
@if (projectsStore.hasProjects()) {
  <table>
    @for (project of projectsStore.projects(); track project._id) {
      <tr>
        <td>{{ project.Project }}</td>
        <td>{{ project.Priority }}</td>
      </tr>
    }
  </table>
}
```

### Display Empty State

```typescript
@if (!projectsStore.loading() && !projectsStore.hasProjects()) {
  <div class="empty-state">
    <p>No projects found</p>
    <button (click)="createProject()">Create Project</button>
  </div>
}
```

### Pagination Controls

```typescript
<mat-paginator
  [length]="projectsStore.pagination().totalItems"
  [pageSize]="projectsStore.pagination().itemsPerPage"
  [pageIndex]="projectsStore.pagination().currentPage - 1"
  [pageSizeOptions]="[5, 10, 25, 50]"
  (page)="onPageChange($event)"
>
</mat-paginator>

// Component method
onPageChange(event: PageEvent): void {
  if (event.pageSize !== this.projectsStore.pagination().itemsPerPage) {
    this.projectsStore.setItemsPerPage(event.pageSize);
  } else {
    this.projectsStore.goToPage(event.pageIndex + 1);
  }
}
```

## Example Component

See [projects-list-example.component.ts](./ProjectManager_Client/src/app/features/projects/components/projects-list-example/projects-list-example.component.ts) for a complete working example with:
- Material Design table
- Search and filter controls
- Pagination
- CRUD operations
- Summary cards
- Loading/error states

## Project Status Enum

```typescript
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}
```

## Best Practices

### ✅ DO:
- Inject the store at component level
- Use signals directly in templates with `()`
- Leverage computed signals for derived state
- Handle errors in the UI
- Use the archive feature instead of hard delete when appropriate

### ❌ DON'T:
- Subscribe to signals (they're not observables)
- Mutate state directly - always use store methods
- Create nested subscriptions
- Forget to check loading/error states in templates

## Backend API Contract

The store expects these endpoints:

```
GET    /api/projects?page=1&limit=10&search=...&status=...&priority=...
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
PATCH  /api/projects/:id/archive
```

Response format:
```typescript
{
  success: boolean,
  data: Project | Project[],
  pagination?: {
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number
  }
}
```

## Performance Tips

1. **Debounced Search**: Search filter has 300ms debounce to reduce API calls
2. **Auto-loading**: Projects load on initialization - no manual trigger needed
3. **Computed Signals**: Status-filtered lists (planning, active, completed) are computed once and cached
4. **Backend Pagination**: Only loads requested page size, not entire dataset

## Migration Guide

If you're migrating from service-based approach to ProjectsStore:

**Before:**
```typescript
constructor(private projectService: ProjectService) {}

ngOnInit() {
  this.projectService.getProjects().subscribe(projects => {
    this.projects = projects;
  });
}
```

**After:**
```typescript
projectsStore = inject(ProjectsStore);

// Projects auto-load, just use them:
// this.projectsStore.projects()
```

## Related Files

- [projects.store.ts](./ProjectManager_Client/src/app/features/projects/store/projects.store.ts) - Store implementation
- [project.ts](./ProjectManager_Client/src/app/features/projects/models/project.ts) - Type definitions
- [projects-list-example.component.ts](./ProjectManager_Client/src/app/features/projects/components/projects-list-example/projects-list-example.component.ts) - Example usage

## See Also

- [AUTH_STORE_DOCUMENTATION.md](./AUTH_STORE_DOCUMENTATION.md) - AuthStore documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall architecture
