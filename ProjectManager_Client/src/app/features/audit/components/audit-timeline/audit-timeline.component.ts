import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuditLog, AuditAction, EntityType } from '../../models/audit';

@Component({
  selector: 'app-audit-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
  ],
  templateUrl: './audit-timeline.component.html',
  styleUrls: ['./audit-timeline.component.scss'],
})
export class AuditTimelineComponent {
  @Input({ required: true }) logs: AuditLog[] = [];
  @Input() showEntityInfo = true;
  @Input() showUserInfo = true;

  // Track expanded state for each log
  expandedLogs = signal<Set<string>>(new Set());

  // Enum references for template
  AuditAction = AuditAction;
  EntityType = EntityType;

  toggleExpanded(logUuid: string): void {
    const expanded = this.expandedLogs();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(logUuid)) {
      newExpanded.delete(logUuid);
    } else {
      newExpanded.add(logUuid);
    }

    this.expandedLogs.set(newExpanded);
  }

  isExpanded(logUuid: string): boolean {
    return this.expandedLogs().has(logUuid);
  }

  getActionIcon(action: AuditAction): string {
    switch (action) {
      case AuditAction.CREATE:
        return 'add_circle';
      case AuditAction.UPDATE:
        return 'edit';
      case AuditAction.DELETE:
        return 'delete';
      default:
        return 'info';
    }
  }

  getActionColor(action: AuditAction): string {
    switch (action) {
      case AuditAction.CREATE:
        return 'success';
      case AuditAction.UPDATE:
        return 'primary';
      case AuditAction.DELETE:
        return 'warn';
      default:
        return 'accent';
    }
  }

  getEntityIcon(entityType: EntityType): string {
    switch (entityType) {
      case EntityType.PROJECT:
        return 'work';
      case EntityType.TASK:
        return 'assignment';
      case EntityType.USER:
        return 'person';
      default:
        return 'folder';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return this.formatDate(dateString);
  }

  getUserName(log: AuditLog): string {
    if (!log.performedBy) return 'System';
    return `${log.performedBy.firstName} ${log.performedBy.lastName}`;
  }

  hasChanges(log: AuditLog): boolean {
    return !!(log.changes.before || log.changes.after);
  }

  getChangedFields(log: AuditLog): string[] {
    if (!log.changes.before || !log.changes.after) return [];

    const beforeKeys = new Set(Object.keys(log.changes.before));
    const afterKeys = new Set(Object.keys(log.changes.after));
    const allKeys = new Set([...beforeKeys, ...afterKeys]);

    return Array.from(allKeys).filter((key) => {
      const before = log.changes.before?.[key];
      const after = log.changes.after?.[key];
      return JSON.stringify(before) !== JSON.stringify(after);
    });
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  getFieldValue(log: AuditLog, field: string, type: 'before' | 'after'): any {
    const changes = type === 'before' ? log.changes.before : log.changes.after;
    return changes?.[field];
  }
}
