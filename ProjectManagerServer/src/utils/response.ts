import { Response } from 'express';

export interface ApiResponse<T = any> {
  Success: boolean;
  Data?: T;
  Message?: string;
}

export const sendSuccess = <T>(res: Response, data?: T, message?: string, statusCode: number = 200): void => {
  const response: ApiResponse<T> = {
    Success: true,
    ...(data !== undefined && { Data: data }),
    ...(message && { Message: message }),
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, statusCode: number = 400): void => {
  const response: ApiResponse = {
    Success: false,
    Message: message,
  };
  res.status(statusCode).json(response);
};