import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProjectPayload, Project } from '../models/project';
import { ApiResponse } from '../../shared/models/shared';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  baseUri = environment.apiBaseUri;

  constructor(private http: HttpClient) {}

  getProjects(
    searchKey?: string,
    sortKey?: string
  ): Observable<ApiResponse<Project[]>> {
    let params = new HttpParams();

    if (searchKey) params = params.append('searchKey', searchKey);

    if (sortKey) params = params.append('sortKey', sortKey);

    const uri = `${this.baseUri}${environment.endpoint_project_get}`;

    return this.http.get<ApiResponse<Project[]>>(uri, { params: params });
  }

  getProject(projectId: string): Observable<ApiResponse<Project>> {
    const uri = `${this.baseUri}${environment.endpoint_project_get}/${projectId}`;

    return this.http.get<ApiResponse<Project>>(uri);
  }

  addProject(newProject: ProjectPayload): Observable<ApiResponse<Project>> {
    const uri = `${this.baseUri}${environment.endpoint_project_add}`;

    return this.http.post<ApiResponse<Project>>(uri, newProject);
  }

  editProject(
    updateProject: ProjectPayload,
    id: string
  ): Observable<ApiResponse<Project>> {
    const uri = `${this.baseUri}${environment.endpoint_project_edit}/${id}`;

    return this.http.put<ApiResponse<Project>>(uri, updateProject);
  }

  deleteProject(projectID: string): Observable<ApiResponse<Project>> {
    const uri = `${this.baseUri}${environment.endpoint_project_delete}/${projectID}`;

    return this.http.delete<ApiResponse<Project>>(uri);
  }
}
