import { Component, OnDestroy, signal } from '@angular/core';
import { Project } from '../../../project/models/project';
import { Task } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../project/components/search/search.component';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.css'],
    providers: [TaskService, AlertService],
    standalone: true,
    imports: [CommonModule, FormsModule, NgbModule]
})
export class ViewComponent implements OnDestroy {
  Tasks!: Task[];
  SortKey!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedProject = signal<Project | null>(null)

  constructor(
    private readonly taskService: TaskService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly modalService: NgbModal
  ) {}

  editTask(taskId: number) {
    this.taskService.getTask(taskId).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      if (response.Success) {
        this.router.navigate(['/task/add'], {
          queryParams: { taskId: taskId },
        });
      } else {
        this.alertService.error(response.Message, 'Error', 3000);
      }
    });
  }

  endTask(taskId: number) {
    this.taskService.endTask(taskId).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      if (response.Success) {
        this.refreshList();
        this.alertService.success('Task ended successfully!', 'Success', 3000);
      } else {
        this.alertService.error(response.Message, 'Error', 3000);
      }
    });
  }

  sortTask(sortKey: string) {
    this.SortKey = sortKey;
    this.taskService
      .getTasksList(this.selectedProject()?.Project_ID, sortKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (response.Success) {
          this.Tasks = response.Data;
        } else {
          this.alertService.error(response.Message, 'Error', 3000);
        }
      });
  }

  refreshList() {
    //fetch all tasks associated to this project and display
    this.taskService
      .getTasksList(this.selectedProject()?.Project_ID, this.SortKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (response.Success) {
          if (response.Data.length == 0) {
            this.alertService.warn(
              'No taks found for the project:' + this.selectedProject()?.Project,
              'Warning',
              3000
            );
          }

          this.Tasks = response.Data;
        } else {
          this.alertService.error(
            'Error occured while fetching tasks for the project:' +
            this.selectedProject()?.Project,
            'Error',
            3000
          );
        }
      });
  }

  openProjectsModal(){
    this.modalService.open(SearchComponent, {backdrop:'static', keyboard:false}).result.then(
			(selectedProject) => {
        if (selectedProject) {
          this.selectedProject.set(selectedProject);
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
    this.destroy$.complete();
  }
}
