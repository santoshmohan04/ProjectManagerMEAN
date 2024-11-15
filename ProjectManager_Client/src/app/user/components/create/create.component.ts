import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../../shared/services/alert.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'user-add',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [UserService, AlertService],
})
export class CreateComponent implements OnInit {
  Users!: User[];
  userForm!: FormGroup;
  userAction!: string;
  SortKey!: string;
  SearchKey!: string;

  constructor(
    private userService: UserService,
    private formbuilder: FormBuilder,
    private alertService: AlertService
  ) {
    this.createForm();
  }

  createForm() {
    this.userForm = this.formbuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      employeeId: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]{1,6}$'),
        ]),
      ],
      userId: '',
    });
    this.userAction = 'Add';
  }

  ngOnInit() {
    //load initial user lists
    this.refreshList();
  }

  refreshList() {
    this.userService
      .getUsersList(this.SearchKey, this.SortKey)
      .subscribe((response: any) => {
        if (response.Success) {
          this.Users = response.Data;
        }
      });
  }

  addorUpdateUser() {
    if (this.userAction === 'Add') {
      this.addUser();
    } else if (this.userAction === 'Update') {
      this.updateUser();
    }
  }

  addUser() {
    const newUser = <User>{
      First_Name: this.userForm.controls['firstName'].value,
      Last_Name: this.userForm.controls['lastName'].value,
      Employee_ID: this.userForm.controls['employeeId'].value,
    };

    this.userService.addUser(newUser).subscribe((response: any) => {
      console.log(response);
      if (response.Success == true) {
        //show success message and refresh the list
        this.alertService.success('User added successfully!', 'Success', 3000);

        this.refreshList();
      } else this.alertService.error(response.Message, 'Error', 3000);
    });
  }

  editUser(userID: any) {
    this.userService.getUser(userID).subscribe((response: any) => {
      if (response.Success == true) {
        this.userForm = this.formbuilder.group({
          firstName: [response.Data.First_Name, Validators.required],
          lastName: [response.Data.Last_Name, Validators.required],
          employeeId: [
            response.Data.Employee_ID,
            Validators.compose([
              Validators.required,
              Validators.pattern('^[0-9]{1,6}$'),
            ]),
          ],
          userId: response.Data.User_ID,
        });

        this.userAction = 'Update';
      } else {
        this.alertService.error(response.Message, 'Error', 3000);
      }
    });
  }

  updateUser() {
    const updateUser = <User>{
      User_ID: this.userForm.controls['userId'].value,
      First_Name: this.userForm.controls['firstName'].value,
      Last_Name: this.userForm.controls['lastName'].value,
      Employee_ID: this.userForm.controls['employeeId'].value,
    };

    this.userService.editUser(updateUser).subscribe((response: any) => {
      if (response.Success) {
        //show success message and refresh the list
        this.alertService.success(
          'User updated successfully!',
          'Success',
          3000
        );

        this.refreshList();

        this.reset();
      } else this.alertService.error(response.Message, 'Error', 3000);
    });
  }

  deleteUser(userID: any) {
    this.userService.deleteUser(userID).subscribe((response: any) => {
      if (response.Success) {
        this.alertService.success(
          'User deleted successfully!',
          'Success',
          3000
        );
        this.refreshList();
      } else {
        this.alertService.error(response.Message, 'Error', 3000);
      }
    });
  }

  reset() {
    this.userForm.reset();
    this.userAction = 'Add';
    this.SearchKey = '';
    this.SortKey = '';
  }

  search(searchValue: Event) {
    this.SearchKey = (searchValue.target as HTMLInputElement).value;
    this.refreshList();
  }

  sort(sortKey: string) {
    if (sortKey === 'firstName') this.SortKey = 'First_Name';
    else if (sortKey === 'lastName') this.SortKey = 'Last_Name';
    else if (sortKey === 'employeeId') this.SortKey = 'Employee_ID';
    this.refreshList();
  }
}
