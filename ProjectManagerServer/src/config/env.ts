import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4300,
  mongoUri: process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/projectmanager',
  nodeEnv: process.env.NODE_ENV || 'development',
};