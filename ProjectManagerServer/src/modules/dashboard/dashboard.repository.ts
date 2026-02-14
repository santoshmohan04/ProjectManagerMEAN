import { Project, ProjectStatus } from '../../models/project.model.js';
import { Task, TaskStatus } from '../../models/task.model.js';
import { User } from '../../models/user.model.js';

export interface DashboardOverview {
  projects: {
    total: number;
    active: number;
    completed: number;
    archived: number;
  };
  tasks: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
  users: {
    total: number;
    active: number;
  };
}

export class DashboardRepository {
  async getOverview(): Promise<DashboardOverview> {
    // Get project counts using aggregation
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get task counts using aggregation
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user counts using aggregation
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);

    // Process project stats
    const projects = {
      total: 0,
      active: 0,
      completed: 0,
      archived: 0
    };

    projectStats.forEach(stat => {
      projects.total += stat.count;
      switch (stat._id) {
        case ProjectStatus.ACTIVE:
          projects.active = stat.count;
          break;
        case ProjectStatus.COMPLETED:
          projects.completed = stat.count;
          break;
        case ProjectStatus.ARCHIVED:
          projects.archived = stat.count;
          break;
      }
    });

    // Process task stats
    const tasks = {
      total: 0,
      open: 0,
      inProgress: 0,
      completed: 0,
      blocked: 0
    };

    taskStats.forEach(stat => {
      tasks.total += stat.count;
      switch (stat._id) {
        case TaskStatus.OPEN:
          tasks.open = stat.count;
          break;
        case TaskStatus.IN_PROGRESS:
          tasks.inProgress = stat.count;
          break;
        case TaskStatus.COMPLETED:
          tasks.completed = stat.count;
          break;
        case TaskStatus.BLOCKED:
          tasks.blocked = stat.count;
          break;
      }
    });

    // Process user stats
    const users = {
      total: 0,
      active: 0
    };

    userStats.forEach(stat => {
      users.total += stat.count;
      if (stat._id === true) {
        users.active = stat.count;
      }
    });

    return {
      projects,
      tasks,
      users
    };
  }
}