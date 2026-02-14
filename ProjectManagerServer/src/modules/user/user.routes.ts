import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate, authorizeRoles, authorizeUserAccess, authorizeUserUpdate } from '../../middleware/auth.middleware.js';
import { validateUuidParam } from '../../middleware/validation.middleware.js';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users (paginated)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: searchKey
 *         schema:
 *           type: string
 *         description: Search users by first name, last name, or email
 *       - in: query
 *         name: sortKey
 *         schema:
 *           type: string
 *         description: Sort by a field (default ascending)
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Filter only active users
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), userController.getUsers.bind(userController));

/**
 * @swagger
 * /users/active:
 *   get:
 *     summary: List active users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/active', authenticate, authorizeRoles('ADMIN', 'MANAGER'), userController.getActiveUsers.bind(userController));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - passwordHash
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               employeeId:
 *                 type: string
 *                 description: Employee ID (optional)
 *               passwordHash:
 *                 type: string
 *                 description: Hashed password
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, USER]
 *                 description: User role
 *               isActive:
 *                 type: boolean
 *                 description: Whether the user is active
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       409:
 *         description: Email or employee ID already exists
 *       400:
 *         description: Invalid request data
 */
router.post('/', authenticate, authorizeRoles('ADMIN'), userController.createUser.bind(userController));

/**
 * @swagger
 * /users/{uuid}:
 *   get:
 *     summary: Get user by UUID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only view own profile
 *       404:
 *         description: User not found
 */
router.get('/:uuid', authenticate, validateUuidParam(), authorizeUserAccess, userController.getUserById.bind(userController));

/**
 * @swagger
 * /users/email/{email}:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 */
router.get('/email/:email', authenticate, authorizeRoles('ADMIN', 'MANAGER'), userController.getUserByEmail.bind(userController));

/**
 * @swagger
 * /users/{uuid}:
 *   put:
 *     summary: Update user by UUID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               employeeId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, USER]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only update own profile or admin access required
 *       404:
 *         description: User not found
 *       409:
 *         description: Email or employee ID already exists
 */
router.put('/:uuid', authenticate, validateUuidParam(), authorizeUserUpdate, userController.updateUser.bind(userController));

/**
 * @swagger
 * /users/{uuid}:
 *   delete:
 *     summary: Soft delete (deactivate) user by UUID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: User not found
 */
router.delete('/:uuid', authenticate, authorizeRoles('ADMIN'), validateUuidParam(), userController.softDeleteUser.bind(userController));

/**
 * @swagger
 * /users/authenticate:
 *   post:
 *     summary: Authenticate user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - passwordHash
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               passwordHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/authenticate', userController.authenticateUser.bind(userController));

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               employeeId:
 *                 type: string
 *                 maxLength: 20
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *       409:
 *         description: Email or employee ID already exists
 *       400:
 *         description: Invalid input data
 */
router.post('/signup', userController.signup.bind(userController));

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         uuid:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                         employeeId:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [ADMIN, MANAGER, USER]
 *                         isActive:
 *                           type: boolean
 *                         lastLogin:
 *                           type: string
 *                           format: date-time
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token (15 minutes expiry)
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token (7 days expiry)
 *       401:
 *         description: Invalid credentials or account deactivated
 *       400:
 *         description: Invalid input data
 */
router.post('/login', userController.login.bind(userController));

export default router;