import { NextRequest, NextResponse } from 'next/server';

// server-side API that calls dbo.Solas_CurrentSeason in the GHS_FwApps database
// and aggregates Solas Kg per Target Country.
import { getPool, getPoolFromEnv } from '@/lib/db';

function normalizeRowKeys(row: Record<string, any>) {
  const norm: Record<string, any> = {};
  for (const k of Object.keys(row)) {
    const key = k.replace(/\s+/g, '').toLowerCase();
    norm[key] = row[k];
  }
  return norm;
}

export async function GET(req: NextRequest) {
  try {
    // Choose DB/pool for GHS Solas proc. Prefer DB2_* env vars (separate credentials).
    const fallbackDb = 'GHS_FwApps';
    let pool;
    if (process.env.SOLAS_CONN) {
      pool = await (await import('@/lib/db')).getPoolFromConnectionString(process.env.SOLAS_CONN);
      console.log('[market-api] using SOLAS_CONN connection string');
    } else if (process.env.DB2_CONN) {
      pool = await (await import('@/lib/db')).getPoolFromConnectionString(process.env.DB2_CONN);
      console.log('[market-api] using DB2_CONN connection string');
    } else if (process.env.DB2_HOST || process.env.DB2_DATABASE) {
      pool = await (await import('@/lib/db')).getPoolFromEnvOrConn('DB2', fallbackDb);
      console.log('[market-api] using DB2_* env vars; target DB=', process.env.DB2_DATABASE || fallbackDb);
    } else {
      pool = await (await import('@/lib/db')).getPoolFromEnvOrConn('DB', fallbackDb);
      console.log('[market-api] using primary credentials; target DB=', fallbackDb);
    }

    // Try multiple candidate procedure names to tolerate naming differences
    const envProc = process.env.SOLAS_PROC;
    const candidates = [envProc, 'dbo.Solas_CurrentSeason', 'Solas_CurrentSeason'].filter(Boolean) as string[];

    // allow overriding the target DB for fully-qualified attempts
    const targetDb = process.env.SOLAS_DB || fallbackDb;

    const tryCandidates = async (p: any) => {
      for (const procName of candidates) {
        try {
          console.log('[market-api] trying proc:', procName);
          const res = await p.request().execute(procName);
          console.log('[market-api] succeeded with proc:', procName);
          return res;
        } catch (e: any) {
          const m = String(e?.message || e);
          if (!m.includes('Could not find stored procedure')) {
            // unexpected error - rethrow
            throw e;
          }
          // otherwise continue to next candidate
        }
      }
      return null;
    };

    // Additionally try fully-qualified proc names (database.schema.proc) via EXEC query
    const tryFullyQualified = async (p: any) => {
      for (const procName of candidates) {
        try {
          // strip any leading schema if present
          const short = procName.replace(/^dbo\./i, '');
          const fq = `${targetDb}.dbo.${short}`;
          console.log('[market-api] trying fully-qualified proc via EXEC:', fq);
          const res = await p.request().query(`EXEC ${fq}`);
          console.log('[market-api] succeeded with fully-qualified proc:', fq);
          return res;
        } catch (e: any) {
          // continue on not-found; rethrow other errors
          const m = String(e?.message || e);
          if (!m.toLowerCase().includes('could not find') && !m.toLowerCase().includes('object') && !m.toLowerCase().includes('does not')) {
            throw e;
          }
        }
      }
      return null;
    };

    let result = await tryCandidates(pool);
    if (!result) {
      // try fully-qualified on the same pool (EXEC database.schema.proc)
      result = await tryFullyQualified(pool);
    }
    if (!result) {
      // if we had DB2 envs, also try explicit fallback DB in case the DB name differs
      if (process.env.DB2_HOST || process.env.DB2_DATABASE) {
        pool = await getPool(fallbackDb);
        console.log('[market-api] trying explicit fallback DB=', fallbackDb);
        result = await tryCandidates(pool);
        if (!result) {
          result = await tryFullyQualified(pool);
        }
      }
    }

    // If still not found, try searching sys.procedures for similar names in the connected DB
    if (!result) {
      try {
        console.log('[market-api] searching sys.procedures for Solas/CurrentSeason candidates');
        // log current DB for diagnostics
        try {
          const dbNameRes = await pool.request().query('SELECT DB_NAME() AS currentDb');
          const currentDb = dbNameRes.recordset?.[0]?.currentDb;
          console.log('[market-api] connected DB (server reports):', currentDb);
        } catch (nerr) {
          console.warn('[market-api] DB_NAME() query failed:', String((nerr as any)?.message || nerr));
        }

        const searchSql = `SELECT SCHEMA_NAME(schema_id) AS schemaName, name FROM sys.procedures WHERE name LIKE '%Solas%' OR name LIKE '%CurrentSeason%'`;
        const searchRes = await pool.request().query(searchSql);
        const procRows = searchRes.recordset || [];
        console.log('[market-api] sys.procedures search returned', procRows.length, 'rows');
        if (procRows.length > 0) {
          console.log('[market-api] procedures found:', JSON.stringify(procRows, null, 2));
          const first = procRows[0];
          const qualified = `${first.schemaName}.${first.name}`;
          console.log('[market-api] found candidate proc from sys.procedures:', qualified);
          result = await pool.request().execute(qualified);
        }
      } catch (searchErr: any) {
        console.warn('[market-api] sys.procedures search failed:', String(searchErr?.message || searchErr));
      }
    }

    if (!result) {
      throw new Error('Solas proc not found in any candidate names or databases');
    }

    const rows = result.recordset || [];

    const totals = new Map<string, number>();
    let overall = 0;

    for (const r of rows) {
      const n = normalizeRowKeys(r);

      // keys: 'solaskg' and 'targetregion'
      const kgRaw = n['solaskg'] ?? n['kg'] ?? n['totalkg'];
      const regionRaw = n['targetregion'] ?? 'Unknown';

      const kg = Number(kgRaw) || 0;
      const region = String(regionRaw ?? 'Unknown');

      const prev = totals.get(region) || 0;
      totals.set(region, prev + kg);
      overall += kg;
    }

    const data = Array.from(totals.entries()).map(([region, sumKg]) => {
      const rounded = Math.round(sumKg * 1000) / 1000; // 3 decimals
      const pct = overall > 0 ? Math.round((rounded / overall) * 10000) / 100 : 0; // 2 decimals
      return { region, value: rounded, pct };
    });

    // sort descending by value so chart shows largest first
    data.sort((a, b) => b.value - a.value);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('market-distribution API error:', err);
    return new NextResponse(JSON.stringify({ error: err.message || 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
