import mongoose from 'mongoose';
const { Schema } = mongoose;

const schemaOptions = {
  toObject: { virtuals: false },
  toJSON: { virtuals: false },
};

// Task Schema
const taskSchema = new Schema(
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
      enum: ['Open', 'In Progress', 'Completed', 'Blocked'], // more flexible than numbers
      default: 'Open',
    },
    Parent: { type: Schema.Types.ObjectId, ref: 'Task', default: null }, // parent task or null
    Project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    User: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    ...schemaOptions,
    collection: 'tasks',
  }
);

export default mongoose.model('Task', taskSchema);