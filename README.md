# ProjectManager MEAN stack Application sample

Project Manager application is a Single Page Application (SPA) to keep track of projects,
their respective tasks, their status and priorities.

This application is developed using MEAN stack such as Angular 20, Node JS(20.x), Express JS and Mongo DB(8.x).

This project contains two folders.
1. ProjectManager_Client - Front end SPA developed using Angular 20, Angular CLI, Angular Material, HTML 5

2. ProjectManagerServer - Rest APIs developed using Node+Express JS and MongoDB with Mongoose driver

## Frontend

The frontend is built using:
- **Angular 20** - Latest Angular framework with standalone components
- **Standalone APIs** - Modern Angular architecture without NgModules
- **NgRx Signal Store** - Reactive state management with signals
- **Angular Material** - Material Design components for consistent UI
- **UUID-based REST APIs** - Modern API routing with UUID identifiers
- **JWT Authentication** - Secure token-based authentication system

### Key Features:
- **UUID Routing**: All entities use UUID-based identifiers for RESTful operations
- **JWT Authentication**: Secure authentication with JSON Web Tokens
- **Pagination Support**: Efficient data loading with server-side pagination
- **Role-based UI**: Dynamic interface based on user roles and permissions

Legacy Angular 6 project (ProjectManagerClient) has been removed as part of modernization.

### Folder Structure:
```
ProjectManager_Client  → Angular 20 frontend
ProjectManagerServer   → Express + MongoDB backend
```

Installation and Run steps:

1. Set up MongoDB.
to set up mongodb in local, follow this page - https://docs.mongodb.com/manual/installation

start the server if installed locally,
> cd "<path to...MongoDB\Server\8.0\bin>mongo.exe

once set up or already having remote mongodb hosted service, copy the mongogb url.

2. Open ProjectManagerServer folder, run these steps -
>npm install

configure mongodb url in /config/ProjectManagerDB.js

configure port in server.js. default port is 4300

> npm start server

By now, Rest API is connected to MongoDB and running.

3. Open ProjectManager_Client folder, run these steps -
 > npm install

 modify the urls and port config in src/environments/environment.ts file per step 2.

 > ng build
 > ng serve --open

 frontend UI is running on local angular cli server with default port 4200.
 
