# Frontend Documentation - ProjectManager Client

## Overview

The ProjectManager Client is a modern Single Page Application (SPA) built with Angular 20, featuring a responsive design, dark mode support, and comprehensive project management capabilities.

**Technology Stack:**
- Angular 20.3.0 (Standalone Components)
- TypeScript 5.7.2
- NgRx Signals 20.0.1
- Angular Material 20.2.3
- RxJS 7.8.1

---

## Architecture

### Component Structure

The application follows Angular's standalone component architecture without NgModules:

```
src/app/
├── app.config.ts              # Application configuration & providers
├── app.routes.ts              # Route definitions with lazy loading
├── app.component.ts           # Root component with router outlet
├── core/                      # Core services & stores
│   ├── app.store.ts          # Global application state
│   ├── auth.store.ts         # Authentication state & JWT management
│   └── theme.service.ts      # Dark mode theme service
├── features/                  # Feature modules (standalone)
│   ├── auth/                 # Login & Registration
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/            # Main dashboard with metrics
│   ├── projects/             # Project management
│   │   ├── components/
│   │   │   ├── projectslist/
│   │   │   └── archived-projects/
│   │   ├── models/
│   │   ├── services/
│   │   └── store/
│   ├── tasks/                # Task management
│   │   ├── components/
│   │   │   ├── tasklist/
│   │   │   └── task-history/
│   │   ├── models/
│   │   ├── services/
│   │   └── store/
│   ├── users/                # User management (ADMIN)
│   ├── audit/                # Audit logs (ADMIN)
│   ├── profile/              # User profile page
│   └── recent-activity/      # Recent activity timeline
└── shared/                   # Shared components & utilities
    ├── header/
    ├── skeleton-loader/
    ├── empty-state/
    ├── confirmation-dialog/
    ├── guards/
    ├── services/
    ├── models/
    └── validators/
```

### State Management

**NgRx Signal Stores** are used for reactive state management:

1. **AuthStore** (`core/auth.store.ts`)
   - User authentication state
   - JWT token management
   - Role-based access (ADMIN, MANAGER, USER)
   - Computed signals for user info and permissions

2. **ProjectsStore** (`features/projects/store/projects.store.ts`)
   - Project list state
   - Filter and sort capabilities
   - Loading/error states

3. **TasksStore** (`features/tasks/store/tasks.store.ts`)
   - Task list state with filters
   - Pagination support
   - CRUD operations

4. **AppStore** (`core/app.store.ts`)
   - Global UI state (sidebar open/close)
   - Shared application state

**Key Features:**
- Signal-based reactivity for automatic UI updates
- Computed signals for derived data
- RxMethod for handling side effects
- LocalStorage persistence for auth state

### Routing Strategy

