import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Task } from '../models/task';
import { ApiResponse } from '../../shared/models/shared';

import { Observable } from 'rxjs';

export interface ITaskService {
  getTask(taskId: string): Observable<ApiResponse<Task>>;
  getTasksList(
    projectId?: string,
    sortKey?: string
  ): Observable<ApiResponse<Task[]>>;
  addTask(newUser: Task): Observable<ApiResponse<Task>>;
  editTask(updateUser: Task): Observable<ApiResponse<Task>>;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService implements ITaskService {
  baseUri = environment.apiBaseUri;

  constructor(private http: HttpClient) {}

  getTask(taskId: string): Observable<ApiResponse<Task>> {
    const uri = `${this.baseUri}${environment.endpoint_task_get}/${taskId}`;

    return this.http.get<ApiResponse<Task>>(uri);
  }

  getTasksList(
    projectId?: string,
    sortKey?: string
  ): Observable<ApiResponse<Task[]>> {
    let params = new HttpParams();

    if (projectId) params = params.append('projectId', projectId.toString());

    if (sortKey) params = params.append('sortKey', sortKey);

    const uri = `${this.baseUri}${environment.endpoint_task_get}`;

    return this.http.get<ApiResponse<Task[]>>(uri, { params: params });
  }

  addTask(newTask: Task): Observable<ApiResponse<Task>> {
    const uri = `${this.baseUri}${environment.endpoint_task_add}`;

    return this.http.post<ApiResponse<Task>>(uri, newTask);
  }

  editTask(updateTask: Task): Observable<ApiResponse<Task>> {
    const uri = `${this.baseUri}${environment.endpoint_task_edit}`;

    return this.http.post<ApiResponse<Task>>(uri, updateTask);
  }

  endTask(taskId: string): Observable<ApiResponse<Task>> {
    const uri = `${this.baseUri}${environment.endpoint_task_get}/${taskId}`;

    return this.http.delete<ApiResponse<Task>>(uri);
  }
}
