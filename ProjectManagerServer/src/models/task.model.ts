import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  Title: string;
  Description?: string;
  Start_Date?: Date;
  End_Date?: Date;
  Priority?: number;
  Status: 'Open' | 'In Progress' | 'Completed' | 'Blocked';
  Parent?: mongoose.Types.ObjectId;
  Project?: mongoose.Types.ObjectId;
  User?: mongoose.Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
  {
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      default: '',
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
      default: 0,
    },
    Status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Blocked'],
      default: 'Open',
    },
    Parent: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
    Project: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    User: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    toObject: { virtuals: false },
    toJSON: { virtuals: false },
    collection: 'tasks',
  }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);