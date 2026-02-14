import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';
import { JWTUtils, TokenPayload } from '../utils/jwt.utils.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * JWT Authentication middleware
 * - Reads token from Authorization: Bearer <token>
 * - Verifies using JWT_ACCESS_SECRET
 * - Attaches decoded user to req.user
 * - Returns 401 if invalid token
 * - Returns 403 if expired token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract token from Authorization header
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      errorResponse(res, 'Access token is required', 401);
      return;
    }

    // Verify the token
    try {
      const decoded = JWTUtils.verifyAccessToken(token);
      // Attach decoded user to request
      req.user = decoded;
      next();
    } catch (error) {
      // Handle different JWT error types
      if (error instanceof jwt.TokenExpiredError) {
        errorResponse(res, 'Access token has expired', 403);
        return;
      } else if (error instanceof jwt.JsonWebTokenError) {
        errorResponse(res, 'Invalid access token', 401);
        return;
      } else {
        errorResponse(res, 'Token verification failed', 401);
        return;
      }
    }
  } catch (error) {
    errorResponse(res, 'Authentication failed', 401);
  }
};

/**
 * Authorization middleware - checks if user has required roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

/**
 * Role-based authorization middleware
 * Usage: authorizeRoles("ADMIN") or authorizeRoles("ADMIN", "MANAGER")
 * - Reads req.user.role
 * - If role not allowed, returns 403
 * - Otherwise calls next()
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * Useful for endpoints that work with or without authentication
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      try {
        const decoded = JWTUtils.verifyAccessToken(token);
        req.user = decoded;
      } catch (error) {
        // Silently ignore token errors for optional authentication
        // Don't attach user to request
      }
    }

    next();
  } catch (error) {
    // Silently ignore errors for optional authentication
    next();
  }
};