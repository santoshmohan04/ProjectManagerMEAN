import { ProjectRepository, ProjectFilters, ProjectSort, PaginatedProjects } from './project.repository.js';
import { IProject, ProjectStatus } from '../../models/project.model.js';

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async getAllProjects(searchKey?: string, sortKey?: string): Promise<IProject[]> {
    return this.projectRepository.findAll(searchKey, sortKey);
  }

  async getProjects(query: {
    page?: string;
    limit?: string;
    sort?: string;
    status?: string;
    priority?: string;
    manager?: string;
    search?: string;
  }): Promise<PaginatedProjects> {
    // Parse pagination parameters
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10))); // Max 100 items per page

    // Parse sort parameter (format: field:asc|desc)
    let sort: ProjectSort | undefined;
    if (query.sort) {
      const [field, order] = query.sort.split(':');
      if (field && (order === 'asc' || order === 'desc')) {
        sort = { field, order };
      }
    }

    // Build filters
    const filters: ProjectFilters = {};

    if (query.status && Object.values(ProjectStatus).includes(query.status as ProjectStatus)) {
      filters.status = query.status as ProjectStatus;
    }

    if (query.priority !== undefined) {
      const priority = parseInt(query.priority, 10);
      if (!isNaN(priority) && priority >= 1 && priority <= 10) {
        filters.priority = priority;
      }
    }

    if (query.manager) {
      filters.manager = query.manager;
    }

    return this.projectRepository.findAllPaginated(page, limit, sort, filters, query.search);
  }

  async getProjectById(id: string): Promise<IProject | null> {
    return this.projectRepository.findById(id);
  }

  async getProjectByUuid(uuid: string): Promise<IProject | null> {
    return this.projectRepository.findByUuid(uuid);
  }

  async createProject(projectData: Partial<IProject>): Promise<IProject> {
    return this.projectRepository.create(projectData);
  }

  async updateProject(id: string, projectData: Partial<IProject>): Promise<IProject | null> {
    return this.projectRepository.update(id, projectData);
  }

  async updateProjectByUuid(uuid: string, projectData: Partial<IProject>): Promise<IProject | null> {
    return this.projectRepository.updateByUuid(uuid, projectData);
  }

  async deleteProject(id: string): Promise<IProject | null> {
    return this.projectRepository.delete(id);
  }

  async deleteProjectByUuid(uuid: string): Promise<IProject | null> {
    return this.projectRepository.deleteByUuid(uuid);
  }
}