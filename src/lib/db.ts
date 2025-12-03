import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_HOST || '',
  database: process.env.DB_DATABASE || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || true,
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true' || true,
  },
};

let pool: sql.ConnectionPool | undefined;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool) {
    try {
      if (pool.connected) return pool;
      // try reconnecting if previously disconnected
      await pool.connect();
      return pool;
    } catch (err) {
      pool = undefined;
    }
  }

  // create a new pool and connect
  pool = await sql.connect(config);
  return pool;
}

export default sql;
