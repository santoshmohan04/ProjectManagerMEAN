/*
We are removing the legacy JavaScript implementation and standardizing on the
TypeScript modular architecture under /src/modules.

Tasks:
1. Remove /controllers and /data_models folders.
2. Remove server.js if it uses legacy routing.
3. Ensure app.ts and server.ts use only /src/modules routes.
4. Ensure all routes are mounted under:
   /auth
   /users
   /projects
   /tasks
   /dashboard
   /audit

No legacy routes like:
- /users/add
- /users/edit/:id
- /projects/add
- /tasks/add

Only RESTful routes allowed.
*/