**Lazy Loading:** All feature routes use Angular's `loadComponent()` for code splitting:

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => import('./features/dashboard/dashboard.component')
    .then(m => m.DashboardComponent),
}
```

**Route Guards:**
- `authGuard`: Protects routes requiring authentication
- `guestGuard`: Redirects authenticated users away from login/register
- `roleGuard`: Restricts routes by user role (ADMIN, MANAGER, USER)

---

## Features & Functionalities

### 1. Authentication System

**Login/Registration:**
- JWT-based authentication
- Token stored in localStorage
- Automatic token refresh
- Role-based access control

**Protected Routes:**
- Dashboard, Projects, Tasks, Profile (All authenticated users)
- Users, Audit (ADMIN only)

### 2. Dashboard

**Features:**
- Project metrics (total, active, completed)
- Task statistics (by status)
- User metrics (active users)
- Completion rate charts
- Recent activity summary

**Components:**
- Metric cards with icons
- Donut charts for distributions
- Bar charts for trends
- Skeleton loaders during data fetch

### 3. Project Management

**Project List:**
- Searchable table with all projects
- Sortable columns
- Filter by status, priority
- Sticky filter bar (scrolls with table)
- Actions: View, Edit, Delete

**Archived Projects:**
- Separate view for completed/archived projects
- Restore functionality
- Task completion tracking
- Priority color coding

**Features:**
- Create new projects with date pickers
- Assign managers
- Set priority (1-10)
- Track start/end dates
- View related tasks

### 4. Task Management

**Task List:**
- Comprehensive task table
- Filter by status, assignee, priority, project
- Date range filtering
- Bulk operations (TODO)
- Quick actions

**My Tasks:**
- Filter tasks by current user
- Personal task view
- Status updates

**Task History:**
- Complete audit trail for each task
- Timeline view of all changes
- Before/after values
- User attribution
- Date/time stamps

**Features:**
- Create tasks with assignments
- Link to projects
- Set priority and dates
- Status transitions
- Parent/child task relationships

### 5. User Management (ADMIN)

**User List:**
- All users table
- Search by name, email, employee ID
- Filter by role and active status
- Actions: Edit, Delete (soft delete)

**Features:**
- Create new users
- Assign roles (ADMIN, MANAGER, USER)
- Employee ID tracking
- Active/inactive status

### 6. Audit System (ADMIN)

**Recent Activity:**
- Timeline of all system changes
- Filter by entity type (PROJECT, TASK, USER)
- Date range filtering
- User activity tracking

**Entity History:**
- View changes for specific entities
- Compare before/after states
- Track who made changes

**User Activity:**
- All actions by specific user
- Activity patterns
- Change history

### 7. User Profile

**Features:**
- View personal information
- Edit profile (name, email, employee ID)
- Change password
- Account status
- Quick stats (tasks, projects)
- Avatar with initials

### 8. Recent Activity (Public)

**Features:**
- Last 50 system activities
- Statistics (today, this week, this month)
- Timeline view
- Accessible to all users
- Link to full audit log (ADMIN)

---

## Pages & Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/login` | LoginComponent | Guest | User login page |
| `/register` | RegisterComponent | Guest | New user registration |
| `/dashboard` | DashboardComponent | Auth | Main dashboard with metrics |
| `/projects` | ProjectslistComponent | Auth | List all projects |
| `/archived-projects` | ArchivedProjectsComponent | Auth | Archived/completed projects |
| `/tasks` | TasklistComponent | Auth | List all tasks |
| `/my-tasks` | TasklistComponent | Auth | Current user's tasks |
| `/task/:uuid/history` | TaskHistoryComponent | Auth | Task audit trail |
| `/users` | UserslistComponent | ADMIN | User management |
| `/profile` | ProfileComponent | Auth | User profile page |
| `/recent-activity` | RecentActivityComponent | Auth | Activity timeline |
| `/audit` | AuditComponent | ADMIN | Audit system (nested routes) |
| `/audit/recent` | RecentActivityComponent | ADMIN | Recent audit logs |
| `/audit/entity` | EntityHistoryComponent | ADMIN | Entity change history |
| `/audit/user` | UserActivityComponent | ADMIN | User activity logs |

**Route Features:**
- Lazy loading for optimal performance
- Guard-protected routes
- UUID-based routing for entities
- Nested routes for audit system

---

## API Integration

