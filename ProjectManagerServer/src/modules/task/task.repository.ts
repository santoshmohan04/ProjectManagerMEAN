import { Task, ITask } from '../../models/task.model.js';

export class TaskRepository {
  async findAll(filters: {
    projectId?: string;
    parentId?: string;
    searchKey?: string;
    sortKey?: string;
  }): Promise<ITask[]> {
    const query = Task.find();

    if (filters.projectId) query.where('Project').equals(filters.projectId);
    if (filters.parentId) query.where('Parent').equals(filters.parentId);
    if (filters.searchKey) query.where('Title', new RegExp(filters.searchKey, 'i'));

    if (filters.sortKey) {
      query.sort({ [filters.sortKey]: 1 });
    }

    return query
      .populate('Project')
      .populate('User')
      .populate('Parent')
      .exec();
  }

  async findById(id: string): Promise<ITask | null> {
    return Task.findById(id)
      .populate('Project')
      .populate('User')
      .populate('Parent')
      .exec();
  }

  async create(taskData: Partial<ITask>): Promise<ITask> {
    const task = new Task(taskData);
    return task.save();
  }

  async update(id: string, taskData: Partial<ITask>): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, taskData, { new: true }).exec();
  }

  async delete(id: string): Promise<ITask | null> {
    return Task.findByIdAndDelete(id).exec();
  }
}