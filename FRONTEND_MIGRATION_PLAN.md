/*
We are refactoring this Angular 20 project to enterprise standards.

Tasks:

1. Remove Bootstrap and ngx-toastr.
2. Use Angular Material + CDK only.
3. Replace Toastr with MatSnackBar.
4. Remove classic NgRx Store + Effects.
5. Replace with NgRx Signal Store.
6. Remove any manual subscriptions in components.
7. Use signals + computed + effect instead of RxJS chaining in components.
8. All API services must return typed responses matching backend:
   {
     success: boolean,
     data: T,
     meta?: PaginationMeta,
     message?: string
   }

App structure:

src/app/
  core/
  shared/
  features/
    auth/
    dashboard/
    projects/
    tasks/
    users/
    audit/
*/
