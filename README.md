# ProjectManager MEAN Stack Application

Project Manager is a modern Single Page Application (SPA) for managing projects, tasks, and teams with comprehensive tracking and audit capabilities.

**Technology Stack:**
- **Frontend:** Angular 20 + TypeScript + Angular Material
- **Backend:** Node.js 20.x + Express.js
- **Database:** MongoDB 8.x + Mongoose
- **State Management:** NgRx Signals
- **Authentication:** JWT tokens
- **Styling:** SCSS + Material Design

## Project Structure

```
ProjectManager_Client/    → Angular 20 frontend (SPA)
ProjectManagerServer/     → Node.js + Express backend (REST API)
```

## Key Features

### Frontend
- ✅ **Standalone Components** - Modern Angular architecture
- ✅ **Dark Mode** - System-wide theme support
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Signal-based State** - NgRx Signals for reactivity
- ✅ **Role-based Access** - ADMIN, MANAGER, USER roles
- ✅ **Advanced UX** - Skeleton loaders, empty states, sticky filters
- ✅ **Real-time Updates** - Signal-based change detection
- ✅ **Audit Trail** - Complete history of all changes

### Backend
- ✅ **RESTful APIs** - UUID-based routing
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-based Authorization** - Middleware protection
- ✅ **MongoDB Integration** - Mongoose ODM
- ✅ **Error Handling** - Centralized error middleware
- ✅ **Validation** - Request validation middleware
- ✅ **Audit Logging** - Automatic change tracking

## Documentation

- 📘 **[Frontend Guide](FRONTEND.md)** - Complete frontend documentation
- 📗 **[API Documentation](API_DOCUMENTATION.md)** - Backend API reference
- 📙 **[Architecture](ARCHITECTURE.md)** - System architecture overview
- 📕 **[UX Improvements](UX_IMPROVEMENTS.md)** - UI/UX enhancements guide
- 📔 **[New Pages](NEW_PAGES_SUMMARY.md)** - Recently added pages

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- MongoDB 8.x or higher
- npm or yarn package manager

### Installation

**1. MongoDB Setup**

Install MongoDB locally or use a cloud service (MongoDB Atlas):
- Download: https://docs.mongodb.com/manual/installation
- Start MongoDB service:
  ```bash
  # Windows
  cd "C:\Program Files\MongoDB\Server\8.0\bin"
  mongod.exe
  
  # macOS/Linux
  mongod
  ```

**2. Backend Setup**

```bash
# Navigate to backend folder
cd ProjectManagerServer

# Install dependencies
npm install

# Configure environment
# Edit src/config/env.ts with your MongoDB URL and settings

# Start the server
npm start

# Server runs on http://localhost:4300
```

**3. Frontend Setup**

```bash
# Navigate to frontend folder
cd ProjectManager_Client

# Install dependencies
npm install

# Configure environment
# Edit src/environments/environment.ts with your backend URL

# Start development server
ng serve

# Application runs on http://localhost:4200
```

### Default Credentials

After seeding the database, use these credentials:

- **Admin:** admin@example.com / Admin@123
- **Manager:** manager@example.com / Manager@123
- **User:** user@example.com / User@123

## Development

### Frontend Development

```bash
cd ProjectManager_Client

# Development server
ng serve

# Production build
ng build --configuration production

# Run tests
ng test

# Run linter
ng lint
```

### Backend Development

```bash
cd ProjectManagerServer

# Development with auto-reload
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Project Features

### Pages

- **Dashboard** - Metrics, charts, and recent activity
- **Projects** - List, create, edit, and archive projects
- **Tasks** - Task management with filters and history
- **Users** - User management (ADMIN only)
- **Audit** - Complete audit trail (ADMIN only)
- **Profile** - User profile and settings
- **Recent Activity** - Public activity timeline

### Capabilities

- **Project Management**
  - Create and manage projects
  - Assign managers
  - Set priorities and dates
  - Archive completed projects
  - Track task completion

- **Task Management**
  - Create and assign tasks
  - Set priorities and deadlines
  - Track status changes
  - View task history
  - Filter and search

- **User Management**
  - Role-based access control
  - User profiles
  - Active/inactive status
  - Employee ID tracking

- **Audit System**
  - Complete change history
  - Entity-specific audit trails
  - User activity tracking
  - Before/after comparisons

- **UI/UX Features**
  - Dark mode support
  - Responsive mobile design
  - Skeleton loaders
  - Empty states
  - Sticky filters
  - Search and sort

## Testing

### Frontend Tests

```bash
cd ProjectManager_Client

# Unit tests
ng test

# E2E tests
ng e2e

# Coverage report
ng test --code-coverage
```

### Backend Tests

```bash
cd ProjectManagerServer

# All tests
npm test

# Specific test file
npm test -- auth.test.ts

# Watch mode
npm run test:watch
```

## Deployment

### Frontend Deployment

```bash
cd ProjectManager_Client

# Build for production
ng build --configuration production

# Output: dist/project-manager-client/
# Deploy to: Netlify, Vercel, AWS S3, or any static host
```

### Backend Deployment

```bash
cd ProjectManagerServer

# Set environment variables
export NODE_ENV=production
export MONGODB_URI=your_mongodb_uri
export JWT_SECRET=your_jwt_secret

# Start production server
npm start

# Deploy to: Heroku, AWS EC2, DigitalOcean, or any Node.js host
```

## Technology Details

### Frontend Stack
- Angular 20.3.0
- TypeScript 5.7.2
- NgRx Signals 20.0.1
- Angular Material 20.2.3
- RxJS 7.8.1
- SCSS for styling

### Backend Stack
- Node.js 20.x
- Express.js 4.x
- MongoDB 8.x
- Mongoose ODM
- JSON Web Tokens
- TypeScript

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Last Updated:** February 15, 2026  
**Version:** 2.0.0  
**Author:** Santosh
 
