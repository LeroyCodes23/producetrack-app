import { ConnectionPool } from 'mssql';

const config = {
  user: process.env.DB_USER || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  server: process.env.DB_SERVER || 'CITRUSTEST',
  database: process.env.DB_NAME || 'ProduceTrack',
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true,
  },
};

let pool: ConnectionPool | null = null;

export async function getDbPool() {
  if (!pool) {
    pool = await new ConnectionPool(config).connect();
  }
  return pool;
}

export async function executeStoredProcedure(procName: string, inputParams: Record<string, any> = {}) {
  const db = await getDbPool();
  const request = db.request();
  Object.entries(inputParams).forEach(([key, value]) => {
    request.input(key, value);
  });
  const result = await request.execute(procName);
  return result;
}
