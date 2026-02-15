import { Component, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AuditStore } from '../../store/audit.store';
import { AuditTimelineComponent } from '../audit-timeline/audit-timeline.component';
import { EntityType, AuditAction } from '../../models/audit';

@Component({
  selector: 'app-user-activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatChipsModule,
    AuditTimelineComponent,
  ],
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
})
export class UserActivityComponent {
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParams, { initialValue: {} as Params });
  private router = inject(Router);
  store = inject(AuditStore);

  // Form fields
  userId = signal<string>('');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  // Track if we've loaded based on route params
  private hasLoadedFromRoute = false;

  constructor() {
    // Effect to reload when pagination changes
    effect(() => {
      const page = this.store.pagination().currentPage;
      const pageSize = this.store.pagination().pageSize;
      const userId = this.store.userId();

      if (userId && this.hasLoadedFromRoute) {
        this.loadActivity();
      }
    });

    // Effect to reload when date filter changes
    effect(() => {
      const dateRange = this.store.dateRange();
      if (this.hasLoadedFromRoute && this.store.userId()) {
        this.loadActivity();
      }
    });

    // Effect to handle route query params
    effect(() => {
      const params = this.queryParams() || {};
      const userId = params['userId'];
      
      if (userId) {
        this.userId.set(userId as string);
        this.hasLoadedFromRoute = true;
        this.loadActivity();
      }
    });
  }

  loadActivity(): void {
    const userId = this.userId().trim();

    if (!userId) {
      return;
    }

    this.store.loadUserActivity(userId);
  }

  applyDateFilter(): void {
    this.store.setDateRange(this.startDate(), this.endDate());
  }

  clearDateFilter(): void {
    this.startDate.set(null);
    this.endDate.set(null);
    this.store.clearDateRange();
  }

  nextPage(): void {
    this.store.nextPage();
  }

  previousPage(): void {
    this.store.previousPage();
  }

  refresh(): void {
    this.loadActivity();
  }

  clearResults(): void {
    this.store.clearUserLogs();
    this.userId.set('');
    this.hasLoadedFromRoute = false;

    // Clear query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge',
    });
  }

  // Calculate statistics from logs
  getActivityStats() {
    const logs = this.store.userLogs();
    const totalActions = logs.length;

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

    return { totalActions, byAction, byEntity };
  }

  getUserInfo() {
    const logs = this.store.userLogs();
    if (logs.length > 0 && logs[0].performedBy) {
      return logs[0].performedBy;
    }
    return null;
  }
}
