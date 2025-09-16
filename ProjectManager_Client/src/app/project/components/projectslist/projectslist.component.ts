import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Project } from '../../models/project';
import { ProjectService } from '../../services/project.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddprojectComponent } from '../addproject/addproject.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-projectslist',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  standalone: true,
  providers: [AlertService],
  templateUrl: './projectslist.component.html',
  styleUrl: './projectslist.component.scss',
})
export class ProjectslistComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'name',
    'tasks',
    'completed',
    'priority',
    'startDate',
    'endDate',
    'actions',
  ];
  dataSource!: MatTableDataSource<Project>;
  SortKey!: string;
  SearchKey!: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isEditAction: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly projectService: ProjectService,
    private readonly alertService: AlertService,
    private readonly dialogService: MatDialog
  ) {}

  ngOnInit(): void {
    this.refreshList();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  refreshList() {
    this.projectService
      .getProjects(this.SearchKey, this.SortKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (response.Success === true) {
          this.dataSource = new MatTableDataSource(response.Data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        } else {
          this.alertService.error(
            'Error occurred while fetching projects',
            'Error',
            3000
          );
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editProject(row: Project) {
    this.isEditAction = true;
    const editdialogRef = this.dialogService.open(AddprojectComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { projectdetails: row, edit: true },
    });

    editdialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit(result);
      }
    });
  }

  deleteProject(row: Project) {
    if (row.Project_ID === undefined) return;
    console.log('Delete Project', row);
    const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
      data: { projectName: row.Project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true && row.Project_ID !== undefined) {
        this.projectService
          .deleteProject(row.Project_ID)
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
    });
  }

  addProject() {
    const dialogRef = this.dialogService.open(AddprojectComponent, {
      width: '800px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit(result);
      }
    });
  }

  onSubmit(form: FormGroup): void {
    if (form.invalid) return;

    const formValues = form.value;
    const projectPayload = {
      Project: formValues.projectName,
      Priority: formValues.priority,
      Manager_ID: formValues.manager?.User_ID,
      Start_Date: formValues.startDate
        ? new Date(formValues.startDate).toISOString()
        : '',
      End_Date: formValues.endDate
        ? new Date(formValues.endDate).toISOString()
        : '',
      ...(this.isEditAction && { Project_ID: formValues.projectId }),
    };

    const request$ = this.isEditAction
      ? this.projectService.editProject(projectPayload)
      : this.projectService.addProject(projectPayload);

    request$.pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      this.isEditAction = false;

      if (response.Success) {
        const action = this.isEditAction ? 'updated' : 'added';
        this.alertService.success(
          `Project ${action} successfully.`,
          'Success',
          3000
        );
        this.refreshList();
      } else {
        this.alertService.error(response.Message, 'Error', 3000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
