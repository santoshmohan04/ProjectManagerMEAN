import { TaskRepository } from './task.repository.js';
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

  async getTaskById(id: string): Promise<ITask | null> {
    return this.taskRepository.findById(id);
  }

  async createTask(taskData: Partial<ITask>): Promise<ITask> {
    return this.taskRepository.create(taskData);
  }

  async updateTask(id: string, taskData: Partial<ITask>): Promise<ITask | null> {
    return this.taskRepository.update(id, taskData);
  }

  async deleteTask(id: string): Promise<ITask | null> {
    return this.taskRepository.delete(id);
  }
}