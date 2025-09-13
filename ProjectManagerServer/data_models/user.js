import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const autoIncrement = mongooseSequence(mongoose);
const { Schema } = mongoose;

const schemaOptions = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
};

// User Schema
const userSchema = new Schema(
  {
    User_ID: {
      type: Number,
    },
    First_Name: {
      type: String,
      required: true,
    },
    Last_Name: {
      type: String,
      required: true,
    },
    Employee_ID: {
      type: Number,
      required: true,
    },
    Task_ID: {
      type: Number,
      default: null,
    },
    Project_ID: {
      type: Number,
      default: null,
    },
  },
  schemaOptions,
  { collection: 'users' }
);

userSchema.virtual('Full_Name').get(function () {
  return `${this.First_Name} ${this.Last_Name}`;
});

userSchema.plugin(autoIncrement, { inc_field: 'User _ID' }); // Corrected

export default mongoose.model('User', userSchema); // Corrected