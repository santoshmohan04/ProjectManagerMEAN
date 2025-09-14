import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
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
import { ProjectService } from '../../services/project.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-addproject',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSliderModule,
    MatAutocompleteModule,
  ],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  templateUrl: './addproject.component.html',
  styleUrl: './addproject.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddprojectComponent implements OnInit, OnDestroy {
  projectForm!: FormGroup;
  userAction: string = 'Add';
  max = 100;
  min = 0;
  step = 1;
  thumbLabel = true;
  usersList: User[] = [];
  filteredOptions: Observable<User[]> | undefined;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly formbuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getUsersList();
    this.filteredOptions = this.projectForm.get('manager')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string): User[] {
    const filterValue = value.toLowerCase();

    return this.usersList.filter(
      (option) =>
        option.First_Name.toLowerCase().includes(filterValue) ||
        option.Last_Name.toLowerCase().includes(filterValue) ||
        option.Employee_ID.toString().includes(filterValue)
    );
  }

  createForm() {
    this.projectForm = this.formbuilder.group({
      projectName: ['', Validators.required],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
      priority: 0,
      manager: [''],
      projectId: '',
    });
  }

  getUsersList() {
    this.userService.getUsersList().subscribe((response) => {
      if (response && response.Success) {
        this.usersList = response.Data;
      }
    });
  }

  onSubmit(form: FormGroup) {
    if (form.invalid) {
      return;
    }

    const newProject = {
      Project: form.value.projectName,
      Priority: form.value.priority,
      Manager_ID: form.value.manager?.User_ID,
      Start_Date: form.value.startDate
        ? new Date(form.value.startDate).toISOString()
        : '',
      End_Date: form.value.endDate
        ? new Date(form.value.endDate).toISOString()
        : '',
    };

    console.log(newProject);

    // this.projectService
    //   .addProject(newProject)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((response: any) => {
    //     if (response.Success === true) {
    //       this.alertService.success(
    //         'Project added successfully.',
    //         'Success',
    //         3000
    //       );
    //     } else {
    //       this.alertService.error(response.Message, 'Error', 3000);
    //     }
    //   });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
