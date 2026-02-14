import { Router } from 'express';
import { ProjectController } from './project.controller.js';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware.js';
import { validateUuidParam } from '../../middleware/validation.middleware.js';

const router = Router();
const projectController = new ProjectController();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get projects with pagination and filtering
 *     tags: [Projects]
 *     description: Returns a paginated list of projects with optional filtering and sorting.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z_]+:(asc|desc)$'
 *         description: Sort field and order (e.g., "name:asc", "priority:desc", "createdAt:desc")
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PLANNING, ACTIVE, COMPLETED, ARCHIVED]
 *         description: Filter by project status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Filter by priority level (1-10)
 *       - in: query
 *         name: manager
 *         schema:
 *           type: string
 *         description: Filter by manager ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search in project names
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Project UUID
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           priority:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 10
 *                           status:
 *                             type: string
 *                             enum: [PLANNING, ACTIVE, COMPLETED, ARCHIVED]
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                           manager:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           createdBy:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), projectController.getProjects.bind(projectController));

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       400:
 *         description: Error occurred while creating new project
 */
router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), projectController.createProject.bind(projectController));

/**
 * @swagger
 * /projects/{uuid}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       400:
 *         description: Error occurred while updating project
 *       404:
 *         description: Project not found
 */
router.put('/:uuid', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validateUuidParam(), projectController.updateProject.bind(projectController));

/**
 * @swagger
 * /projects/{uuid}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Project not found
 *       500:
 *         description: An error occurred
 */
router.delete('/:uuid', authenticate, authorizeRoles('ADMIN'), validateUuidParam(), projectController.deleteProject.bind(projectController));

/**
 * @swagger
 * /projects/{uuid}:
 *   get:
 *     summary: Get a project by UUID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Project not found
 *       500:
 *         description: An error occurred
 */
router.get('/:uuid', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validateUuidParam(), projectController.getProjectById.bind(projectController));

export default router;