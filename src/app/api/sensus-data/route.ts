
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
      // prefer DB_SENSUS_CONN if present via getPoolFromEnvOrConn
      pool = await (await import('@/lib/db')).getPoolFromEnvOrConn(sensusPrefix, fallback);
      console.log('[sensus-api] using DB_SENSUS_* env vars; fallback database=', fallback);
    } else if (process.env.SENSUS_CONN) {
      // explicit connection string for sensus (least-preferred)
      const connVal = process.env.SENSUS_CONN || '';
      const m = connVal.match(/Database=([^;]+)/i);
      if (m) console.log('[sensus-api] SENSUS_CONN reports Database=', m[1]);
      pool = await (await import('@/lib/db')).getPoolFromConnectionString(connVal);
      console.log('[sensus-api] using SENSUS_CONN connection string');
    } else {
      const primaryDb = process.env.DB_DATABASE || 'GHC_SBO';
      pool = await (await import('@/lib/db')).getPoolFromEnvOrConn('DB', primaryDb);
      console.log('[sensus-api] using primary DB_DATABASE=', primaryDb);
    }

    // Try multiple candidate procedure names (allows slight naming differences)
    const candidates = [
      process.env.SENSUS_PROC,
      'dbo.CurrentSensus',
      'dbo.CurrentSenus',
      'dbo.Current_Sensus',
      'CurrentSensus',
      'CurrentSenus',
    ].filter(Boolean) as string[];

    let result: any = null;
    let triedPrimaryErr: string | null = null;

    const tryCandidates = async (p: any) => {
      for (const procName of candidates) {
        try {
          try {
            const dbNameRes = await p.request().query('SELECT DB_NAME() AS currentDb');
            const currentDb = dbNameRes.recordset?.[0]?.currentDb;
            console.log('[sensus-api] connected DB (server reports):', currentDb);
          } catch (nerr) {
            // ignore
          }

          console.log('[sensus-api] trying proc:', procName, 'on DB:', (p as any).config?.database || 'unknown');
          const r = await p.request().execute(procName);
          console.log('[sensus-api] succeeded with proc:', procName);
          return r;
        } catch (e: any) {
          const m = String(e?.message || e);
          console.warn('[sensus-api] proc attempt failed:', procName, m);
          if (!m.includes('Could not find stored procedure')) {
            // unexpected error (permissions, runtime) — rethrow immediately
            throw e;
          }
          // otherwise continue to next candidate
        }
      }

      // try fully-qualified names via EXEC if candidates failed
      try {
        for (const procName of candidates) {
          try {
            const short = procName.replace(/^dbo\./i, '');
            const fq = `${process.env.SENSUS_DATABASE || (pool as any)?.config?.database || 'GHC_SBO'}.dbo.${short}`;
            console.log('[sensus-api] trying fully-qualified via EXEC:', fq);
            const res = await pool.request().query(`EXEC ${fq}`);
            console.log('[sensus-api] succeeded with fully-qualified proc:', fq);
            return res;
          } catch (e: any) {
            console.warn('[sensus-api] fully-qualified attempt failed:', String(e?.message || e));
            continue;
          }
        }
      } catch (outer) {
        // ignore
      }

      return null;
    };

    try {
      // verify pool is connected to the expected database; if not, attempt to reconnect to expected DB
      const expectedDb = process.env.DB_SENSUS_DATABASE || process.env.SENSUS_DATABASE || process.env.DB_DATABASE || 'GHC_SBO';
      try {
        const dbNameRes = await pool.request().query('SELECT DB_NAME() AS currentDb');
        const currentDb = dbNameRes.recordset?.[0]?.currentDb;
        console.log('[sensus-api] pool initial connected DB:', currentDb, 'expected:', expectedDb);
        if (expectedDb && currentDb && currentDb.toLowerCase() !== expectedDb.toLowerCase()) {
          console.log('[sensus-api] connected DB differs from expected — reconnecting to expected DB:', expectedDb);
          pool = await getPool(expectedDb);
        }
      } catch (dbCheckErr) {
        // ignore and proceed
      }

      result = await tryCandidates(pool);
      if (!result) {
        triedPrimaryErr = 'No candidate proc found in primary DB';
        // try fallback DB2 / GHS_FwApps
        if (process.env.DB2_HOST || process.env.DB2_DATABASE) {
          pool = await getPoolFromEnv('DB2', 'GHS_FwApps');
        } else {
          pool = await getPool('GHS_FwApps');
        }
        result = await tryCandidates(pool);
        if (!result) {
          throw new Error(`Sensus proc not found. Primary: ${triedPrimaryErr}; Fallback: no candidate proc found`);
        }
      }
    } catch (err: any) {
      throw err;
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
