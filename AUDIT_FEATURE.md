# Audit Feature Documentation

## Overview
The Audit feature provides comprehensive tracking and monitoring of all system activities, changes, and user actions across the application. It includes three main views with a beautiful timeline UI, expandable change details, date range filtering, and pagination.

## Architecture

### Signal Store Pattern
The feature uses NgRx Signals for state management, following the same pattern as the Tasks, Projects, Users, and Dashboard features.

### File Structure
```
audit/
├── models/
│   └── audit.ts                        # Type definitions and interfaces
├── services/
│   └── audit.service.ts                # API service for audit endpoints
├── store/
│   └── audit.store.ts                  # Signal store for state management
├── components/
│   ├── audit-timeline/                 # Shared timeline UI component
│   │   ├── audit-timeline.component.ts
│   │   ├── audit-timeline.component.html
│   │   └── audit-timeline.component.scss
│   ├── entity-history/                 # Entity history view
│   │   ├── entity-history.component.ts
│   │   ├── entity-history.component.html
│   │   └── entity-history.component.scss
│   ├── user-activity/                  # User activity log view
│   │   ├── user-activity.component.ts
│   │   ├── user-activity.component.html
│   │   └── user-activity.component.scss
│   └── recent-activity/                # Recent activity feed view
│       ├── recent-activity.component.ts
│       ├── recent-activity.component.html
│       └── recent-activity.component.scss
├── audit.component.ts                  # Container component with navigation
├── audit.component.html
└── audit.component.scss
```

## API Endpoints

### GET /audit/entity/:entityType/:entityId
Get audit history for a specific entity (PROJECT, TASK, or USER).

**Query Parameters:**
- `limit` (number, optional): Maximum records to return (default: 50)
- `skip` (number, optional): Number of records to skip (default: 0)
- `startDate` (ISO string, optional): Filter from date
- `endDate` (ISO string, optional): Filter to date

**Response:**
```typescript
{
  success: true,
  data: AuditLog[]
}
```

### GET /audit/user/:userId
Get audit activity for a specific user.

**Query Parameters:**
- `limit` (number, optional): Maximum records to return (default: 50)
- `skip` (number, optional): Number of records to skip (default: 0)
- `startDate` (ISO string, optional): Filter from date
- `endDate` (ISO string, optional): Filter to date

**Response:**
```typescript
{
  success: true,
  data: AuditLog[]
}
```

### GET /audit/recent
Get recent audit activity across all entities and users.

**Query Parameters:**
- `limit` (number, optional): Maximum records to return (default: 100, max: 500)

**Response:**
```typescript
{
  success: true,
  data: AuditLog[]
}
```

## Data Models

### AuditLog
```typescript
interface AuditLog {
  uuid: string;
  entityType: EntityType;     // 'PROJECT' | 'TASK' | 'USER'
  entityId: string;            // UUID of the affected entity
  action: AuditAction;         // 'CREATE' | 'UPDATE' | 'DELETE'
  changes: {
    before?: any;              // State before change
    after?: any;               // State after change
  };
  performedBy?: AuditLogUser;  // User who performed the action
  timestamp: string;           // ISO date string
  ipAddress?: string;          // IP address of user
  userAgent?: string;          // Browser user agent
}
```

### EntityType Enum
```typescript
enum EntityType {
  PROJECT = 'PROJECT',
  TASK = 'TASK',
  USER = 'USER',
}
```

### AuditAction Enum
```typescript
enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
```

## Components

### 1. Entity History Component

**Route:** `/audit/entity`

**Purpose:** View complete audit history for a specific entity.

**Features:**
- Entity type selector (PROJECT, TASK, USER)
- Entity ID input field
- Date range filter
- Pagination controls
- Timeline view showing all changes

**Usage:**
```typescript
// Navigate with query params
this.router.navigate(['/audit/entity'], {
  queryParams: {
    entityType: 'PROJECT',
    entityId: 'some-uuid',
  },
});
```

