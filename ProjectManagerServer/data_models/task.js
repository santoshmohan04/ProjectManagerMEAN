import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const autoIncrement = mongooseSequence(mongoose);
const { Schema } = mongoose;

const schemaOptions = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
};

// Task Schema
const taskSchema = new Schema(
  {
    Task_ID: {
      type: Number,
    },
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
    },
    Status: {
      type: Number, // 0 - Open, 1 - Complete
      default: 0,
    },
    Parent: { type: Schema.Types.ObjectId, ref: 'ParentTask' },
    Project: { type: Schema.Types.ObjectId, ref: 'Project' },
    User: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptions,
  { collection: 'tasks' }
);

taskSchema.plugin(autoIncrement, { inc_field: 'Task_ID' }); // auto increment value

export default mongoose.model('Task', taskSchema);