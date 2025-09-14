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
    console.log('Edit Project', row);
  }

  deleteProject(row: Project) {
    if (row.Project_ID === undefined) return;
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

  addProject() {
    const dialogRef = this.dialogService.open(AddprojectComponent, {
      width: '600px',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
