import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.js';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // TODO: Implement validation logic with a library like Joi or Zod
    next();
  };
};