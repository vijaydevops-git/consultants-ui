const pool = require('../config/database');

beforeAll(async () => {
  // Setup test database
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Close database connection
  await pool.end();
});