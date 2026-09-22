import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeQuery } from '@/lib/mssql';

interface SeasonRow {
  SEASON: string;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await executeQuery<SeasonRow>(`
      SELECT DISTINCT SEASON
      FROM dbo.vBinRegister
      ORDER BY SEASON DESC
    `);

    return NextResponse.json({ data: rows.map((row) => row.SEASON) });
  } catch (error) {
    console.error('seasons API error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}