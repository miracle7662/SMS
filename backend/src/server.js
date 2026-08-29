import app from './app.js';
import { config } from './config/env.js';
import { createPool, testDatabaseConnection, closePool } from './config/database.js';

const PORT = config.port;

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close HTTP server
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }

  // Close database pool
  await closePool();

  process.exit(0);
};

let server;

const startServer = async () => {
  try {
    console.log(`Environment: ${config.nodeEnv}`);

    // Initialize database pool
    createPool();
    console.log('Database pool created');

    // Test database connection
    console.log('Testing database connection...');
    await testDatabaseConnection();
    console.log('✓ Database connection successful');

    // Start Express server
    server = app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ Health check available at http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown handlers
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    if (error.message.includes('connect')) {
      console.error('\n⚠ Database connection failed.');
      console.error('Please ensure:');
      console.error('  1. MySQL server is running');
      console.error('  2. Database credentials in .env are correct');
      console.error('  3. Database exists (run: CREATE DATABASE society_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;)');
    }
    process.exit(1);
  }
};

startServer();

export { server };
