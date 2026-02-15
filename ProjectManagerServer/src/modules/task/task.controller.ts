import { Request, Response } from 'express';
import { TaskService } from './task.service.js';
import { TaskSearchFilters, TaskSort, TaskPagination } from './task.repository.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { EntityType } from '../../models/audit.model.js';
import { ITask, TaskStatus } from '../../models/task.model.js';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async getTasksWithFilters(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        sort,
        status,
        priority,
        project,
        assignedTo,
        parentTask,
        search
      } = req.query as {
        page?: string;
        limit?: string;
        sort?: string;
        status?: string | string[];
        priority?: string;
        project?: string;
        assignedTo?: string;
        parentTask?: string;
        search?: string;
      };

      // Parse pagination
      const pageNum = Math.max(1, parseInt(String(page || '1'), 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit || '10'), 10)));

      // Parse sort
      let sortConfig: TaskSort | undefined;
      if (sort) {
        const sortMatch = sort.match(/^([a-zA-Z_]+):(asc|desc)$/);
        if (sortMatch) {
          sortConfig = {
            field: sortMatch[1],
            order: sortMatch[2] as 'asc' | 'desc'
          };
        }
      }

      // Build filters
      const filters: TaskSearchFilters = {};

      // Status filter (can be array)
      if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        filters.status = statusArray as TaskStatus[];
      }

      // Priority filter (min/max range)
      if (priority) {
        try {
          const priorityObj = JSON.parse(priority);
          if (priorityObj.min !== undefined || priorityObj.max !== undefined) {
            filters.priority = {
              min: priorityObj.min ?? 1,
              max: priorityObj.max ?? 5
            };
          }
        } catch (e) {
          // If parsing fails, try as single number
          const priorityNum = parseInt(priority, 10);
          if (!isNaN(priorityNum)) {
            filters.priority = { min: priorityNum, max: priorityNum };
          }
        }
      }

      // Other filters
      if (project) filters.projectId = project;
      if (assignedTo) filters.assignedTo = assignedTo;
      if (parentTask) filters.parentId = parentTask;
      if (search) filters.search = search;

      // For search, we'll use the existing search functionality
      // Note: The advanced search doesn't have a general search field,
      // so we'll need to modify the service/repository or use a different approach

      const result = await this.taskService.getAdvancedTasks(filters, sortConfig, {
        page: pageNum,
        limit: limitNum
      });

      successResponse(res, result.data, result.meta);
    } catch (err) {
      errorResponse(res, 'Error fetching tasks', 'FETCH_ERROR');
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
        return errorResponse(res, 'Filters are required', 'VALIDATION_ERROR', 400);
      }

      const result = await this.taskService.getAdvancedTasks(filters, sort, pagination);
      successResponse(res, result.data, result.meta);
    } catch (err) {
      errorResponse(res, 'Error performing advanced search', 'SEARCH_ERROR');
    }
  }

  async getTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const task = await this.taskService.getTaskByUuid(uuid);
      if (!task) {
        return errorResponse(res, 'Task not found', 'NOT_FOUND', 404);
      }
      successResponse(res, task);
    } catch (err) {
      errorResponse(res, 'Error fetching task', 'FETCH_ERROR');
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
      errorResponse(res, 'Error creating task', 'CREATE_ERROR');
    }
  }

  async updateTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;

      // Get the original task for audit logging
      const originalTask = await this.taskService.getTaskByUuid(uuid);

      const task = await this.taskService.updateTaskByUuid(uuid, req.body);
      if (!task) {
        return errorResponse(res, 'Task not found', 'NOT_FOUND', 404);
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
      errorResponse(res, 'Error updating task', 'UPDATE_ERROR');
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
        return errorResponse(res, 'uuids array is required and must not be empty', 'VALIDATION_ERROR', 400);
      }

      if (!updates || Object.keys(updates).length === 0) {
        return errorResponse(res, 'updates object is required and must not be empty', 'VALIDATION_ERROR', 400);
      }

      const result = await this.taskService.bulkUpdateTasksByUuids(uuids, updates);
      successResponse(res, result, undefined, 'Tasks updated successfully');
    } catch (err: any) {
      errorResponse(res, err.message || 'Error updating tasks', 'BULK_UPDATE_ERROR', 400);
    }
  }

  async deleteTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;

      // Get the task before deleting for audit logging
      const task = await this.taskService.getTaskByUuid(uuid);
      if (!task) {
        return errorResponse(res, 'Task not found', 'NOT_FOUND', 404);
      }

      // Log the deletion before actually deleting
      if ((req as any).audit) {
        await (req as any).audit.logDelete(EntityType.TASK, task.uuid, task.toObject());
      }

      await this.taskService.deleteTaskByUuid(uuid);
      successResponse(res, null, undefined, 'Task deleted successfully');
    } catch (err) {
      errorResponse(res, 'Error deleting task', 'DELETE_ERROR');
    }
  }
}