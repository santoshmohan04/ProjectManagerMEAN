import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParentTaskService } from '../../services/parent-task.service';
import { TaskService } from '../../services/task.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Task, ParentTask } from '../../models/task';
import { Project } from '../../../project/models/project';
import { User } from '../../../user/models/user';

import moment from 'moment';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SearchComponent as ProjectSearchComponent } from '../../../project/components/search/search.component';
import { SearchComponent as UserSearchComponent } from '../../../user/components/search/search.component';
import { ParentSearchComponent } from '../search/parent-search/parent-search.component';
import { CommonModule } from '@angular/common';
import { DateCompareValidatorDirective } from '../../../shared/directives/datecompare.directive';

@Component({
  selector: 'create-task',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    NgbDatepickerModule,
    ProjectSearchComponent,
    UserSearchComponent,
    ParentSearchComponent,
    CommonModule,
    DateCompareValidatorDirective,
  ],
  providers: [ParentTaskService, TaskService, AlertService],
})
export class CreateComponent implements OnInit {
  taskId: number | null = null;

  taskStartDate: NgbDateStruct = this.initializeDateStruct();
  taskEndDate: NgbDateStruct = this.initializeDateStruct(1);

  task: Task = this.initializeTask();
  isParentTask = false;

  constructor(
    private readonly parentTaskService: ParentTaskService,
    private readonly taskService: TaskService,
    private readonly alertService: AlertService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.taskId = params['taskId'] || null;
      if (this.taskId) this.loadTaskForUpdate(this.taskId);
    });
  }

  private initializeDateStruct(offsetDays = 0): NgbDateStruct {
    const date = moment().add(offsetDays, 'days').toDate();
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  private initializeTask(): Task {
    return {
      Task: '',
      Priority: 0,
      Start_Date: moment().format('DD/MM/YYYY'),
      End_Date: moment().add(1, 'days').format('DD/MM/YYYY'),
      Project: {
        Project_ID: undefined,
        Project: '',
        Start_Date: undefined,
        End_Date: undefined,
        Priority: 0,
        Manager_ID: undefined,
        Tasks: [],
        CompletedTasks: null,
        NoOfTasks: null,
      },
    };
  }

  private loadTaskForUpdate(taskId: number): void {
    this.taskService.getTask(taskId).subscribe((response) => {
      this.task = response.Data;
      if (this.task.Start_Date) {
        this.taskStartDate = this.convertToStruct(this.task.Start_Date);
      }
      if (this.task.End_Date) {
        this.taskEndDate = this.convertToStruct(this.task.End_Date);
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
    this.taskStartDate = this.initializeDateStruct();
    this.taskEndDate = this.initializeDateStruct(1);
    this.task = this.initializeTask();
    this.isParentTask = false;
    this.taskId = null;
  }

  private formatDateStruct(date: NgbDateStruct): string {
    return moment([date.year, date.month - 1, date.day]).format('YYYY-MM-DD');
  }

  addTask(): void {
    this.task.Start_Date = this.formatDateStruct(this.taskStartDate);
    this.task.End_Date = this.formatDateStruct(this.taskEndDate);

    if (this.isParentTask) {
      this.addParentTask();
    } else {
      this.addIndividualTask();
    }
  }

  private addParentTask(): void {
    const newParent: ParentTask = {
      Parent_Task: this.task.Task,
      Project_ID: this.task.Project?.Project_ID ?? undefined,
    };

    this.parentTaskService.addParentTask(newParent).subscribe((response) => {
      this.handleResponse(response, 'Task added successfully!');
    });
  }

  private addIndividualTask(): void {
    this.taskService.addTask(this.task).subscribe((response) => {
      this.handleResponse(response, 'Task added successfully!');
    });
  }

  updateTask(): void {
    this.task.Start_Date = this.formatDateStruct(this.taskStartDate);
    this.task.End_Date = this.formatDateStruct(this.taskEndDate);

    this.taskService.editTask(this.task).subscribe((response) => {
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
    this.task.Project = project;
  }

  onParentSelected(parent: ParentTask): void {
    this.task.Parent = parent;
  }

  onUserSelected(user: User): void {
    this.task.User = user;
  }
}