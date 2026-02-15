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
  combineLatest,
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
import { User } from '@features/users/models/user';
import { ConfirmationDialogComponent } from '@shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from '@shared/services/alert.service';
import { AddtaskComponent } from '../addtask/addtask.component';

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
    'id',
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
  tasks = this.appStore.tasks;
  users = this.appStore.users;
  projects = this.appStore.projects;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private readonly dialogService: MatDialog) {
    // Set paginator and sort when dataSource changes
    // effect() must be called in constructor (injection context)
    effect(() => {
      const ds = this.dataSource();
      if (ds && this.paginator && this.sort) {
        ds.paginator = this.paginator;
        ds.sort = this.sort;
      }
    });
  }

  ngOnInit(): void {
    // Load data using signals
    this.loadTasks();
    this.loadProjects();
    this.loadUsers();
    
    this.filteredOptions = this.selectedproject.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  // Computed signals
  dataSource = computed(() => {
    const tasks = this.tasks();
    const dataSource = new MatTableDataSource(tasks);
    return dataSource;
  });

  private loadTasks() {
    // TODO: Implement task loading
  }

  private loadProjects() {
    // TODO: Implement project loading
  }

  private loadUsers() {
    // TODO: Implement user loading
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
    // Paginator and sort setup moved to constructor effect
  }

  displayProjectFn(project: Project): string {
    return project && project.Project ? project.Project : '';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const ds = this.dataSource();
    ds.filter = filterValue.trim().toLowerCase();

    if (ds.paginator) {
      ds.paginator.firstPage();
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
    if (task._id === undefined) return;
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Task',
        content: `Are you sure you want to delete task ${task.Title}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && task._id !== undefined) {
        // TODO: Implement task deletion using appStore
        // this.appStore.deleteTask(task._id);
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
}
