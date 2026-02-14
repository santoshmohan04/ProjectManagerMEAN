import { Request, Response } from 'express';
import { ProjectService } from './project.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { EntityType } from '../../models/audit.model.js';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.projectService.getProjects(req.query as any);
      successResponse(res, result);
    } catch (err) {
      errorResponse(res, 'Error fetching projects');
    }
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }
      successResponse(res, project);
    } catch (err) {
      errorResponse(res, 'Error fetching project');
    }
  }

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.projectService.createProject(req.body);

      // Log the creation
      if ((req as any).audit) {
        await (req as any).audit.logCreate(EntityType.PROJECT, project.uuid, project.toObject());
      }

      successResponse(res, project, undefined, 'Project created successfully');
    } catch (err) {
      errorResponse(res, 'Error creating project');
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the original project for audit logging
      const originalProject = await this.projectService.getProjectById(id);

      const project = await this.projectService.updateProject(id, req.body);
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }

      // Log the update
      if ((req as any).audit && originalProject) {
        await (req as any).audit.logUpdate(
          EntityType.PROJECT,
          project.uuid,
          originalProject.toObject(),
          project.toObject()
        );
      }

      successResponse(res, project, undefined, 'Project updated successfully');
    } catch (err) {
      errorResponse(res, 'Error updating project');
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the project before deleting for audit logging
      const project = await this.projectService.getProjectById(id);
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }

      // Log the deletion before actually deleting
      if ((req as any).audit) {
        await (req as any).audit.logDelete(EntityType.PROJECT, project.uuid, project.toObject());
      }

      await this.projectService.deleteProject(id);
      successResponse(res, null, undefined, 'Project deleted successfully');
    } catch (err) {
      errorResponse(res, 'Error deleting project');
    }
  }
}