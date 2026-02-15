import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AuditStore } from '../../store/audit.store';
import { AuditTimelineComponent } from '../audit-timeline/audit-timeline.component';
import { EntityType, AuditAction, AuditLog } from '../../models/audit';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonToggleModule,
    AuditTimelineComponent,
  ],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss'],
})
export class RecentActivityComponent implements OnInit {
  private router = inject(Router);
  store = inject(AuditStore);

  EntityType = EntityType;
  AuditAction = AuditAction;

  // Filter options
  selectedLimit = signal<number>(100);
  filterEntityType = signal<EntityType | 'ALL'>('ALL');
  filterAction = signal<AuditAction | 'ALL'>('ALL');

  limitOptions = [50, 100, 200, 500];
  entityTypes = ['ALL', ...Object.values(EntityType)];
  actions = ['ALL', ...Object.values(AuditAction)];

  // Filtered logs based on client-side filters
  filteredLogs = computed(() => {
    let logs = this.store.recentLogs();

    // Filter by entity type
    if (this.filterEntityType() !== 'ALL') {
      logs = logs.filter((log) => log.entityType === this.filterEntityType());
    }

    // Filter by action
    if (this.filterAction() !== 'ALL') {
      logs = logs.filter((log) => log.action === this.filterAction());
    }

    return logs;
  });

  ngOnInit(): void {
    // Load recent activity on init
    this.loadActivity();
  }

  loadActivity(): void {
    this.store.loadRecentActivity(this.selectedLimit());
  }

  refresh(): void {
    this.loadActivity();
  }

  clearFilters(): void {
    this.filterEntityType.set('ALL');
    this.filterAction.set('ALL');
  }

  viewEntityHistory(log: AuditLog): void {
    this.router.navigate(['/audit/entity'], {
      queryParams: {
        entityType: log.entityType,
        entityId: log.entityId,
      },
    });
  }

  viewUserActivity(log: AuditLog): void {
    if (log.performedBy) {
      this.router.navigate(['/audit/user'], {
        queryParams: {
          userId: log.performedBy._id,
        },
      });
    }
  }

  // Calculate statistics
  getActivityStats() {
    const logs = this.store.recentLogs();
    const filteredCount = this.filteredLogs().length;

    const byAction = {
      [AuditAction.CREATE]: logs.filter((l) => l.action === AuditAction.CREATE).length,
      [AuditAction.UPDATE]: logs.filter((l) => l.action === AuditAction.UPDATE).length,
      [AuditAction.DELETE]: logs.filter((l) => l.action === AuditAction.DELETE).length,
    };

    const byEntity = {
      [EntityType.PROJECT]: logs.filter((l) => l.entityType === EntityType.PROJECT).length,
      [EntityType.TASK]: logs.filter((l) => l.entityType === EntityType.TASK).length,
      [EntityType.USER]: logs.filter((l) => l.entityType === EntityType.USER).length,
    };

    // Get unique users
    const uniqueUsers = new Set(
      logs.filter((l) => l.performedBy).map((l) => l.performedBy!._id)
    );

    return {
      totalLogs: logs.length,
      filteredCount,
      byAction,
      byEntity,
      uniqueUsers: uniqueUsers.size,
    };
  }

  // Get most recent timestamp
  getMostRecentTime(): string | null {
    const logs = this.store.recentLogs();
    if (logs.length === 0) return null;
    return logs[0].timestamp;
  }
}
