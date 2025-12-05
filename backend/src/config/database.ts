import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided, otherwise use individual env vars
let poolConfig: any;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL for Cloud SQL or standard PostgreSQL
  const dbUrl = new URL(process.env.DATABASE_URL);
  const isCloudSQL = dbUrl.searchParams.has('host');

  if (isCloudSQL) {
    // Cloud SQL Unix socket connection
    const socketPath = dbUrl.searchParams.get('host');
    poolConfig = {
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1), // Remove leading slash
      host: socketPath,
    };
  } else {
    // Standard PostgreSQL connection
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
} else {
  // Fallback to individual environment variables
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'gymnastics_scoring',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  };
}



const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

