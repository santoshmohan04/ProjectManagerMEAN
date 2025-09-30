import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const autoIncrement = mongooseSequence(mongoose);
const { Schema } = mongoose;

const schemaOptions = {
  toObject: { virtuals: false },
  toJSON: { virtuals: false },
};

// Project Schema
const projectSchema = new Schema(
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
      ref: "User",
      default: null,
    },
  },
  schemaOptions,
  { collection: "projects" }
);

// Virtual for related tasks
projectSchema.virtual("Tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "Project",
});

// Virtual for number of tasks
projectSchema.virtual("NoOfTasks").get(function () {
  return this.get("Tasks") ? this.get("Tasks").length : 0;
});

// Virtual for completed tasks
projectSchema.virtual("CompletedTasks").get(function () {
  const tasks = this.get("Tasks") || [];
  return tasks.filter((task) => task.Status === 1).length;
});

projectSchema.plugin(autoIncrement, { inc_field: "Project_ID" });

export default mongoose.model("Project", projectSchema);
