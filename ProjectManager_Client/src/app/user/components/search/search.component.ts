import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  signal,
  OnDestroy,
} from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    providers: [UserService],
    imports: [CommonModule]
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() name!: string;

  Users!: User[];
  SortKey!: string;
  SearchKey!: string;
  SelectedUser = signal<User | null>(null);
  enableAdd!: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private readonly userService: UserService,
    private readonly activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.userService
      .getUsersList(this.SearchKey, this.SortKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
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

  selectUser(user: User) {
    this.SelectedUser.set(user);
    this.enableAdd = true;
  }

  addUser() {
    this.activeModal.close(this.SelectedUser());
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
