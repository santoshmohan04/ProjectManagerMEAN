import { Router } from 'express';
import { TaskController } from './task.controller.js';

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
 *     summary: List tasks
 *     tags: [Tasks]
 *     description: |
 *       Retrieves a list of tasks with optional filters.
 *       - `projectId` = filter by project
 *       - `parentId` = filter by parent task (subtasks)
 *       - `searchKey` = search by title (case-insensitive)
 *       - `sortKey` = sort by any field (default ascending)
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter tasks by project ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Filter tasks by parent task ID
 *       - in: query
 *         name: searchKey
 *         schema:
 *           type: string
 *         description: Search tasks by title
 *       - in: query
 *         name: sortKey
 *         schema:
 *           type: string
 *         description: Sort by a specific field (default ascending)
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Server error
 */
router.get('/', taskController.getTasks.bind(taskController));

/**
 * @swagger
 * /tasks/search:
 *   post:
 *     summary: Advanced task search
 *     tags: [Tasks]
 *     description: |
 *       Performs an advanced search on tasks with complex filtering, sorting, and pagination.
 *       Supports multiple filters, custom sorting, and paginated results.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filters
 *             properties:
 *               filters:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [pending, in-progress, completed, cancelled]
 *                     description: Filter by task status (multiple values allowed)
 *                   priority:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                         description: Minimum priority level
 *                       max:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                         description: Maximum priority level
 *                     description: Filter by priority range
 *                   assignedTo:
 *                     type: string
 *                     description: Filter by assigned user UUID
 *                   projectId:
 *                     type: string
 *                     description: Filter by project UUID
 *                   dueDateBefore:
 *                     type: string
 *                     format: date-time
 *                     description: Filter tasks due before this date
 *               sort:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     enum: [title, priority, status, dueDate, createdAt, updatedAt]
 *                     description: Field to sort by
 *                   order:
 *                     type: string
 *                     enum: [asc, desc]
 *                     description: Sort order
 *                 description: Sorting configuration
 *               pagination:
 *                 type: object
 *                 properties:
 *                   page:
 *                     type: integer
 *                     minimum: 1
 *                     default: 1
 *                     description: Page number (1-based)
 *                   limit:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 100
 *                     default: 10
 *                     description: Number of items per page
 *                 description: Pagination configuration
 *           example:
 *             filters:
 *               status: ["pending", "in-progress"]
 *               priority: { min: 3, max: 5 }
 *               assignedTo: "user-uuid-123"
 *               projectId: "project-uuid-456"
 *               dueDateBefore: "2024-12-31T23:59:59Z"
 *             sort:
 *               field: "priority"
 *               order: "desc"
 *             pagination:
 *               page: 1
 *               limit: 20
 *     responses:
 *       200:
 *         description: Search results with pagination metadata
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
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *               example:
 *                 success: true
 *                 data:
 *                   data: []
 *                   meta:
 *                     page: 1
 *                     limit: 20
 *                     total: 0
 *                     totalPages: 0
 *       400:
 *         description: Invalid request - missing filters
 *       500:
 *         description: Server error
 */
router.post('/search', taskController.advancedSearch.bind(taskController));

/**
 * @swagger
 * /tasks/add:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     description: Creates a new task. If `Parent` is provided, it will be created as a subtask.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid request
 */
router.post('/add', taskController.createTask.bind(taskController));

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/:id', taskController.getTaskById.bind(taskController));

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Task not found
 */
router.put('/:id', taskController.updateTask.bind(taskController));

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', taskController.deleteTask.bind(taskController));

export default router;