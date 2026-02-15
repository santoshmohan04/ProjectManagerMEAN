import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuditService } from '@features/audit/services/audit.service';
import { TaskService } from '@features/tasks/services/task.service';
import { AuditLog, EntityType } from '@features/audit/models/audit';
import { Task } from '@features/tasks/models/task';
import { AuditTimelineComponent } from '@features/audit/components/audit-timeline/audit-timeline.component';
import { SkeletonLoaderComponent } from '@shared/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/empty-state/empty-state.component';

@Component({
  selector: 'app-task-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    AuditTimelineComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './task-history.component.html',
  styleUrls: ['./task-history.component.scss']
})
export class TaskHistoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auditService = inject(AuditService);
  private taskService = inject(TaskService);

  // State signals
  loading = signal(false);
  taskLoading = signal(false);
  error = signal<string | null>(null);
  taskError = signal<string | null>(null);
  
  // Data signals
  taskUuid = signal<string>('');
  task = signal<Task | null>(null);
  auditLogs = signal<AuditLog[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.taskUuid.set(uuid);
        this.loadTaskDetails();
        this.loadTaskHistory();
      } else {
        this.error.set('No task UUID provided');
      }
    });
  }

  loadTaskDetails(): void {
    this.taskLoading.set(true);
    this.taskError.set(null);

    this.taskService.getTask(this.taskUuid()).subscribe({
      next: (response) => {
        this.task.set(response.data);
        this.taskLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading task:', err);
        this.taskError.set('Failed to load task details.');
        this.taskLoading.set(false);
      }
    });
  }

  loadTaskHistory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.auditService.getEntityHistory(EntityType.TASK, this.taskUuid()).subscribe({
      next: (response) => {
        this.auditLogs.set(response.data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading task history:', err);
        this.error.set('Failed to load task history. Please try again.');
        this.loading.set(false);
      }
    });
  }

  refreshHistory(): void {
    this.loadTaskHistory();
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  viewTaskDetails(): void {
    this.router.navigate(['/tasks', this.taskUuid()]);
  }

  getStatusChipColor(status: string): string {
    switch (status) {
      case 'Completed': return 'accent';
      case 'In Progress': return 'primary';
      case 'Open': return 'warn';
      default: return 'primary';
    }
  }

  getPriorityColor(priority: number): string {
    if (priority >= 7) return 'high-priority';
    if (priority >= 4) return 'medium-priority';
    return 'low-priority';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
