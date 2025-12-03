
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  // Use shared pool helper to avoid creating new pools on every request
  // Ensure `mssql` is installed and env vars (DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD)
  // are set in `.env.local`.
  try {
    const { getPool } = await import('@/lib/db');
    const pool = await getPool();
    const result = await pool.request().execute('dbo.CurrentSensus');
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
