import { Component, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { ProjectsStore } from '../../store/projects.store';
import { AuthStore } from '../../../../core/auth.store';
import { Project } from '../../models/project';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  projectsStore = inject(ProjectsStore);
  authStore = inject(AuthStore);

  // Get route param as signal
  private paramMap = toSignal(this.route.paramMap);
  
  // Extract uuid from params
  uuid = computed(() => {
    const params = this.paramMap();
    return params?.get('id') || params?.get('uuid') || null;
  });

  // Get current project from store
  project = computed(() => this.projectsStore.selectedProject());

  // Calculate progress percentage
  progress = computed(() => {
    const proj = this.project();
    if (!proj || !proj.NoOfTasks || proj.NoOfTasks === 0) {
      return 0;
    }
    return Math.round((proj.CompletedTasks || 0) / proj.NoOfTasks * 100);
  });

  // Check if user can edit (ADMIN or MANAGER)
  canEdit = computed(() => {
    const user = this.authStore.user();
    if (!user) return false;
    const role = user.role?.toUpperCase();
    return role === 'ADMIN' || role === 'MANAGER';
  });

  // Check if user can archive (ADMIN only)
  canArchive = computed(() => {
    const user = this.authStore.user();
    if (!user) return false;
    return user.role?.toUpperCase() === 'ADMIN';
  });

  constructor() {
    // Load project when uuid changes
    effect(() => {
      const id = this.uuid();
      if (id) {
        this.loadProject(id);
      }
    });
  }

  private loadProject(id: string): void {
    // First check if we already have this project in the list
    const projects = this.projectsStore.projects();
    const existingProject = projects.find(p => p._id === id || String(p.Project_ID) === id);
    
    if (existingProject) {
      this.projectsStore.setSelectedProject(existingProject);
    } else {
      // If not in list, we would need to fetch it individually
      // For now, load all projects and find it
      this.projectsStore.loadProjects({});
    }
  }

  onEdit(): void {
    const proj = this.project();
    if (proj) {
      this.router.navigate(['/projects', 'edit', proj._id]);
    }
  }

  onArchive(): void {
    const proj = this.project();
    if (!proj) return;

    if (confirm(`Archive project "${proj.Project || proj.name}"? This will hide it from active lists.`)) {
      this.projectsStore.archiveProject(proj._id);
      // Navigate back after archiving
      setTimeout(() => {
        this.router.navigate(['/projects']);
      }, 500);
    }
  }

  onDelete(): void {
    const proj = this.project();
    if (!proj) return;

    if (confirm(`Delete project "${proj.Project || proj.name}"? This action cannot be undone.`)) {
      this.projectsStore.deleteProject(proj._id);
      // Navigate back after deletion
      setTimeout(() => {
        this.router.navigate(['/projects']);
      }, 500);
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  }

  getPriorityClass(priority: number): string {
    if (priority <= 3) return 'priority-low';
    if (priority <= 7) return 'priority-medium';
    return 'priority-high';
  }

  getProgressColor(): string {
    const prog = this.progress();
    if (prog < 30) return 'warn';
    if (prog < 70) return 'accent';
    return 'primary';
  }

  // Format date for display
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
