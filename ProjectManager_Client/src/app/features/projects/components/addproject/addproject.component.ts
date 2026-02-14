import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { User } from '@features/users/models/user';
import { AppStore } from '@core/app.store';
import { UserService } from '@features/users/services/user.service';
import { map, startWith, Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { managerRequiredValidator, priorityRangeValidator, dateComparisonValidator } from '@shared/validators/custom-validators';

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
export class AddprojectComponent implements OnInit {
  projectForm!: FormGroup;
  max = 10;
  min = 0;
  step = 1;
  thumbLabel = true;
  usersList: User[] = [];
  filteredOptions: Observable<User[]> | undefined;
  private readonly appStore = inject(AppStore);
  private readonly userService = inject(UserService);
  data = inject(MAT_DIALOG_DATA) as { projectdetails: any; edit: boolean };

  // Signals
  users = this.appStore.users;

  constructor(private readonly formbuilder: FormBuilder) {}

  ngOnInit(): void {
    this.loadUsers();
    this.createForm();
    this.filteredOptions = this.projectForm.get('manager')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );

    // Use effect to react to users changes
    effect(() => {
      const users = this.users();
      this.usersList = users;
      this.projectForm
        .get('manager')
        ?.setValue(
          this.data?.projectdetails?._id
            ? users.find(
                (u: User) => u._id === (this.data as any).projectdetails.Manager_ID
              )
            : null
        );
    });
  }

  private loadUsers() {
    this.userService.getUsersList().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.appStore.setUsers(response.data);
        }
      },
      error: (error: any) => {
        console.error('Failed to load users', error);
      }
    });
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
      priority: [0, [Validators.required, priorityRangeValidator()]],
      manager: [null, managerRequiredValidator()],
      projectId: '',
    }, { validators: dateComparisonValidator('startDate', 'endDate') });
    if (this.data?.projectdetails && this.data?.edit === true) {
      this.projectForm.patchValue({
        projectName: this.data.projectdetails.Project,
        startDate: new Date(this.data.projectdetails.Start_Date),
        endDate: new Date(this.data.projectdetails.End_Date),
        priority: this.data.projectdetails.Priority,
        projectId: this.data.projectdetails._id,
      });
    }
  }
}
