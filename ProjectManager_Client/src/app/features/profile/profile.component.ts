import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthStore } from '@core/auth.store';
import { SkeletonLoaderComponent } from '@shared/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/empty-state/empty-state.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    EmptyStateComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  private authStore = inject(AuthStore);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // User data from AuthStore
  currentUser = this.authStore.user;
  isAuthenticated = this.authStore.isAuthenticated;
  userFullName = this.authStore.userFullName;
  userInitials = this.authStore.userInitials;
  isAdmin = this.authStore.isAdmin;
  isManager = this.authStore.isManager;

  // Edit mode
  isEditMode = false;

  // Profile form
  profileForm: FormGroup = this.fb.group({
    firstName: [{ value: '', disabled: true }, Validators.required],
    lastName: [{ value: '', disabled: true }, Validators.required],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    employeeId: [{ value: '', disabled: true }],
  });

  // Computed badge text
  roleBadge = computed(() => {
    const user = this.currentUser();
    return user?.role || 'USER';
  });

  // Computed badge color
  roleBadgeColor = computed(() => {
    const role = this.roleBadge();
    switch (role) {
      case 'ADMIN': return 'accent';
      case 'MANAGER': return 'primary';
      default: return 'warn';
    }
  });

  constructor() {
    // Initialize form with user data
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        employeeId: user.employeeId || '',
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode) {
      this.profileForm.enable();
      this.profileForm.get('email')?.disable(); // Email shouldn't be editable
    } else {
      this.profileForm.disable();
      // Reset form to original values
      const user = this.currentUser();
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          employeeId: user.employeeId || '',
        });
      }
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const formValues = this.profileForm.getRawValue();
      
      // TODO: Implement API call to update user profile
      console.log('Saving profile:', formValues);
      
      this.snackBar.open('Profile updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      
      this.isEditMode = false;
      this.profileForm.disable();
    }
  }

  cancelEdit(): void {
    this.toggleEditMode();
  }

  changePassword(): void {
    // TODO: Implement password change dialog
    this.snackBar.open('Password change feature coming soon', 'Close', {
      duration: 3000,
    });
  }
}
