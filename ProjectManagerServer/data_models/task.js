import mongoose from 'mongoose';

const { Schema } = mongoose;

const schemaOptions = {
  toObject: { virtuals: false }, // no "id" virtual
  toJSON: { virtuals: false },   // no "id" virtual
};

// Task Schema
const taskSchema = new Schema(
  {
    Task: {
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
      default: 0,
    },
    Status: {
      type: Number, // 0 - Open, 1 - Complete
      default: 0,
    },
    Parent: { type: Schema.Types.ObjectId, ref: 'ParentTask', default: null },
    Project: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    User: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    ...schemaOptions,
    collection: 'tasks',
  }
);

export default mongoose.model('Task', taskSchema);