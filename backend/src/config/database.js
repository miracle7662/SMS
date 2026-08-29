import mysql from 'mysql2/promise';
import { config } from './env.js';

let pool;

export const createPool = () => {
  pool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
  });

  return pool;
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createPool() first.');
  }
  return pool;
};

export const testDatabaseConnection = async () => {
  try {
    const connection = await getPool().getConnection();
    try {
      const result = await connection.query('SELECT 1');
      return true;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    throw error;
  }
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('Database pool closed');
  }
};

export default { createPool, getPool, testDatabaseConnection, closePool };
