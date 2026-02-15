import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { AuditService } from '@features/audit/services/audit.service';
import { AuditLog } from '@features/audit/models/audit';
import { AuditTimelineComponent } from '@features/audit/components/audit-timeline/audit-timeline.component';
import { SkeletonLoaderComponent } from '@shared/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/empty-state/empty-state.component';
import { AuthStore } from '@core/auth.store';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    AuditTimelineComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent implements OnInit {
  private auditService = inject(AuditService);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  // State signals
  loading = signal(false);
  error = signal<string | null>(null);
  activities = signal<AuditLog[]>([]);
  
  // User info
  currentUser = this.authStore.user;
  isAdmin = this.authStore.isAdmin;

  ngOnInit(): void {
    this.loadRecentActivity();
  }

  loadRecentActivity(): void {
    this.loading.set(true);
    this.error.set(null);

    this.auditService.getRecentActivity().subscribe({
      next: (response) => {
        // Limit to 50 most recent activities
        const activities = Array.isArray(response.data) ? response.data : [];
        this.activities.set(activities.slice(0, 50));
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading recent activity:', err);
        this.error.set('Failed to load recent activity. Please try again.');
        this.loading.set(false);
      }
    });
  }

  refreshActivity(): void {
    this.loadRecentActivity();
  }

  viewFullAudit(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/audit']);
    }
  }

  getActivityStats(): { today: number; thisWeek: number; thisMonth: number } {
    const activities = this.activities();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      today: activities.filter(a => new Date(a.timestamp) >= todayStart).length,
      thisWeek: activities.filter(a => new Date(a.timestamp) >= weekStart).length,
      thisMonth: activities.filter(a => new Date(a.timestamp) >= monthStart).length,
    };
  }
}
