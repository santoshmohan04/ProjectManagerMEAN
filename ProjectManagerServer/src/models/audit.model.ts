import mongoose, { Schema, Document } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';

export enum EntityType {
  PROJECT = 'PROJECT',
  TASK = 'TASK',
  USER = 'USER',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface IAuditLog extends Document {
  uuid: string;
  entityType: EntityType;
  entityId: string; // UUID of the entity being audited
  action: AuditAction;
  changes: {
    before?: any;
    after?: any;
  };
  performedBy?: mongoose.Types.ObjectId; // Reference to User who performed the action
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

const auditLogSchema = new Schema<IAuditLog>({
  uuid: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv7(),
  },
  entityType: {
    type: String,
    required: true,
    enum: Object.values(EntityType),
  },
  entityId: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: Object.values(AuditAction),
  },
  changes: {
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
});

// Compound indexes for efficient querying
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// Static method to create audit log entry
auditLogSchema.statics.createLog = async function(
  entityType: EntityType,
  entityId: string,
  action: AuditAction,
  changes: { before?: any; after?: any },
  performedBy?: mongoose.Types.ObjectId,
  ipAddress?: string,
  userAgent?: string
): Promise<IAuditLog> {
  const auditLog = new this({
    entityType,
    entityId,
    action,
    changes,
    performedBy,
    ipAddress,
    userAgent,
  });

  return auditLog.save();
};

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);