import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const autoIncrement = mongooseSequence(mongoose);
const { Schema } = mongoose;

const schemaOptions = {
  toObject: { virtuals: false },
  toJSON: { virtuals: false },
};

// User Schema
const userSchema = new Schema(
  {
    First_Name: {
      type: String,
      required: true,
    },
    Last_Name: {
      type: String,
      required: true,
    },
    Employee_ID: {
      type: String,
      required: true,
    },
    Task_ID: {
      type: String,
      default: null,
    },
    Project_ID: {
      type: String,
      default: null,
    },
  },
  schemaOptions,
  { collection: "users" }
);

userSchema.virtual("Full_Name").get(function () {
  return `${this.First_Name} ${this.Last_Name}`;
});

export default mongoose.model("User", userSchema); // Corrected
