import { Request, Response } from 'express';
import { AuthService, LoginRequest, AuthResponse } from './auth.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;

      // Basic validation
      if (!credentials.email || !credentials.password) {
        return errorResponse(res, 'Email and password are required', "VALIDATION_ERROR", 400);
      }

      const result = await this.authService.login(credentials);
      successResponse(res, result, undefined, 'Login successful');
    } catch (err: any) {
      errorResponse(res, err.message || 'Login failed', "VALIDATION_ERROR", 401);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;

      // Basic validation
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        return errorResponse(res, 'Email, password, firstName, and lastName are required', 'BAD_REQUEST', 400);
      }

      const result = await this.authService.register(userData);
      successResponse(res, result, undefined, 'Registration successful', 201);
    } catch (err: any) {
      errorResponse(res, err.message || 'Registration failed', "VALIDATION_ERROR", 400);
    }
  }
}