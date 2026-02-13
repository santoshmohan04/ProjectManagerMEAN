import { Task, ITask, TaskStatus } from '../../models/task.model.js';

export interface TaskSearchFilters {
  status?: TaskStatus[];
  priority?: { min: number; max: number };
  assignedTo?: string;
  projectId?: string;
  dueDateBefore?: Date;
}

export interface TaskSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface TaskPagination {
  page: number;
  limit: number;
}

export interface TaskSearchResult {
  data: ITask[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

  async advancedSearch(
    filters: TaskSearchFilters,
    sort?: TaskSort,
    pagination?: TaskPagination
  ): Promise<TaskSearchResult> {
    // Build match conditions
    const matchConditions: any = {};

    // Status filter - array of statuses
    if (filters.status && filters.status.length > 0) {
      matchConditions.status = { $in: filters.status };
    }

    // Priority range filter
    if (filters.priority) {
      matchConditions.priority = {
        $gte: filters.priority.min,
        $lte: filters.priority.max
      };
    }

    // Assigned to filter
    if (filters.assignedTo) {
      matchConditions.assignedTo = filters.assignedTo;
    }

    // Project ID filter
    if (filters.projectId) {
      matchConditions.project = filters.projectId;
    }

    // Due date before filter
    if (filters.dueDateBefore) {
      matchConditions.dueDate = { $lte: filters.dueDateBefore };
    }

    // Build sort conditions
    const sortConditions: any = {};
    if (sort) {
      sortConditions[sort.field] = sort.order === 'desc' ? -1 : 1;
    } else {
      sortConditions.createdAt = -1; // Default sort by newest first
    }

    // Set pagination defaults
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: any[] = [
      // Match stage
      { $match: matchConditions },

      // Lookup stages for population
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedTo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'parentTask',
          foreignField: '_id',
          as: 'parentTask'
        }
      },

      // Unwind arrays (optional, since we want single objects)
      {
        $unwind: {
          path: '$project',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$assignedTo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$createdBy',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$parentTask',
          preserveNullAndEmptyArrays: true
        }
      },

      // Project only necessary fields and transform data
      {
        $project: {
          _id: 0, // Exclude internal _id
          id: '$uuid', // Map uuid to id
          title: 1,
          description: 1,
          priority: 1,
          status: 1,
          dueDate: 1,
          estimatedHours: 1,
          actualHours: 1,
          createdAt: 1,
          updatedAt: 1,
          project: {
            id: '$project.uuid',
            name: '$project.name',
            status: '$project.status'
          },
          assignedTo: {
            id: '$assignedTo.uuid',
            firstName: '$assignedTo.firstName',
            lastName: '$assignedTo.lastName',
            email: '$assignedTo.email'
          },
          createdBy: {
            id: '$createdBy.uuid',
            firstName: '$createdBy.firstName',
            lastName: '$createdBy.lastName',
            email: '$createdBy.email'
          },
          parentTask: {
            id: '$parentTask.uuid',
            title: '$parentTask.title',
            status: '$parentTask.status'
          }
        }
      },

      // Sort stage
      { $sort: sortConditions },

      // Facet stage for pagination and total count
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    // Execute aggregation
    const result = await Task.aggregate(pipeline);

    // Extract data and count
    const data = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async findById(id: string): Promise<ITask | null> {
    return Task.findById(id)
      .populate('Project')
      .populate('User')
      .populate('Parent')
      .exec();
  }

  async findByUuid(uuid: string): Promise<ITask | null> {
    return Task.findOne({ uuid })
      .populate('project', 'uuid name status')
      .populate('assignedTo', 'uuid firstName lastName email')
      .populate('createdBy', 'uuid firstName lastName email')
      .populate('parentTask', 'uuid title status')
      .exec();
  }

  async create(taskData: Partial<ITask>): Promise<ITask> {
    const task = new Task(taskData);
    return task.save();
  }

  async update(id: string, taskData: Partial<ITask>): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, taskData, { new: true }).exec();
  }

  async updateByUuid(uuid: string, taskData: Partial<ITask>): Promise<ITask | null> {
    return Task.findOneAndUpdate({ uuid }, taskData, { new: true }).exec();
  }

  async delete(id: string): Promise<ITask | null> {
    return Task.findByIdAndDelete(id).exec();
  }

  async deleteByUuid(uuid: string): Promise<ITask | null> {
    return Task.findOneAndDelete({ uuid }).exec();
  }
}