**Key Methods:**
- `loadHistory()` - Load entity audit logs
- `applyDateFilter()` - Apply date range filter
- `clearDateFilter()` - Clear date filters
- `nextPage()` / `previousPage()` - Navigate pages

### 2. User Activity Component

**Route:** `/audit/user`

**Purpose:** View all activities performed by a specific user.

**Features:**
- User ID input field
- Date range filter
- User profile display
- Activity statistics (by action type and entity type)
- Pagination controls
- Timeline view

**Usage:**
```typescript
// Navigate with query params
this.router.navigate(['/audit/user'], {
  queryParams: {
    userId: 'user-id-or-uuid',
  },
});
```

**Key Methods:**
- `loadActivity()` - Load user activity logs
- `applyDateFilter()` - Apply date range filter
- `clearDateFilter()` - Clear date filters
- `getActivityStats()` - Calculate statistics

### 3. Recent Activity Component

**Route:** `/audit/recent`

**Purpose:** Monitor recent system activity across all entities and users.

**Features:**
- Configurable record limit (50, 100, 200, 500)
- Client-side filtering by entity type
- Client-side filtering by action type
- Activity overview statistics
- Auto-load on initialization
- Real-time refresh
- Timeline view

**Usage:**
```typescript
// Navigate to recent activity
this.router.navigate(['/audit/recent']);
```

**Key Methods:**
- `loadActivity()` - Load recent audit logs
- `refresh()` - Reload activity feed
- `clearFilters()` - Clear client-side filters
- `getActivityStats()` - Calculate statistics

### 4. Audit Timeline Component (Shared)

**Selector:** `<app-audit-timeline>`

**Purpose:** Reusable timeline UI for displaying audit logs.

**Inputs:**
- `logs: AuditLog[]` (required) - Array of audit logs to display
- `showEntityInfo: boolean` (default: true) - Show/hide entity information
- `showUserInfo: boolean` (default: true) - Show/hide user information

**Features:**
- Beautiful vertical timeline with icons
- Color-coded action indicators (CREATE=green, UPDATE=blue, DELETE=red)
- Expandable change details
- Field-by-field comparison for updates
- Before/after value display
- Relative timestamps (e.g., "2 hours ago")
- Metadata display (IP address, user agent)
- Responsive design

**Usage:**
```html
<!-- Show all information -->
<app-audit-timeline [logs]="store.entityLogs()"></app-audit-timeline>

<!-- Hide entity info (useful in entity-specific views) -->
<app-audit-timeline 
  [logs]="store.entityLogs()"
  [showEntityInfo]="false">
</app-audit-timeline>

<!-- Hide user info (useful in user-specific views) -->
<app-audit-timeline 
  [logs]="store.userLogs()"
  [showUserInfo]="false">
</app-audit-timeline>
```

## AuditStore (Signal Store)

### State Properties
```typescript
{
  // Entity history
  entityLogs: AuditLog[];
  entityType: EntityType | null;
  entityId: string | null;

  // User activity
  userLogs: AuditLog[];
  userId: string | null;

  // Recent activity
  recentLogs: AuditLog[];

  // Common state
  loading: boolean;
  error: string | null;

  // Filters
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };

  // Pagination
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    hasMore: boolean;
  };
}
```

### Computed Signals

1. **isLoading:** `Signal<boolean>`
   - Whether any data is currently loading

2. **hasError:** `Signal<boolean>`
   - Whether there is an error

3. **hasEntityLogs:** `Signal<boolean>`
   - Whether entity logs are available

4. **hasUserLogs:** `Signal<boolean>`
   - Whether user logs are available

5. **hasRecentLogs:** `Signal<boolean>`
   - Whether recent logs are available

6. **hasDateFilter:** `Signal<boolean>`
   - Whether date filter is active

7. **currentPageInfo:** `Signal<{ start: number; end: number; total: number }>`
   - Current page information for display

