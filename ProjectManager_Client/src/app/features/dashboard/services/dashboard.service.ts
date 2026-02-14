import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/shared';
import { DashboardOverview } from '../models/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUri = environment.apiBaseUri;

  /**
   * Get dashboard overview data
   * @returns Observable with dashboard statistics
   */
  getOverview(): Observable<ApiResponse<DashboardOverview>> {
    const uri = `${this.baseUri}${environment.endpoint_dashboard_overview}`;
    return this.http.get<ApiResponse<DashboardOverview>>(uri);
  }
}
