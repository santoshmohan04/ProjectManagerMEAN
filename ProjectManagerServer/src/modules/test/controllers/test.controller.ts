import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { successResponse } from '../../../utils/response.js';

export class TestController {
  // Test Zod validation error
  static testZodError = (req: Request, res: Response, next: NextFunction): void => {
    const error = new Error('Validation failed: name: Expected string, received number');
    error.name = 'ZodError';
    next(error);
  };

  // Test Mongoose validation error
  static testMongooseError = (req: Request, res: Response, next: NextFunction): void => {
    const error = new Error('Validation failed');
    (error as any).name = 'ValidationError';
    (error as any).errors = {
      email: {
        name: 'ValidatorError',
        message: 'Email is required'
      }
    };
    next(error);
  };

  // Test JWT error
  static testJwtError = (req: Request, res: Response, next: NextFunction): void => {
    const error = new Error('jwt malformed');
    (error as any).name = 'JsonWebTokenError';
    next(error);
  };

  // Test generic error
  static testGenericError = (req: Request, res: Response, next: NextFunction): void => {
    next(new Error('Something went wrong'));
  };

  // Test success response
  static testSuccess = (req: Request, res: Response): void => {
    successResponse(res, { test: 'success' }, undefined, 'Test endpoint working');
  };
}