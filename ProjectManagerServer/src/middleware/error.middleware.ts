import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { sendErrorResponse } from '../utils/response.js';
import { config } from '../config/env.js';

// Custom error class for operational errors
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Zod validation errors
const handleZodError = (err: any): { message: string; errorCode: string; statusCode: number } => {
  // If it's a real ZodError with issues
  if (err.issues && Array.isArray(err.issues)) {
    const errors = err.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`);
    return {
      message: `Validation failed: ${errors.join(', ')}`,
      errorCode: 'VALIDATION_ERROR',
      statusCode: 400,
    };
  }
  // If it's a simulated ZodError (just has the name)
  return {
    message: err.message || 'Zod validation failed',
    errorCode: 'VALIDATION_ERROR',
    statusCode: 400,
  };
};

// Handle Mongoose errors
const handleMongooseError = (err: mongoose.Error): { message: string; errorCode: string; statusCode: number } => {
  if (err instanceof mongoose.Error.CastError) {
    return {
      message: `Invalid ${err.path}: ${err.value}`,
      errorCode: 'INVALID_ID',
      statusCode: 400,
    };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((error: any) => error.message);
    return {
      message: `Validation failed: ${errors.join(', ')}`,
      errorCode: 'VALIDATION_ERROR',
      statusCode: 400,
    };
  }

  if (err instanceof mongoose.Error.DocumentNotFoundError) {
    return {
      message: 'Document not found',
      errorCode: 'NOT_FOUND',
      statusCode: 404,
    };
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return {
      message: `${field} already exists`,
      errorCode: 'DUPLICATE_ERROR',
      statusCode: 409,
    };
  }

  return {
    message: 'Database error occurred',
    errorCode: 'DATABASE_ERROR',
    statusCode: 500,
  };
};

// Handle JWT errors
const handleJWTError = (err: Error): { message: string; errorCode: string; statusCode: number } => {
  if (err.name === 'JsonWebTokenError') {
    return {
      message: 'Invalid token',
      errorCode: 'INVALID_TOKEN',
      statusCode: 401,
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      message: 'Token expired',
      errorCode: 'TOKEN_EXPIRED',
      statusCode: 401,
    };
  }

  return {
    message: 'Authentication error',
    errorCode: 'AUTH_ERROR',
    statusCode: 401,
  };
};

// Main error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';
  let statusCode = 500;

  // Log the full error stack internally
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    constructor: err.constructor.name,
    instanceofZod: err instanceof ZodError,
    instanceofMongoose: err instanceof mongoose.Error,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Handle different error types
  if (err.name === 'ZodError' || err instanceof ZodError) {
    const errorInfo = handleZodError(err as ZodError);
    message = errorInfo.message;
    errorCode = errorInfo.errorCode;
    statusCode = errorInfo.statusCode;
  } else if (err instanceof mongoose.Error || err.name === 'ValidationError') {
    const errorInfo = handleMongooseError(err);
    message = errorInfo.message;
    errorCode = errorInfo.errorCode;
    statusCode = errorInfo.statusCode;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const errorInfo = handleJWTError(err);
    message = errorInfo.message;
    errorCode = errorInfo.errorCode;
    statusCode = errorInfo.statusCode;
  } else if (err instanceof AppError) {
    message = err.message;
    errorCode = err.errorCode;
    statusCode = err.statusCode;
  } else if (err.name === 'MulterError') {
    // Handle file upload errors
    message = 'File upload error';
    errorCode = 'UPLOAD_ERROR';
    statusCode = 400;
  } else if (err.message.includes('rate limit')) {
    // Handle rate limiting errors
    message = err.message;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    statusCode = 429;
  }

  // Send structured error response
  sendErrorResponse(res, `[${err.name}] ${message}`, errorCode, statusCode, config.nodeEnv === 'development' ? err.stack : undefined);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  sendErrorResponse(res, `Route ${req.originalUrl} not found`, 'NOT_FOUND', 404);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);