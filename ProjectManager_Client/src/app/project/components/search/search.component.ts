import { Component, OnInit, Input, OnDestroy, signal } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'project-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    imports: [],
    providers: [ProjectService]
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() name!: string;

  Projects!: Project[];
  SortKey!: string;
  SearchKey!: string;
  selectedProject = signal<Project | null>(null);
  enableAdd!: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly projectService: ProjectService,
    private readonly activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.projectService
      .getProjects(this.SearchKey, this.SortKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        if (response.Success === true) {
          this.Projects = response.Data;
        }
      });
    this.enableAdd = false;
  }

  searchProject(searchValue: Event) {
    this.SearchKey = (searchValue.target as HTMLInputElement).value;
    this.refreshList();
  }

  selectProject(project: Project) {
    this.selectedProject.set(project);
    this.enableAdd = true;
  }

  addProject() {
    const project = this.selectedProject();
    if (project) {
      console.log('Closing Modal with Project:', project);
      this.activeModal.close(project);
    } else {
      console.warn('No project selected!');
    }
  }

  closeModal() {
    console.log('Dismiss Modal');
    this.activeModal.dismiss();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
