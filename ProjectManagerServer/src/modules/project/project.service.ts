import { ProjectRepository, ProjectFilters, ProjectSort, PaginatedProjects } from './project.repository.js';
import { IProject, ProjectStatus } from '../../models/project.model.js';

export interface ProjectResponse {
  uuid: string;
  Project_ID: number;
  name: string;
  description?: string;
  priority: number;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  manager?: string; // UUID of manager
  isArchived: boolean;
  createdBy: string; // UUID of creator
  createdAt: Date;
  updatedAt: Date;
  Tasks?: any[];
  NoOfTasks: number;
  CompletedTasks: number;
}

export interface PaginatedProjectsResponse {
  data: ProjectResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  /**
   * Map IProject to ProjectResponse (exclude _id and internal ObjectIds)
   */
  private mapToProjectResponse(project: IProject): ProjectResponse {
    return {
      uuid: project.uuid,
      Project_ID: project.Project_ID,
      name: project.name,
      description: project.description,
      priority: project.priority,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      manager: project.manager?.toString(), // Convert ObjectId to string
      isArchived: project.isArchived,
      createdBy: project.createdBy?.toString(), // Convert ObjectId to string
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      Tasks: project.Tasks,
      NoOfTasks: project.NoOfTasks,
      CompletedTasks: project.CompletedTasks,
    };
  }

  async getAllProjects(searchKey?: string, sortKey?: string): Promise<ProjectResponse[]> {
    const projects = await this.projectRepository.findAll(searchKey, sortKey);
    return projects.map(project => this.mapToProjectResponse(project));
  }

  async getProjects(query: {
    page?: string;
    limit?: string;
    sort?: string;
    status?: string;
    priority?: string;
    manager?: string;
    search?: string;
  }): Promise<PaginatedProjectsResponse> {
    const result = await this.projectRepository.findAllPaginated(
      Math.max(1, parseInt(query.page || '1', 10)),
      Math.min(100, Math.max(1, parseInt(query.limit || '10', 10))),
      query.sort ? (() => {
        const [field, order] = query.sort!.split(':');
        if (field && (order === 'asc' || order === 'desc')) {
          return { field, order };
        }
        return undefined;
      })() : undefined,
      (() => {
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
        return filters;
      })(),
      query.search
    );

    return {
      data: result.data.map(project => this.mapToProjectResponse(project)),
      meta: result.meta,
    };
  }

  async getProjectById(id: string): Promise<ProjectResponse | null> {
    const project = await this.projectRepository.findById(id);
    return project ? this.mapToProjectResponse(project) : null;
  }

  async getProjectByUuid(uuid: string): Promise<ProjectResponse | null> {
    const project = await this.projectRepository.findByUuid(uuid);
    return project ? this.mapToProjectResponse(project) : null;
  }

  async createProject(projectData: Partial<IProject>): Promise<ProjectResponse> {
    const project = await this.projectRepository.create(projectData);
    return this.mapToProjectResponse(project);
  }

  async updateProject(id: string, projectData: Partial<IProject>): Promise<ProjectResponse | null> {
    const project = await this.projectRepository.update(id, projectData);
    return project ? this.mapToProjectResponse(project) : null;
  }

  async updateProjectByUuid(uuid: string, projectData: Partial<IProject>): Promise<ProjectResponse | null> {
    const project = await this.projectRepository.updateByUuid(uuid, projectData);
    return project ? this.mapToProjectResponse(project) : null;
  }

  async deleteProject(id: string): Promise<ProjectResponse | null> {
    const project = await this.projectRepository.delete(id);
    return project ? this.mapToProjectResponse(project) : null;
  }

  async deleteProjectByUuid(uuid: string): Promise<ProjectResponse | null> {
    const project = await this.projectRepository.deleteByUuid(uuid);
    return project ? this.mapToProjectResponse(project) : null;
  }
}