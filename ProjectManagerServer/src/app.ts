import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import userRoutes from './modules/user/user.routes.js';
import projectRoutes from './modules/project/project.routes.js';
import taskRoutes from './modules/task/task.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

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
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;