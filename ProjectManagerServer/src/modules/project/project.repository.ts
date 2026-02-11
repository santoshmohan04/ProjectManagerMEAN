import { Project, IProject } from '../../models/project.model.js';

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

  async findById(id: string): Promise<IProject | null> {
    return Project.findById(id).populate('Tasks').exec();
  }

  async create(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return project.save();
  }

  async update(id: string, projectData: Partial<IProject>): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, projectData, { new: true }).exec();
  }

  async delete(id: string): Promise<IProject | null> {
    return Project.findByIdAndDelete(id).exec();
  }
}