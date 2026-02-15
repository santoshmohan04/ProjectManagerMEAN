// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUri: 'http://localhost:4300',

  endpoint_user_get: '/users',
  endpoint_user_add: '/users',
  endpoint_user_edit: '/users',
  endpoint_user_delete: '/users',

  endpoint_project_get: '/projects',
  endpoint_project_add: '/projects',
  endpoint_project_edit: '/projects',
  endpoint_project_delete: '/projects',

  endpoint_parentTask_get: '/parenttasks',
  endpoint_parentTask_add: '/parenttasks',

  endpoint_task_get: '/tasks',
  endpoint_task_add: '/tasks',
  endpoint_task_edit: '/tasks',
  endpoint_task_delete: '/tasks',

  endpoint_dashboard_overview: '/dashboard/overview',

  endpoint_auth_login: '/auth/login',
  endpoint_auth_register: '/auth/register',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
