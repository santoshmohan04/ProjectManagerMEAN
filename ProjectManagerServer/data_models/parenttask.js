import mongoose from 'mongoose';

const { Schema } = mongoose;

const schemaOptions = {
  toObject: { virtuals: false },
  toJSON: { virtuals: false },
};

const parentTaskSchema = new Schema(
  {
    Parent_Task: {
      type: String,
      required: true,
    },
    Project_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
  },
  {
    ...schemaOptions,
    collection: 'parenttasks',
  }
);

export default mongoose.model('ParentTask', parentTaskSchema);