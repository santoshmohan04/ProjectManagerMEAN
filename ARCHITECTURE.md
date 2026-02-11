Perfect ✅
Below are **high-quality, production-level GitHub Copilot prompts** you can paste directly into your backend files to generate clean architecture code aligned with the improvements we discussed.

These prompts are written like a **Senior Architect giving instructions to Copilot**.

---

# 🔥 1. PROJECT STRUCTURE REFACTOR PROMPT

### 📁 Create Modular Architecture

Paste this in a new file like `ARCHITECTURE.md` or at top of server:

```ts
/*
Refactor this Express + MongoDB backend into a modular enterprise structure.

Requirements:
- Use Node.js (ES Modules)
- Use Express
- Use MongoDB with Mongoose
- Implement feature-based folder structure:

src/
  modules/
    auth/
      auth.controller.ts
      auth.service.ts
      auth.routes.ts
      auth.validation.ts
    user/
    project/
    task/
    dashboard/
    audit/
  middleware/
    auth.middleware.ts
    error.middleware.ts
    validation.middleware.ts
  utils/
    response.ts
    pagination.ts
  config/
    database.ts
    env.ts
  app.ts
  server.ts

Separate controller, service, and repository logic properly.
Controllers should not directly access Mongoose models.
*/
```

---

# 🔐 2. AUTH MODULE PROMPTS

---

## 🔹 2.1 Create User Schema with UUID + RBAC

Create `user.model.ts` and paste:

```ts
/*
Create a production-grade Mongoose User schema.

Requirements:
- uuid (string, required, unique, default uuidv7)
- firstName (string, required, trimmed)
- lastName (string, required, trimmed)
- email (string, required, unique, lowercase, indexed)
- employeeId (string, unique)
- passwordHash (string, required)
- role (enum: ADMIN, MANAGER, USER, default USER)
- isActive (boolean, default true)
- lastLogin (Date)
- timestamps enabled
- Hide passwordHash in toJSON
- Add compound index on email + isActive

Use:
- mongoose
- uuid
*/
```

---

## 🔹 2.2 Signup API Prompt

Inside `auth.service.ts`:

```ts
/*
Implement signup service function.

Requirements:
- Validate input using Zod
- Check if email already exists
- Hash password using bcrypt (saltRounds = 12)
- Create user with role USER by default
- Return sanitized user object (exclude passwordHash)
- Generate JWT access token (expires 15m)
- Generate refresh token (expires 7d)
- Store refresh token in database

Return:
{
  user,
  accessToken,
  refreshToken
}
*/
```

---

## 🔹 2.3 Login API Prompt

```ts
/*
Implement login service function.

Requirements:
- Accept email + password
- Validate user exists
- Compare password with bcrypt
- Check isActive
- Update lastLogin
- Generate JWT access token (15 minutes)
- Generate refresh token (7 days)
- Return sanitized user + tokens
- Throw proper error if invalid credentials
*/
```

---

## 🔹 2.4 Auth Middleware Prompt

Inside `auth.middleware.ts`:

```ts
/*
Create JWT authentication middleware.

Requirements:
- Read token from Authorization: Bearer <token>
- Verify using JWT_SECRET
- Attach decoded user to req.user
- Return 401 if invalid
- Return 403 if expired
*/
```

---

## 🔹 2.5 Role Authorization Middleware Prompt

```ts
/*
Create role-based authorization middleware.

Usage:
authorizeRoles("ADMIN")
authorizeRoles("ADMIN", "MANAGER")

Requirements:
- Read req.user.role
- If role not allowed, return 403
- Otherwise call next()
*/
```

---

# 🧠 3. PROJECT MODULE PROMPTS

---

## 🔹 3.1 Project Schema Prompt

```ts
/*
Create Project schema.

Fields:
- uuid (string, unique)
- name (string, required, indexed)
- description (string)
- priority (number, min 1 max 10)
- status (enum: PLANNING, ACTIVE, COMPLETED, ARCHIVED)
- startDate (Date)
- endDate (Date)
- manager (ObjectId ref User)
- isArchived (boolean default false)
- createdBy (ObjectId ref User)
- timestamps true

Add indexes:
- name text index
- priority index
- status index
*/
```

---

## 🔹 3.2 Paginated List API Prompt

In `project.service.ts`:

