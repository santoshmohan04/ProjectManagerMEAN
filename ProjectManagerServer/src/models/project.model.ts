import mongoose, { Schema, Document } from 'mongoose';
// @ts-ignore
import mongooseSequence from 'mongoose-sequence';

// @ts-ignore
const autoIncrement = mongooseSequence(mongoose);

export interface IProject extends Document {
  Project_ID: number;
  Project: string;
  Start_Date?: Date;
  End_Date?: Date;
  Priority?: number;
  Manager?: mongoose.Types.ObjectId;
}

const projectSchema = new Schema<IProject>(
  {
    Project_ID: {
      type: Number,
    },
    Project: {
      type: String,
      required: true,
    },
    Start_Date: {
      type: Date,
      default: null,
    },
    End_Date: {
      type: Date,
      default: null,
    },
    Priority: {
      type: Number,
    },
    Manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    toObject: { virtuals: false },
    toJSON: { virtuals: false },
    collection: 'projects',
  }
);

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