import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const overview = await this.dashboardService.getOverview();
      successResponse(res, overview);
    } catch (err) {
      errorResponse(res, 'Error fetching dashboard overview');
    }
  }
}