import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { Project } from '../../models/project';
import { AlertService } from '@shared/services/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddprojectComponent } from '../addproject/addproject.component';
import { ConfirmationDialogComponent } from '@shared/confirmation-dialog/confirmation-dialog.component';
import { FormGroup } from '@angular/forms';
import { User } from '@features/users/models/user';
import { ApiResponse } from '@shared/models/shared';
import { AppStore } from '@core/app.store';
import { ProjectService } from '../../services/project.service';
import { UserService } from '@features/users/services/user.service';
import { filterByText } from '@shared/utils/filter-utils';
import { getInitials } from '@shared/utils/string-utils';
import { SkeletonLoaderComponent } from '@shared/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/empty-state/empty-state.component';

@Component({
  selector: 'app-projectslist',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  standalone: true,
  providers: [AlertService],
  templateUrl: './projectslist.component.html',
  styleUrl: './projectslist.component.scss',
})
export class ProjectslistComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'tasks',
    'completed',
    'user',
    'priority',
    'startDate',
    'endDate',
    'actions',
  ];

  private readonly appStore = inject(AppStore);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly dialogService = inject(MatDialog);
  private readonly alertService = inject(AlertService);

  // Signals
  projects = this.appStore.projects;
  users = this.appStore.users;
  loading = this.appStore.loading;
  error = this.appStore.error;

  // MatTableDataSource instance
  dataSource = new MatTableDataSource<Project>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Configure filter predicate
    this.dataSource.filterPredicate = (data: Project, filter: string) => {
      const assignedUser = this.getAssignedUser(data).toLowerCase();
      const projectName = (data.name || data.Project || '').toLowerCase();
      const priority = (data.priority || data.Priority || '').toString();
      return (
        projectName.includes(filter) ||
        assignedUser.includes(filter) ||
        priority.includes(filter)
      );
    };

    // Effect to update dataSource when projects change
    effect(() => {
      const projects = this.projects();
      const validProjects = Array.isArray(projects) ? projects : [];
      this.dataSource.data = validProjects;
      
      // Re-apply paginator after data change to ensure proper connection
      setTimeout(() => {
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      });
    });
  }

  ngOnInit(): void {
    // Only load data if not already in store (caching)
    if (!this.projects() || this.projects().length === 0) {
      this.loadProjects();
    }
    if (!this.users() || this.users().length === 0) {
      this.loadUsers();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadProjects(searchKey?: string, sortKey?: string, force: boolean = false) {
    // Skip if data exists and not forced
    if (!force && !searchKey && !sortKey && this.projects() && this.projects().length > 0) {
      return;
    }
    
    this.appStore.setLoading(true);
    this.projectService.getProjects(searchKey, sortKey).subscribe({
      next: (response) => {
        if (response.success) {
          // response.data is now the project array, response.meta has pagination info
          const projects = Array.isArray(response.data) ? response.data : [];
          this.appStore.setProjects(projects);
        } else {
          this.appStore.setError(response.message || 'Failed to load projects');
          this.alertService.error(response.message || 'Failed to load projects');
        }
        this.appStore.setLoading(false);
      },
      error: (error) => {
        this.appStore.setError('Failed to load projects');
        this.alertService.error('Failed to load projects');
        this.appStore.setLoading(false);
      }
    });
  }

  private loadUsers(searchKey?: string, sortKey?: string, force: boolean = false) {
    // Skip if data exists and not forced
    if (!force && !searchKey && !sortKey && this.users() && this.users().length > 0) {
      return;
    }
    
    const params = {
      search: searchKey,
      sort: sortKey,
    };
    this.userService.getUsersList(params).subscribe({
      next: (response: ApiResponse<User[]>) => {
        if (response.success) {
          // Handle nested data structure
          const users = Array.isArray(response.data) ? response.data : [];
          this.appStore.setUsers(users);
        }
      },
      error: (error: any) => {
        this.alertService.error('Failed to load users');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editProject(row: Project) {
    const editdialogRef = this.dialogService.open(AddprojectComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { projectdetails: row, edit: true },
    });

    editdialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit(result, 'edit');
      }
    });
  }

  deleteProject(row: Project) {
    if (row._id === undefined) return;
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      data: { projectName: row.Project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && row._id !== undefined) {
        this.projectService.deleteProject(row._id).subscribe({
          next: (response) => {
            if (response.success) {
              this.appStore.deleteProject(row._id);
              this.alertService.success('Project deleted successfully');
            } else {
              this.alertService.error(response.message || 'Failed to delete project');
            }
          },
          error: (error) => {
            this.alertService.error('Failed to delete project');
          }
        });
      }
    });
  }

  addProject() {
    const dialogRef = this.dialogService.open(AddprojectComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { projectdetails: null, edit: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit(result, 'add');
      }
    });
  }

  onSubmit(form: FormGroup, action: 'add' | 'edit'): void {
    if (form.invalid) return;

    const formValues = form.value;
    const projectPayload = {
      Project: formValues.projectName,
      Priority: formValues.priority,
      Manager_ID: formValues.manager?.User_ID,
      Start_Date: formValues.startDate
        ? new Date(formValues.startDate).toISOString()
        : '',
      End_Date: formValues.endDate
        ? new Date(formValues.endDate).toISOString()
        : '',
    };

    if (action === 'edit' && formValues.projectId) {
      this.projectService.editProject(projectPayload, formValues.projectId).subscribe({
        next: (response) => {
          if (response.success) {
            this.appStore.updateProject(response.data);
            this.alertService.success('Project updated successfully');
          } else {
            this.alertService.error(response.message || 'Failed to update project');
          }
        },
        error: (error) => {
          this.alertService.error('Failed to update project');
        }
      });
    } else {
      this.projectService.addProject(projectPayload).subscribe({
        next: (response) => {
          if (response.success) {
            this.appStore.addProject(response.data);
            this.alertService.success('Project added successfully');
          } else {
            this.alertService.error(response.message || 'Failed to add project');
          }
        },
        error: (error) => {
          this.alertService.error('Failed to add project');
        }
      });
    }
  }

  getAssignedUser(row: Project): string {
    const users = this.users();
    const managerId = row?.manager || row?.Manager_ID;
    if (!users || !managerId) return 'N/A';
    
    // Match by uuid (primary), _id (ObjectId string), or User_ID
    const user = users.find((u) => 
      u.uuid === managerId || 
      u._id === managerId || 
      u.User_ID === managerId
    );
    
    if (!user) return 'N/A';

    const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return `${getInitials(fullName)} (${fullName})`;
  }
}
