import { TaskRepository, TaskSearchFilters, TaskSort, TaskPagination, TaskSearchResult } from './task.repository.js';
import { ITask } from '../../models/task.model.js';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async getAllTasks(filters: {
    projectId?: string;
    parentId?: string;
    searchKey?: string;
    sortKey?: string;
  }): Promise<ITask[]> {
    return this.taskRepository.findAll(filters);
  }

  async getAdvancedTasks(
    filters: TaskSearchFilters,
    sort?: TaskSort,
    pagination?: TaskPagination
  ): Promise<TaskSearchResult> {
    return this.taskRepository.advancedSearch(filters, sort, pagination);
  }

  async getTaskById(id: string): Promise<ITask | null> {
    return this.taskRepository.findById(id);
  }

  async getTaskByUuid(uuid: string): Promise<ITask | null> {
    return this.taskRepository.findByUuid(uuid);
  }

  async createTask(taskData: Partial<ITask>): Promise<ITask> {
    return this.taskRepository.create(taskData);
  }

  async updateTask(id: string, taskData: Partial<ITask>): Promise<ITask | null> {
    return this.taskRepository.update(id, taskData);
  }

  async updateTaskByUuid(uuid: string, taskData: Partial<ITask>): Promise<ITask | null> {
    return this.taskRepository.updateByUuid(uuid, taskData);
  }

  async bulkUpdateTasksByUuids(uuids: string[], taskData: Partial<ITask>): Promise<{ modifiedCount: number }> {
    // Validate all UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const invalidUuids = uuids.filter(uuid => !uuidRegex.test(uuid));
    
    if (invalidUuids.length > 0) {
      throw new Error(`Invalid UUIDs: ${invalidUuids.join(', ')}`);
    }

    // Validate taskData - only allow status, priority, and assignedTo
    const allowedFields = ['status', 'priority', 'assignedTo'];
    const invalidFields = Object.keys(taskData).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields for bulk update: ${invalidFields.join(', ')}. Only status, priority, and assignedTo are allowed.`);
    }

    return this.taskRepository.bulkUpdateByUuids(uuids, taskData);
  }

  async deleteTask(id: string): Promise<ITask | null> {
    return this.taskRepository.delete(id);
  }

  async deleteTaskByUuid(uuid: string): Promise<ITask | null> {
    return this.taskRepository.deleteByUuid(uuid);
  }
}