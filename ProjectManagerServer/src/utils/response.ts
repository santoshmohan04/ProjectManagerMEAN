import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: any;
  message?: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errorCode: string;
  timestamp: string;
  stack?: string; // Only included in development
}

export const successResponse = <T>(
  res: Response,
  data?: T,
  meta?: any,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
    ...(message && { message }),
  };
  res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400
): void => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: Response,
  message: string,
  errorCode: string,
  statusCode: number = 500,
  stack?: string
): void => {
  const response: ErrorResponse = {
    success: false,
    message,
    errorCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && stack && { stack }),
  };
  res.status(statusCode).json(response);
};