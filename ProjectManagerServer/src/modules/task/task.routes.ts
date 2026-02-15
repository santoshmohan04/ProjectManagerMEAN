import { Router } from 'express';
import { TaskController } from './task.controller.js';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware.js';
import { validateUuidParam } from '../../middleware/validation.middleware.js';

const router = Router();
const taskController = new TaskController();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get tasks with pagination and filtering
 *     tags: [Tasks]
 *     description: Returns a paginated list of tasks with optional filtering and sorting.
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
 *         description: Sort field and order (e.g., "title:asc", "priority:desc", "createdAt:desc")
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED]
 *         description: Filter by task status (multiple values allowed)
 *       - in: query
 *         name: priority
 *         schema:
 *           type: object
 *           properties:
 *             min:
 *               type: integer
 *               minimum: 1
 *               maximum: 5
 *             max:
 *               type: integer
 *               minimum: 1
 *               maximum: 5
 *         description: Filter by priority range
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project UUID
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user UUID
 *       - in: query
 *         name: parentTask
 *         schema:
 *           type: string
 *         description: Filter by parent task UUID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search in task titles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of tasks
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
 *                             description: Task UUID
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           priority:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 5
 *                           status:
 *                             type: string
 *                             enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED]
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                           project:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           assignedTo:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           parentTask:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
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
router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'USER'), taskController.getTasksWithFilters.bind(taskController));

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       400:
 *         description: Error occurred while creating new task
 */
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'USER'), taskController.createTask.bind(taskController));

/**
 * @swagger
 * /tasks/{uuid}:
 *   get:
 *     summary: Get a task by UUID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     responses:
 *       200:
 *         description: Task found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Task not found
 *       500:
 *         description: An error occurred
 */
router.get('/:uuid', authorizeRoles('ADMIN', 'MANAGER', 'USER'), validateUuidParam(), taskController.getTaskByUuid.bind(taskController));

/**
 * @swagger
 * /tasks/{uuid}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       400:
 *         description: Error occurred while updating task
 *       404:
 *         description: Task not found
 */
router.put('/:uuid', authorizeRoles('ADMIN', 'MANAGER', 'USER'), validateUuidParam(), taskController.updateTaskByUuid.bind(taskController));

/**
 * @swagger
 * /tasks/{uuid}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Task not found
 *       500:
 *         description: An error occurred
 */
router.delete('/:uuid', authorizeRoles('ADMIN', 'MANAGER'), validateUuidParam(), taskController.deleteTaskByUuid.bind(taskController));

/**
 * @swagger
 * /tasks/bulk-update:
 *   put:
 *     summary: Bulk update tasks
 *     tags: [Tasks]
 *     description: Update multiple tasks by their UUIDs with the same data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuids
 *               - updates
 *             properties:
 *               uuids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of task UUIDs to update
 *                 example: ["0192a1b2-3c4d-7e8f-9a0b-1c2d3e4f5g6h", "0192a1b2-3c4d-7e8f-9a0b-1c2d3e4f5g7i"]
 *               updates:
 *                 type: object
 *                 description: Fields to update (only status, priority, and assignedTo are allowed)
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED]
 *                     example: "IN_PROGRESS"
 *                   priority:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     example: 3
 *                   assignedTo:
 *                     type: string
 *                     description: User ID to assign the task to
 *                     example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Tasks updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount:
 *                       type: number
 *                       description: Number of tasks that were modified
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: "Tasks updated successfully"
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.put('/bulk-update', authorizeRoles('ADMIN', 'MANAGER'), taskController.bulkUpdateTasks.bind(taskController));

export default router;