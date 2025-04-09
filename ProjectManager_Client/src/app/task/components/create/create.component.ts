import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ParentTaskService } from '../../services/parent-task.service';
import { TaskService } from '../../services/task.service';
import { AlertService } from '../../../shared/services/alert.service';
import { ParentTask } from '../../models/task';
import { Project } from '../../../project/models/project';
import { User } from '../../../user/models/user';

import moment from 'moment';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DateCompareValidatorDirective } from '../../../shared/directives/datecompare.directive';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'create-task',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
    imports: [
        ReactiveFormsModule,
        NgbDatepickerModule,
        CommonModule,
        DateCompareValidatorDirective,
    ],
    providers: [ParentTaskService, TaskService, AlertService]
})
export class CreateComponent implements OnInit, OnDestroy {
  taskId: number | null = null;
  taskForm!: FormGroup;
  isParentTask = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly parentTaskService: ParentTaskService,
    private readonly taskService: TaskService,
    private readonly alertService: AlertService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeForm();

    this.route.queryParams.subscribe((params) => {
      this.taskId = params['taskId'] || null;
      if (this.taskId) this.loadTaskForUpdate(this.taskId);
    });
    this.initializeSlider();
  }

  private initializeForm() {
    this.taskForm = this.fb.group({
      TaskName: [null, Validators.required],
      Priority: [0, [Validators.min(0), Validators.max(30)]],
      Start_Date: [this.initializeDateStruct(), Validators.required],
      End_Date: [this.initializeDateStruct(1), Validators.required],
      isParentTask: [false],
      Project: [null, Validators.required],
      ProjectName: [{value:null, disabled: true}, Validators.required, ],
      ParentTask: [null],
      ParentTaskName: [null],
      User: [null],
      UserName: [null],
    });
  }

  updateRange(event: any) {
    const rangeInput = event.target;
    const percent =
      ((rangeInput.value - rangeInput.min) /
        (rangeInput.max - rangeInput.min)) *
      100;
    rangeInput.style.setProperty('--progress', percent + '%');
  }

  private initializeSlider() {
    const rangeInput = document.querySelector(
      'input[type="range"]'
    ) as HTMLInputElement;
    if (rangeInput) {
      rangeInput.style.setProperty('--progress', '0%');
    }
  }

  private initializeDateStruct(offsetDays = 0): NgbDateStruct {
    const date = moment().add(offsetDays, 'days').toDate();
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  private loadTaskForUpdate(taskId: number): void {
    this.taskService.getTask(taskId).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response.Success) {
        const taskData = response.Data;
        this.taskForm.patchValue({
          Task: taskData.Task,
          Priority: taskData.Priority,
          Start_Date: this.convertToStruct(taskData.Start_Date ?? ''),
          End_Date: this.convertToStruct(taskData.End_Date ?? ''),
          Project: taskData.Project,
          Parent: taskData.Parent,
          User: taskData.User,
        });
      }
    });
  }

  private convertToStruct(date: string): NgbDateStruct {
    const parsedDate = moment(date).toDate();
    return {
      year: parsedDate.getFullYear(),
      month: parsedDate.getMonth() + 1,
      day: parsedDate.getDate(),
    };
  }

  reset(): void {
    this.taskForm.reset({
      Task: '',
      Priority: 0,
      Start_Date: this.initializeDateStruct(),
      End_Date: this.initializeDateStruct(1),
      Project: null,
      Parent: null,
      User: null,
    });
    this.isParentTask = false;
    this.taskId = null;
    this.initializeSlider();
  }

  private formatDateStruct(date: NgbDateStruct): string {
    return moment([date.year, date.month - 1, date.day]).format('YYYY-MM-DD');
  }

  addTask(): void {
    const formValue = this.taskForm.value;
    formValue.Start_Date = this.formatDateStruct(formValue.Start_Date);
    formValue.End_Date = this.formatDateStruct(formValue.End_Date);

    if (this.isParentTask) {
      this.addParentTask(formValue);
    } else {
      this.addIndividualTask(formValue);
    }
  }

  private addParentTask(formValue: any): void {
    const newParent: ParentTask = {
      Parent_Task: formValue.Task,
      Project_ID: formValue.Project?.Project_ID ?? undefined,
    };

    this.parentTaskService.addParentTask(newParent).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.handleResponse(response, 'Task added successfully!');
    });
  }

  private addIndividualTask(formValue: any): void {
    this.taskService.addTask(formValue).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.handleResponse(response, 'Task added successfully!');
    });
  }

  updateTask(): void {
    const formValue = this.taskForm.value;
    formValue.Start_Date = this.formatDateStruct(formValue.Start_Date);
    formValue.End_Date = this.formatDateStruct(formValue.End_Date);

    this.taskService.editTask(formValue).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.handleResponse(response, 'Task updated successfully!');
    });
  }

  private handleResponse(response: any, successMessage: string): void {
    if (response.Success) {
      this.alertService.success(successMessage, 'Success', 3000);
      this.reset();
    } else {
      this.alertService.error(response.Message || 'Unknown error', 'Error', 3000);
    }
  }

  onProjectSelected(project: Project): void {
    this.taskForm.patchValue({ Project: project, ProjectName: project.Project });
  }

  onParentSelected(parent: ParentTask): void {
    this.taskForm.patchValue({ Parent: parent });
  }

  onUserSelected(user: User): void {
    this.taskForm.patchValue({ User: user });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
