import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const autoIncrement = mongooseSequence(mongoose);
const { Schema } = mongoose;

const schemaOptions = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
};

// ParentTask Schema
const parentTaskSchema = new Schema(
  {
    Parent_ID: {
      type: Number,
    },
    Parent_Task: {
      type: String,
      required: true,
    },
    Project_ID: {
      type: Number,
      default: null,
    },
  },
  schemaOptions,
  { collection: 'parenttasks' }
);

parentTaskSchema.plugin(autoIncrement, { inc_field: 'Parent_ID' }); // auto increment value

export default mongoose.model('ParentTask', parentTaskSchema);