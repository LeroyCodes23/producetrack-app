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
    // If DB2_* env vars exist, use them for the GHS_FwApps connection
    // This allows separate credentials for the GHS database on the same or different server.
    let pool;
    if (process.env.DB2_HOST || process.env.DB2_DATABASE) {
      // use DB2_* env vars (prefix DB2)
      // pass fallbackDatabase so we connect to GHS_FwApps if DB2_DATABASE is missing
      pool = await getPoolFromEnv('DB2', 'GHS_FwApps');
    } else {
      // default: use existing credentials but target the GHS_FwApps database name
      pool = await getPool('GHS_FwApps');
    }
    const result = await pool.request().execute('dbo.Solas_CurrentSeason');
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
