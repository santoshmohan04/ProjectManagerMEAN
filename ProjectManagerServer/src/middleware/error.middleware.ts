import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);
  sendError(res, 'Internal Server Error', 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 'Route not found', 404);
};