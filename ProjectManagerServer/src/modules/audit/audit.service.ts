import { AuditLog, EntityType, AuditAction, IAuditLog } from '../../models/audit.model.js';
import mongoose from 'mongoose';

export interface AuditLogData {
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  changes?: {
    before?: any;
    after?: any;
  };
  performedBy?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  async logActivity(data: AuditLogData): Promise<IAuditLog> {
    try {
      const auditLog = new AuditLog({
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        changes: data.changes || {},
        performedBy: data.performedBy,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      return await auditLog.save();
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  async getEntityHistory(
    entityType: EntityType,
    entityId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<IAuditLog[]> {
    return AuditLog.find({ entityType, entityId })
      .populate('performedBy', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getUserActivity(
    userId: mongoose.Types.ObjectId,
    limit: number = 50,
    skip: number = 0
  ): Promise<IAuditLog[]> {
    return AuditLog.find({ performedBy: userId })
      .populate('performedBy', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getRecentActivity(limit: number = 100): Promise<IAuditLog[]> {
    return AuditLog.find()
      .populate('performedBy', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}