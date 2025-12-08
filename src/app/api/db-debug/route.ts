import { NextRequest, NextResponse } from 'next/server';

// Temporary diagnostic route to inspect DB connectivity and available procedures.
// Returns an object with attempts for primary/DB_SENSUS/DB2 connection sources.

export async function GET(req: NextRequest) {
  const { getPoolFromEnvOrConn, getPoolFromConnectionString, getPoolFromEnv, getPool } = await import('@/lib/db');

  const results: Record<string, any> = {};

  async function probe(key: string, poolGetter: () => Promise<any>) {
    try {
      const pool = await poolGetter();
      const info: any = { ok: true };
      try {
        const dbNameRes = await pool.request().query('SELECT DB_NAME() AS currentDb, SUSER_SNAME() AS loginName, USER_NAME() AS dbUser');
        info.db = dbNameRes.recordset?.[0] || null;
      } catch (qerr) {
        info.db = { error: String((qerr as any)?.message || qerr) };
      }

      // look for candidate procedures
      try {
        const procNames = ['CurrentSensus', 'Solas_CurrentSeason', 'CurrentSeason', 'Solas'];
        const like = procNames.map(p => `name LIKE '%${p}%'`).join(' OR ');
        const sql = `SELECT SCHEMA_NAME(schema_id) AS schemaName, name FROM sys.procedures WHERE ${like} ORDER BY name`;
        const procs = await pool.request().query(sql);
        info.procedures = procs.recordset || [];
      } catch (perr) {
        info.procedures = { error: String((perr as any)?.message || perr) };
      }

      return info;
    } catch (err) {
      return { ok: false, error: String((err as any)?.message || err) };
    }
  }

  // Primary DB (DB or DB_CONN)
  try {
    results.primary = await probe('primary', async () => getPoolFromEnvOrConn('DB'));
  } catch (e) {
    results.primary = { ok: false, error: String((e as any)?.message || e) };
  }

  // SENSUS specific (DB_SENSUS_* or SENSUS_CONN)
  try {
    results.sensus = await probe('sensus', async () => {
      const conn = process.env.SENSUS_CONN || process.env.DB_SENSUS_CONN || process.env.DB_SENSUS_CONN;
      if (conn) return getPoolFromConnectionString(conn);
      return getPoolFromEnvOrConn('DB_SENSUS');
    });
  } catch (e) {
    results.sensus = { ok: false, error: String((e as any)?.message || e) };
  }

  // DB2 / SOLAS (DB2_CONN)
  try {
    results.db2 = await probe('db2', async () => {
      const conn = process.env.DB2_CONN || process.env.SOLAS_CONN;
      if (conn) return getPoolFromConnectionString(conn);
      return getPoolFromEnvOrConn('DB2');
    });
  } catch (e) {
    results.db2 = { ok: false, error: String((e as any)?.message || e) };
  }

  return NextResponse.json({ time: new Date().toISOString(), results });
}
