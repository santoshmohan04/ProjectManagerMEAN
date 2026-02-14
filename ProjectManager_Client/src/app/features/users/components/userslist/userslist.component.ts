import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertService } from '@shared/services/alert.service';
import { User } from '../../models/user';
import { ApiResponse } from '@shared/models/shared';
import { AppStore } from '@core/app.store';
import { UserService } from '../../services/user.service';
import { AdduserComponent } from '../adduser/adduser.component';
import { ConfirmationDialogComponent } from '@shared/confirmation-dialog/confirmation-dialog.component';

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
export class UserslistComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'firstname',
    'lastname',
    'employeeid',
    'project',
    'actions',
  ];
  
  private readonly appStore = inject(AppStore);
  private readonly userService = inject(UserService);
  private readonly dialogService = inject(MatDialog);
  private readonly alertService = inject(AlertService);

  // Signals
  users = this.appStore.users;
  loading = this.appStore.loading;
  error = this.appStore.error;

  // Computed signals
  dataSource = computed(() => {
    const users = this.users();
    const dataSource = new MatTableDataSource(users);
    dataSource.filterPredicate = (data: User, filter: string) => {
      const firstName = data.First_Name?.toLowerCase() || '';
      const lastName = data.Last_Name?.toLowerCase() || '';
      const employeeId = data.Employee_ID?.toString() || '';
      return (
        firstName.includes(filter) ||
        lastName.includes(filter) ||
        employeeId.includes(filter)
      );
    };
    return dataSource;
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Load initial data
    this.loadUsers();

    // Effect to handle data source updates
    effect(() => {
      const dataSource = this.dataSource();
      if (this.paginator) {
        dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        dataSource.sort = this.sort;
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    // Data source is already set up in the effect
  }

  private loadUsers(searchKey?: string, sortKey?: string) {
    this.appStore.setLoading(true);
    this.userService.getUsersList(searchKey, sortKey).subscribe({
      next: (response) => {
        if (response.success) {
          this.appStore.setUsers(response.data);
        } else {
          this.appStore.setError(response.message || 'Failed to load users');
          this.alertService.error(response.message || 'Failed to load users');
        }
        this.appStore.setLoading(false);
      },
      error: (error) => {
        this.appStore.setError('Failed to load users');
        this.alertService.error('Failed to load users');
        this.appStore.setLoading(false);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    const dataSource = this.dataSource();
    dataSource.filter = filterValue.trim().toLowerCase();

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  addUser() {
    const dialogRef = this.dialogService.open(AdduserComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { title: 'Add User' },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
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

    editdialogRef.afterClosed().subscribe((result: any) => {
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

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === true && row._id !== undefined) {
        this.userService.deleteUser(row._id).subscribe({
          next: (response) => {
            if (response.success) {
              this.appStore.deleteUser(row._id!);
              this.alertService.success('User deleted successfully');
            } else {
              this.alertService.error(response.message || 'Failed to delete user');
            }
          },
          error: (error) => {
            this.alertService.error('Failed to delete user');
          }
        });
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
      this.userService.addUser(addUser).subscribe({
        next: (response) => {
          if (response.success) {
            this.appStore.addUser(response.data);
            this.alertService.success('User added successfully');
          } else {
            this.alertService.error(response.message || 'Failed to add user');
          }
        },
        error: (error) => {
          this.alertService.error('Failed to add user');
        }
      });
    }

    if (action === 'edit') {
      const updateUser = {
        First_Name: data.firstname,
        Last_Name: data.lastname,
        Employee_ID: data.employeeid,
      };
      this.userService.editUser(updateUser, user?._id || '').subscribe({
        next: (response) => {
          if (response.success) {
            this.appStore.updateUser(response.data);
            this.alertService.success('User updated successfully');
          } else {
            this.alertService.error(response.message || 'Failed to update user');
          }
        },
        error: (error) => {
          this.alertService.error('Failed to update user');
        }
      });
    }
  }
}
