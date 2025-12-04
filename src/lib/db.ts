import sql from 'mssql';

const baseConfig: sql.config = {
  server: process.env.DB_HOST || '',
  database: process.env.DB_DATABASE || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || true,
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true' || true,
  },
};

// cache pools by database name to avoid recreating connections
const pools: Record<string, sql.ConnectionPool | undefined> = {};

export async function getPool(database?: string): Promise<sql.ConnectionPool> {
  const dbName = database || baseConfig.database || '';

  if (pools[dbName]) {
    try {
      if (pools[dbName]!.connected) return pools[dbName]!;
      await pools[dbName]!.connect();
      return pools[dbName]!;
    } catch (err) {
      pools[dbName] = undefined;
    }
  }

  const cfg: sql.config = { ...baseConfig, database: dbName };
  const pool = await sql.connect(cfg);
  pools[dbName] = pool;
  return pool;
}

export default sql;

// Create a pool using environment variables with a given prefix.
// Example: prefix = 'DB2' will read DB2_HOST, DB2_DATABASE, DB2_USER, DB2_PASSWORD, DB2_ENCRYPT, DB2_TRUST_CERT
export async function getPoolFromEnv(prefix = 'DB') {
  const env = (key: string) => process.env[`${prefix}_${key}`] ?? process.env[key] ?? '';

  const cfg: sql.config = {
    server: env('HOST'),
    database: env('DATABASE'),
    user: env('USER'),
    password: env('PASSWORD'),
    options: {
      encrypt: (env('ENCRYPT') === 'true') || true,
      trustServerCertificate: (env('TRUST_CERT') === 'true') || true,
    },
  };

  const dbName = cfg.database || '';
  if (!pools[dbName]) {
    const pool = await sql.connect(cfg);
    pools[dbName] = pool;
    return pool;
  }

  try {
    if (pools[dbName]!.connected) return pools[dbName]!;
    await pools[dbName]!.connect();
    return pools[dbName]!;
  } catch (err) {
    const pool = await sql.connect(cfg);
    pools[dbName] = pool;
    return pool;
  }
}
