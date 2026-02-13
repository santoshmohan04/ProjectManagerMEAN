import { Router } from 'express';
import { ProjectController } from './project.controller.js';

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
 */
router.get('/', projectController.getProjects.bind(projectController));

/**
 * @swagger
 * /projects/add:
 *   post:
 *     summary: Add a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project added successfully
 *       400:
 *         description: Error occurred while creating new project
 */
router.post('/add', projectController.createProject.bind(projectController));

/**
 * @swagger
 * /projects/edit/{id}:
 *   post:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Error occurred while updating project
 *       404:
 *         description: Project not found
 */
router.post('/edit/:id', projectController.updateProject.bind(projectController));

/**
 * @swagger
 * /projects/delete/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: An error occurred
 */
router.delete('/delete/:id', projectController.deleteProject.bind(projectController));

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project found
 *       404:
 *         description: Project not found
 *       500:
 *         description: An error occurred
 */
router.get('/:id', projectController.getProjectById.bind(projectController));

export default router;