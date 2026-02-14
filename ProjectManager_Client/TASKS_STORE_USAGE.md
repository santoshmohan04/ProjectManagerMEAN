# TasksStore Usage Guide

Complete guide for using the TasksSignalStore in your Angular components.

## Overview

TasksStore is a NgRx Signal Store that manages task state with:
- Server-side pagination
- Advanced filtering (status, priority, project, assignedTo)
- CRUD operations
- Bulk operations
- Status transitions
- Type-safe signals

## Quick Start

```typescript
import { Component, inject } from '@angular/core';
import { TasksStore } from './store/tasks.store';

@Component({
  selector: 'app-tasks',
  standalone: true,
  template: `
    <h2>Tasks ({{ tasksStore.pagination().totalItems }})</h2>
    
    @if (tasksStore.loading()) {
      <p>Loading...</p>
    }
    
    @for (task of tasksStore.tasks(); track task._id) {
      <div>{{ task.Title }} - {{ task.Status }}</div>
    }
  `
})
export class TasksComponent {
  tasksStore = inject(TasksStore);
}
```

## State Properties

All state is accessed as **signals**:

```typescript
// Task list
tasksStore.tasks()              // Task[] - all tasks
tasksStore.hasTasks()           // boolean - has any tasks
tasksStore.selectedTask()       // Task | null - currently selected

// Pagination
tasksStore.pagination()         // PaginationMeta
tasksStore.hasMorePages()       // boolean
tasksStore.hasPreviousPage()    // boolean

// Filters
tasksStore.filters()            // TaskFilters
tasksStore.hasActiveFilters()   // boolean

// Loading state
tasksStore.loading()            // boolean
tasksStore.error()              // string | null
```

## Computed Signals

### Filter Tasks

```typescript
// All filtered tasks (client-side)
tasksStore.filteredTasks()

// By status
tasksStore.openTasks()
tasksStore.inProgressTasks()
tasksStore.completedTasks()
tasksStore.blockedTasks()

// By priority
tasksStore.highPriorityTasks()    // priority >= 8
tasksStore.mediumPriorityTasks()  // 4 <= priority < 8
tasksStore.lowPriorityTasks()     // priority < 4

// Overdue tasks
tasksStore.overdueTasks()
```

## Loading Tasks

### Basic Load

```typescript
// Load with defaults (page 1, 10 items)
tasksStore.loadTasks({});

// With pagination
tasksStore.loadTasks({
  page: 2,
  limit: 25
});
```

### With Sorting

```typescript
// Sort by priority descending
tasksStore.loadTasks({
  page: 1,
  limit: 10,
  sort: 'priority:desc'
});

// Sort by due date ascending
tasksStore.loadTasks({
  sort: 'End_Date:asc'
});

// Multiple sort fields (backend permitting)
tasksStore.loadTasks({
  sort: 'Status:asc,Priority:desc'
});
```

### With Filters

```typescript
import { TaskStatus } from './models/task';

// Single filter
tasksStore.loadTasks({
  filters: {
    status: TaskStatus.InProgress
  }
});

// Multiple filters
tasksStore.loadTasks({
  page: 1,
  limit: 20,
  filters: {
    search: 'bug fix',
    status: TaskStatus.Open,
    priority: 8,
    project: 'project-uuid-123',
    assignedTo: 'user-uuid-456'
  }
});
```

## CRUD Operations

### Create Task

```typescript
import { TaskStatus } from './models/task';

tasksStore.createTask({
  Title: 'Implement new feature',
  Description: 'Add user authentication',
  Start_Date: '2026-02-14',
  End_Date: '2026-02-28',
  Priority: 8,
  Status: TaskStatus.Open,
  Project: 'project-uuid',
  User: 'user-uuid',
  Parent: null
});
```

### Update Task

```typescript
tasksStore.updateTask({
  uuid: 'task-uuid',
  payload: {
    Status: TaskStatus.InProgress,
    Priority: 9
  }
});
```

### Delete Task

```typescript
tasksStore.deleteTask('task-uuid');
```

### Load Single Task

```typescript
tasksStore.loadTask('task-uuid');
// Access via: tasksStore.selectedTask()
```