### Methods

#### Data Loading
- **loadEntityHistory(params: { entityType, entityId })** - Load entity audit logs
- **loadUserActivity(userId: string)** - Load user activity logs
- **loadRecentActivity(limit?: number)** - Load recent activity logs

#### Filtering
- **setDateRange(startDate, endDate)** - Set date range filter
- **clearDateRange()** - Clear date range filter

#### Pagination
- **setPage(page: number)** - Set current page
- **setPageSize(pageSize: number)** - Set page size
- **nextPage()** - Go to next page
- **previousPage()** - Go to previous page

#### Utility
- **clearError()** - Clear error state
- **reset()** - Reset entire store to initial state
- **clearEntityLogs()** - Clear entity logs
- **clearUserLogs()** - Clear user logs
- **clearRecentLogs()** - Clear recent logs

### Usage Example

```typescript
import { Component, inject } from '@angular/core';
import { AuditStore } from '../store/audit.store';
import { EntityType } from '../models/audit';

@Component({
  selector: 'app-my-component',
  template: `
    @if (store.isLoading()) {
      <mat-spinner></mat-spinner>
    }
    
    @if (store.hasError()) {
      <p>Error: {{ store.error() }}</p>
    }
    
    @if (store.hasEntityLogs()) {
      <app-audit-timeline [logs]="store.entityLogs()"></app-audit-timeline>
    }
  `,
})
export class MyComponent {
  store = inject(AuditStore);

  ngOnInit() {
    // Load entity history
    this.store.loadEntityHistory({
      entityType: EntityType.PROJECT,
      entityId: 'some-uuid',
    });
    
    // Apply date filter
    const startDate = new Date('2024-01-01');
    const endDate = new Date();
    this.store.setDateRange(startDate, endDate);
    
    // Reload after filter change
    this.store.loadEntityHistory({
      entityType: EntityType.PROJECT,
      entityId: 'some-uuid',
    });
  }
}
```

## Routing Configuration

The audit feature uses nested routes:

```typescript
{
  path: 'audit',
  canActivate: [authGuard],
  component: AuditComponent,
  children: [
    {
      path: '',
      redirectTo: 'recent',
      pathMatch: 'full',
    },
    {
      path: 'recent',
      component: RecentActivityComponent,
    },
    {
      path: 'entity',
      component: EntityHistoryComponent,
    },
    {
      path: 'user',
      component: UserActivityComponent,
    },
  ],
}
```

**Navigation URLs:**
- `/audit` → Redirects to `/audit/recent`
- `/audit/recent` → Recent activity feed
- `/audit/entity` → Entity history (with query params)
- `/audit/user` → User activity (with query params)

## Features

### 1. Timeline UI
- Beautiful vertical timeline with connecting lines
- Color-coded icons for different actions
- Hover effects and smooth animations
- Card-based layout for each log entry
- Responsive design for mobile/tablet/desktop

### 2. Expandable Change Details

**CREATE Actions:**
- Shows the complete created data

**UPDATE Actions:**
- Field-by-field comparison
- Before (red highlight) and After (green highlight) values
- Arrow indicators showing change direction
- Shows only changed fields
- Supports nested objects with JSON display

**DELETE Actions:**
- Shows the complete deleted data

### 3. Date Range Filtering
- Material date pickers for start and end dates
- Filter applied on subsequent API calls
- Visual indicator when filter is active
- Clear filter button
- Integrated with pagination

### 4. Pagination
- Configurable page size
- Previous/Next navigation
- Current page indicator
- "More available" indicator
- Resets to page 1 when filters change

### 5. Statistics Display

**User Activity:**
- Total actions count
- Actions grouped by type (CREATE, UPDATE, DELETE)
- Actions grouped by entity (PROJECT, TASK, USER)

**Recent Activity:**
- Total logs count
- Unique active users count
- Actions by type visualization
- Actions by entity visualization
- Most recent activity timestamp

