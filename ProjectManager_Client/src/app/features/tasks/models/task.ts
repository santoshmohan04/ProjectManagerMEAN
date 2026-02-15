import { User } from '@features/users/models/user';
import { Project } from '@features/projects/models/project';

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number;
  status: TaskStatus;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    status: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  parentTask?: {
    id: string;
    title: string;
    status: string;
  };
  
  // Legacy properties for backward compatibility (will be removed)
  _id?: string;
  Title?: string;
  Description?: string;
  Start_Date?: string;
  End_Date?: string;
  Priority?: number;
  Status?: string;
  Parent?: Task | null;
  Project?: Project | null;
  User?: User | null;
}
