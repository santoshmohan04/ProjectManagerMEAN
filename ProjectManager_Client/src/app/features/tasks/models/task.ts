import { User } from '@features/users/models/user';
import { Project } from '@features/projects/models/project';

export enum TaskStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Blocked = 'Blocked',
}

export interface Task {
  _id: string;
  Title: string;
  Description: string;
  Start_Date: string;
  End_Date: string;
  Priority: number;
  Status: TaskStatus;
  Parent: Task | null;
  Project: Project | null;
  User: User | null;
}