### Base Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:4300',
  // Endpoints for each resource
  endpoint_user_get: '/users',
  endpoint_project_get: '/projects',
  endpoint_task_get: '/tasks',
  endpoint_audit_get: '/audit',
  // ... more endpoints
};
```

### Service Layer

All services follow consistent patterns:

**1. ProjectService** (`features/projects/services/project.service.ts`)
```typescript
- getProjects(searchKey?, sortKey?): Observable<ApiResponse<Project[]>>
- getProject(projectId: string): Observable<ApiResponse<Project>>
- createProject(payload: ProjectPayload): Observable<ApiResponse<Project>>
- updateProject(id: string, payload): Observable<ApiResponse<Project>>
- deleteProject(id: string): Observable<ApiResponse<void>>
```

**2. TaskService** (`features/tasks/services/task.service.ts`)
```typescript
- getTask(taskId: string): Observable<ApiResponse<Task>>
- getTasksList(searchKey?, sortKey?, filters?): Observable<ApiResponse<Task[]>>
- createTask(payload: TaskPayload): Observable<ApiResponse<Task>>
- updateTask(id: string, payload): Observable<ApiResponse<Task>>
- deleteTask(id: string): Observable<ApiResponse<void>>
```

**3. UserService** (`features/users/services/user.service.ts`)
```typescript
- getUsers(): Observable<ApiResponse<User[]>>
- getUser(userId: string): Observable<ApiResponse<User>>
- createUser(payload: UserPayload): Observable<ApiResponse<User>>
- updateUser(id: string, payload): Observable<ApiResponse<User>>
- deleteUser(id: string): Observable<ApiResponse<void>>
```

**4. AuditService** (`features/audit/services/audit.service.ts`)
```typescript
- getEntityHistory(entityType, entityId, params?): Observable<ApiResponse<AuditLog[]>>
- getUserActivity(userId, params?): Observable<ApiResponse<AuditLog[]>>
- getRecentActivity(limit?): Observable<ApiResponse<AuditLog[]>>
```

### API Response Format

All APIs return a standardized `ApiResponse<T>` wrapper:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

### Authentication

**JWT Tokens:**
- Stored in localStorage as `auth_token`
- Automatically included in HTTP headers via interceptor
- Token refresh on 401 responses
- Automatic logout on token expiration

**Auth Endpoints:**
- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- POST `/auth/logout` - User logout
- GET `/auth/verify` - Token verification

---

## UX & Design System

### Material Design Components

**Components Used:**
- MatCard, MatTable, MatPaginator
- MatButton, MatIconButton, MatFab
- MatFormField, MatInput, MatSelect, MatDatepicker
- MatDialog, MatSnackBar, MatTooltip
- MatChip, MatBadge, MatDivider
- MatIcon (Material Icons font)

### Custom Components

**1. Skeleton Loader** (`shared/skeleton-loader/skeleton-loader.component.ts`)

**Purpose:** Replace spinners with content-aware loading animations

**Types:**
- `text` - Single line text placeholder
- `circle` - Circular avatar/icon
- `rect` - Rectangular block
- `card` - Full card skeleton
- `table-row` - Table row skeleton
- `list-item` - List item skeleton

**Features:**
- Shimmer animation
- Dark mode support
- Customizable dimensions
- Responsive design

**Usage:**
```html
<app-skeleton-loader type="card" [height]="100"></app-skeleton-loader>
<app-skeleton-loader type="text" [width]="60"></app-skeleton-loader>
```

**2. Empty State** (`shared/empty-state/empty-state.component.ts`)

**Purpose:** Consistent empty state UI with icons and actions

**Features:**
- Material icons
- Customizable title and message
- Optional action button
- Responsive design

**Usage:**
```html
<app-empty-state
  icon="folder_off"
  title="No Projects"
  message="Create your first project to get started."
  actionLabel="Add Project"
  actionIcon="add"
  (actionClick)="addProject()"
></app-empty-state>
```

**3. Header** (`shared/header/header.component.ts`)

**Features:**
- Full navigation menu
- Dark mode toggle button
- Mobile hamburger menu
- User profile dropdown
- Logout functionality
- Responsive design

### Dark Mode

**Theme Service** (`core/theme.service.ts`)

**Features:**
- Signal-based theme state
- localStorage persistence (`app_theme`)
- System preference detection
- Body class application (`.dark-mode`)
- Smooth transitions

**Implementation:**
```typescript
// Toggle theme
themeService.toggleTheme();

// Set specific theme
themeService.setTheme('dark');

