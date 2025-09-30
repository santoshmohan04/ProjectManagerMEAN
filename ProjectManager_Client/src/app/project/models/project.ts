import { Task } from '../../task/models/task';

export interface Project {
  _id: string; // MongoDB ObjectId
  Project_ID?: number; // auto-increment ID
  Project: string;
  Start_Date?: string; // ISO date string
  End_Date?: string; // ISO date string
  Priority: number;
  Manager_ID?: number;
  Tasks?: Task[];
  CompletedTasks?: number; // virtual → count
  NoOfTasks?: number; // virtual → count
}

export interface ProjectPayload {
  Project: string;
  Start_Date?: string; // ISO date string
  End_Date?: string; // ISO date string
  Priority: number;
  Manager_ID?: number;
}