## Bulk Operations

### Bulk Update

```typescript
// Update multiple tasks at once
tasksStore.bulkUpdateTasks({
  taskIds: ['task-1', 'task-2', 'task-3'],
  updates: {
    Status: TaskStatus.Completed,
    Priority: 5
  }
});
```

### Bulk Delete

```typescript
// Delete multiple tasks
tasksStore.bulkDeleteTasks([
  'task-1',
  'task-2',
  'task-3'
]);
```

## Status Transitions

Helper methods for common status changes:

```typescript
// Mark as in progress
tasksStore.markTaskAsInProgress('task-uuid');

// Mark as completed
tasksStore.markTaskAsCompleted('task-uuid');

// Mark as blocked
tasksStore.markTaskAsBlocked('task-uuid');

// Reopen task
tasksStore.reopenTask('task-uuid');
```

## Filter Management

### Set Filters

```typescript
import { TaskStatus } from './models/task';

// Set filters (triggers reload)
tasksStore.setFilters({
  status: TaskStatus.InProgress,
  priority: 8,
  project: 'project-uuid'
});
```

### Clear Filters

```typescript
// Remove all filters (triggers reload)
tasksStore.clearFilters();
```

## Pagination

### Navigate Pages

```typescript
// Go to specific page
tasksStore.goToPage(3);

// Next page
tasksStore.nextPage();

// Previous page
tasksStore.previousPage();
```

### Change Page Size

```typescript
// Change items per page (reloads from page 1)
tasksStore.setItemsPerPage(50);
```

## UI State Management

### Selected Task

```typescript
// Set selected task
const task = tasksStore.tasks()[0];
tasksStore.setSelectedTask(task);

// Clear selection
tasksStore.setSelectedTask(null);

// Access selected
const selected = tasksStore.selectedTask();
```

### Error Handling

```typescript
// Clear error message
tasksStore.clearError();

// Check for errors in template
@if (tasksStore.error()) {
  <div class="error">{{ tasksStore.error() }}</div>
}
```

### Refresh

```typescript
// Reload current page with current filters
tasksStore.refreshTasks();
```

## Complete Component Example

```typescript
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksStore, TaskStatus } from './store/tasks.store';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tasks-container">
      <!-- Filters -->
      <div class="filters">
        <input
          type="text"
          placeholder="Search tasks..."
          (input)="onSearch($event)"
        />
        
        <select (change)="onStatusFilter($event)">
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Blocked">Blocked</option>
        </select>

        @if (tasksStore.hasActiveFilters()) {
          <button (click)="clearFilters()">Clear Filters</button>
        }
      </div>

      <!-- Loading State -->
      @if (tasksStore.loading()) {
        <div class="loading">Loading tasks...</div>
      }

      <!-- Error State -->
      @if (tasksStore.error()) {
        <div class="error">
          {{ tasksStore.error() }}
          <button (click)="retry()">Retry</button>
        </div>
      }

      <!-- Tasks List -->
      <div class="tasks-list">
        @for (task of tasksStore.tasks(); track task._id) {
          <div class="task-card" (click)="selectTask(task)">
            <h3>{{ task.Title }}</h3>
            <p>{{ task.Description }}</p>
            <div class="task-meta">
              <span class="status">{{ task.Status }}</span>
              <span class="priority">Priority: {{ task.Priority }}</span>
              <span class="due-date">Due: {{ task.End_Date | date }}</span>
            </div>
            <div class="actions">
              <button (click)="markInProgress(task._id); $event.stopPropagation()">
                Start
              </button>
              <button (click)="markCompleted(task._id); $event.stopPropagation()">
                Complete
              </button>
              <button (click)="deleteTask(task._id); $event.stopPropagation()">
                Delete
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            @if (tasksStore.hasActiveFilters()) {
              <p>No tasks match your filters</p>
              <button (click)="clearFilters()">Clear Filters</button>
            } @else {
              <p>No tasks found</p>
              <button (click)="createNewTask()">Create Task</button>
            }
          </div>
        }
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button
          [disabled]="!tasksStore.hasPreviousPage()"
          (click)="previousPage()"
        >
          Previous
        </button>
        
        <span>
          Page {{ tasksStore.pagination().currentPage }} of
          {{ tasksStore.pagination().totalPages }}
          ({{ tasksStore.pagination().totalItems }} total)
        </span>
        
        <button
          [disabled]="!tasksStore.hasMorePages()"
          (click)="nextPage()"
        >
          Next
        </button>
        
        <select
          [value]="tasksStore.pagination().itemsPerPage"
          (change)="onPageSizeChange($event)"
        >
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>

      <!-- Summary Stats -->
      <div class="stats">
        <div class="stat">
          <span class="label">Open:</span>
          <span class="value">{{ tasksStore.openTasks().length }}</span>
        </div>
        <div class="stat">
          <span class="label">In Progress:</span>
          <span class="value">{{ tasksStore.inProgressTasks().length }}</span>
        </div>
        <div class="stat">
          <span class="label">Completed:</span>
          <span class="value">{{ tasksStore.completedTasks().length }}</span>
        </div>
        <div class="stat">
          <span class="label">Overdue:</span>
          <span class="value">{{ tasksStore.overdueTasks().length }}</span>
        </div>
      </div>
    </div>
  `
})
export class TasksListComponent {
  tasksStore = inject(TasksStore);

