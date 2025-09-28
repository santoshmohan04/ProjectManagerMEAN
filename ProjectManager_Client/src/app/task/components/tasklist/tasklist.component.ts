import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Project } from '../../../project/models/project';
import {
  combineLatest,
  map,
  Observable,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Task } from '../../models/task';
import { Store } from '@ngrx/store';
import {
  ProjectDataActions,
  TasksDataActions,
  UsersDataActions,
} from '../../../store/actions';
import {
  selectAllProjects,
  selectAllTasks,
  selectAllUsers,
} from '../../../store/selectors';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from '../../../shared/services/alert.service';
import { AddtaskComponent } from '../addtask/addtask.component';
import { User } from '../../../user/models/user';

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
export class TasklistComponent implements OnInit, AfterViewInit, OnDestroy {
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
  dataSource!: MatTableDataSource<Task>;
  selectedproject = new FormControl();
  SortKey!: string;
  SearchKey!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  filteredOptions: Observable<Project[]> | undefined;
  projectsList: Project[] = [];
  taskList!: Task[];
  userList!: User[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialogService: MatDialog,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.store.dispatch(
      TasksDataActions.loadTasks({ projectId: '', sortKey: this.SortKey })
    );
    this.store.dispatch(
      ProjectDataActions.loadProjects({
        searchKey: this.SearchKey,
        sortKey: this.SortKey,
      })
    );

    this.store.dispatch(
      UsersDataActions.loadUsers({
        searchKey: this.SearchKey,
        sortKey: this.SortKey,
      })
    );
    this.initialiseSubscriptions();
  }

  initialiseSubscriptions() {
    this.store
      .select(selectAllTasks)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tasks) => {
        this.taskList = tasks;
        this.dataSource = new MatTableDataSource(tasks);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });

    this.filteredOptions = combineLatest([
      this.selectedproject.valueChanges.pipe(startWith('')),
      this.store.select(selectAllProjects),
    ]).pipe(
      map(([value, projects]) => {
        this.projectsList = projects;
        return this._filter(value || '', projects);
      })
    );

    this.selectedproject.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        const projectId = data?._id;
        if (projectId && projectId !== '') {
          this.store.dispatch(
            TasksDataActions.loadTasks({
              projectId: projectId,
              sortKey: this.SortKey,
            })
          );
        }
      });

    this.store
      .select(selectAllUsers)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.userList = data;
      });
  }

  private _filter(
    value: string | Project,
    list: Project[] = this.projectsList
  ): Project[] {
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value && typeof value === 'object') {
      filterValue = value.Project?.toLowerCase() ?? '';
    }

    return list.filter((option) =>
      option.Project.toLowerCase().includes(filterValue)
    );
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
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
        tasklist: this.taskList,
        projectlist: this.projectsList,
        userlist: this.userList,
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
        this.store.dispatch(TasksDataActions.endTask({ taskId: task._id! }));
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
