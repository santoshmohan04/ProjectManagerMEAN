export interface DashboardOverview {
  projects: ProjectStats;
  tasks: TaskStats;
  users: UserStats;
  recentProjects?: RecentProject[];
  overdueCount?: number;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  archived: number;
}

export interface TaskStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  blocked: number;
}

export interface UserStats {
  total: number;
  active: number;
}

export interface RecentProject {
  _id: string;
  uuid?: string;
  Project: string;
  Status: string;
  Priority: number;
  Start_Date: string;
  End_Date: string;
  NoOfTasks?: number;
  CompletedTasks?: number;
}

export interface TaskDistribution {
  name: string;
  value: number;
  color?: string;
}

export interface ChartData {
  name: string;
  value: number;
}
