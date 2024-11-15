import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project';
import { CommonModule } from '@angular/common';
declare var $ :any;

@Component({
  selector: 'project-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [ProjectService]
})
export class SearchComponent implements OnInit {
  @Input()  name!: string;
  @Output() projectSelected = new EventEmitter<Project>();

  Projects!: Project[];
  SortKey!: string;
  SearchKey!: string;
  SelectedProjectID!: number;
  enableAdd!:boolean;

  constructor(private projectService: ProjectService) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList(){
    this.projectService.getProjects(this.SearchKey, this.SortKey)
      .subscribe((response:any) => {
        if (response.Success == true) {
          this.Projects = response.Data;
        }
      });
      this.enableAdd = false;
  }

  
  searchProject(searchValue: Event) {
    this.SearchKey = (searchValue.target as HTMLInputElement).value;
    this.refreshList();
  }

  selectProject(projectID: Event){
    this.SelectedProjectID = Number((projectID.target as HTMLInputElement).value);
    this.enableAdd = true;
  }

  addProject(){

    this.projectService.getProject(this.SelectedProjectID)
      .subscribe((response:any) =>{
          if(response.Success==true)
          {
            this.projectSelected.emit(response.Data);
            $('#projectSearchModel').modal('toggle');
          }
      });
  }
}
