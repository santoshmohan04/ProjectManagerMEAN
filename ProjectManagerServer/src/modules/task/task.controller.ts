import { Request, Response } from 'express';
import { TaskService } from './task.service.js';
import { TaskSearchFilters, TaskSort, TaskPagination } from './task.repository.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { EntityType } from '../../models/audit.model.js';
import { ITask } from '../../models/task.model.js';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, parentId, searchKey, sortKey } = req.query as {
        projectId?: string;
        parentId?: string;
        searchKey?: string;
        sortKey?: string;
      };
      const tasks = await this.taskService.getAllTasks({ projectId, parentId, searchKey, sortKey });
      successResponse(res, tasks);
    } catch (err) {
      errorResponse(res, 'Error fetching tasks');
    }
  }

  async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const { filters, sort, pagination } = req.body as {
        filters: TaskSearchFilters;
        sort?: TaskSort;
        pagination?: TaskPagination;
      };

      // Validate required fields
      if (!filters) {
        return errorResponse(res, 'Filters are required', 400);
      }

      const result = await this.taskService.getAdvancedTasks(filters, sort, pagination);
      successResponse(res, result);
    } catch (err) {
      errorResponse(res, 'Error performing advanced search');
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return errorResponse(res, 'Task not found', 404);
      }
      successResponse(res, task);
    } catch (err) {
      errorResponse(res, 'Error fetching task');
    }
  }

  async getTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const task = await this.taskService.getTaskByUuid(uuid);
      if (!task) {
        return errorResponse(res, 'Task not found', 404);
      }
      successResponse(res, task);
    } catch (err) {
      errorResponse(res, 'Error fetching task');
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.createTask(req.body);

      // Log the creation
      if ((req as any).audit) {
        await (req as any).audit.logCreate(EntityType.TASK, task.uuid, task.toObject());
      }

      successResponse(res, task, undefined, 'Task created successfully', 201);
    } catch (err) {
      errorResponse(res, 'Error creating task');
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the original task for audit logging
      const originalTask = await this.taskService.getTaskById(id);

      const task = await this.taskService.updateTask(id, req.body);
      if (!task) {
        return errorResponse(res, 'Task not found', 404);
      }

      // Log the update
      if ((req as any).audit && originalTask) {
        await (req as any).audit.logUpdate(
          EntityType.TASK,
          task.uuid,
          originalTask.toObject(),
          task.toObject()
        );
      }

      successResponse(res, task, undefined, 'Task updated successfully');
    } catch (err) {
      errorResponse(res, 'Error updating task');
    }
  }

  async updateTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const task = await this.taskService.updateTaskByUuid(uuid, req.body);
      if (!task) {
        return errorResponse(res, 'Task not found', 404);
      }
      successResponse(res, task, undefined, 'Task updated successfully');
    } catch (err) {
      errorResponse(res, 'Error updating task');
    }
  }

  async bulkUpdateTasks(req: Request, res: Response): Promise<void> {
    try {
      const { uuids, updates } = req.body as {
        uuids: string[];
        updates: Partial<ITask>;
      };

      // Validate required fields
      if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
        return errorResponse(res, 'uuids array is required and must not be empty', 400);
      }

      if (!updates || Object.keys(updates).length === 0) {
        return errorResponse(res, 'updates object is required and must not be empty', 400);
      }

      const result = await this.taskService.bulkUpdateTasksByUuids(uuids, updates);
      successResponse(res, result, undefined, 'Tasks updated successfully');
    } catch (err: any) {
      errorResponse(res, err.message || 'Error updating tasks', 400);
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get the task before deleting for audit logging
      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return errorResponse(res, 'Task not found', 404);
      }

      // Log the deletion before actually deleting
      if ((req as any).audit) {
        await (req as any).audit.logDelete(EntityType.TASK, task.uuid, task.toObject());
      }

      await this.taskService.deleteTask(id);
      successResponse(res, null, undefined, 'Task deleted successfully');
    } catch (err) {
      errorResponse(res, 'Error deleting task');
    }
  }

  async deleteTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const task = await this.taskService.deleteTaskByUuid(uuid);
      if (!task) {
        return errorResponse(res, 'Task not found', 404);
      }
      successResponse(res, null, undefined, 'Task deleted successfully');
    } catch (err) {
      errorResponse(res, 'Error deleting task');
    }
  }
}