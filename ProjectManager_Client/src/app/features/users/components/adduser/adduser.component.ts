import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MatDialogModule,
} from '@angular/material/dialog';
import { employeeIdPatternValidator } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-adduser',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDialogModule,
  ],
  standalone: true,
  templateUrl: './adduser.component.html',
  styleUrl: './adduser.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdduserComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  data = inject(MAT_DIALOG_DATA);

  constructor(private readonly formbuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initialiseUserForm();
  }

  initialiseUserForm() {
    this.userForm = this.formbuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      employeeid: ['', [Validators.required, employeeIdPatternValidator()]],
    });

    if (this.data && this.data.edit && this.data.userdetails) {
      this.userForm.patchValue({
        firstname: this.data.userdetails.firstName || this.data.userdetails.First_Name,
        lastname: this.data.userdetails.lastName || this.data.userdetails.Last_Name,
        employeeid: this.data.userdetails.employeeId || this.data.userdetails.Employee_ID,
      });
    }
  }

  ngOnDestroy(): void {
    this.userForm.reset();
  }
}
