import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard overview APIs
 */

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Dashboard]
 *     description: |
 *       Retrieves aggregated statistics for projects, tasks, and users.
 *       Uses MongoDB aggregation for optimized counting.
 *     responses:
 *       200:
 *         description: Dashboard overview statistics
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
 *                     projects:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of projects
 *                         active:
 *                           type: integer
 *                           description: Number of active projects
 *                         completed:
 *                           type: integer
 *                           description: Number of completed projects
 *                         archived:
 *                           type: integer
 *                           description: Number of archived projects
 *                     tasks:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of tasks
 *                         open:
 *                           type: integer
 *                           description: Number of open tasks
 *                         inProgress:
 *                           type: integer
 *                           description: Number of tasks in progress
 *                         completed:
 *                           type: integer
 *                           description: Number of completed tasks
 *                         blocked:
 *                           type: integer
 *                           description: Number of blocked tasks
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of users
 *                         active:
 *                           type: integer
 *                           description: Number of active users
 *               example:
 *                 success: true
 *                 data:
 *                   projects:
 *                     total: 25
 *                     active: 12
 *                     completed: 8
 *                     archived: 5
 *                   tasks:
 *                     total: 150
 *                     open: 45
 *                     inProgress: 32
 *                     completed: 68
 *                     blocked: 5
 *                   users:
 *                     total: 20
 *                     active: 18
 *       500:
 *         description: Server error
 */
router.get('/overview', dashboardController.getOverview.bind(dashboardController));

export default router;