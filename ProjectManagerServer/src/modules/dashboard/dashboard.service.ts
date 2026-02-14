import { DashboardRepository, DashboardOverview } from './dashboard.repository.js';

export class DashboardService {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  async getOverview(): Promise<DashboardOverview> {
    return this.dashboardRepository.getOverview();
  }
}