## Responsive Design

All components are fully responsive with breakpoints at:
- Desktop: > 992px
- Tablet: 768px - 992px
- Mobile: < 768px

**Mobile Optimizations:**
- Stacked layouts instead of side-by-side
- Simplified timeline view
- Collapsed navigation elements
- Touch-friendly controls
- Optimized font sizes

## Error Handling

The feature includes comprehensive error handling:
- Loading states with spinners
- Error messages with retry buttons
- Empty state displays
- Network error recovery
- Validation for required fields

## Performance Considerations

1. **Debouncing:** 300ms debounce on API calls
2. **Lazy Loading:** Components loaded on demand via routing
3. **Computed Signals:** Efficient derived state calculation
4. **Client-side Filtering:** Recent activity uses client-side filters
5. **Pagination:** Limits data fetched per request

## Styling

### Color Scheme
- **CREATE:** Green (success)
- **UPDATE:** Blue (primary)
- **DELETE:** Red (warn/error)
- **Accent:** Orange/Purple gradients for headers

### Material Design
- Material Design 3 components
- Consistent spacing and typography
- Elevation and shadows
- Smooth transitions and animations

## Integration Examples

### Navigate to Entity History from Project View
```typescript
viewProjectHistory(projectId: string) {
  this.router.navigate(['/audit/entity'], {
    queryParams: {
      entityType: EntityType.PROJECT,
      entityId: projectId,
    },
  });
}
```

### Navigate to User Activity from User List
```typescript
viewUserActivity(userId: string) {
  this.router.navigate(['/audit/user'], {
    queryParams: {
      userId: userId,
    },
  });
}
```

### Add Audit Link to Navigation Menu
```html
<a mat-list-item routerLink="/audit">
  <mat-icon>security</mat-icon>
  <span>Audit Logs</span>
</a>
```

## Future Enhancements

Potential improvements for future versions:
1. Export audit logs to CSV/PDF
2. Advanced filtering (multiple entity types, action types)
3. Real-time updates via WebSocket
4. Audit log search functionality
5. Bookmarking specific queries
6. Scheduled audit reports
7. Audit log retention policies
8. Compare multiple versions side-by-side
9. Restore previous versions
10. Audit log analytics dashboard

## Testing

### Manual Testing Checklist
- [ ] Load entity history for each entity type
- [ ] Apply date range filters
- [ ] Navigate through pages
- [ ] Expand/collapse change details
- [ ] Load user activity logs
- [ ] View user statistics
- [ ] Load recent activity feed
- [ ] Apply client-side filters
- [ ] Test responsive layouts on different screen sizes
- [ ] Verify error handling
- [ ] Check loading states
- [ ] Validate empty states

### Test Data Requirements
- Sample audit logs for projects, tasks, and users
- Multiple users with various activities
- CREATE, UPDATE, and DELETE actions
- Logs with and without change details
- Logs spanning different date ranges

## Troubleshooting

### Issue: No logs displayed
- **Check:** Backend API is running and accessible
- **Check:** Network tab for 200 response status
- **Check:** Entity ID / User ID is correct
- **Check:** Date filters are not excluding all results

### Issue: Changes not showing
- **Check:** Audit logs have `changes.before` and `changes.after` properties
- **Check:** Backend is capturing change data correctly

### Issue: Pagination not working
- **Check:** `hasMore` flag is being set correctly by backend
- **Check:** `skip` parameter is being sent to backend
- **Check:** Page size matches expected value

### Issue: Date filter not working
- **Note:** Backend must support `startDate` and `endDate` query parameters
- **Check:** Dates are being converted to ISO strings
- **Check:** Backend is filtering by timestamp field

## Conclusion

The Audit feature provides a comprehensive, user-friendly interface for tracking all system activities. With its beautiful timeline UI, powerful filtering capabilities, and responsive design, it enables administrators and users to monitor changes, investigate issues, and maintain system accountability.
