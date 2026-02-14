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
      const { uuid } = req.params;
      const project = await this.projectService.getProjectByUuid(uuid);
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

      // For audit logging, we need the original document
      const originalProject = await this.projectService.getProjectByUuid(project.uuid);
      if ((req as any).audit && originalProject) {
        await (req as any).audit.logCreate(EntityType.PROJECT, project.uuid, originalProject);
      }

      successResponse(res, project, undefined, 'Project created successfully');
    } catch (err) {
      errorResponse(res, 'Error creating project');
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;

      // Get the original project for audit logging (before update)
      const originalProject = await this.projectService.getProjectByUuid(uuid);
      if (!originalProject) {
        return errorResponse(res, 'Project not found', 404);
      }

      const project = await this.projectService.updateProjectByUuid(uuid, req.body);
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }

      // Log the update
      if ((req as any).audit) {
        await (req as any).audit.logUpdate(
          EntityType.PROJECT,
          project.uuid,
          originalProject,
          project
        );
      }

      successResponse(res, project, undefined, 'Project updated successfully');
    } catch (err) {
      errorResponse(res, 'Error updating project');
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;

      // Get the project before deleting for audit logging
      const project = await this.projectService.getProjectByUuid(uuid);
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }

      // Log the deletion before actually deleting
      if ((req as any).audit) {
        await (req as any).audit.logDelete(EntityType.PROJECT, project.uuid, project);
      }

      await this.projectService.deleteProjectByUuid(uuid);
      successResponse(res, null, undefined, 'Project deleted successfully');
    } catch (err) {
      errorResponse(res, 'Error deleting project');
    }
  }
}