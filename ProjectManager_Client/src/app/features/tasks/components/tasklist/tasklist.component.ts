import { CommonModule } from '@angular/common';
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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Project } from '@features/projects/models/project';
import {
  map,
  Observable,
  startWith,
} from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Task } from '../../models/task';
import { AppStore } from '@core/app.store';
import { ConfirmationDialogComponent } from '@shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from '@shared/services/alert.service';
import { AddtaskComponent } from '../addtask/addtask.component';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '@features/projects/services/project.service';
import { UserService } from '@features/users/services/user.service';

@Component({
  selector: 'app-tasklist',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatAutocompleteModule,
  ],
  providers: [AlertService],
  templateUrl: './tasklist.component.html',
  styleUrl: './tasklist.component.scss',
})
export class TasklistComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'task',
    'description',
    'priority',
    'startDate',
    'endDate',
    'status',
    'actions',
  ];
  selectedproject = new FormControl();
  SortKey!: string;
  SearchKey!: string;
  filteredOptions: Observable<Project[]> | undefined;
  projectsList: Project[] = [];

  // Signals
  private readonly appStore = inject(AppStore);
  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly alertService = inject(AlertService);
  
  tasks = this.appStore.tasks;
  users = this.appStore.users;
  projects = this.appStore.projects;
  taskCount = computed(() => this.tasks()?.length || 0);

  // MatTableDataSource instance
  dataSource = new MatTableDataSource<Task>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private readonly dialogService: MatDialog) {
    // Effect to update dataSource when tasks change
    effect(() => {
      const tasks = this.tasks();
      const validTasks = Array.isArray(tasks) ? tasks : [];
      this.dataSource.data = validTasks;
      
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
    if (!this.tasks() || this.tasks().length === 0) {
      this.loadTasks();
    }
    if (!this.projects() || this.projects().length === 0) {
      this.loadProjects();
    }
    if (!this.users() || this.users().length === 0) {
      this.loadUsers();
    }
    
    this.filteredOptions = this.selectedproject.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private loadTasks(force: boolean = false) {
    // Skip if data exists and not forced
    if (!force && this.tasks() && this.tasks().length > 0) {
      return;
    }
    
    this.appStore.setLoading(true);
    this.taskService.getTasksList().subscribe({
      next: (response) => {
        if (response.success) {
          // Handle nested data structure - response.data might be array or contain nested data
          const tasks = Array.isArray(response.data) ? response.data : [];
          this.appStore.setTasks(tasks);
          console.log('Tasks loaded:', tasks.length);
        } else {
          this.appStore.setError(response.message || 'Failed to load tasks');
          this.alertService.error(response.message || 'Failed to load tasks');
        }
        this.appStore.setLoading(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.appStore.setError('Failed to load tasks');
        this.appStore.setLoading(false);
        this.alertService.error('Failed to load tasks');
      }
    });
  }

  private loadProjects(force: boolean = false) {
    // Skip if data exists and not forced
    if (!force && this.projects() && this.projects().length > 0) {
      return;
    }
    
    this.projectService.getProjects().subscribe({
      next: (response) => {
        if (response.success) {
          // Handle nested data structure
          const projects = Array.isArray(response.data) ? response.data : [];
          this.appStore.setProjects(projects);
        } else {
          this.alertService.error(response.message || 'Failed to load projects');
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.alertService.error('Failed to load projects');
      }
    });
  }

  private loadUsers(force: boolean = false) {
    // Skip if data exists and not forced
    if (!force && this.users() && this.users().length > 0) {
      return;
    }
    
    this.userService.getUsersList().subscribe({
      next: (response) => {
        if (response.success) {
          // Handle nested data structure
          const users = Array.isArray(response.data) ? response.data : [];
          this.appStore.setUsers(users);
        } else {
          this.alertService.error(response.message || 'Failed to load users');
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.alertService.error('Failed to load users');
      }
    });
  }

  private _filter(value: string | Project): Project[] {
    const projects = this.projects();
    // Add null check to prevent "filter is not a function" error
    if (!projects || !Array.isArray(projects)) {
      return [];
    }
    
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value && typeof value === 'object') {
      filterValue = value.Project?.toLowerCase() ?? '';
    }

    return projects.filter((option) =>
      option.Project.toLowerCase().includes(filterValue)
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  displayProjectFn(project: Project): string {
    return project && project.Project ? project.Project : '';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addTask() {
    const dialogRef = this.dialogService.open(AddtaskComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        title: 'Add Task',
        tasklist: this.tasks(),
        projectlist: this.projects(),
        userlist: this.users(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit(result, 'add');
      }
    });
  }

  editTask(task: Task) {}

  endTask(task: Task) {
    const taskId = task.id || task._id;
    if (!taskId) return;
    const taskTitle = task.title || task.Title || 'this task';
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Task',
        content: `Are you sure you want to delete task ${taskTitle}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && taskId) {
        // TODO: Implement task deletion using appStore
        // After deletion, reload tasks
        // this.loadTasks();
      }
    });
  }

  onSubmit(
    data: { firstname: string; lastname: string; employeeid: string },
    action: 'add' | 'edit',
    task?: Task
  ) {
    if (action === 'add') {
    }

    if (action === 'edit') {
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'open';
    
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
    
    switch (normalizedStatus) {
      case 'open':
        return 'open';
      case 'in_progress':
      case 'in-progress':
        return 'in-progress';
      case 'completed':
        return 'completed';
      case 'blocked':
        return 'blocked';
      default:
        return 'open';
    }
  }
}
