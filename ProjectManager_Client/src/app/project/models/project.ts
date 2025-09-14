import { Task } from '../../task/models/task';

export interface Project {
  Project_ID?: number;
  Project: string;
  Start_Date?: string;
  End_Date?: string;
  Priority: number;
  Manager_ID?: number;
  Tasks?: Task[];
  CompletedTasks?: any;
  NoOfTasks?: any;
}
