# Frontend Summary (ProjectManagerClient)

## Stack
- Framework: Angular 6
- Language: TypeScript (~2.7)
- Runtime/libs: RxJS 6, Angular CLI, Bootstrap 4, ng-bootstrap, ngx-toastr, ng2-slim-loading-bar, angular-font-awesome, jQuery, moment

## Packages Used
- Major deps: `@angular/core`, `@angular/router`, `@angular/forms`, `@angular/common/http`, `bootstrap`, `@ng-bootstrap/ng-bootstrap`, `ngx-toastr`, `ng2-slim-loading-bar`, `angular-font-awesome`, `moment`, `jquery`
- Dev: Angular build tooling, TypeScript, Karma/Jasmine

(See `ProjectManagerClient/package.json` for full list.)

## What data is displayed / Project purpose
- Purpose: Client for a simple Project Management app (Projects, Tasks, Users, ParentTasks).
- Domain models: `Project`, `Task`, `User`, `ParentTask` (see `src/app/*/models`).
- Displayed data: Project lists/details, Task lists/details (per project), User lists/details, Parent tasks; includes dates, priorities, manager/user assignment and model relations.

## Functionalities & Features
- CRUD operations for Projects, Tasks, Users via REST-backed services.
- Search and sorting on lists (projects/users/tasks).
- Selection popups (modals) to pick Users or Projects.
- Task lifecycle support: create, edit, end/suspend.
- Routing for `/user`, `/project`, `/task` add/view flows.
- UX helpers: loading bar, toast notifications, ng-bootstrap date pickers, form validation.

## State Management
- No global state library (no NgRx). Component-local state with services calling `HttpClient`.
- Shared `AlertService` for toast notifications.

## APIs Consumed
- Base URI set in `src/environments/environment.ts` (dev: `http://localhost:4300`).
- Endpoints defined in `environment.ts`: `/users`, `/projects`, `/tasks`, `/parenttasks`, plus add/edit/delete variants.
- Services compose URIs as `baseUri + endpoint_*` and use `HttpClient` GET/POST.

## Styling & UX
- CSS framework: Bootstrap 4 with custom styles in `src/styles.css`.
- Components use ng-bootstrap for date pickers and Bootstrap modals (jQuery). Font Awesome for icons.
- Notifications: `ngx-toastr`. Loading indicator: `ng2-slim-loading-bar`.
- Forms: `ReactiveFormsModule` used, with a custom date-compare directive.

## Notable Code Locations Inspected
- `ProjectManagerClient/package.json`
- `ProjectManagerClient/src/app/app.module.ts`
- `ProjectManagerClient/src/environments/environment.ts`
- `ProjectManagerClient/src/app/project/services/project.service.ts`
- `ProjectManagerClient/src/app/project/models/project.ts`
- `ProjectManagerClient/src/styles.css`

---

If you want this as a README-style file in a specific folder or with a different filename/extension, tell me where and I'll move/rename it.
