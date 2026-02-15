import { Task } from '@features/tasks/models/task';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface Project {
  _id: string; // MongoDB ObjectId
  uuid?: string; // UUID for identification
  Project_ID?: number; // auto-increment ID
  Project: string; // Project name
  name?: string; // Alternative name field (backend uses this)
  description?: string;
  Start_Date?: string; // ISO date string
  End_Date?: string; // ISO date string
  startDate?: Date; // Backend uses this
  endDate?: Date; // Backend uses this
  Priority: number;
  priority?: number; // Backend uses this
  status?: ProjectStatus;
  Manager_ID?: number;
  manager?: string; // UUID of manager (backend)
  isArchived?: boolean;
  createdBy?: string; // UUID of creator
  Tasks?: Task[];
  CompletedTasks?: number; // virtual → count
  NoOfTasks?: number; // virtual → count
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectPayload {
  Project?: string; // Legacy field
  name?: string; // Backend expects this
  description?: string;
  Start_Date?: string; // ISO date string
  End_Date?: string; // ISO date string
  startDate?: string; // Backend expects this
  endDate?: string; // Backend expects this
  Priority?: number;
  priority?: number; // Backend expects this
  status?: ProjectStatus;
  Manager_ID?: number;
  manager?: string; // UUID of manager
}
