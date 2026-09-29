import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeQuery } from '@/lib/mssql';

interface SeasonRow {
  Season: string;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await executeQuery<SeasonRow>(`
      SELECT DISTINCT U_Season AS Season
      FROM GHC_SBO.dbo.[@BK_ORCHARDS]
      WHERE U_Season IS NOT NULL
        AND U_Season != ''
        AND U_Season <= CAST(YEAR(GETDATE()) AS NVARCHAR(10))
      ORDER BY U_Season DESC
    `);

    return NextResponse.json({ data: rows.map((row) => row.Season) });
  } catch (error) {
    console.error('seasons API error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}