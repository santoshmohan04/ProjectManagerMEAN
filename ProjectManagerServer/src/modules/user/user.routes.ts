import { Router } from 'express';
import { UserController } from './user.controller.js';

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
 *     summary: List users
 *     tags: [Users]
 *     parameters:
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
 *         description: List of users
 */
router.get('/', userController.getUsers.bind(userController));

/**
 * @swagger
 * /users/active:
 *   get:
 *     summary: List active users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of active users
 */
router.get('/active', userController.getActiveUsers.bind(userController));

/**
 * @swagger
 * /users/add:
 *   post:
 *     summary: Create a new user
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
 *       409:
 *         description: Email or employee ID already exists
 *       400:
 *         description: Invalid request data
 */
router.post('/add', userController.createUser.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', userController.getUserById.bind(userController));

/**
 * @swagger
 * /users/uuid/{uuid}:
 *   get:
 *     summary: Get user by UUID
 *     tags: [Users]
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
 *       404:
 *         description: User not found
 */
router.get('/uuid/:uuid', userController.getUserByUuid.bind(userController));

/**
 * @swagger
 * /users/email/{email}:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
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
 *       404:
 *         description: User not found
 */
router.get('/email/:email', userController.getUserByEmail.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *       404:
 *         description: User not found
 *       409:
 *         description: Email or employee ID already exists
 */
router.put('/:id', userController.updateUser.bind(userController));

/**
 * @swagger
 * /users/uuid/{uuid}:
 *   put:
 *     summary: Update user by UUID
 *     tags: [Users]
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
 *       404:
 *         description: User not found
 *       409:
 *         description: Email or employee ID already exists
 */
router.put('/uuid/:uuid', userController.updateUserByUuid.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Hard delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', userController.deleteUser.bind(userController));

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Soft delete (deactivate) user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/deactivate', userController.softDeleteUser.bind(userController));

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