import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ProjectService } from '@features/projects/services/project.service';
import { Project, ProjectStatus } from '@features/projects/models/project';
import { SkeletonLoaderComponent } from '@shared/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/empty-state/empty-state.component';

@Component({
  selector: 'app-archived-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './archived-projects.component.html',
  styleUrls: ['./archived-projects.component.scss']
})
export class ArchivedProjectsComponent implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  // State signals
  loading = signal(false);
  error = signal<string | null>(null);
  archivedProjects = signal<Project[]>([]);

  // Table configuration
  displayedColumns: string[] = ['projectName', 'startDate', 'endDate', 'priority', 'status', 'tasks', 'actions'];
  Array = Array;

  ngOnInit(): void {
    this.loadArchivedProjects();
  }

  loadArchivedProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    // TODO: Update ProjectService to support status filtering
    // For now, load all projects and filter on frontend
    this.projectService.getProjects().subscribe({
      next: (response) => {
        // Filter projects with COMPLETED or ARCHIVED status
        const projects = Array.isArray(response.data) ? response.data : [];
        const archived = projects.filter(
          (p: Project) => p.status === 'COMPLETED' || p.status === 'ARCHIVED'
        );
        this.archivedProjects.set(archived);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading archived projects:', err);
        this.error.set('Failed to load archived projects. Please try again.');
        this.loading.set(false);
      }
    });
  }

  viewProject(project: Project): void {
    this.router.navigate(['/projects', project.uuid]);
  }

  restoreProject(project: Project): void {
    // TODO: Implement restore functionality (update project status to IN_PROGRESS or PLANNED)
    console.log('Restoring project:', project.Project || project.name);
  }

  deleteProject(project: Project): void {
    // TODO: Implement delete functionality with confirmation dialog
    console.log('Deleting project:', project.Project || project.name);
  }

  getStatusChipColor(status: ProjectStatus): string {
    switch (status) {
      case 'COMPLETED': return 'accent';
      case 'ARCHIVED': return 'warn';
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

  getTaskCount(project: Project): string {
    if (!project.Tasks || project.Tasks.length === 0) return '0';
    return project.Tasks.length.toString();
  }

  getCompletedTaskCount(project: Project): string {
    if (!project.Tasks || project.Tasks.length === 0) return '0';
    const completed = project.Tasks.filter((t: any) => t.Status === 'Completed').length;
    return completed.toString();
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
