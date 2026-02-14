import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
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
import { User } from '../../../user/models/user';
import { priorityRangeValidator } from '../../../shared/validators/custom-validators';

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
  max = 10;
  min = 0;
  step = 1;
  thumbLabel = true;
  filteredOptions: Observable<User[]> | undefined;

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