// Check current theme
const isDark = themeService.isDarkMode();
```

**Styling:**
- Global dark mode styles in `styles.scss`
- All Material components styled
- Custom component dark variants
- Color palette for dark mode

### Responsive Design

**Breakpoints:**
- Desktop: > 768px
- Mobile: ≤ 768px

**Features:**
- Mobile-first approach
- Touch-friendly tap targets
- Hamburger menu on mobile
- Vertical filter stacking
- Responsive tables (horizontal scroll on mobile)
- Optimized font sizes

### Loading States

**Strategy:**
- Skeleton loaders instead of spinners
- Content-aware placeholders
- Smooth transitions
- Perceived performance improvement

**Implementation:**
```html
@if (loading()) {
  <app-skeleton-loader type="card" [height]="100"></app-skeleton-loader>
} @else {
  <!-- Actual content -->
}
```

### Empty States

**Strategy:**
- Helpful messages with context
- Action buttons when applicable
- Icons for visual clarity
- Different states for errors vs. no data

**Types:**
- No data (first time)
- No search results
- Error states
- Permission denied

### Sticky Filter Bars

**Implementation:**
```scss
.sticky-filter {
  position: sticky;
  top: 64px; // Below header
  z-index: 10;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**Features:**
- Stays visible while scrolling
- Smooth shadow on scroll
- Dark mode support
- Mobile responsive

---

## Packages & Dependencies

### Core Dependencies

```json
{
  "@angular/animations": "^20.2.3",
  "@angular/cdk": "^20.2.3",
  "@angular/common": "^20.3.0",
  "@angular/compiler": "^20.3.0",
  "@angular/core": "^20.3.0",
  "@angular/forms": "^20.3.0",
  "@angular/material": "^20.2.3",
  "@angular/platform-browser": "^20.3.0",
  "@angular/platform-browser-dynamic": "^20.3.0",
  "@angular/router": "^20.3.0"
}
```

### State Management

```json
{
  "@ngrx/signals": "^20.0.1",
  "rxjs": "~7.8.1"
}
```

### HTTP & APIs

```json
{
  "@angular/common": "^20.3.0",
  "uuid": "^11.0.5"
}
```

### Dev Dependencies

```json
{
  "@angular-devkit/build-angular": "^20.3.0",
  "@angular/cli": "^20.3.0",
  "@angular/compiler-cli": "^20.3.0",
  "typescript": "~5.7.2"
}
```

### Testing

```json
{
  "jasmine-core": "~5.5.0",
  "karma": "~6.4.4",
  "karma-jasmine": "~5.1.0",
  "karma-chrome-launcher": "~3.2.0"
}
```

---

## Code Quality & Best Practices

### Memory Safety Rules

**No Manual Subscriptions:**
```typescript
// ❌ Bad: Manual subscription without cleanup
ngOnInit() {
  this.service.getData().subscribe(data => this.data = data);
}

// ✅ Good: Use async pipe or toSignal()
data$ = this.service.getData();
// In template: {{ data$ | async }}

// ✅ Good: Use toSignal() with effect()
data = toSignal(this.service.getData(), { initialValue: [] });
```

**Automatic Cleanup:**
- Use `async` pipe in templates
- Use `toSignal()` for reactive streams
- Use `takeUntilDestroyed()` if manual subscription needed

### TypeScript Configuration

**Strict Mode Enabled:**
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true
}
```

### Component Structure

**Standalone Components:**
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, MatCardModule, /* ... */],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
  // Signal-based state
  data = signal<Data[]>([]);
  loading = signal(false);
  
  // Computed values
  count = computed(() => this.data().length);
  
  // Dependency injection
  private service = inject(DataService);
}
```

### Template Syntax

**Modern Angular Syntax:**
```html
<!-- Control flow -->
@if (loading()) {
  <app-skeleton-loader></app-skeleton-loader>
} @else if (error()) {
  <app-empty-state></app-empty-state>
} @else {
  <div>{{ data() }}</div>
}

<!-- For loops -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

<!-- Signals -->
<div>{{ count() }}</div>
```

### Error Handling

**Consistent Error Display:**
```typescript
loadData(): void {
  this.loading.set(true);
  this.error.set(null);
  
  this.service.getData().subscribe({
    next: (response) => {
      this.data.set(response.data);
      this.loading.set(false);
    },
    error: (err: any) => {
      console.error('Error loading data:', err);
      this.error.set('Failed to load data. Please try again.');
      this.loading.set(false);
    }
  });
}
```

