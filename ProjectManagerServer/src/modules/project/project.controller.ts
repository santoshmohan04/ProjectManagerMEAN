import { Request, Response } from 'express';
import { ProjectService } from './project.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.projectService.getProjects(req.query as any);
      sendSuccess(res, result);
    } catch (err) {
      sendError(res, 'Error fetching projects');
    }
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      if (!project) {
        return sendError(res, 'Project not found', 404);
      }
      sendSuccess(res, project);
    } catch (err) {
      sendError(res, 'Error fetching project');
    }
  }

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.projectService.createProject(req.body);
      sendSuccess(res, project, 'Project created successfully');
    } catch (err) {
      sendError(res, 'Error creating project');
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.updateProject(id, req.body);
      if (!project) {
        return sendError(res, 'Project not found', 404);
      }
      sendSuccess(res, project, 'Project updated successfully');
    } catch (err) {
      sendError(res, 'Error updating project');
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.deleteProject(id);
      if (!project) {
        return sendError(res, 'Project not found', 404);
      }
      sendSuccess(res, null, 'Project deleted successfully');
    } catch (err) {
      sendError(res, 'Error deleting project');
    }
  }
}