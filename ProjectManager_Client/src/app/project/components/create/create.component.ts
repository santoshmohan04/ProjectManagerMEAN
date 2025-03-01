import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../../user/services/user.service';
import { ProjectService } from '../../services/project.service';
import { AlertService } from '../../../shared/services/alert.service';
import { User } from '../../../user/models/user';
import { Project } from '../../models/project';

import moment from 'moment';
import {
  NgbDateStruct,
  NgbDatepickerModule,
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SearchComponent } from '../../../user/components/search/search.component';
import { CommonModule } from '@angular/common';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'project-add',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  standalone: true,
  providers: [UserService, ProjectService, AlertService],
  imports: [ReactiveFormsModule, NgbDatepickerModule, CommonModule, NgbModule],
})
export class CreateComponent implements OnInit, OnDestroy {
  Projects!: Project[];
  projectForm!: FormGroup;
  userAction!: string;
  SortKey!: string;
  SearchKey!: string;
  Manager!: User;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
    private readonly formbuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit() {
    this.createForm();
    this.refreshList();
    this.addValidations();
    this.initializeSlider();
  }

  createForm() {
    this.projectForm = this.formbuilder.group({
      projectName: ['', Validators.required],
      setDates: false,
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
      priority: 0,
      manager: null,
      managername: '',
      projectId: '',
    });

    this.userAction = 'Add';
  }

  updateRange(event: any) {
    const rangeInput = event.target;
    const percent =
      ((rangeInput.value - rangeInput.min) /
        (rangeInput.max - rangeInput.min)) *
      100;
    rangeInput.style.setProperty('--progress', percent + '%');
  }

  reset() {
    this.projectForm.reset();
    this.projectForm.get('priority')?.setValue(0);
    this.userAction = 'Add';
    this.Manager = <User>{};
    this.initializeSlider();
  }

  // Reset range input progress
  initializeSlider() {
    const rangeInput = document.querySelector(
      'input[type="range"]'
    ) as HTMLInputElement;
    if (rangeInput) {
      rangeInput.style.setProperty('--progress', '0%');
    }
  }

