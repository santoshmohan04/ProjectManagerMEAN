import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DashboardStore } from './store/dashboard.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly store = inject(DashboardStore);

  // Metric card configurations
  readonly projectMetrics = computed(() => {
    const stats = this.store.projectStats();
    if (!stats) return [];
    
    return [
      {
        title: 'Total Projects',
        value: stats.total,
        icon: 'folder',
        color: 'primary',
        change: null,
      },
      {
        title: 'Active Projects',
        value: stats.active,
        icon: 'assignment',
        color: 'accent',
        change: null,
      },
      {
        title: 'Completed',
        value: stats.completed,
        icon: 'check_circle',
        color: 'success',
        change: null,
      },
    ];
  });

  readonly taskMetrics = computed(() => {
    const stats = this.store.taskStats();
    if (!stats) return [];

    return [
      {
        title: 'Total Tasks',
        value: stats.total,
        icon: 'task_alt',
        color: 'primary',
      },
      {
        title: 'Active Tasks',
        value: this.store.activeTaskCount(),
        icon: 'pending_actions',
        color: 'warn',
      },
      {
        title: 'Overdue',
        value: this.store.overdueCount(),
        icon: 'warning',
        color: 'error',
      },
    ];
  });

  // Chart calculation for task distribution (simple bar chart)
  readonly taskChartBars = computed(() => {
    const distribution = this.store.taskDistribution();
    if (!distribution.length) return [];

    const maxValue = Math.max(...distribution.map(d => d.value));
    
    return distribution.map(item => ({
      ...item,
      percentage: maxValue > 0 ? (item.value / maxValue) * 100 : 0,
      width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%',
    }));
  });

  // Project status distribution for donut chart
  readonly projectChartSegments = computed(() => {
    const projects = this.store.projectStats();
    if (!projects || projects.total === 0) return [];

    const data = [
      { label: 'Active', value: projects.active, color: '#2196F3' },
      { label: 'Completed', value: projects.completed, color: '#4CAF50' },
      { label: 'Archived', value: projects.archived, color: '#9E9E9E' },
    ].filter(item => item.value > 0);

    // Calculate percentages and angles
    let currentAngle = 0;
    return data.map(item => {
      const percentage = (item.value / projects.total) * 100;
      const angle = (item.value / projects.total) * 360;
      const segment = {
        ...item,
        percentage: Math.round(percentage),
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      };
      currentAngle += angle;
      return segment;
    });
  });

  /**
   * Refresh dashboard data
   */
  refreshDashboard() {
    this.store.refreshOverview();
  }

  /**
   * Get status color class
   */
  getStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'status-active',
      'COMPLETED': 'status-completed',
      'ARCHIVED': 'status-archived',
    };
    return statusMap[status] || '';
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: number): string {
    if (priority >= 8) return 'priority-high';
    if (priority >= 5) return 'priority-medium';
    return 'priority-low';
  }

  /**
   * Calculate project progress
   */
  getProjectProgress(completedTasks: number = 0, totalTasks: number = 0): number {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }
}
