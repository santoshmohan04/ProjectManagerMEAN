import { Request, Response, NextFunction } from 'express';
import { AuditService, AuditLogData } from './audit.service.js';
import { EntityType, AuditAction } from '../../models/audit.model.js';
import mongoose from 'mongoose';

export class AuditMiddleware {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  // Middleware to extract user info and add audit logging methods to request
  auditLogger(req: Request, res: Response, next: NextFunction): void {
    // Extract user ID from JWT or session
    const userId = this.extractUserId(req);

    // Extract client info
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.get('User-Agent');

    // Add audit methods to request object
    (req as any).audit = {
      logCreate: (entityType: EntityType, entityId: string, after: any) => {
        return this.auditService.logActivity({
          entityType,
          entityId,
          action: AuditAction.CREATE,
          changes: { after },
          performedBy: userId,
          ipAddress,
          userAgent,
        });
      },

      logUpdate: (entityType: EntityType, entityId: string, before: any, after: any) => {
        return this.auditService.logActivity({
          entityType,
          entityId,
          action: AuditAction.UPDATE,
          changes: { before, after },
          performedBy: userId,
          ipAddress,
          userAgent,
        });
      },

      logDelete: (entityType: EntityType, entityId: string, before: any) => {
        return this.auditService.logActivity({
          entityType,
          entityId,
          action: AuditAction.DELETE,
          changes: { before },
          performedBy: userId,
          ipAddress,
          userAgent,
        });
      },

      logActivity: (data: Omit<AuditLogData, 'performedBy' | 'ipAddress' | 'userAgent'>) => {
        return this.auditService.logActivity({
          ...data,
          performedBy: userId,
          ipAddress,
          userAgent,
        });
      },
    };

    next();
  }

  private extractUserId(req: Request): mongoose.Types.ObjectId | undefined {
    // Try to get user ID from different sources
    const user = (req as any).user; // From JWT middleware
    if (user && user._id) {
      return user._id;
    }

    // Try from session
    if ((req as any).session && (req as any).session.userId) {
      return new mongoose.Types.ObjectId((req as any).session.userId);
    }

    // Try from headers (for testing or API keys)
    const userIdHeader = req.get('X-User-ID');
    if (userIdHeader) {
      try {
        return new mongoose.Types.ObjectId(userIdHeader);
      } catch {
        // Invalid ObjectId, ignore
      }
    }

    return undefined;
  }

  private extractIpAddress(req: Request): string | undefined {
    // Try different headers for IP address
    return (
      req.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
      req.get('X-Real-IP') ||
      req.get('CF-Connecting-IP') ||
      req.ip ||
      req.connection.remoteAddress
    );
  }
}

// Export singleton instance
export const auditMiddleware = new AuditMiddleware();