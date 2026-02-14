import mongoose, { Schema, Document } from 'mongoose';
import { v7 as uuidv7 } from 'uuid';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export interface IUser extends Document {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  updateLastLogin(): Promise<IUser>;
}

export interface IUserModel extends mongoose.Model<IUser> {
  findActive(): mongoose.Query<IUser[], IUser>;
}

const userSchema = new Schema<IUser>(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv7(),
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    tokenVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'users',
  }
);

// Compound index on email + isActive for efficient queries
userSchema.index({ email: 1, isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Hide passwordHash in JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

// Static method to find active users
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Add audit hooks to the schema
userSchema.pre('save', async function (this: IUser, next) {
  try {
    const doc = this;
    // Audit logging is handled by controllers using the audit service
    next();
  } catch (error) {
    console.error('Audit logging error in user pre-save:', error);
    next();
  }
});

userSchema.pre('deleteOne', async function (this: IUser, next) {
  try {
    const doc = this;
    // Audit logging is handled by controllers using the audit service
    next();
  } catch (error) {
    console.error('Audit logging error in user pre-deleteOne:', error);
    next();
  }
});

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);

// Note: Audit logging is now handled by the controllers using the audit service