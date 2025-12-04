
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  // Use shared pool helper to avoid creating new pools on every request
  // Ensure `mssql` is installed and env vars (DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD)
  // are set in `.env.local`.
  try {
    const { getPool, getPoolFromEnv } = await import('@/lib/db');
    // explicitly target the primary database configured in .env.local
    const primaryDb = process.env.DB_DATABASE || 'GHC_SBO';
    let pool = await getPool(primaryDb);

    let result;
    try {
      result = await pool.request().execute('dbo.CurrentSensus');
    } catch (err: any) {
      // If the stored procedure isn't found in the primary DB, try the alternate DB (DB2/GHS_FwApps)
      const msg = String(err?.message || err);
      if (msg.includes("Could not find stored procedure")) {
        // attempt fallback to DB2 env vars or GHS_FwApps
        if (process.env.DB2_HOST || process.env.DB2_DATABASE) {
          pool = await getPoolFromEnv('DB2', 'GHS_FwApps');
        } else {
          pool = await getPool('GHS_FwApps');
        }
        result = await pool.request().execute('dbo.CurrentSensus');
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
