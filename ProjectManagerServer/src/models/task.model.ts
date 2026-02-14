import mongoose, { Schema, Document } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

export interface ITask extends Document {
  uuid: string;
  title: string;
  description?: string;
  priority: number;
  status: TaskStatus;
  project: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  parentTask?: mongoose.Types.ObjectId;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  uuid: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv7(),
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5,
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.OPEN,
    index: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  parentTask: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  dueDate: {
    type: Date,
  },
  estimatedHours: {
    type: Number,
    min: 0,
  },
  actualHours: {
    type: Number,
    min: 0,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Add indexes for better query performance
taskSchema.index({ project: 1, status: 1 }); // Compound index for project + status queries
taskSchema.index({ assignedTo: 1, status: 1 }); // Compound index for assigned user + status queries
taskSchema.index({ dueDate: 1 }); // Index for due date queries
taskSchema.index({ createdAt: -1 }); // Index for recent tasks

// Add audit hooks to the schema
taskSchema.pre('save', async function (this: ITask, next) {
  try {
    const doc = this;
    // Audit logging is handled by controllers using the audit service
    next();
  } catch (error) {
    console.error('Audit logging error in task pre-save:', error);
    next();
  }
});

taskSchema.pre('deleteOne', async function (this: ITask, next) {
  try {
    const doc = this;
    // Audit logging is handled by controllers using the audit service
    next();
  } catch (error) {
    console.error('Audit logging error in task pre-deleteOne:', error);
    next();
  }
});

export const Task = mongoose.model<ITask>('Task', taskSchema);

// Note: Audit logging is now handled by the controllers using the audit service