import { Component, inject, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ProjectsStore, ProjectStatus } from '../../store/projects.store';
import { Project } from '../../models/project';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-projects-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './projects-table.component.html',
  styleUrls: ['./projects-table.component.scss']
})
export class ProjectsTableComponent implements OnInit {
  projectsStore = inject(ProjectsStore);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'name',
    'manager',
    'status',
    'tasks',
    'priority',
    'actions'
  ];

  dataSource = new MatTableDataSource<Project>();

  // Filter values
  searchValue = '';
  selectedStatus: ProjectStatus | null = null;
  selectedPriority: number | null = null;

  // Search debounce
  private searchSubject = new Subject<string>();

  // Expose enum to template
  ProjectStatus = ProjectStatus;

  // Current sort
  currentSort: string = '';
  currentSortDirection: 'asc' | 'desc' = 'asc';

  constructor() {
    // Update dataSource when projects change
    effect(() => {
      const projects = this.projectsStore.projects();
      this.dataSource.data = projects;
    });

    // Setup search debounce
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.applyFilters();
      });
  }

  ngOnInit(): void {
    // Initial load is handled by store's onInit hook
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.searchSubject.next(value);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.projectsStore.setFilters({
      search: this.searchValue || undefined,
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined,
    });
    // Reset to first page when filters change
    this.projectsStore.goToPage(1);
  }

  clearFilters(): void {
    this.searchValue = '';
    this.selectedStatus = null;
    this.selectedPriority = null;
    this.projectsStore.clearFilters();
  }

  onSortChange(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.currentSort = '';
      this.currentSortDirection = 'asc';
    } else {
      this.currentSort = sort.active;
      this.currentSortDirection = sort.direction as 'asc' | 'desc';
    }

    // Reload with new sort
    this.projectsStore.loadProjects({
      page: this.projectsStore.pagination().currentPage,
      limit: this.projectsStore.pagination().itemsPerPage,
      sort: this.currentSort ? `${this.currentSort}:${this.currentSortDirection}` : undefined,
      filters: this.projectsStore.filters(),
    });
  }

  onPageChange(event: PageEvent): void {
    if (event.pageSize !== this.projectsStore.pagination().itemsPerPage) {
      this.projectsStore.setItemsPerPage(event.pageSize);
    } else {
      this.projectsStore.goToPage(event.pageIndex + 1);
    }
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

  // CRUD Actions
  viewProject(project: Project): void {
    this.projectsStore.setSelectedProject(project);
    console.log('View project:', project);
  }

  editProject(project: Project): void {
    console.log('Edit project:', project);
    // Navigate to edit page or open dialog
  }

  archiveProject(project: Project): void {
    if (confirm(`Archive project "${project.Project || project.name}"?`)) {
      this.projectsStore.archiveProject(project._id);
    }
  }

  deleteProject(project: Project): void {
    if (confirm(`Delete project "${project.Project || project.name}"? This cannot be undone.`)) {
      this.projectsStore.deleteProject(project._id);
    }
  }

  refresh(): void {
    this.projectsStore.refreshProjects();
  }
}
