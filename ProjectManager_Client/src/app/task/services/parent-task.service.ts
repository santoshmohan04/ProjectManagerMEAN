import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Task } from '../models/task';
import { ApiResponse } from '../../shared/models/shared';

import { Observable } from 'rxjs';

export interface IParentTaskService {
  getParentTask(parentId: string): Observable<ApiResponse<Task>>;
  getParentTaskList(searchKey?: string): Observable<ApiResponse<Task[]>>;
  addParentTask(newParent: Task): Observable<ApiResponse<Task>>;
}

@Injectable({
  providedIn: 'root',
})
export class ParentTaskService implements IParentTaskService {
  baseUri = environment.apiBaseUri;

  constructor(private http: HttpClient) {}

  getParentTask(parentId: string): Observable<ApiResponse<Task>> {
    const uri = `${this.baseUri}${environment.endpoint_parentTask_get}/${parentId}`;

    return this.http.get<ApiResponse<Task>>(uri);
  }

  getParentTaskList(searchKey?: string): Observable<ApiResponse<Task[]>> {
    //add query string params to search and sort
    let params = new HttpParams();

    if (searchKey) params = params.append('searchKey', searchKey);

    const uri = `${this.baseUri}${environment.endpoint_parentTask_get}`;

    return this.http.get<ApiResponse<Task[]>>(uri, { params: params });
  }

  addParentTask(newParent: Task): Observable<ApiResponse<Task>> {
    const uri = `${this.baseUri}${environment.endpoint_parentTask_add}`;

    return this.http.post<ApiResponse<Task>>(uri, newParent);
  }
}
