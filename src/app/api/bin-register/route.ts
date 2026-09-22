import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeQuery } from '@/lib/mssql';

interface BinRegisterRow {
  Orchard: string;
  PACKHOUSE: string;
  Cultivar: string;
  Variety: string;
  Bins: number;
  BinsKG: number;
  RunDate: string | null;
  RunPackhouse: number | null;
}

interface SeasonRow {
  SEASON: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userType = (session.user as any).userType;
    const clientNumber = (session.user as any).clientNumber;

    if (!userType) {
      return NextResponse.json({ error: 'No role assigned' }, { status: 403 });
    }

    let season = request.nextUrl.searchParams.get('season');
    if (!season) {
      const seasonRows = await executeQuery<SeasonRow>(`
        SELECT MAX(SEASON) AS SEASON
        FROM dbo.vBinRegister
      `);
      season = seasonRows[0]?.SEASON ?? null;
    }

    if (!season) {
      return NextResponse.json({ data: [] });
    }

    let rows: BinRegisterRow[];

    if (userType === 'Admin' || userType === 'Employee') {
      rows = await executeQuery<BinRegisterRow>(`
        SELECT Orchard, PACKHOUSE, Cultivar, Variety, Bins, BinsKG, RunDate, RunPackhouse
        FROM dbo.vBinRegister
        WHERE SEASON = @season
        ORDER BY RunDate DESC, Orchard, PACKHOUSE
      `, { season });
    } else if (userType === 'Producer') {
      if (!clientNumber) {
        return NextResponse.json({ error: 'No client number found' }, { status: 403 });
      }

      rows = await executeQuery<BinRegisterRow>(
        `
        SELECT Orchard, PACKHOUSE, Cultivar, Variety, Bins, BinsKG, RunDate, RunPackhouse
        FROM dbo.vBinRegister
        WHERE CLIENT = @clientNumber
          AND SEASON = @season
        ORDER BY RunDate DESC, Orchard, PACKHOUSE
      `,
        { clientNumber, season }
      );
    } else {
      return NextResponse.json({ error: 'No role assigned' }, { status: 403 });
    }

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('bin-register API error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