  refreshList() {
    this.projectService
      .getProjects(this.SearchKey, this.SortKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (response.Success === true) {
          this.Projects = response.Data;
        } else {
          this.Projects = response.Data;
          this.alertService.error(
            'Error occured while fetching products',
            'Error',
            3000
          );
        }
      });
  }

  search(searchValue: Event) {
    this.SearchKey = (searchValue.target as HTMLInputElement).value;
    this.refreshList();
  }

  addorUpdateProject() {
    if (this.projectForm.valid) {
      if (this.userAction === 'Add') {
        this.addProject();
      } else {
        this.updateProject();
      }
    }
  }

  addProject() {
    const newProject: Project = {
      Project: this.projectForm.controls['projectName'].value,
      Priority: this.projectForm.controls['priority'].value,
    };
  
    if (this.Manager) {
      newProject.Manager_ID = this.projectForm.controls['manager'].value?.User_ID;
    }
  
    if (this.projectForm.controls['setDates'].value === true) {
      // Convert NgbDateStruct to JavaScript Date
      const startDate = this.convertToDate(this.projectForm.controls['startDate'].value);
      const endDate = this.convertToDate(this.projectForm.controls['endDate'].value);
  
      if (startDate) {
        newProject.Start_Date = moment(startDate).add(-1, 'months').toDate();
      }
      if (endDate) {
        newProject.End_Date = moment(endDate).add(-1, 'months').toDate();
      }
    }
  
    this.projectService
      .addProject(newProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (response.Success === true) {
          this.alertService.success('Project added successfully.', 'Success', 3000);
          this.refreshList();
          this.reset();
        } else {
          this.alertService.error(response.Message, 'Error', 3000);
        }
      });
  }
  
  /**
   * Converts NgbDateStruct {year, month, day} to a JavaScript Date
   */
  private convertToDate(dateStruct: NgbDateStruct | null): Date | null {
    if (!dateStruct) return null;
    return new Date(dateStruct.year, dateStruct.month - 1, dateStruct.day);
  }
  

  updateProject() {
    const updateProject = <Project>{
      Project_ID: this.projectForm.controls['projectId'].value,
      Project: this.projectForm.controls['projectName'].value,
      Priority: this.projectForm.controls['priority'].value,
    };

    if (this.Manager) {
      updateProject.Manager_ID = this.Manager.User_ID;
    }

    if (this.projectForm.controls['setDates'].value === true) {
      // Convert NgbDateStruct to JavaScript Date
      const startDate = this.convertToDate(this.projectForm.controls['startDate'].value);
      const endDate = this.convertToDate(this.projectForm.controls['endDate'].value);
  
      if (startDate) {
        updateProject.Start_Date = moment(startDate).add(-1, 'months').toDate();
      }
      if (endDate) {
        updateProject.End_Date = moment(endDate).add(-1, 'months').toDate();
      }
    }

    this.projectService
      .editProject(updateProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        console.log(response);
        if (response.Success === true) {
          this.alertService.success(
            'Project updated successfully!',
            'Success',
            3000
          );
          this.refreshList();
          this.reset();
        } else this.alertService.error(response.Message, 'Error', 3000);
      });
  }

  editProject(projectID: any) {
    this.projectService
      .getProject(projectID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (response.Success === true) {
          const data = response.Data;
          this.projectForm.patchValue({
            projectName: data.Project,
            priority: data.Priority,
            projectId: data.Project_ID,
          });

          this.projectForm.controls['projectName'].setValidators(
            Validators.required
          );
          this.projectForm.controls['projectName'].updateValueAndValidity();

          if (data.Start_Date || data.End_Date) {
            this.projectForm.controls['setDates'].setValue(true);
            const startDate = this.convertToNgbDate(data.Start_Date);
            const endDate = this.convertToNgbDate(data.End_Date);
            this.projectForm.patchValue({ startDate, endDate });
          } else {
            this.projectForm.controls['setDates'].setValue(false);
          }

          if (data.Manager_ID) {
            this.userService
              .getUser(data.Manager_ID)
              .subscribe((userResponse: any) => {
                this.Manager = userResponse.Data;
                if (this.Manager) {
                  this.projectForm.patchValue({
                    manager: this.Manager,
                    managername: `${this.Manager.First_Name} ${this.Manager.Last_Name}`,
                  });
                }
              });
          }

          this.userAction = 'Update';
        } else {
          this.alertService.error(response.Message, 'Error', 3000);
        }
      });
  }

  /**
   * Converts a string or Date object to NgbDateStruct
   */
  private convertToNgbDate(date: string | Date | null): NgbDateStruct | null {
    if (!date) return null;
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return isNaN(parsedDate.getTime())
      ? null
      : {
          year: parsedDate.getFullYear(),
          month: parsedDate.getMonth() + 1,
          day: parsedDate.getDate(),
        };
  }

  suspendProject(projectID: any) {
    this.projectService
      .deleteProject(projectID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (response.Success === true) {
          this.alertService.success(
            'Project suspended successfully!',
            'Success',
            3000
          );
          this.refreshList();
        } else {
          this.alertService.error(response.Message, 'Error', 3000);
        }
      });
  }

  sort(sortKey: string) {
    this.SortKey = sortKey;
    this.refreshList();
  }

  addValidations() {
    // Subscribe to "setDates" checkbox value changes
    this.projectForm
      .get('setDates')
      ?.valueChanges.pipe(distinctUntilChanged()) // Avoid unnecessary execution if value is unchanged
      .subscribe((setDate: boolean) => {
        this.toggleDateFields(setDate);
      });

    // Subscribe to "startDate" & "endDate" value changes for validation
    this.projectForm
      .get('startDate')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => this.validateDateRange());

    this.projectForm
      .get('endDate')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => this.validateDateRange());
  }

  // Toggle Date Fields Based on "setDates"
  private toggleDateFields(setDate: boolean) {
    const today = moment();
    const startDate: NgbDateStruct = {
      year: today.year(),
      month: today.month() + 1,
      day: today.date(),
    };
    const endDate: NgbDateStruct = {
      year: today.year(),
      month: today.month() + 1,
      day: today.date() + 1,
    };

    this.setFieldState('startDate', setDate, startDate);
    this.setFieldState('endDate', setDate, endDate);
  }

  // Enable/Disable & Set Validators for a Field
  private setFieldState(
    field: string,
    enable: boolean,
    value: NgbDateStruct | string = ''
  ) {
    const control = this.projectForm.get(field);
    if (!control) return;

    if (enable) {
      control.setValidators([Validators.required]);
      control.setValue(value);
      control.enable({ emitEvent: false });
    } else {
      control.clearValidators();
      control.setValue('');
      control.disable({ emitEvent: false });
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  // Validate Date Range Between Start & End Dates
  private validateDateRange() {
    const startDate = this.projectForm.get('startDate')?.value;
    const endDate = this.projectForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = moment(startDate).subtract(1, 'months').toDate();
      const end = moment(endDate).subtract(1, 'months').toDate();

      this.projectForm
        .get('endDate')
        ?.setErrors(end < start ? { incorrect: true } : null);
      this.projectForm
        .get('startDate')
        ?.setErrors(start > end ? { incorrect: true } : null);
    }
  }

  openUsersModal() {
    const modalRef = this.modalService.open(SearchComponent, {
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.result.then(
      (selectedUser) => {
        if (selectedUser) {
          this.Manager = selectedUser;
          this.projectForm.get('manager')?.setValue(selectedUser);
          this.projectForm
            .get('managername')
            ?.setValue(`${selectedUser.First_Name} ${selectedUser.Last_Name}`);
          this.refreshList();
        }
      },
      (reason) => {
        console.log('Modal dismissed', reason); // Handle dismiss action if needed
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
