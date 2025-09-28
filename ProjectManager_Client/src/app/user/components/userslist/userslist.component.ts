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
import { AlertService } from '../../../shared/services/alert.service';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { User } from '../../models/user';
import { Store } from '@ngrx/store';
import { UsersDataActions } from '../../../store/actions';
import { selectAllUsers } from '../../../store/selectors';
import { AdduserComponent } from '../adduser/adduser.component';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-userslist',
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
  templateUrl: './userslist.component.html',
  styleUrl: './userslist.component.scss',
})
export class UserslistComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'firstname',
    'lastname',
    'employeeid',
    'project',
    'actions',
  ];
  dataSource!: MatTableDataSource<User>;
  SortKey!: string;
  SearchKey!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  usersList!: User[];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly dialogService: MatDialog,
    private readonly store: Store<{}>
  ) {}

  ngOnInit(): void {
    this.store.dispatch(
      UsersDataActions.loadUsers({
        searchKey: this.SearchKey,
        sortKey: this.SortKey,
      })
    );
    this.initialiseSubscriptions();
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  initialiseSubscriptions() {
    this.store
      .select(selectAllUsers)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.usersList = users;
        this.dataSource = new MatTableDataSource(users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addUser() {
    const dialogRef = this.dialogService.open(AdduserComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { title: 'Add User' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit(result, 'add');
      }
    });
  }

  editUser(row: User) {
    const editdialogRef = this.dialogService.open(AdduserComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { title: 'Edit User', userdetails: row, edit: true },
    });

    editdialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit(result, 'edit', row);
      }
    });
  }

  deleteUser(row: User) {
    if (row._id === undefined) return;
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete User',
        content: `Are you sure you want to delete user ${row.First_Name} ${row.Last_Name}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && row._id !== undefined) {
        this.store.dispatch(UsersDataActions.deleteUser({ userId: row._id }));
      }
    });
  }

  onSubmit(
    data: { firstname: string; lastname: string; employeeid: string },
    action: 'add' | 'edit',
    user?: User
  ) {
    if (action === 'add') {
      const addUser = {
        First_Name: data.firstname,
        Last_Name: data.lastname,
        Employee_ID: data.employeeid,
      };
      this.store.dispatch(UsersDataActions.addUser({ newUser: addUser }));
    }

    if (action === 'edit') {
      const updateUser = {
        First_Name: data.firstname,
        Last_Name: data.lastname,
        Employee_ID: data.employeeid,
      };
      this.store.dispatch(
        UsersDataActions.updateUser({
          updateUser: updateUser,
          id: user?._id || '',
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
