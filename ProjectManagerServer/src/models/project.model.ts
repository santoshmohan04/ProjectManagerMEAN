import mongoose, { Schema, Document } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';
// @ts-ignore
import mongooseSequence from 'mongoose-sequence';

// @ts-ignore
const autoIncrement = mongooseSequence(mongoose);

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface IProject extends Document {
  uuid: string;
  Project_ID: number; // Auto-incremented
  name: string;
  description?: string;
  priority: number;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  manager?: mongoose.Types.ObjectId;
  isArchived: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  Tasks?: any[];
  NoOfTasks: number;
  CompletedTasks: number;
}

const projectSchema = new Schema<IProject>({
  uuid: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv7(),
  },
  name: {
    type: String,
    required: true,
    index: true,
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
    index: true,
  },
  status: {
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.PLANNING,
    index: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Add text index for name field
projectSchema.index({ name: 'text' });

// Virtual for related tasks
projectSchema.virtual('Tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'Project',
});

// Virtual for number of tasks
projectSchema.virtual('NoOfTasks').get(function (this: IProject) {
  return (this as any).get('Tasks') ? (this as any).get('Tasks').length : 0;
});

// Virtual for completed tasks
projectSchema.virtual('CompletedTasks').get(function (this: IProject) {
  const tasks = (this as any).get('Tasks') || [];
  return tasks.filter((task: any) => task.Status === 1).length;
});

// @ts-ignore
projectSchema.plugin(autoIncrement, { inc_field: 'Project_ID' });

export const Project = mongoose.model<IProject>('Project', projectSchema);