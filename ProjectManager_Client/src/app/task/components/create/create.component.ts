import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { SearchComponent as UserSearchComponent } from "../../../user/components/search/search.component";
import { ParentSearchComponent } from '../search/parent-search/parent-search.component';
import { CommonModule } from '@angular/common';
declare const $: any;

@Component({
  selector: 'create-task',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  standalone: true,
  imports: [FormsModule, NgbDatepickerModule, ProjectSearchComponent, UserSearchComponent,ParentSearchComponent, CommonModule],
  providers: [ParentTaskService, TaskService, AlertService]
})
export class CreateComponent implements OnInit {

  taskId: any = null;

  taskStartDate: NgbDateStruct = {
    year: (new Date()).getFullYear(),
    month: (new Date()).getMonth() + 1, 
    day: (new Date()).getDate()
  };

  taskEndDate: NgbDateStruct = {
    year: (new Date()).getFullYear(),
    month: (new Date()).getMonth() + 1, 
    day: (new Date()).getDate() + 1
  };

  task = <Task>{
    Task: '',
    Priority: 0,
    Start_Date: moment().format('DD/MM/YYYY'),
    End_Date: moment().add(1, 'days').format('DD/MM/YYYY')
  };

  isParentTask: boolean = false;

  constructor(private parentTaskService: ParentTaskService,
    private taskService: TaskService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {

    //set taskId that is sent from Edit Task
    this.route
      .queryParams
      .subscribe(params => {
        this.taskId = params['taskId']
      });

    if (this.taskId) {
      //load the task for update
      this.taskService.getTask(this.taskId)
        .subscribe(response => {
          this.task = response.Data;

          const startDateSource=moment(this.task.Start_Date).toDate();
          this.taskStartDate = {
            year: startDateSource.getFullYear(),
            month: startDateSource.getMonth() + 1, 
            day: startDateSource.getDate()
          };
        
          const endDateSource=moment(this.task.Start_Date).toDate();
          this.taskEndDate = {
            year: endDateSource.getFullYear(),
            month: endDateSource.getMonth() + 1, 
            day: endDateSource.getDate()
          };
        });
    }

  }

  reset() {
    this.taskStartDate = {
      year: (new Date()).getFullYear(),
      month: (new Date()).getMonth() + 1, 
      day: (new Date()).getDate()
    };
  
    this.taskEndDate = {
      year: (new Date()).getFullYear(),
      month: (new Date()).getMonth() + 1, 
      day: (new Date()).getDate() + 1
    };

    this.task = <Task>{
      Task: '',
      Priority: 0,
      Start_Date: moment().format('DD/MM/YYYY'),
      End_Date: moment().add(1, 'days').format('DD/MM/YYYY')
    };
    this.isParentTask = false;
    this.taskId = null;
    $('#taskName').removeClass('ng-invalid');
  }

  addTask() {
    if (this.isParentTask) {
      //create parent task
      const newParent = <ParentTask>{
        Parent_Task: this.task.Task,
        Project_ID: this.task.Project ? this.task.Project.Project_ID : null
      };

      this.parentTaskService.addParentTask(newParent)
        .subscribe((response:any) => {
          if (response.Success) {
            this.alertService.success('Task added successfully!', 'success', 3000);
            this.reset();
          }
          else {
            this.alertService.error(response.Message || 'Unknown error', 'Error', 3000);
          }
        });
    }
    else {

      this.task.Start_Date = moment(this.taskStartDate).add(-1, 'months').format("YYYY-MM-DD");
      this.task.End_Date = moment(this.taskEndDate).add(-1, 'months').format("YYYY-MM-DD");
      //create individual task with or without linked to parent task
      this.taskService.addTask(this.task)
        .subscribe((response:any) => {
          if (response.Success) {
            this.alertService.success('Task added successfuly!', 'Success', 3000);
            this.reset();
          }
          else {
            this.alertService.error(response.Message || 'Unknown error', 'Error', 3000);
          }
        });
    }
  }

  updateTask() {
    this.task.Start_Date = moment(this.taskStartDate).add(-1, 'months').format("YYYY-MM-DD");
    this.task.End_Date = moment(this.taskEndDate).add(-1, 'months').format("YYYY-MM-DD");
    
    this.taskService.editTask(this.task)
      .subscribe((response:any) => {
        if (response.Success) {
          this.alertService.success('Task updated successfuly!', 'Success', 3000);
        }
        else {
          this.alertService.error(response.Message || 'Unknown error', 'Error', 3000);
        }
      });
  }

  //callback from Project search popup
  onProjectSelected(project: Project) {
    this.task.Project = project;
  }

  //callback from Parent Task search popup
  onParentSelected(parent: ParentTask) {
    this.task.Parent = parent;
  }

  onUserSelected(user: User) {
    this.task.User = user;
  }
}
