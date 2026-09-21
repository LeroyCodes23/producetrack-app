import sql from 'mssql';

const server = process.env.DB_HOST;
if (!server) {
  throw new Error('DB_HOST is not set. Check your .env.local');
}

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server,
  database: process.env.DB_DATABASE || 'ProduceTrack',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  }
};

let pool: sql.ConnectionPool | null = null;

async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('Connected to database');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
  return pool;
}

export async function executeStoredProcedure(
  procedureName: string, 
  params: Record<string, any> = {}
): Promise<sql.IProcedureResult<any>> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.execute(procedureName);
    return result;  // Return the full IProcedureResult
  } catch (error) {
    console.error(`Error executing ${procedureName}:`, error);
    throw error;
  }
}

export async function executeQuery<T = any>(
  query: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  try {
    const pool = await getConnection();
    const request = pool.request();

    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);
    return result.recordset as T[];
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}