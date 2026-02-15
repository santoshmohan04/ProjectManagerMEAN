import { Router } from 'express';
import { AuditController } from './audit.controller.js';

const router = Router();
const auditController = new AuditController();

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Audit log management APIs
 */

/**
 * @swagger
 * /audit/entity/{entityType}/{entityId}:
 *   get:
 *     summary: Get audit history for a specific entity
 *     tags: [Audit]
 *     description: |
 *       Retrieves the complete audit history for a specific entity (project, task, or user).
 *       Shows all create, update, and delete operations performed on the entity.
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PROJECT, TASK, USER]
 *         description: Type of entity to get history for
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the entity
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Entity audit history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uuid:
 *                         type: string
 *                       entityType:
 *                         type: string
 *                         enum: [PROJECT, TASK, USER]
 *                       entityId:
 *                         type: string
 *                       action:
 *                         type: string
 *                         enum: [CREATE, UPDATE, DELETE]
 *                       changes:
 *                         type: object
 *                         properties:
 *                           before:
 *                             type: object
 *                           after:
 *                             type: object
 *                       performedBy:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       ipAddress:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *       400:
 *         description: Invalid entity type
 *       500:
 *         description: Server error
 */
router.get('/entity/:entityType/:entityId', auditController.getEntityHistory.bind(auditController));

/**
 * @swagger
 * /audit/user/{userId}:
 *   get:
 *     summary: Get audit activity for a specific user
 *     tags: [Audit]
 *     description: |
 *       Retrieves all audit log entries for actions performed by a specific user.
 *       Shows what operations the user has performed across all entities.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (ObjectId) to get activity for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: User audit activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', auditController.getUserActivity.bind(auditController));

/**
 * @swagger
 * /audit/recent:
 *   get:
 *     summary: Get recent audit activity
 *     tags: [Audit]
 *     description: |
 *       Retrieves the most recent audit log entries across all entities and users.
 *       Useful for monitoring recent system activity.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 100
 *         description: Maximum number of records to return
 *     responses:
 *       200:
 *         description: Recent audit activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *       500:
 *         description: Server error
 */
router.get('/recent', auditController.getRecentActivity.bind(auditController));

export default router;