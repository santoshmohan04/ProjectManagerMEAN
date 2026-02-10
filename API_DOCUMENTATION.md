# Project Manager API Documentation

## Overview
This document provides comprehensive API documentation for the ProjectManagerServer backend from a frontend UI perspective. The server is built using Express.js and MongoDB (MEAN stack) and provides RESTful APIs for managing projects, tasks, and users.

**Base URL:** `http://localhost:4300`

**Swagger Documentation:** Available at `http://localhost:4300/api-docs`

---

## Table of Contents
1. [Data Models](#data-models)
2. [Projects API](#projects-api)
3. [Users API](#users-api)
4. [Tasks API](#tasks-api)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)

---

## Data Models

### Project Model
```javascript
{
  "_id": "MongoDB ObjectId",
  "Project_ID": Number,              // Auto-incremented
  "Project": String,                 // Project name (required)
  "Start_Date": Date,                // Project start date (nullable)
  "End_Date": Date,                  // Project end date (nullable)
  "Priority": Number,                // Priority level
  "Manager": "ObjectId",             // Reference to User (nullable)
  "Tasks": [                         // Virtual field - populated tasks
    {
      "Task_ID": "ObjectId",
      "Status": String
    }
  ],
  "NoOfTasks": Number,               // Virtual field - total tasks count
  "CompletedTasks": Number           // Virtual field - completed tasks count
}
```

### User Model
```javascript
{
  "_id": "MongoDB ObjectId",
  "First_Name": String,              // Required
  "Last_Name": String,               // Required
  "Employee_ID": String,             // Required
  "Task_ID": String,                 // Task assignment (nullable)
  "Project": "ObjectId",             // Reference to Project (nullable)
  "Full_Name": String                // Virtual field - "First_Name Last_Name"
}
```

### Task Model
```javascript
{
  "_id": "MongoDB ObjectId",
  "Title": String,                   // Required
  "Description": String,             // Default: ""
  "Start_Date": Date,                // Nullable
  "End_Date": Date,                  // Nullable
  "Priority": Number,                // Default: 0
  "Status": String,                  // Enum: ["Open", "In Progress", "Completed", "Blocked"]
  "Parent": "ObjectId",              // Reference to parent Task (nullable)
  "Project": "ObjectId",             // Reference to Project (nullable)
  "User": "ObjectId"                 // Reference to User (nullable)
}
```

---

## Projects API

### 1. Get All Projects
**Endpoint:** `GET /projects`

**Description:** Retrieves a list of all projects with optional filtering and sorting. Tasks are populated with Task_ID and Status.

**Query Parameters:**
- `searchKey` (optional): Search term for project name (case-insensitive regex)
- `sortKey` (optional): Field to sort by. Allowed values: `Project`, `Priority`, `Start_Date`, `End_Date`

**Frontend Use Case:** Display projects list with search and sort functionality

**Request Example:**
```http
GET /projects?searchKey=web&sortKey=Priority
```

**Success Response (200):**
```json
{
  "Success": true,
  "Data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "Project_ID": 1,
      "Project": "Web Application Development",
      "Start_Date": "2024-01-01T00:00:00.000Z",
      "End_Date": "2024-06-30T00:00:00.000Z",
      "Priority": 5,
      "Manager": "507f191e810c19729de860ea",
      "Tasks": [
        {
          "Task_ID": "507f1f77bcf86cd799439012",
          "Status": "In Progress"
        }
      ]
    }
  ]
}
```

**Error Response (500):**
```json
{
  "Success": false,
  "Message": "An error occurred",
  "Error": "error message"
}
```

---

### 2. Add New Project
**Endpoint:** `POST /projects/add`

**Description:** Creates a new project

**Frontend Use Case:** Add new project form submission

**Request Body:**
```json
{
  "Project": "Mobile App Development",
  "Priority": 8,
  "Manager_ID": "507f191e810c19729de860ea",
  "Start_Date": "2024-02-01T00:00:00.000Z",
  "End_Date": "2024-08-31T00:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "Success": true
}
```

**Error Response (400):**
```json
{
  "Success": false,
  "Message": "Error occurred while creating new project",
  "Error": "validation error message"
}
```

---

### 3. Update Project
**Endpoint:** `POST /projects/edit/:id`

**Description:** Updates an existing project by ID

**Frontend Use Case:** Edit project form submission

**URL Parameters:**
- `id`: Project MongoDB ObjectId

**Request Body:**
```json
{
  "Project": "Updated Project Name",
  "Priority": 9,
  "Start_Date": "2024-03-01T00:00:00.000Z",
  "End_Date": "2024-09-30T00:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "Success": true,
  "Data": {
    "_id": "507f1f77bcf86cd799439011",
    "Project": "Updated Project Name",
    "Priority": 9,
    "Start_Date": "2024-03-01T00:00:00.000Z",
    "End_Date": "2024-09-30T00:00:00.000Z",
    "Manager": "507f191e810c19729de860ea"
  }
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "Project not found" }`
- **400:** `{ "Success": false, "Message": "Error occurred while updating project", "Error": "error message" }`

---

### 4. Delete Project
**Endpoint:** `DELETE /projects/delete/:id`

**Description:** Deletes a project by ID

**Frontend Use Case:** Delete project confirmation action

**URL Parameters:**
- `id`: Project MongoDB ObjectId

**Success Response (200):**
```json
{
  "Success": true
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "Project not found" }`
- **500:** `{ "Success": false, "Message": "An error occurred", "Error": "error message" }`

---

### 5. Get Project by ID
**Endpoint:** `GET /projects/:id`

**Description:** Retrieves a single project with full task population

**Frontend Use Case:** View project details page

**URL Parameters:**
- `id`: Project MongoDB ObjectId

**Success Response (200):**
```json
{
  "Success": true,
  "Data": {
    "_id": "507f1f77bcf86cd799439011",
    "Project_ID": 1,
    "Project": "Web Application Development",
    "Start_Date": "2024-01-01T00:00:00.000Z",
    "End_Date": "2024-06-30T00:00:00.000Z",
    "Priority": 5,
    "Manager": "507f191e810c19729de860ea",
    "Tasks": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "Title": "Design Database Schema",
        "Description": "Create the database schema for the application",
        "Status": "Completed",
        "Priority": 7
      }
    ]
  }
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "Project not found" }`
- **500:** `{ "Success": false, "Message": "An error occurred", "Error": "error message" }`

---

## Users API

### 1. List All Users
**Endpoint:** `GET /users`

**Description:** Retrieves a list of all users with optional search and sort

**Query Parameters:**
- `searchKey` (optional): Search users by first or last name (case-insensitive regex)
- `sortKey` (optional): Field name to sort by (ascending order)

**Frontend Use Case:** User management list, user selection dropdowns

**Request Example:**
```http
GET /users?searchKey=john&sortKey=First_Name
```

**Success Response (200):**
```json
{
  "Success": true,
  "Data": [
    {
      "_id": "507f191e810c19729de860ea",
      "First_Name": "John",
      "Last_Name": "Doe",
      "Employee_ID": "EMP001",
      "Task_ID": null,
      "Project": "507f1f77bcf86cd799439011"
    }
  ]
}
```

**Error Response (200):**
```json
{
  "Success": false
}
```

---

### 2. Add New User
**Endpoint:** `POST /users/add`

**Description:** Creates a new user

**Frontend Use Case:** Add new user form submission

**Request Body:**
```json
{
  "First_Name": "Jane",
  "Last_Name": "Smith",
  "Employee_ID": "EMP002"
}
```

**Success Response (200):**
```json
{
  "Success": true
}
```

**Error Response (400):**
```json
{
  "Success": false,
  "Message": "Error occurred while creating new user"
}
```

---

### 3. Update User
**Endpoint:** `POST /users/edit/:id`

**Description:** Updates an existing user by ID

**Frontend Use Case:** Edit user form submission

**URL Parameters:**
- `id`: User MongoDB ObjectId

**Request Body:**
```json
{
  "First_Name": "Jane",
  "Last_Name": "Smith-Updated",
  "Employee_ID": "EMP002"
}
```

**Success Response (200):**
```json
{
  "Success": true
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "User not found" }`
- **400:** `{ "Success": false }`

---

### 4. Delete User
**Endpoint:** `DELETE /users/delete/:id`

**Description:** Deletes a user by ID

**Frontend Use Case:** Delete user confirmation action

**URL Parameters:**
- `id`: User MongoDB ObjectId

**Success Response (200):**
```json
{
  "Success": true
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "User not found" }`
- **500:** `{ "Success": false, "Message": "Error occurred while deleting user" }`

---

### 5. Get User by ID
**Endpoint:** `GET /users/:id`

**Description:** Retrieves a single user by ID

**Frontend Use Case:** View user details, user profile page

**URL Parameters:**
- `id`: User MongoDB ObjectId

**Success Response (200):**
```json
{
  "Success": true,
  "Data": {
    "_id": "507f191e810c19729de860ea",
    "First_Name": "John",
    "Last_Name": "Doe",
    "Employee_ID": "EMP001",
    "Task_ID": null,
    "Project": "507f1f77bcf86cd799439011"
  }
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "User not found" }`
- **500:** `{ "Success": false, "Message": "Error occurred while fetching user" }`

---

### 6. Assign Project to User (as Manager)
**Endpoint:** `POST /users/assign/project/:id`

**Description:** Assigns a project to a user, making them the project manager

**Frontend Use Case:** Assign manager to project action

**URL Parameters:**
- `id`: User ID (custom User_ID field, not MongoDB _id)

**Request Body:**
```json
{
  "Project_ID": "507f1f77bcf86cd799439011"
}
```

**Success Response (200):**
```json
{
  "Success": true
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "User not found" }`
- **400:** `{ "Success": false }`

---

### 7. Assign Task to User
**Endpoint:** `POST /users/assign/task/:id`

**Description:** Assigns a task to a user

**Frontend Use Case:** Assign task to team member action

**URL Parameters:**
- `id`: User ID (custom User_ID field, not MongoDB _id)

**Request Body:**
```json
{
  "Task_ID": "507f1f77bcf86cd799439012"
}
```

**Success Response (200):**
```json
{
  "Success": true
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "User not found" }`
- **400:** `{ "Success": false }`

---

## Tasks API

### 1. List All Tasks
**Endpoint:** `GET /tasks`

**Description:** Retrieves a list of tasks with optional filters. Related Project, User, and Parent task are populated.

**Query Parameters:**
- `projectId` (optional): Filter tasks by project ID
- `parentId` (optional): Filter tasks by parent task ID (get subtasks)
- `searchKey` (optional): Search tasks by title (case-insensitive regex)
- `sortKey` (optional): Sort by any field (ascending order)

**Frontend Use Case:** 
- Display tasks list with filters
- Show project tasks
- Display subtasks under a parent task

**Request Example:**
```http
GET /tasks?projectId=507f1f77bcf86cd799439011&sortKey=Priority
```

**Success Response (200):**
```json
{
  "Success": true,
  "Data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "Title": "Design Database Schema",
      "Description": "Create the database schema for the application",
      "Start_Date": "2024-01-15T00:00:00.000Z",
      "End_Date": "2024-01-25T00:00:00.000Z",
      "Priority": 7,
      "Status": "Completed",
      "Parent": null,
      "Project": {
        "_id": "507f1f77bcf86cd799439011",
        "Project": "Web Application Development"
      },
      "User": {
        "_id": "507f191e810c19729de860ea",
        "First_Name": "John",
        "Last_Name": "Doe"
      }
    }
  ]
}
```

**Error Response (500):**
```json
{
  "Success": false,
  "Message": "Error while fetching tasks",
  "Error": "error message"
}
```

---

### 2. Create New Task
**Endpoint:** `POST /tasks/add`

**Description:** Creates a new task. If Parent is provided, creates it as a subtask.

**Frontend Use Case:** Add new task form submission, create subtask

**Request Body:**
```json
{
  "Title": "Implement User Authentication",
  "Description": "Add login and registration functionality",
  "Start_Date": "2024-02-01T00:00:00.000Z",
  "End_Date": "2024-02-15T00:00:00.000Z",
  "Priority": 9,
  "Status": "Open",
  "Project": "507f1f77bcf86cd799439011",
  "User": "507f191e810c19729de860ea",
  "Parent": null
}
```

**Success Response (201):**
```json
{
  "Success": true,
  "Data": {
    "_id": "507f1f77bcf86cd799439013",
    "Title": "Implement User Authentication",
    "Description": "Add login and registration functionality",
    "Start_Date": "2024-02-01T00:00:00.000Z",
    "End_Date": "2024-02-15T00:00:00.000Z",
    "Priority": 9,
    "Status": "Open",
    "Project": "507f1f77bcf86cd799439011",
    "User": "507f191e810c19729de860ea",
    "Parent": null
  }
}
```

**Error Response (400):**
```json
{
  "Success": false,
  "Message": "Error while creating task",
  "Error": "validation error message"
}
```

---

### 3. Get Task by ID
**Endpoint:** `GET /tasks/:id`

**Description:** Retrieves a single task with populated Project, User, and Parent references

**Frontend Use Case:** View task details page, edit task form

**URL Parameters:**
- `id`: Task MongoDB ObjectId

**Success Response (200):**
```json
{
  "Success": true,
  "Data": {
    "_id": "507f1f77bcf86cd799439012",
    "Title": "Design Database Schema",
    "Description": "Create the database schema for the application",
    "Start_Date": "2024-01-15T00:00:00.000Z",
    "End_Date": "2024-01-25T00:00:00.000Z",
    "Priority": 7,
    "Status": "Completed",
    "Parent": null,
    "Project": {
      "_id": "507f1f77bcf86cd799439011",
      "Project": "Web Application Development",
      "Priority": 5
    },
    "User": {
      "_id": "507f191e810c19729de860ea",
      "First_Name": "John",
      "Last_Name": "Doe",
      "Employee_ID": "EMP001"
    }
  }
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "Task not found" }`
- **500:** `{ "Success": false, "Message": "Error while fetching task", "Error": "error message" }`

---

### 4. Update Task
**Endpoint:** `PUT /tasks/:id`

**Description:** Updates an existing task

**Frontend Use Case:** Edit task form submission, update task status

**URL Parameters:**
- `id`: Task MongoDB ObjectId

**Request Body:**
```json
{
  "Title": "Design Database Schema - Updated",
  "Status": "In Progress",
  "Priority": 8
}
```

**Success Response (200):**
```json
{
  "Success": true,
  "Data": {
    "_id": "507f1f77bcf86cd799439012",
    "Title": "Design Database Schema - Updated",
    "Description": "Create the database schema for the application",
    "Status": "In Progress",
    "Priority": 8,
    "Start_Date": "2024-01-15T00:00:00.000Z",
    "End_Date": "2024-01-25T00:00:00.000Z",
    "Parent": null,
    "Project": "507f1f77bcf86cd799439011",
    "User": "507f191e810c19729de860ea"
  }
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "Task not found" }`
- **400:** `{ "Success": false, "Message": "Error while updating task", "Error": "error message" }`

---

### 5. Delete Task
**Endpoint:** `DELETE /tasks/:id`

**Description:** Deletes a task by ID

**Frontend Use Case:** Delete task confirmation action

**URL Parameters:**
- `id`: Task MongoDB ObjectId

**Success Response (200):**
```json
{
  "Success": true,
  "Message": "Task deleted successfully"
}
```

**Error Responses:**
- **404:** `{ "Success": false, "Message": "Task not found" }`
- **500:** `{ "Success": false, "Message": "Error while deleting task", "Error": "error message" }`

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "Success": true,
  "Data": {} // or []
}
```

### Error Response
```json
{
  "Success": false,
  "Message": "Human-readable error message",
  "Error": "Technical error details" // optional
}
```

---

## Error Handling

### HTTP Status Codes
- **200**: Success (GET, POST updates)
- **201**: Created (POST create operations)
- **400**: Bad Request (validation errors)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (unexpected errors)

### Common Error Scenarios

1. **Invalid ObjectId Format**
   - Status: 500
   - Response: `{ "Success": false, "Message": "An error occurred", "Error": "Cast to ObjectId failed" }`

2. **Missing Required Fields**
   - Status: 400
   - Response: `{ "Success": false, "Message": "Error occurred...", "Error": "validation failed" }`

3. **Resource Not Found**
   - Status: 404
   - Response: `{ "Success": false, "Message": "Resource not found" }`

4. **Database Connection Error**
   - Status: 500
   - Response: `{ "Success": false, "Message": "An error occurred", "Error": "connection error" }`

---

## Frontend Integration Tips

### 1. API Service Layer
Create a centralized API service in your frontend application:

```typescript
// Example Angular Service
export class ApiService {
  private baseUrl = 'http://localhost:4300';
  
  getProjects(searchKey?: string, sortKey?: string) {
    const params = new HttpParams()
      .set('searchKey', searchKey || '')
      .set('sortKey', sortKey || '');
    return this.http.get(`${this.baseUrl}/projects`, { params });
  }
}
```

### 2. Error Handling
Always check the `Success` field in responses:

```typescript
this.apiService.getProjects().subscribe({
  next: (response) => {
    if (response.Success) {
      this.projects = response.Data;
    } else {
      this.handleError(response.Message);
    }
  },
  error: (error) => {
    this.handleError('Network error occurred');
  }
});
```

### 3. Data Population
When displaying related data (e.g., project with tasks), use endpoints that populate references:
- Use `GET /projects/:id` for full project details with tasks
- Use `GET /tasks?projectId=xxx` for project's task list with user details

### 4. Search and Filter
All list endpoints support search and sort:
- Search: Use `searchKey` query parameter for text search
- Sort: Use `sortKey` query parameter with field name
- Filter: Tasks API supports `projectId` and `parentId` filters

### 5. Date Handling
- Dates are stored as ISO 8601 strings
- Always convert to/from JavaScript Date objects in the frontend
- Nullable dates can be `null` or omitted

### 6. Task Status Values
Valid task status values:
- `"Open"`
- `"In Progress"`
- `"Completed"`
- `"Blocked"`

### 7. Virtual Fields
Some fields are computed (virtual) and read-only:
- Project: `NoOfTasks`, `CompletedTasks`
- User: `Full_Name`

---

## API Testing

### Using Swagger UI
Access the interactive API documentation at:
```
http://localhost:4300/api-docs
```

### Using cURL

**Get all projects:**
```bash
curl http://localhost:4300/projects
```

**Create a project:**
```bash
curl -X POST http://localhost:4300/projects/add \
  -H "Content-Type: application/json" \
  -d '{
    "Project": "New Project",
    "Priority": 5,
    "Start_Date": "2024-01-01",
    "End_Date": "2024-12-31"
  }'
```

**Search users:**
```bash
curl "http://localhost:4300/users?searchKey=john&sortKey=First_Name"
```

---

## Database Configuration

The server connects to MongoDB using the configuration in:
```
/config/ProjectManagerDB.js
```

Default connection:
- **Port**: 4300
- **Database**: ProjectManager (configured in ProjectManagerDB.js)

---

## CORS Configuration

CORS is enabled for all origins. For production, configure specific allowed origins in `server.js`:

```javascript
app.use(cors({
  origin: 'http://your-frontend-domain.com'
}));
```

---

## Notes

1. **Auto-increment**: Projects use `Project_ID` as an auto-incrementing field via mongoose-sequence plugin
2. **References**: All foreign key relationships use MongoDB ObjectId references
3. **Population**: Related documents are populated using Mongoose's `.populate()` method
4. **Validation**: Basic validation is handled at the schema level
5. **Search**: Text searches use case-insensitive regex matching
6. **Security**: For production, implement:
   - Authentication/Authorization
   - Input validation and sanitization
   - Rate limiting
   - HTTPS
   - Environment-specific CORS

---

## Summary

This API provides a complete CRUD (Create, Read, Update, Delete) interface for managing:
- **Projects**: With manager assignment and task tracking
- **Users**: With project and task assignments
- **Tasks**: With hierarchical structure (parent-child) and status tracking

All endpoints return consistent JSON responses with a `Success` flag and appropriate data/error information.

For real-time updates in the frontend, consider implementing WebSocket connections or polling strategies for critical data updates.
