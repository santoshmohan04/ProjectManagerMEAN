import { ProjectRepository } from './project.repository.js';
import { IProject } from '../../models/project.model.js';

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async getAllProjects(searchKey?: string, sortKey?: string): Promise<IProject[]> {
    return this.projectRepository.findAll(searchKey, sortKey);
  }

  async getProjectById(id: string): Promise<IProject | null> {
    return this.projectRepository.findById(id);
  }

  async createProject(projectData: Partial<IProject>): Promise<IProject> {
    return this.projectRepository.create(projectData);
  }

  async updateProject(id: string, projectData: Partial<IProject>): Promise<IProject | null> {
    return this.projectRepository.update(id, projectData);
  }

  async deleteProject(id: string): Promise<IProject | null> {
    return this.projectRepository.delete(id);
  }
}