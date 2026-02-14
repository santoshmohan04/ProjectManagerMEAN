import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { ProjectsStore, ProjectStatus } from '../../store/projects.store';
import { Project } from '../../models/project';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
  ],
  templateUrl: './projects-list-example.component.html',
  styleUrls: ['./projects-list-example.component.scss']
})
export class ProjectsListExampleComponent implements OnInit {
  projectsStore = inject(ProjectsStore);

  // Filter values
  searchTerm = '';
  selectedStatus: ProjectStatus | null = null;
  selectedPriority: number | null = null;

  // Table columns
  displayedColumns: string[] = ['id', 'name', 'priority', 'status', 'tasks', 'actions'];

  // Expose enum to template
  ProjectStatus = ProjectStatus;

  ngOnInit(): void {
    // Projects are auto-loaded by the store's onInit hook
  }

  onSearchChange(): void {
    this.projectsStore.setFilters({
      search: this.searchTerm || undefined,
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined,
    });
  }

  onFilterChange(): void {
    this.projectsStore.setFilters({
      search: this.searchTerm || undefined,
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined,
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedPriority = null;
    this.projectsStore.clearFilters();
  }

  refreshProjects(): void {
    this.projectsStore.refreshProjects();
  }

  onPageChange(event: PageEvent): void {
    if (event.pageSize !== this.projectsStore.pagination().itemsPerPage) {
      this.projectsStore.setItemsPerPage(event.pageSize);
    } else {
      this.projectsStore.goToPage(event.pageIndex + 1);
    }
  }

  viewProject(project: Project): void {
    this.projectsStore.setSelectedProject(project);
    console.log('View project:', project);
  }

  editProject(project: Project): void {
    console.log('Edit project:', project);
  }

  archiveProject(project: Project): void {
    if (confirm(`Are you sure you want to archive "${project.Project || project.name}"?`)) {
      this.projectsStore.archiveProject(project._id);
    }
  }

  deleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete "${project.Project || project.name}"? This action cannot be undone.`)) {
      this.projectsStore.deleteProject(project._id);
    }
  }
}
