import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/shared';
import { AuditLog, EntityType, AuditQueryParams } from '../models/audit';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUri;

  /**
   * Get audit history for a specific entity
   */
  getEntityHistory(
    entityType: EntityType,
    entityId: string,
    params?: AuditQueryParams
  ): Observable<ApiResponse<AuditLog[]>> {
    let httpParams = new HttpParams();

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.skip) {
      httpParams = httpParams.set('skip', params.skip.toString());
    }
    if (params?.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params?.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }

    return this.http.get<ApiResponse<AuditLog[]>>(
      `${this.apiUrl}/audit/entity/${entityType}/${entityId}`,
      { params: httpParams }
    );
  }

  /**
   * Get audit activity for a specific user
   */
  getUserActivity(
    userId: string,
    params?: AuditQueryParams
  ): Observable<ApiResponse<AuditLog[]>> {
    let httpParams = new HttpParams();

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.skip) {
      httpParams = httpParams.set('skip', params.skip.toString());
    }
    if (params?.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params?.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }

    return this.http.get<ApiResponse<AuditLog[]>>(
      `${this.apiUrl}/audit/user/${userId}`,
      { params: httpParams }
    );
  }

  /**
   * Get recent audit activity across all entities
   */
  getRecentActivity(limit?: number): Observable<ApiResponse<AuditLog[]>> {
    let httpParams = new HttpParams();

    if (limit) {
      httpParams = httpParams.set('limit', limit.toString());
    }

    return this.http.get<ApiResponse<AuditLog[]>>(
      `${this.apiUrl}/audit/recent`,
      { params: httpParams }
    );
  }
}
