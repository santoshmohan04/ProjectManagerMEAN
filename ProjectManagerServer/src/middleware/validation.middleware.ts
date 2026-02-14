import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.js';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // TODO: Implement validation logic with a library like Joi or Zod
    next();
  };
};

/**
 * UUID parameter validation middleware
 * Validates that the UUID parameter matches UUID v7 format
 */
export const validateUuidParam = (paramName: string = 'uuid') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuid || !uuidRegex.test(uuid)) {
      errorResponse(res, `Invalid ${paramName} format. Must be a valid UUID v7.`, 400);
      return;
    }

    next();
  };
};