import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { User, UserPayload, CreateUserRequest, UpdateUserRequest, UserRole } from '../models/user';
import { ApiResponse } from '@shared/models/shared';

import { Observable } from 'rxjs';

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserQueryParams extends UserFilters {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IUserService {
  getUser(userId: string): Observable<ApiResponse<User>>;
  getUsersList(params?: UserQueryParams): Observable<ApiResponse<User[]>>;
  addUser(newUser: CreateUserRequest): Observable<ApiResponse<User>>;
  editUser(updateUser: UpdateUserRequest, id: string): Observable<ApiResponse<User>>;
  deleteUser(userId: string): Observable<ApiResponse<User>>;
  deactivateUser(userId: string): Observable<ApiResponse<User>>;
  activateUser(userId: string): Observable<ApiResponse<User>>;
}

@Injectable({
  providedIn: 'root',
})
export class UserService implements IUserService {
  baseUri = environment.apiBaseUri;

  constructor(private readonly http: HttpClient) {}

  getUser(userId: string): Observable<ApiResponse<User>> {
    const uri = `${this.baseUri}${environment.endpoint_user_get}/${userId}`;

    return this.http.get<ApiResponse<User>>(uri);
  }

  getUsersList(params?: UserQueryParams): Observable<ApiResponse<User[]>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.append('page', params.page.toString());
      if (params.limit) httpParams = httpParams.append('limit', params.limit.toString());
      if (params.sort) httpParams = httpParams.append('sort', params.sort);
      if (params.search) httpParams = httpParams.append('search', params.search);
      if (params.role) httpParams = httpParams.append('role', params.role);
      if (params.isActive !== undefined) httpParams = httpParams.append('isActive', params.isActive.toString());
    }

    const uri = `${this.baseUri}${environment.endpoint_user_get}`;

    return this.http.get<ApiResponse<User[]>>(uri, { params: httpParams });
  }

  addUser(newUser: CreateUserRequest): Observable<ApiResponse<User>> {
    const uri = `${this.baseUri}${environment.endpoint_user_add}`;

    return this.http.post<ApiResponse<User>>(uri, newUser);
  }

  editUser(updateUser: UpdateUserRequest, id: string): Observable<ApiResponse<User>> {
    const uri = `${this.baseUri}${environment.endpoint_user_edit}/${id}`;

    return this.http.put<ApiResponse<User>>(uri, updateUser);
  }

  deleteUser(userId: string): Observable<ApiResponse<User>> {
    const uri = `${this.baseUri}${environment.endpoint_user_delete}/${userId}`;

    return this.http.delete<ApiResponse<User>>(uri);
  }

  deactivateUser(userId: string): Observable<ApiResponse<User>> {
    return this.editUser({ isActive: false }, userId);
  }

  activateUser(userId: string): Observable<ApiResponse<User>> {
    return this.editUser({ isActive: true }, userId);
  }
}
