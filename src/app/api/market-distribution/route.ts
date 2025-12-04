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
    const candidates = [process.env.SOLAS_PROC, 'dbo.Solas_CurrentSeason', 'Solas_CurrentSeason'].filter(Boolean) as string[];

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

    let result = await tryCandidates(pool);
    if (!result) {
      // if we had DB2 envs, also try explicit fallback DB in case the DB name differs
      if (process.env.DB2_HOST || process.env.DB2_DATABASE) {
        pool = await getPool(fallbackDb);
        console.log('[market-api] trying explicit fallback DB=', fallbackDb);
        result = await tryCandidates(pool);
      }
    }

    // If still not found, try searching sys.procedures for similar names in the connected DB
    if (!result) {
      try {
        console.log('[market-api] searching sys.procedures for Solas/CurrentSeason candidates');
        const searchSql = `SELECT SCHEMA_NAME(schema_id) AS schemaName, name FROM sys.procedures WHERE name LIKE '%Solas%' OR name LIKE '%CurrentSeason%'`;
        const searchRes = await pool.request().query(searchSql);
        const procRows = searchRes.recordset || [];
        if (procRows.length > 0) {
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

      // keys: 'solaskg'  and 'targetcountry'
      const kgRaw = n['solaskg'] ?? n['solaskg'] ?? n['kg'] ?? n['totalkg'];
      const countryRaw = n['targetcountry'] ?? n['targetmarket'] ?? n['targetregion'] ?? 'Unknown';

      const kg = Number(kgRaw) || 0;
      const country = String(countryRaw ?? 'Unknown');

      const prev = totals.get(country) || 0;
      totals.set(country, prev + kg);
      overall += kg;
    }

    const data = Array.from(totals.entries()).map(([market, sumKg]) => {
      const rounded = Math.round(sumKg * 1000) / 1000; // 3 decimals
      const pct = overall > 0 ? Math.round((rounded / overall) * 10000) / 100 : 0; // 2 decimals
      return { market, value: rounded, pct };
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
