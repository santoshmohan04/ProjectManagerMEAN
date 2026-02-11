# Frontend Summary (ProjectManager_Client)

## Stack
- Framework: Angular 20 (see `ProjectManager_Client/package.json`).
- Language: TypeScript (>=5).
- State management: NgRx Store & Effects.
- UI libs: Angular Material, Bootstrap 5, ngx-toastr.

## Packages Used
- Major deps: `@angular/*` (v20), `@ngrx/store`, `@ngrx/effects`, `@angular/material`, `bootstrap`, `ngx-toastr`, `rxjs`, `uuid`.
- Dev: Angular CLI/build packages, Karma/Jasmine test tooling.

## What data is displayed / Project purpose
- Purpose: Modernized Project Management client (Projects, Tasks, Users, ParentTasks) — similar domain to `ProjectManagerClient` but updated stack and NgRx usage.
- Domain models: `Project`, `Task`, `User`, `ParentTask` (see `src/app/*/models`).
- Displayed data: Project lists/details, counts (CompletedTasks/NoOfTasks), Task lists (by project), User lists, Parent tasks; fields include dates (ISO strings), priority, manager/assignee, and relationships.

## Functionalities & Features
- CRUD for Projects, Tasks, Users via REST services (`ProjectService`, `TaskService`, `UserService`).
- Search, filter and sort on lists.
- Selection and confirmation dialogs.
- Task lifecycle: add/edit/end.
- Routing with lazy-loaded components via `app.routes.ts`.
- Centralized side-effects via NgRx Effects (`store/effects.ts`) and notifications from `AlertService`.

## State Management
- Uses NgRx Store and Effects: `provideStore({projects: projectReducer})` and `provideEffects([ProjectManagementEffects])` in `app.config.ts`.
- Actions, reducers and selectors present in `src/app/store` (`actions.ts`, `reducers.ts`, `effects.ts`, `selectors.ts`).
- Data flow: UI dispatches actions → Effects call services → on success actions update Store via reducers → components select data from Store.

## APIs Consumed
- Base URI in `src/environments/environment.ts` (`http://localhost:4300` for dev).
- Endpoints matching `/users`, `/projects`, `/tasks`, `/parenttasks` plus add/edit/delete routes; services build URIs as `baseUri + endpoint_*`.
- Services use `HttpClient` and return `ApiResponse<T>` wrappers.

## Styling & UX
- Styling: SCSS with Bootstrap 5 and Angular Material. Global styles in `src/styles.scss`.
- Notifications: `ngx-toastr`. Confirmation dialog component exists under `shared/confirmation-dialog`.
- Routing uses modern lazy-loading of components via dynamic imports.

## Notable Code Locations Inspected
- `ProjectManager_Client/package.json`
- `ProjectManager_Client/src/app/app.config.ts` (app bootstrap providers)
- `ProjectManager_Client/src/app/app.routes.ts`
- `ProjectManager_Client/src/app/store/*` (actions, reducers, effects, selectors)
- `ProjectManager_Client/src/environments/environment.ts`
- `ProjectManager_Client/src/app/project/services/project.service.ts`
- `ProjectManager_Client/src/styles.scss`

---

If you want edits (shorter/longer format, add checklist for improvements, or move this to a docs folder), tell me where to save or how to adjust it.
