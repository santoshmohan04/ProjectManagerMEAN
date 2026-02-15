import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('ProjectManager Database is connected');
    mongoose.set('debug', true);
  } catch (err) {
    console.error('Cannot connect to the ProjectManager database:', err);
    process.exit(1);
  }
};