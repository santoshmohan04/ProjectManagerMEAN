import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  computed,
} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MatDialogModule,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { User } from '@features/users/models/user';
import { priorityRangeValidator } from '@shared/validators/custom-validators';
import { AuthStore } from '@core/auth.store';

@Component({
  selector: 'app-addtask',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDialogModule,
  ],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  templateUrl: './addtask.component.html',
  styleUrl: './addtask.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddtaskComponent implements OnInit, OnDestroy {
  taskForm!: FormGroup;
  data = inject(MAT_DIALOG_DATA);
  private readonly authStore = inject(AuthStore);
  
  max = 10;
  min = 0;
  step = 1;
  thumbLabel = true;
  minDate = new Date(); // Prevent selecting past dates
  filteredOptions: Observable<User[]> | undefined;
  
  // Check if user is ADMIN
  isAdmin = computed(() => this.authStore.user()?.role === 'ADMIN');

  constructor(private readonly formbuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initialiseTaskForm();
  }

  initialiseTaskForm() {
    this.taskForm = this.formbuilder.group({
      title: ['', Validators.required],
      description: [''],
      startdate: [null],
      enddate: [null],
      priority: [0, [Validators.required, priorityRangeValidator()]],
      parenttask: [null],
      project: [null],
      user: [null],
    });
  }

  ngOnDestroy(): void {
    this.taskForm.reset();
  }
}
