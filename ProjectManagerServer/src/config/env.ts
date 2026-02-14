import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4300,
  mongoUri: process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/projectmanager',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:4200', 'http://localhost:3000'],
  jwtSecret: process.env.JWT_SECRET || 'test-jwt-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
};