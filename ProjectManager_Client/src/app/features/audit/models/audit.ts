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

export interface AuditLogUser {
  _id: string;
  uuid?: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuditLog {
  uuid: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  changes: {
    before?: any;
    after?: any;
  };
  performedBy?: AuditLogUser;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditQueryParams {
  limit?: number;
  skip?: number;
  startDate?: string;
  endDate?: string;
}

export interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
}

export interface AuditPaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  hasMore: boolean;
}
