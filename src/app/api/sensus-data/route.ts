
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  // Use shared pool helper to avoid creating new pools on every request
  // Ensure `mssql` is installed and env vars (DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD)
  // are set in `.env.local`.
  try {
    const { getPool, getPoolFromEnv } = await import('@/lib/db');
    // determine which database to target for the sensus stored procedure
    // Priority:
    // 1. explicit SENSUS_DATABASE env var
    // 2. DB_SENSUS_* env vars (separate credentials)
    // 3. primary DB (DB_DATABASE)
    // 4. fallback to GHS_FwApps
    const explicitSensusDb = process.env.SENSUS_DATABASE;
    const sensusPrefix = (process.env.DB_SENSUS_HOST || process.env.DB_SENSUS_DATABASE) ? 'DB_SENSUS' : undefined;

    let pool;
    if (explicitSensusDb) {
      pool = await getPool(explicitSensusDb);
      console.log('[sensus-api] using explicit SENSUS_DATABASE=', explicitSensusDb);
    } else if (sensusPrefix) {
      const fallback = process.env.DB_SENSUS_DATABASE || process.env.DB_DATABASE;
      pool = await getPoolFromEnv(sensusPrefix, fallback);
      console.log('[sensus-api] using DB_SENSUS_* env vars; fallback database=', fallback);
    } else {
      const primaryDb = process.env.DB_DATABASE || 'GHC_SBO';
      pool = await getPool(primaryDb);
      console.log('[sensus-api] using primary DB_DATABASE=', primaryDb);
    }

    const sensusProc = process.env.SENSUS_PROC || 'dbo.CurrentSensus';
    let result;
    try {
      result = await pool.request().execute(sensusProc);
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes('Could not find stored procedure')) {
        // try DB2 / GHS_FwApps as a final fallback
        try {
          if (process.env.DB2_HOST || process.env.DB2_DATABASE) {
            pool = await getPoolFromEnv('DB2', 'GHS_FwApps');
          } else {
            pool = await getPool('GHS_FwApps');
          }
          result = await pool.request().execute('dbo.CurrentSensus');
        } catch (err2: any) {
          const msg2 = String(err2?.message || err2);
          // include both attempts in the error to help debugging
          throw new Error(`Sensus proc not found. Primary error: ${msg}; Fallback error: ${msg2}`);
        }
      } else {
        throw err;
      }
    }
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('sensus-data API error:', err);
    return new NextResponse(JSON.stringify({ error: err.message || 'An unknown database error occurred' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
