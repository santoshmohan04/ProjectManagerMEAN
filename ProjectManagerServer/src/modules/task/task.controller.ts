import { Request, Response } from 'express';
import { TaskService } from './task.service.js';
import { TaskSearchFilters, TaskSort, TaskPagination } from './task.repository.js';
import { sendSuccess, sendError } from '../../utils/response.js';

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
      sendSuccess(res, tasks);
    } catch (err) {
      sendError(res, 'Error fetching tasks');
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
        return sendError(res, 'Filters are required', 400);
      }

      const result = await this.taskService.getAdvancedTasks(filters, sort, pagination);
      sendSuccess(res, result);
    } catch (err) {
      sendError(res, 'Error performing advanced search');
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }
      sendSuccess(res, task);
    } catch (err) {
      sendError(res, 'Error fetching task');
    }
  }

  async getTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const task = await this.taskService.getTaskByUuid(uuid);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }
      sendSuccess(res, task);
    } catch (err) {
      sendError(res, 'Error fetching task');
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.createTask(req.body);
      sendSuccess(res, task, 'Task created successfully', 201);
    } catch (err) {
      sendError(res, 'Error creating task');
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.updateTask(id, req.body);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }
      sendSuccess(res, task, 'Task updated successfully');
    } catch (err) {
      sendError(res, 'Error updating task');
    }
  }

  async updateTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const task = await this.taskService.updateTaskByUuid(uuid, req.body);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }
      sendSuccess(res, task, 'Task updated successfully');
    } catch (err) {
      sendError(res, 'Error updating task');
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.deleteTask(id);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }
      sendSuccess(res, null, 'Task deleted successfully');
    } catch (err) {
      sendError(res, 'Error deleting task');
    }
  }

  async deleteTaskByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const task = await this.taskService.deleteTaskByUuid(uuid);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }
      sendSuccess(res, null, 'Task deleted successfully');
    } catch (err) {
      sendError(res, 'Error deleting task');
    }
  }
}