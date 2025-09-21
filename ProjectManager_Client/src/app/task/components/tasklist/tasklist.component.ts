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
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Task } from '../../models/task';
import { Store } from '@ngrx/store';
import { ProjectDataActions, TasksDataActions } from '../../../store/actions';
import { selectAllProjects, selectAllTasks } from '../../../store/selectors';

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
  templateUrl: './tasklist.component.html',
  styleUrl: './tasklist.component.scss',
})
export class TasklistComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'task',
    'parent',
    'priority',
    'startDate',
    'endDate',
    'status',
    'actions',
  ];
  dataSource: MatTableDataSource<Project> = new MatTableDataSource<Project>([]);
  selectedproject = new FormControl();
  SortKey!: string;
  SearchKey!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  filteredOptions: Observable<Project[]> | undefined;
  projectsList: Project[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(
      ProjectDataActions.loadProjects({
        searchKey: this.SearchKey,
        sortKey: this.SortKey,
      })
    );
    this.initialiseSubscriptions();
  }

  initialiseSubscriptions() {
    this.store
      .select(selectAllProjects)
      .pipe(takeUntil(this.destroy$))
      .subscribe((projects) => {
        this.projectsList = projects;
      });

    this.filteredOptions = combineLatest([
      this.selectedproject.valueChanges.pipe(startWith('')),
      this.store.select(selectAllProjects),
    ]).pipe(
      map(([value, projects]) => {
        this.projectsList = projects; // keep local copy if needed
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

  addTask() {}

  editTask(task: Task) {}

  endTask(task: Task) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
