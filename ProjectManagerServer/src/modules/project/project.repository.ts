import { Project, IProject, ProjectStatus } from '../../models/project.model.js';

export interface ProjectFilters {
  status?: ProjectStatus;
  priority?: number;
  manager?: string;
}

export interface ProjectSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface PaginatedProjects {
  data: IProject[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProjectRepository {
  async findAll(searchKey?: string, sortKey?: string): Promise<IProject[]> {
    let filter: any = {};
    if (searchKey) {
      const safeSearch = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter = { $or: [{ Project: { $regex: safeSearch, $options: 'i' } }] };
    }

    let query = Project.find(filter);

    const allowedSortKeys = ['Project', 'Priority', 'Start_Date', 'End_Date'];
    if (sortKey && allowedSortKeys.includes(sortKey)) {
      query = query.sort({ [sortKey]: 1 });
    }

    return query.populate('Tasks', ['_id', 'Status']).exec();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    sort?: ProjectSort,
    filters?: ProjectFilters,
    searchKey?: string
  ): Promise<PaginatedProjects> {
    // Build filter object
    const filter: any = {};

    // Add search filter
    if (searchKey) {
      filter.$text = { $search: searchKey };
    }

    // Add status filter
    if (filters?.status) {
      filter.status = filters.status;
    }

    // Add priority filter
    if (filters?.priority !== undefined) {
      filter.priority = filters.priority;
    }

    // Add manager filter
    if (filters?.manager) {
      filter.manager = filters.manager;
    }

    // Build sort object
    const sortObj: any = {};
    if (sort) {
      sortObj[sort.field] = sort.order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = -1; // Default sort by newest first
    }

    // Get total count
    const total = await Project.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const data = await Project.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('manager', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .select('-_id -__v') // Exclude internal fields
      .lean() // Return plain objects
      .exec();

    // Transform data to map uuid as id
    const transformedData = data.map(project => ({
      id: project.uuid,
      ...project,
    }));

    return {
      data: transformedData as IProject[],
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findByUuid(uuid: string): Promise<IProject | null> {
    return Project.findOne({ uuid })
      .populate('manager', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }

  async create(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return project.save();
  }

  async updateByUuid(uuid: string, projectData: Partial<IProject>): Promise<IProject | null> {
    return Project.findOneAndUpdate({ uuid }, projectData, { new: true }).exec();
  }

  async deleteByUuid(uuid: string): Promise<IProject | null> {
    return Project.findOneAndDelete({ uuid }).exec();
  }
}