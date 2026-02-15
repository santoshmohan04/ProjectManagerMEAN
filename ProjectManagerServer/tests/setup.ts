import mongoose from 'mongoose';

// For now, we'll skip the in-memory database setup
// and just ensure mongoose is available for tests
beforeAll(async () => {
  // You can add database setup here if needed
  // For now, tests will use the actual database connection
});

afterAll(async () => {
  // Clean up if needed
});

afterEach(async () => {
  // Clear all collections after each test
  // This will only work if mongoose is connected
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    // Ignore errors if not connected
  }
});