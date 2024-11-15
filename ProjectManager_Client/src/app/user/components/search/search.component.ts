import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
declare var $ :any;

@Component({
  selector: 'user-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  providers: [UserService],
  imports: [CommonModule]
})
export class SearchComponent implements OnInit {
  @Input()  name!: string;
  @Output() userSelected = new EventEmitter<User>();

  Users!: User[];
  SortKey!: string;
  SearchKey!: string;
  SelectedUserID!: number;
  enableAdd!:boolean;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList(){
    this.userService.getUsersList(this.SearchKey, this.SortKey)
      .subscribe((response:any) => {
        if (response.Success) {
          this.Users = response.Data;
        }
      });
      this.enableAdd = false;
  }

  
  searchUser(searchValue: Event) {
    this.SearchKey = (searchValue.target as HTMLInputElement).value;
    this.refreshList();
  }

  selectUser(userID: Event){
    this.SelectedUserID = Number((userID.target as HTMLInputElement).value);
    this.enableAdd = true;
  }

  addUser(){

    this.userService.getUser(this.SelectedUserID)
      .subscribe((response:any) =>{
          if(response.Success)
          {
            this.userSelected.emit(response.Data);
            $('#userSearchModel').modal('toggle');
          }
      });
  }
}