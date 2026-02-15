import app from './app.js';
import { config } from './config/env.js';

const startTestServer = async (): Promise<void> => {
  try {
    // Skip database connection for testing error handler
    console.log('Starting test server without database connection...');

    app.listen(config.port, () => {
      console.log(`Test server is running on port ${config.port}`);
      console.log('Test endpoints:');
      console.log(`  GET /test/success - Test success response`);
      console.log(`  GET /test/zod-error - Test Zod validation error`);
      console.log(`  GET /test/mongoose-error - Test Mongoose validation error`);
      console.log(`  GET /test/jwt-error - Test JWT error`);
      console.log(`  GET /test/generic-error - Test generic error`);
    });
  } catch (error) {
    console.error('Failed to start test server:', error);
    process.exit(1);
  }
};

startTestServer();