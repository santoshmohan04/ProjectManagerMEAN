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
import { MatCardModule } from '@angular/material/card';
import { AlertService } from '@shared/services/alert.service';
import { User } from '../../models/user';
import { ApiResponse } from '@shared/models/shared';
import { AppStore } from '@core/app.store';
import { UserService } from '../../services/user.service';
import { AdduserComponent } from '../adduser/adduser.component';
import { ConfirmationDialogComponent } from '@shared/confirmation-dialog/confirmation-dialog.component';
import { SkeletonLoaderComponent } from '@shared/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/empty-state/empty-state.component';

@Component({
  selector: 'app-userslist',
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
  userCount = computed(() => this.users()?.length || 0);

  // MatTableDataSource instance
  dataSource = new MatTableDataSource<User>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Configure filter predicate
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const firstName = data.firstName?.toLowerCase() || '';
      const lastName = data.lastName?.toLowerCase() || '';
      const employeeId = data.employeeId?.toString() || '';
      const email = data.email?.toLowerCase() || '';
      return (
        firstName.includes(filter) ||
        lastName.includes(filter) ||
        employeeId.includes(filter) ||
        email.includes(filter)
      );
    };

    // Effect to update dataSource when users change
    effect(() => {
      const users = this.users();
      const validUsers = Array.isArray(users) ? users : [];
      this.dataSource.data = validUsers;
      
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
    if (!this.users() || this.users().length === 0) {
      this.loadUsers();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadUsers(searchKey?: string, sortKey?: string, force: boolean = false) {
    // Skip if data exists and not forced
    if (!force && !searchKey && !sortKey && this.users() && this.users().length > 0) {
      return;
    }
    
    this.appStore.setLoading(true);
    const params = {
      search: searchKey,
      sort: sortKey,
    };
    this.userService.getUsersList(params).subscribe({
      next: (response) => {
        if (response.success) {
          const users = Array.isArray(response.data) ? response.data : [];
          this.appStore.setUsers(users);
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
    if (!row.uuid) return;
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete User',
        content: `Are you sure you want to delete user ${row.firstName} ${row.lastName}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === true && row.uuid) {
        this.userService.deleteUser(row.uuid).subscribe({
          next: (response) => {
            if (response.success) {
              this.appStore.deleteUser(row.uuid!);
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
        firstName: data.firstname,
        lastName: data.lastname,
        email: `${data.firstname.toLowerCase()}.${data.lastname.toLowerCase()}@example.com`,
        password: 'ChangeMe123!',
        employeeId: data.employeeid,
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
        firstName: data.firstname,
        lastName: data.lastname,
        employeeId: data.employeeid,
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

  getUserInitials(user: User): string {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
