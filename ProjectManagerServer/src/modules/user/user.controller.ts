import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

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
      sendSuccess(res, users);
    } catch (err) {
      sendError(res, 'Error fetching users');
    }
  }

  async getActiveUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getActiveUsers();
      sendSuccess(res, users);
    } catch (err) {
      sendError(res, 'Error fetching active users');
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user);
    } catch (err) {
      sendError(res, 'Error fetching user');
    }
  }

  async getUserByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const user = await this.userService.getUserByUuid(uuid);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user);
    } catch (err) {
      sendError(res, 'Error fetching user');
    }
  }

  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user);
    } catch (err) {
      sendError(res, 'Error fetching user');
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        sendError(res, err.message, 409);
      } else {
        sendError(res, 'Error creating user');
      }
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUser(id, req.body);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user, 'User updated successfully');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        sendError(res, err.message, 409);
      } else {
        sendError(res, 'Error updating user');
      }
    }
  }

  async updateUserByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const user = await this.userService.updateUserByUuid(uuid, req.body);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user, 'User updated successfully');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        sendError(res, err.message, 409);
      } else {
        sendError(res, 'Error updating user');
      }
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);
      if (!deleted) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, null, 'User deleted successfully');
    } catch (err) {
      sendError(res, 'Error deleting user');
    }
  }

  async softDeleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.softDeleteUser(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user, 'User deactivated successfully');
    } catch (err) {
      sendError(res, 'Error deactivating user');
    }
  }

  async authenticateUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, passwordHash } = req.body;
      const user = await this.userService.authenticateUser(email, passwordHash);
      if (!user) {
        return sendError(res, 'Invalid credentials', 401);
      }
      sendSuccess(res, user, 'Authentication successful');
    } catch (err) {
      sendError(res, 'Authentication failed');
    }
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userService.signup(req.body);
      sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 'User created successfully', 201);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes('already exists')) {
        return sendError(res, error.message, 409);
      }
      sendError(res, 'Error creating user');
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userService.login(req.body);
      sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, 'Login successful');
    } catch (err) {
      const error = err as Error;
      if (error.message === 'Invalid email or password' || error.message === 'Account is deactivated') {
        return sendError(res, error.message, 401);
      }
      sendError(res, 'Login failed');
    }
  }
}