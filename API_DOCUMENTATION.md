# Project Manager API Documentation

## Overview
This document provides comprehensive API documentation for the ProjectManagerServer backend from a frontend UI perspective. The server is built using Express.js and MongoDB (MEAN stack) and provides RESTful APIs for managing projects, tasks, users, dashboard analytics, and audit trails.

**Base URL:** `http://localhost:4300`

**Swagger Documentation:** Available at `http://localhost:4300/api-docs`

---

## Table of Contents
1. [Data Models](#data-models)
2. [Authentication API](#authentication-api)
3. [Projects API](#projects-api)
4. [Users API](#users-api)
5. [Tasks API](#tasks-api)
6. [Dashboard API](#dashboard-api)
7. [Audit API](#audit-api)
8. [Response Format](#response-format)
9. [Error Handling](#error-handling)

---

## Data Models

### Project Model
```javascript
{
  "uuid": "string",              // UUID v7 (primary identifier)
  "Project_ID": "number",         // Auto-incremented legacy field
  "name": "string",               // Project name (required)
  "description": "string",        // Optional description
  "priority": "number",           // Priority level (1-10)
  "status": "string",             // Enum: PLANNING, ACTIVE, COMPLETED, ARCHIVED
  "startDate": "Date",            // Project start date (nullable)
  "endDate": "Date",              // Project end date (nullable)
  "manager": "string",            // UUID reference to User (nullable)
  "isArchived": "boolean",        // Archive status
  "createdBy": "string",          // UUID reference to User who created
  "createdAt": "Date",            // Auto-generated
  "updatedAt": "Date",            // Auto-generated
  // Virtual/Populated fields
  "Tasks": [...],                 // Populated tasks with full details
  "NoOfTasks": "number",          // Total task count
  "CompletedTasks": "number"      // Completed task count
}
```

### User Model
```javascript
{
  "uuid": "string",               // UUID v7 (primary identifier)
  "firstName": "string",          // Required
  "lastName": "string",           // Required
  "email": "string",              // Required, unique
  "employeeId": "string",         // Optional unique identifier
  "passwordHash": "string",       // Hashed password (not returned)
  "role": "string",               // Enum: ADMIN, MANAGER, USER
  "isActive": "boolean",          // Account status
  "lastLogin": "Date",            // Last login timestamp
  "refreshToken": "string",       // JWT refresh token
  "tokenVersion": "number",       // Token version for invalidation
  "createdAt": "Date",            // Auto-generated
  "updatedAt": "Date",           // Auto-generated
  "fullName": "string"            // Virtual: firstName + lastName
}
```

### Task Model
```javascript
{
  "uuid": "string",               // UUID v7 (primary identifier)
  "title": "string",              // Required
  "description": "string",        // Optional
  "priority": "number",           // 1-5 (1=lowest, 5=highest)
  "status": "string",             // Enum: OPEN, IN_PROGRESS, COMPLETED, BLOCKED
  "startDate": "Date",            // Nullable
  "endDate": "Date",              // Nullable
  "dueDate": "Date",              // Task deadline
  "estimatedHours": "number",     // Estimated effort
  "actualHours": "number",        // Actual effort
  "project": "string",            // UUID reference to Project
  "assignedTo": "string",         // UUID reference to User
  "parentTask": "string",         // UUID reference to parent Task (nullable)
  "createdBy": "string",          // UUID reference to User who created
  "createdAt": "Date",            // Auto-generated
  "updatedAt": "Date"             // Auto-generated
}
```

---

## Authentication API

### 1. User Registration
**Endpoint:** `POST /auth/register`

**Description:** Registers a new user account

**Frontend Use Case:** User registration form submission

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "employeeId": "EMP001"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "employeeId": "EMP001",
      "role": "USER",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

### 2. User Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticates a user and returns JWT tokens

**Frontend Use Case:** User login form submission

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "lastLogin": "2024-01-20T09:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "AUTHENTICATION_FAILED",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

---

## Projects API

### 1. Get All Projects
**Endpoint:** `GET /projects`

**Description:** Retrieves a paginated list of projects with optional filtering and sorting. Tasks are populated with basic info.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field and order (format: "field:asc" or "field:desc")
- `status` (optional): Filter by status (PLANNING, ACTIVE, COMPLETED, ARCHIVED)
- `priority` (optional): Filter by priority (1-10)
- `manager` (optional): Filter by manager UUID
- `search` (optional): Search in project name and description

**Frontend Use Case:** Display projects list with pagination, search and filters

**Request Example:**
```http
GET /projects?page=1&limit=5&sort=name:asc&status=ACTIVE
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
      "Project_ID": 1,
      "name": "Web Application Development",
      "description": "Modern web app with React and Node.js",
      "priority": 8,
      "status": "ACTIVE",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-06-30T00:00:00.000Z",
      "manager": {
        "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com"
      },
      "createdBy": {
        "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4p",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "Tasks": [
        {
          "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4q",
          "title": "Setup CI/CD Pipeline",
          "status": "COMPLETED",
          "priority": 9
        }
      ],
      "NoOfTasks": 5,
      "CompletedTasks": 2,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "totalPages": 3
  }
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "An error occurred",
  "errorCode": "INTERNAL_ERROR",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

---

### 2. Create New Project
**Endpoint:** `POST /projects`

**Description:** Creates a new project

**Authentication:** Required (JWT token)

**Authorization:** ADMIN, MANAGER roles

**Frontend Use Case:** Add new project form submission

**Request Body:**
```json
{
  "name": "Mobile App Development",
  "description": "Native iOS and Android application",
  "priority": 8,
  "status": "PLANNING",
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-08-31T00:00:00.000Z",
  "manager": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4r",
    "Project_ID": 2,
    "name": "Mobile App Development",
    "description": "Native iOS and Android application",
    "priority": 8,
    "status": "PLANNING",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-08-31T00:00:00.000Z",
    "manager": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
    "createdBy": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4p",
    "isArchived": false,
    "createdAt": "2024-01-20T09:00:00.000Z",
    "updatedAt": "2024-01-20T09:00:00.000Z"
  },
  "message": "Project created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

---

### 3. Update Project
**Endpoint:** `PUT /projects/:uuid`

**Description:** Updates an existing project by UUID

**Authentication:** Required (JWT token)

**Authorization:** ADMIN, MANAGER roles, or project creator

**URL Parameters:**
- `uuid`: Project UUID

**Frontend Use Case:** Edit project form submission

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "priority": 9,
  "status": "ACTIVE",
  "startDate": "2024-03-01T00:00:00.000Z",
  "endDate": "2024-09-30T00:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4r",
    "Project_ID": 2,
    "name": "Updated Project Name",
    "description": "Updated description",
    "priority": 9,
    "status": "ACTIVE",
    "startDate": "2024-03-01T00:00:00.000Z",
    "endDate": "2024-09-30T00:00:00.000Z",
    "manager": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
    "createdBy": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4p",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **404:** `{ "success": false, "message": "Project not found", "errorCode": "NOT_FOUND" }`
- **403:** `{ "success": false, "message": "Access denied", "errorCode": "FORBIDDEN" }`

---

### 4. Delete Project
**Endpoint:** `DELETE /projects/:uuid`

**Description:** Soft deletes a project by UUID (sets isArchived = true)

**Authentication:** Required (JWT token)

**Authorization:** ADMIN role only

**URL Parameters:**
- `uuid`: Project UUID

**Frontend Use Case:** Delete project confirmation action

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project archived successfully"
}
```

**Error Responses:**
- **404:** `{ "success": false, "message": "Project not found", "errorCode": "NOT_FOUND" }`
- **403:** `{ "success": false, "message": "Access denied", "errorCode": "FORBIDDEN" }`

---

### 5. Get Project by UUID
**Endpoint:** `GET /projects/:uuid`

**Description:** Retrieves a single project with full task population

**Authentication:** Required (JWT token)

**URL Parameters:**
- `uuid`: Project UUID

**Frontend Use Case:** View project details page

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
    "Project_ID": 1,
    "name": "Web Application Development",
    "description": "Modern web app with React and Node.js",
    "priority": 8,
    "status": "ACTIVE",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-06-30T00:00:00.000Z",
    "manager": {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
      "firstName": "John",
      "lastName": "Doe"
    },
    "Tasks": [
      {
        "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4q",
        "title": "Design Database Schema",
        "description": "Create the database schema for the application",
        "status": "COMPLETED",
        "priority": 7,
        "assignedTo": {
          "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "NoOfTasks": 5,
    "CompletedTasks": 2
  }
}
```

**Error Responses:**
- **404:** `{ "success": false, "message": "Project not found", "errorCode": "NOT_FOUND" }`

---

## Users API

### 1. List All Users
**Endpoint:** `GET /users`

**Description:** Retrieves a paginated list of users with optional filtering and sorting

**Authentication:** Required (JWT token)

**Authorization:** ADMIN, MANAGER roles

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field and order (format: "field:asc" or "field:desc")
- `search` (optional): Search in firstName, lastName, or email
- `role` (optional): Filter by role (ADMIN, MANAGER, USER)
- `isActive` (optional): Filter by active status (true/false)

**Frontend Use Case:** User management list with pagination and filters

**Request Example:**
```http
GET /users?page=1&limit=10&sort=firstName:asc&role=USER&isActive=true
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "employeeId": "EMP001",
      "role": "USER",
      "isActive": true,
      "lastLogin": "2024-01-20T09:00:00.000Z",
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-20T09:00:00.000Z",
      "fullName": "John Doe"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Authentication required",
  "errorCode": "AUTHENTICATION_REQUIRED",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

---

### 2. Create New User
**Endpoint:** `POST /users`

**Description:** Creates a new user account

**Authentication:** Required (JWT token)

**Authorization:** ADMIN role only

**Frontend Use Case:** Add new user form submission

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "employeeId": "EMP002",
  "role": "USER"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "employeeId": "EMP002",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z",
    "fullName": "Jane Smith"
  },
  "message": "User created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

---

### 3. Get User by UUID
**Endpoint:** `GET /users/:uuid`

**Description:** Retrieves a single user by UUID

**Authentication:** Required (JWT token)

**Authorization:** ADMIN, MANAGER roles, or own profile

**URL Parameters:**
- `uuid`: User UUID

**Frontend Use Case:** View user profile, edit user form

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "employeeId": "EMP001",
    "role": "USER",
    "isActive": true,
    "lastLogin": "2024-01-20T09:00:00.000Z",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-20T09:00:00.000Z",
    "fullName": "John Doe"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

---

### 4. Update User
**Endpoint:** `PUT /users/:uuid`

**Description:** Updates an existing user by UUID

**Authentication:** Required (JWT token)

**Authorization:** ADMIN role, or own profile (limited fields)

**URL Parameters:**
- `uuid`: User UUID

**Frontend Use Case:** Edit user profile form submission

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe-Updated",
  "email": "john.doe.updated@example.com",
  "employeeId": "EMP001",
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
    "firstName": "John",
    "lastName": "Doe-Updated",
    "email": "john.doe.updated@example.com",
    "employeeId": "EMP001",
    "role": "USER",
    "isActive": true,
    "updatedAt": "2024-01-20T11:00:00.000Z",
    "fullName": "John Doe-Updated"
  },
  "message": "User updated successfully"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied",
  "errorCode": "FORBIDDEN",
  "timestamp": "2024-01-20T11:00:00.000Z"
}
```

---

### 5. Delete User
**Endpoint:** `DELETE /users/:uuid`

**Description:** Soft deletes a user by UUID (sets isActive = false)

**Authentication:** Required (JWT token)

**Authorization:** ADMIN role only

**URL Parameters:**
- `uuid`: User UUID

**Frontend Use Case:** Deactivate user account

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

---

### 6. Get Active Users
**Endpoint:** `GET /users/active`

**Description:** Retrieves a list of all active users

**Authentication:** Required (JWT token)

**Authorization:** ADMIN, MANAGER roles

**Frontend Use Case:** Populate dropdowns or user selection lists

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "isActive": true
    }
  ]
}
```

---

### 7. Get User by Email
**Endpoint:** `GET /users/email/:email`

**Description:** Retrieves a single user by email address

**Authentication:** Required (JWT token)

**Authorization:** ADMIN, MANAGER roles

**URL Parameters:**
- `email`: User email address

**Frontend Use Case:** User lookup by email

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "employeeId": "EMP001",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-20T09:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

---

## Tasks API

### 1. List All Tasks
**Endpoint:** `GET /tasks`

**Description:** Retrieves a paginated list of tasks with optional filtering and sorting

**Authentication:** Required (JWT token)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field and order (format: "field:asc" or "field:desc")
- `status` (optional): Filter by status (OPEN, IN_PROGRESS, COMPLETED, BLOCKED)
- `priority` (optional): Filter by priority (1-10)
- `project` (optional): Filter by project UUID
- `assignedTo` (optional): Filter by assigned user UUID
- `parentTask` (optional): Filter by parent task UUID
- `search` (optional): Search in title and description

**Frontend Use Case:** Display tasks list with pagination, search and filters

**Request Example:**
```http
GET /tasks?page=1&limit=10&sort=priority:desc&status=IN_PROGRESS&project=0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4q",
      "title": "Design Database Schema",
      "description": "Create the database schema for the application",
      "priority": 7,
      "status": "COMPLETED",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-25T00:00:00.000Z",
      "dueDate": "2024-01-25T00:00:00.000Z",
      "estimatedHours": 16,
      "actualHours": 14,
      "project": {
        "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
        "name": "Web Application Development"
      },
      "assignedTo": {
        "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "parentTask": null,
      "createdBy": {
        "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4p",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-25T16:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Authentication required",
  "errorCode": "AUTHENTICATION_REQUIRED",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

---

### 2. Create New Task
**Endpoint:** `POST /tasks`

**Description:** Creates a new task

**Authentication:** Required (JWT token)

**Authorization:** ADMIN, MANAGER roles, or PROJECT_MANAGER for own projects

**Frontend Use Case:** Add new task form submission

**Request Body:**
```json
{
  "title": "Implement User Authentication",
  "description": "Add login and registration functionality",
  "priority": 9,
  "status": "OPEN",
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-15T00:00:00.000Z",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "estimatedHours": 24,
  "project": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
  "assignedTo": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
  "parentTask": null
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4r",
    "title": "Implement User Authentication",
    "description": "Add login and registration functionality",
    "priority": 9,
    "status": "OPEN",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-15T00:00:00.000Z",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "estimatedHours": 24,
    "actualHours": 0,
    "project": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
    "assignedTo": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
    "parentTask": null,
    "createdBy": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4p",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

---

### 3. Get Task by UUID
**Endpoint:** `GET /tasks/:uuid`

**Description:** Retrieves a single task with populated references

**Authentication:** Required (JWT token)

**URL Parameters:**
- `uuid`: Task UUID

**Frontend Use Case:** View task details, edit task form

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4q",
    "title": "Design Database Schema",
    "description": "Create the database schema for the application",
    "priority": 7,
    "status": "COMPLETED",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-25T00:00:00.000Z",
    "dueDate": "2024-01-25T00:00:00.000Z",
    "estimatedHours": 16,
    "actualHours": 14,
    "project": {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
      "name": "Web Application Development"
    },
    "assignedTo": {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
      "firstName": "John",
      "lastName": "Doe"
    },
    "parentTask": null,
    "createdBy": {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4p",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Task not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

---

### 4. Update Task
**Endpoint:** `PUT /tasks/:uuid`

**Description:** Updates an existing task

**Authentication:** Required (JWT token)

**Authorization:** ADMIN, MANAGER roles, or task creator/assignee

**URL Parameters:**
- `uuid`: Task UUID

**Frontend Use Case:** Edit task form submission, update task status

**Request Body:**
```json
{
  "title": "Design Database Schema - Updated",
  "status": "IN_PROGRESS",
  "priority": 8,
  "actualHours": 12
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4q",
    "title": "Design Database Schema - Updated",
    "status": "IN_PROGRESS",
    "priority": 8,
    "actualHours": 12,
    "updatedAt": "2024-01-20T11:00:00.000Z"
  },
  "message": "Task updated successfully"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied",
  "errorCode": "FORBIDDEN",
  "timestamp": "2024-01-20T11:00:00.000Z"
}
```

---

### 5. Delete Task
**Endpoint:** `DELETE /tasks/:uuid`

**Description:** Deletes a task by UUID

**Authentication:** Required (JWT token)

**Authorization:** ADMIN role, or task creator

**URL Parameters:**
- `uuid`: Task UUID

**Frontend Use Case:** Delete task confirmation action

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Task not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

---

## Dashboard API

### 1. Get Dashboard Overview
**Endpoint:** `GET /dashboard/overview`

**Description:** Retrieves dashboard statistics and overview data

**Authentication:** Required (JWT token)

**Frontend Use Case:** Display dashboard with project/task statistics

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProjects": 25,
    "activeProjects": 18,
    "completedProjects": 7,
    "totalTasks": 150,
    "completedTasks": 89,
    "inProgressTasks": 45,
    "overdueTasks": 16,
    "totalUsers": 12,
    "activeUsers": 10,
    "projectsByStatus": {
      "PLANNING": 5,
      "ACTIVE": 18,
      "COMPLETED": 7,
      "ARCHIVED": 2
    },
    "tasksByStatus": {
      "OPEN": 25,
      "IN_PROGRESS": 45,
      "COMPLETED": 89,
      "BLOCKED": 8
    },
    "recentProjects": [
      {
        "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
        "name": "New Web Application",
        "status": "ACTIVE",
        "createdAt": "2024-01-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

## Audit API

### 1. Get Entity History
**Endpoint:** `GET /audit/entity/:entityType/:entityId`

**Description:** Retrieves audit history for a specific entity

**Authentication:** Required (JWT token)

**URL Parameters:**
- `entityType`: Type of entity (PROJECT, TASK, USER)
- `entityId`: Entity UUID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Frontend Use Case:** View audit trail for specific records

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4a",
      "entityType": "PROJECT",
      "entityId": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
      "action": "CREATE",
      "userId": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
      "oldValues": null,
      "newValues": {
        "name": "New Project",
        "status": "PLANNING"
      },
      "timestamp": "2024-01-20T10:00:00.000Z",
      "ipAddress": "192.168.1.100"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 2. Get User Activity
**Endpoint:** `GET /audit/user/:userId`

**Description:** Retrieves audit history for a specific user's actions

**Authentication:** Required (JWT token)

**URL Parameters:**
- `userId`: User UUID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Frontend Use Case:** View user activity log

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4b",
      "entityType": "TASK",
      "entityId": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4q",
      "action": "UPDATE",
      "userId": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
      "oldValues": {
        "status": "OPEN"
      },
      "newValues": {
        "status": "IN_PROGRESS"
      },
      "timestamp": "2024-01-20T11:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3. Get Recent Activity
**Endpoint:** `GET /audit/recent`

**Description:** Retrieves recent audit activity across all entities

**Authentication:** Required (JWT token)

**Query Parameters:**
- `limit` (optional): Number of recent activities to retrieve (default: 50, max: 200)

**Frontend Use Case:** Display recent activity feed

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4c",
      "entityType": "PROJECT",
      "entityId": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n",
      "action": "UPDATE",
      "userId": "0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4o",
      "changes": {
        "status": {
          "old": "PLANNING",
          "new": "ACTIVE"
        }
      },
      "timestamp": "2024-01-20T14:00:00.000Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errorCode": "TECHNICAL_ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Key Changes from Legacy Format:
- `Success` → `success` (lowercase)
- `Data` → `data` (lowercase)
- Added `meta` for pagination info
- Added `errorCode` and `timestamp` for errors
- Added optional `message` field

---

## Error Handling

### HTTP Status Codes
- **200**: Success (GET, POST updates)
- **201**: Created (POST create operations)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **422**: Unprocessable Entity (validation errors)
- **500**: Internal Server Error (unexpected errors)

### Error Response Format
All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errorCode": "MACHINE_READABLE_ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Error Scenarios

1. **Invalid UUID Format**
   - Status: 400
   - Response:
   ```json
   {
     "success": false,
     "message": "Invalid UUID format provided",
     "errorCode": "INVALID_UUID_FORMAT",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

2. **Missing Required Fields**
   - Status: 422
   - Response:
   ```json
   {
     "success": false,
     "message": "Required field 'name' is missing",
     "errorCode": "VALIDATION_ERROR",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

3. **Resource Not Found**
   - Status: 404
   - Response:
   ```json
   {
     "success": false,
     "message": "Project with ID '123e4567-e89b-12d3-a456-426614174000' not found",
     "errorCode": "RESOURCE_NOT_FOUND",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

4. **Authentication Required**
   - Status: 401
   - Response:
   ```json
   {
     "success": false,
     "message": "Authentication token required",
     "errorCode": "AUTHENTICATION_REQUIRED",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

5. **Insufficient Permissions**
   - Status: 403
   - Response:
   ```json
   {
     "success": false,
     "message": "Insufficient permissions to access this resource",
     "errorCode": "INSUFFICIENT_PERMISSIONS",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

6. **Database Connection Error**
   - Status: 500
   - Response:
   ```json
   {
     "success": false,
     "message": "Database connection failed",
     "errorCode": "DATABASE_ERROR",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

### Error Code Reference
- `INVALID_UUID_FORMAT`: UUID parameter is malformed
- `VALIDATION_ERROR`: Request data failed validation
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `AUTHENTICATION_REQUIRED`: JWT token missing or invalid
- `INSUFFICIENT_PERMISSIONS`: User lacks required role/permissions
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_SERVER_ERROR`: Unexpected server error

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
Always check the `success` field in responses:

```typescript
this.apiService.getProjects().subscribe({
  next: (response) => {
    if (response.success) {
      this.projects = response.data;
      this.pagination = response.meta;
    } else {
      this.handleError(response.message);
    }
  },
  error: (error) => {
    this.handleError('Network error occurred');
  }
});
```

### 3. Data Population
When displaying related data (e.g., project with tasks), use endpoints that populate references:
- Use `GET /projects/:uuid` for full project details with populated manager and tasks
- Use `GET /tasks/:uuid` for task details with populated project, assigned user, and creator
- Use `GET /users/:uuid` for user details
- Dashboard endpoints provide aggregated statistics without full population

### 4. Search and Filter
All list endpoints support search and sort:
- Search: Use `search` query parameter for text search in projects and tasks
- Search: Use `searchKey` query parameter for user searches
- Sort: Use `sort` query parameter with field name and direction (e.g., "name:asc", "createdAt:desc")
- Filter: Tasks API supports `project`, `assignedTo`, `status`, `priority` filters
- Filter: Users API supports `role`, `isActive` filters
- Pagination: All list endpoints support `page` and `limit` parameters

### 5. Date Handling
- Dates are stored as ISO 8601 strings
- Always convert to/from JavaScript Date objects in the frontend
- Nullable dates can be `null` or omitted

### 6. Task Status Values
Valid task status values:
- `"OPEN"`
- `"IN_PROGRESS"`
- `"COMPLETED"`
- `"BLOCKED"`

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
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:4300/projects
```

**Create a project:**
```bash
curl -X POST http://localhost:4300/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Project description",
    "priority": 5,
    "status": "PLANNING"
  }'
```

**Get user by email:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:4300/users/email/john.doe@example.com"
```

---

## Database Configuration

The server connects to MongoDB using environment variables. The connection is configured in:
```
src/config/database.ts
```

Default connection:
- **Port**: 4300
- **Database**: Configured via `MONGODB_CONNECTION_STRING` environment variable
- **Authentication**: JWT-based with role-based access control

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

1. **UUID Primary Keys**: All entities use UUID v7 as primary identifiers instead of MongoDB ObjectIds
2. **Auto-increment**: Projects use `Project_ID` as an auto-incrementing field via mongoose-sequence plugin
3. **References**: Foreign key relationships use UUID strings for API consistency
4. **Population**: Related documents are populated using Mongoose's `.populate()` method
5. **Validation**: Comprehensive validation using Zod schemas and middleware
6. **Search**: Text searches use case-insensitive regex matching
7. **Audit Logging**: All data changes are automatically logged for compliance
8. **Security**: Production-ready security with:
   - JWT authentication and role-based authorization
   - Input validation and sanitization
   - Rate limiting (100 requests per 15 minutes)
   - HTTPS enforcement
   - Environment-specific CORS configuration

---

## Summary

This API provides a complete RESTful interface for managing:
- **Projects**: CRUD operations with manager assignment and task tracking
- **Users**: User management with role-based access control and authentication
- **Tasks**: Task management with hierarchical structure and status tracking
- **Dashboard**: Analytics and overview statistics
- **Audit**: Complete audit trail for all data changes

### Key Features:
- **UUID-based**: All resources use UUID v7 as primary identifiers
- **JWT Authentication**: Bearer token authentication with role-based authorization
- **Pagination**: All list endpoints support pagination with configurable limits
- **Consistent Responses**: Standardized success/error response format
- **Audit Logging**: Complete audit trail for compliance and debugging
- **Swagger Documentation**: Interactive API documentation

### Security Features:
- JWT token-based authentication
- Role-based access control (ADMIN, MANAGER, USER)
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- MongoDB injection prevention

For real-time updates in the frontend, consider implementing WebSocket connections or polling strategies for critical data updates.
