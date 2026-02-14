import { Request, Response } from 'express';
import { AuditService } from './audit.service.js';
import { EntityType } from '../../models/audit.model.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  async getEntityHistory(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      const { limit = 50, skip = 0 } = req.query as { limit?: string; skip?: string };

      if (!Object.values(EntityType).includes(entityType as EntityType)) {
        return errorResponse(res, 'Invalid entity type', 'BAD_REQUEST', 400);
      }

      const history = await this.auditService.getEntityHistory(
        entityType as EntityType,
        entityId,
        parseInt(limit.toString()),
        parseInt(skip.toString())
      );

      successResponse(res, history);
    } catch (err) {
      errorResponse(res, 'Error fetching entity history');
    }
  }

  async getUserActivity(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 50, skip = 0 } = req.query as { limit?: string; skip?: string };

      const activity = await this.auditService.getUserActivity(
        userId as any, // Will be converted to ObjectId in service
        parseInt(limit.toString()),
        parseInt(skip.toString())
      );

      successResponse(res, activity);
    } catch (err) {
      errorResponse(res, 'Error fetching user activity');
    }
  }

  async getRecentActivity(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 100 } = req.query as { limit?: string };

      const activity = await this.auditService.getRecentActivity(
        parseInt(limit.toString())
      );

      successResponse(res, activity);
    } catch (err) {
      errorResponse(res, 'Error fetching recent activity');
    }
  }
}