  onSearch(event: Event): void {
    const search = (event.target as HTMLInputElement).value;
    this.tasksStore.setFilters({
      ...this.tasksStore.filters(),
      search
    });
  }

  onStatusFilter(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.tasksStore.setFilters({
      ...this.tasksStore.filters(),
      status: status || undefined
    });
  }

  clearFilters(): void {
    this.tasksStore.clearFilters();
  }

  selectTask(task: any): void {
    this.tasksStore.setSelectedTask(task);
  }

  markInProgress(taskId: string): void {
    this.tasksStore.markTaskAsInProgress(taskId);
  }

  markCompleted(taskId: string): void {
    this.tasksStore.markTaskAsCompleted(taskId);
  }

  deleteTask(taskId: string): void {
    if (confirm('Delete this task?')) {
      this.tasksStore.deleteTask(taskId);
    }
  }

  previousPage(): void {
    this.tasksStore.previousPage();
  }

  nextPage(): void {
    this.tasksStore.nextPage();
  }

  onPageSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value);
    this.tasksStore.setItemsPerPage(size);
  }

  retry(): void {
    this.tasksStore.refreshTasks();
  }

  createNewTask(): void {
    // Navigate to create task page
  }
}
```

## Backend Query Params

The store sends these query parameters:

```
GET /tasks?page=1&limit=10&sort=priority:desc&status=Open&priority=8&project=uuid&assignedTo=uuid&search=keyword
```

## API Response Contract

Expected backend response format:

```typescript
{
  data: {
    data: Task[],
    meta: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10
    }
  }
}

// Or simplified:
{
  data: Task[]
}
```

## Best Practices

1. **Use signals directly in templates** - No need for subscriptions
2. **Debounced search** - Search input is automatically debounced (300ms)
3. **Filter changes reset to page 1** - Prevents empty results
4. **Bulk operations** - Use for better performance
5. **Status helpers** - Use convenience methods for status changes
6. **Error handling** - Always check `tasksStore.error()` in UI

## Migration from Service

Before (with service):
```typescript
export class TasksComponent implements OnInit, OnDestroy {
  tasks$ = new BehaviorSubject<Task[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  destroy$ = new Subject<void>();

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => this.tasks$.next(tasks));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

After (with store):
```typescript
export class TasksComponent {
  tasksStore = inject(TasksStore);
  // That's it! No subscriptions, no cleanup
}
```

## Performance Tips

1. **Use computed selectors** - `openTasks()`, `highPriorityTasks()`, etc.
2. **Server-side filtering** - For large datasets, use `setFilters()`
3. **Pagination** - Keep page sizes reasonable (10-50 items)
4. **Bulk operations** - Update/delete multiple items at once
5. **Refresh sparingly** - Auto-updates on create/update/delete

## Related Stores

- `ProjectsStore` - For project management
- `AuthStore` - For user authentication
- `UsersStore` - For user management (if implemented)