---

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Open browser
http://localhost:4200
```

### Build

```bash
# Development build
ng build

# Production build
ng build --configuration production

# Output location
dist/project-manager-client/
```

### Testing

```bash
# Run unit tests
ng test

# Run with coverage
ng test --code-coverage

# Run e2e tests
ng e2e
```

### Linting

```bash
# Run TSLint
ng lint

# Fix auto-fixable issues
ng lint --fix
```

---

## Performance Optimizations

### Code Splitting

- Lazy loading for all feature routes
- Dynamic imports for components
- Separate chunks per feature

### Bundle Size

**Current Metrics:**
- Initial bundle: ~705 KB (raw), ~179 KB (gzipped)
- Lazy chunks: 15-120 KB per feature
- Total: ~1.2 MB raw, ~350 KB transferred

### Change Detection

- OnPush strategy where applicable
- Signal-based reactivity (automatic)
- Computed values memoized
- Trackby functions in ngFor loops

### HTTP Optimization

- Response caching where appropriate
- Request debouncing for search
- Pagination for large lists
- Lazy loading of related data

---

## Browser Support

**Supported Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Features:**
- ES2022 target
- Modern JavaScript features
- CSS Grid and Flexbox
- LocalStorage API
- Fetch API (via HttpClient)

---

## Accessibility

**WCAG AA Compliant:**
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratios met
- Focus indicators visible
- Screen reader compatible

**Material Components:**
- Built-in ARIA support
- Keyboard shortcuts
- Focus management
- Live regions for dynamic content

---

## Security

**Authentication:**
- JWT tokens with expiration
- Secure token storage
- CSRF protection
- XSS prevention (Angular sanitization)

**Authorization:**
- Role-based access control
- Route guards
- Service-level permissions
- API-level validation

**Data Protection:**
- No sensitive data in URL
- Encrypted HTTPS communication
- Secure localStorage usage
- Input validation and sanitization

---

## Future Enhancements

### Planned Features

1. **Profile Management**
   - Profile photo upload
   - Password change
   - Email notifications settings
   - Two-factor authentication

2. **Task Management**
   - Bulk task operations
   - Task dependencies
   - Gantt chart view
   - Time tracking

3. **Project Analytics**
   - Advanced reporting
   - Export to PDF/Excel
   - Custom dashboards
   - Predictive analytics

4. **Collaboration**
   - Real-time updates (WebSocket)
   - Comments and mentions
   - File attachments
   - Activity feeds

5. **Mobile App**
   - Native mobile apps (iOS/Android)
   - Offline support
   - Push notifications
   - Mobile-optimized UI

### Technical Improvements

- Service Worker for offline support
- Progressive Web App (PWA)
- Server-Side Rendering (SSR)
- i18n internationalization
- Advanced caching strategies
- GraphQL integration

---

## Troubleshooting

### Common Issues

**1. Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
ng cache clean
```

**2. Authentication Issues**
```bash
# Clear localStorage
localStorage.clear()

# Check token expiration
console.log(localStorage.getItem('auth_token'))
```

**3. Dark Mode Not Working**
```bash
# Check ThemeService initialization
# Verify body class is applied
console.log(document.body.classList)
```

**4. Routing Issues**
```bash
# Check route guards
# Verify lazy loading paths
# Check browser console for errors
```

---

## Contributing

### Code Style

- Follow Angular style guide
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

### Pull Request Process

1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Submit PR with description
5. Address review comments
6. Merge after approval

---

## Documentation

- **Frontend Guide:** [FRONTEND.md](FRONTEND.md) (this file)
- **API Documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Migration Plan:** [MIGRATION_PLAN.md](MIGRATION_PLAN.md)
- **UX Improvements:** [UX_IMPROVEMENTS.md](UX_IMPROVEMENTS.md)
- **New Pages:** [NEW_PAGES_SUMMARY.md](NEW_PAGES_SUMMARY.md)

---

**Last Updated:** February 15, 2026  
**Angular Version:** 20.3.0  
**Material Version:** 20.2.3
