import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { EntityType } from '../../models/audit.model.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { searchKey, sortKey, activeOnly } = req.query as {
        searchKey?: string;
        sortKey?: string;
        activeOnly?: string;
      };
      const users = await this.userService.getAllUsers(
        searchKey,
        sortKey,
        activeOnly === 'true'
      );
      successResponse(res, users);
    } catch (err) {
      errorResponse(res, 'Error fetching users');
    }
  }

  async getActiveUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getActiveUsers();
      successResponse(res, users);
    } catch (err) {
      errorResponse(res, 'Error fetching active users');
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      successResponse(res, user);
    } catch (err) {
      errorResponse(res, 'Error fetching user');
    }
  }

  async getUserByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const user = await this.userService.getUserByUuid(uuid);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      successResponse(res, user);
    } catch (err) {
      errorResponse(res, 'Error fetching user');
    }
  }

  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      successResponse(res, user);
    } catch (err) {
      errorResponse(res, 'Error fetching user');
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);

      // Log the creation
      if ((req as any).audit) {
        await (req as any).audit.logCreate(EntityType.USER, user.uuid, user.toObject());
      }

      successResponse(res, user, undefined, 'User created successfully', 201);
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        errorResponse(res, err.message, 409);
      } else {
        errorResponse(res, 'Error creating user');
      }
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the original user for audit logging
      const originalUser = await this.userService.getUserById(id);

      const user = await this.userService.updateUser(id, req.body);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Log the update
      if ((req as any).audit && originalUser) {
        await (req as any).audit.logUpdate(
          EntityType.USER,
          user.uuid,
          originalUser.toObject(),
          user.toObject()
        );
      }

      successResponse(res, user, undefined, 'User updated successfully');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        errorResponse(res, err.message, 409);
      } else {
        errorResponse(res, 'Error updating user');
      }
    }
  }

  async updateUserByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const user = await this.userService.updateUserByUuid(uuid, req.body);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      successResponse(res, user, undefined, 'User updated successfully');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        errorResponse(res, err.message, 409);
      } else {
        errorResponse(res, 'Error updating user');
      }
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the user before deleting for audit logging
      const user = await this.userService.getUserById(id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Log the deletion before actually deleting
      if ((req as any).audit) {
        await (req as any).audit.logDelete(EntityType.USER, user.uuid, user.toObject());
      }

      const deleted = await this.userService.deleteUser(id);
      if (!deleted) {
        return errorResponse(res, 'User not found', 404);
      }
      successResponse(res, null, undefined, 'User deleted successfully');
    } catch (err) {
      errorResponse(res, 'Error deleting user');
    }
  }

  async softDeleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.softDeleteUser(id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      successResponse(res, user, undefined, 'User deactivated successfully');
    } catch (err) {
      errorResponse(res, 'Error deactivating user');
    }
  }

  async authenticateUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, passwordHash } = req.body;
      const user = await this.userService.authenticateUser(email, passwordHash);
      if (!user) {
        return errorResponse(res, 'Invalid credentials', 401);
      }
      successResponse(res, user, undefined, 'Authentication successful');
    } catch (err) {
      errorResponse(res, 'Authentication failed');
    }
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userService.signup(req.body);
      successResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, undefined, 'User created successfully', 201);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('already exists')) {
        return errorResponse(res, error.message, 409);
      }
      errorResponse(res, 'Error creating user');
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userService.login(req.body);
      successResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, undefined, 'Login successful');
    } catch (err) {
      const error = err as Error;
      if (error.message === 'Invalid email or password' || error.message === 'Account is deactivated') {
        return errorResponse(res, error.message, 401);
      }
      errorResponse(res, 'Login failed');
    }
  }
}