```ts
/*
Implement getProjects function with:

Query Parameters:
- page (default 1)
- limit (default 10)
- sort (format: field:asc|desc)
- filters:
    status
    priority
    manager

Requirements:
- Use skip and limit
- Return:
{
  data,
  meta: {
    page,
    limit,
    total,
    totalPages
  }
}
- Always exclude internal _id
- Map uuid as id
*/
```

---

# 📋 4. TASK MODULE PROMPTS

---

## 🔹 4.1 Task Schema Prompt

```ts
/*
Create Task schema.

Fields:
- uuid
- title (required)
- description
- priority (1–10)
- status (OPEN, IN_PROGRESS, COMPLETED, BLOCKED)
- project (ObjectId ref Project)
- assignedTo (ObjectId ref User)
- parentTask (ObjectId ref Task)
- dueDate
- estimatedHours
- actualHours
- createdBy
- timestamps

Indexes:
- project
- status
- assignedTo
*/
```

---

## 🔹 4.2 Advanced Filter API Prompt

```ts
/*
Implement advanced task search endpoint.

Accept body:
{
  filters: {
    status: [],
    priority: { min, max },
    assignedTo,
    projectId,
    dueDateBefore
  },
  sort: { field, order },
  pagination: { page, limit }
}

Build dynamic Mongo query.
Use aggregation pipeline if necessary.
Return paginated response format.
*/
```

---

# 📊 5. DASHBOARD MODULE PROMPT

```ts
/*
Implement dashboard overview service.

Return:
{
  projects: {
    total,
    active,
    completed,
    archived
  },
  tasks: {
    total,
    open,
    inProgress,
    completed,
    blocked
  },
  users: {
    total,
    active
  }
}

Use MongoDB aggregation for counts.
Optimize using $group and $match.
*/
```

---

# 📜 6. AUDIT LOG PROMPT

```ts
/*
Create AuditLog schema.

Fields:
- entityType (PROJECT | TASK | USER)
- entityId
- action (CREATE | UPDATE | DELETE)
- changes (object with before/after)
- performedBy (User ref)
- timestamp

Implement middleware that logs:
- All create
- All update
- All delete
*/
```

---

# 🛡 7. SECURITY MIDDLEWARE PROMPT

In `app.ts`:

```ts
/*
Enhance security:

- Use helmet
- Use express-rate-limit (100 req per 15 min per IP)
- Use mongo-sanitize
- Use hpp
- Configure CORS with allowed origins from env
- Set body size limit to 10mb
*/
```

---

# ⚙ 8. GLOBAL ERROR HANDLER PROMPT

```ts
/*
Create centralized error handler middleware.

Requirements:
- Handle validation errors
- Handle mongoose errors
- Handle JWT errors
- Return structured response:

{
  success: false,
  message,
  errorCode,
  timestamp
}

Log full error stack internally.
Hide stack trace in production.
*/
```

---

# 📦 9. RESPONSE HELPER PROMPT

```ts
/*
Create response utility functions:

successResponse(res, data, meta?)
errorResponse(res, message, statusCode)

Ensure all controllers use this format:
{
  success: boolean,
  data?: any,
  meta?: any,
  message?: string
}
*/
```

---

# 🔄 10. BULK OPERATIONS PROMPT

```ts
/*
Implement bulk update for tasks.

Input:
{
  taskIds: string[],
  updates: {
    status?,
    priority?,
    assignedTo?
  }
}

Requirements:
- Validate all UUIDs
- Use updateMany
- Return count of modified documents
- Wrap inside transaction
*/
```

---

# 🧪 11. TESTING SETUP PROMPT

```ts
/*
Setup Jest testing environment for Express app.

Requirements:
- Supertest for API testing
- Test auth login
- Test project CRUD
- Mock MongoDB using mongodb-memory-server
- Add coverage configuration
*/
```

---

# 🏁 How To Use These

1. Create new file
2. Paste prompt
3. Let Copilot generate code
4. Refine & enforce standards

---

# 🎯 If You Want Next

I can now generate:

* 🔥 Copilot prompts for Angular 20 frontend
* 🔥 Full JWT + RBAC production-ready code sample
* 🔥 Database migration script strategy
* 🔥 Complete OpenAPI 3.1 contract spec
* 🔥 Enterprise-level CI/CD pipeline setup prompts

Tell me the next move.