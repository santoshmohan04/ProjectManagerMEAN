import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Project } from '../../models/project';
import { AlertService } from '../../../shared/services/alert.service';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddprojectComponent } from '../addproject/addproject.component';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { FormGroup } from '@angular/forms';
import { User } from '../../../user/models/user';
import { Store } from '@ngrx/store';
import { ProjectDataActions, UsersDataActions } from '../../../store/actions';
import { selectAllProjects, selectAllUsers } from '../../../store/selectors';
import { filterByText } from '../../../shared/utils/filter-utils';
import { getInitials } from '../../../shared/utils/string-utils';

@Component({
  selector: 'app-projectslist',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  standalone: true,
  providers: [AlertService],
  templateUrl: './projectslist.component.html',
  styleUrl: './projectslist.component.scss',
})
export class ProjectslistComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'name',
    'tasks',
    'completed',
    'user',
    'priority',
    'startDate',
    'endDate',
    'actions',
  ];
  dataSource!: MatTableDataSource<Project>;
  SortKey!: string;
  SearchKey!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  usersList!: User[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialogService: MatDialog,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
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

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  initialiseSubscriptions() {
    this.store
      .select(selectAllProjects)
      .pipe(takeUntil(this.destroy$))
      .subscribe((projects) => {
        this.dataSource = new MatTableDataSource(projects);
        this.dataSource.filterPredicate = (data: Project, filter: string) => {
          const assignedUser = this.getAssignedUser(data).toLowerCase();
          const projectName = data.Project?.toLowerCase() || '';
          const priority = (data.Priority ?? '').toString();
          return (
            projectName.includes(filter) ||
            assignedUser.includes(filter) ||
            priority.includes(filter)
          );
        };
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });

    this.store
      .select(selectAllUsers)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.usersList = users;
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
    if (row.Project_ID === undefined) return;
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      data: { projectName: row.Project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && row._id !== undefined) {
        this.store.dispatch(
          ProjectDataActions.deleteProject({ projectId: row._id })
        );
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
      this.store.dispatch(
        ProjectDataActions.updateProject({
          updateProject: projectPayload,
          id: formValues.projectId,
        })
      );
    } else {
      this.store.dispatch(
        ProjectDataActions.addProject({ newProject: projectPayload })
      );
    }
  }

  getAssignedUser(row: Project): string {
    if (!this.usersList || !row?.Manager_ID) return 'N/A';
    const user = this.usersList.find((u) => u.User_ID === row?.Manager_ID);
    if (!user) return 'N/A';

    const fullName = user.Full_Name || `${user.First_Name} ${user.Last_Name}`;
    return `${getInitials(fullName)} (${fullName})`;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
