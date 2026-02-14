import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';
import hpp from 'hpp';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { auditMiddleware } from './modules/audit/audit.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import projectRoutes from './modules/project/project.routes.js';
import taskRoutes from './modules/task/task.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import testRoutes from './modules/test/routes/test.routes.js';

const app = express();

// Security middleware
app.use(helmet()); // Set security headers

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS configuration with allowed origins from environment
const corsOptions = {
  origin: config.corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser with size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize(req.body);
  }
  if (req.query) {
    req.query = mongoSanitize(req.query);
  }
  if (req.params) {
    req.params = mongoSanitize(req.params);
  }
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Audit logging middleware
app.use(auditMiddleware.auditLogger.bind(auditMiddleware));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Manager API',
      version: '1.0.0',
      description: 'API documentation for Project Manager MEAN app',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
      },
    ],
    components: {
      schemas: {
        Project: {
          type: 'object',
          properties: {
            Project: { type: 'string', description: 'Name of the project' },
            Priority: {
              type: 'number',
              description: 'Priority of the project',
            },
            Manager_ID: { type: 'string', description: 'Assigned manager ID' },
            Start_Date: {
              type: 'string',
              format: 'date-time',
              description: 'Project start date',
            },
            End_Date: {
              type: 'string',
              format: 'date-time',
              description: 'Project end date',
            },
            Tasks: {
              type: 'array',
              description: 'List of tasks under this project',
              items: {
                type: 'object',
                properties: {
                  Task_ID: { type: 'string' },
                  Status: { type: 'string' },
                },
              },
            },
          },
          required: [
            'Project',
            'Priority',
            'Manager_ID',
            'Start_Date',
            'End_Date',
          ],
        },
        Task: {
          type: 'object',
          properties: {
            Title: { type: 'string' },
            Description: { type: 'string' },
            Project: { type: 'string' },
            User: { type: 'string' },
            Parent: { type: 'string' },
            Status: { type: 'string' },
            Priority: { type: 'number' },
          },
        },
        User: {
          type: 'object',
          properties: {
            uuid: {
              type: 'string',
              description: 'Unique user identifier (UUID v7)',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            employeeId: {
              type: 'string',
              description: 'Employee ID (optional)',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'USER'],
              description: 'User role',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user is active',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
            fullName: {
              type: 'string',
              description: 'Computed full name (virtual field)',
            },
          },
          required: ['uuid', 'firstName', 'lastName', 'email', 'passwordHash', 'role', 'isActive', 'createdAt', 'updatedAt'],
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/audit', auditRoutes);
app.use('/test', testRoutes);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;