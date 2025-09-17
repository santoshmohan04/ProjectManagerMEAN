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
import { User } from '../../../user/models/user';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../user/services/user.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-addproject',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatDialogModule,
  ],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  templateUrl: './addproject.component.html',
  styleUrl: './addproject.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddprojectComponent implements OnInit, OnDestroy {
  projectForm!: FormGroup;
  max = 10;
  min = 0;
  step = 1;
  thumbLabel = true;
  usersList: User[] = [];
  filteredOptions: Observable<User[]> | undefined;
  destroy$: Subject<boolean> = new Subject<boolean>();
  data = inject(MAT_DIALOG_DATA);

  constructor(private readonly formbuilder: FormBuilder) {}

  ngOnInit(): void {
    this.usersList = this.data?.usersList || [];
    this.createForm();
    this.filteredOptions = this.projectForm.get('manager')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string | User): User[] {
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value && typeof value === 'object') {
      filterValue = value.Full_Name
        ? value.Full_Name.toLowerCase()
        : `${value.First_Name} ${value.Last_Name}`.toLowerCase();
    }

    return this.usersList.filter(
      (option) =>
        option.First_Name.toLowerCase().includes(filterValue) ||
        option.Last_Name.toLowerCase().includes(filterValue) ||
        (option.Full_Name &&
          option.Full_Name.toLowerCase().includes(filterValue)) ||
        option.Employee_ID.toString().includes(filterValue)
    );
  }

  displayUserFn(user: any): string {
    return user && user.Full_Name ? user.Full_Name : '';
  }

  createForm() {
    this.projectForm = this.formbuilder.group({
      projectName: ['', Validators.required],
      startDate: [null],
      endDate: [null],
      priority: [0],
      manager: [null],
      projectId: '',
    });
    if (this.data?.projectdetails && this.data?.edit === true) {
      this.projectForm.patchValue({
        projectName: this.data.projectdetails.Project,
        startDate: new Date(this.data.projectdetails.Start_Date),
        endDate: new Date(this.data.projectdetails.End_Date),
        priority: this.data.projectdetails.Priority,
        manager: this.usersList.find(
          (t) => t.User_ID === this.data.projectdetails.Manager_ID
        ),
        projectId: this.data.projectdetails._id,
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
