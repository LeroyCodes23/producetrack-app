import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeQuery } from '@/lib/mssql';

interface DetailBinRow {
  BINNUMBER: string;
  IN_NUMBER: string | null;
  POOL: string | null;
  STOCK_POOL: string | null;
  SUB_POOL: string | null;
  IN_DATE_TIME: string | null;
  SALE_NUMBER: string | null;
  RUN_NUMBER: string | null;
  OUT_DATE_TIME: string | null;
  DEGREENING_ROOM: string | null;
  GRADE: string | null;
}

interface CountRow {
  total: number;
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

    const { searchParams } = request.nextUrl;
    const orchard = searchParams.get('orchard');
    const packhouse = searchParams.get('packhouse');
    const cultivar = searchParams.get('cultivar');
    const variety = searchParams.get('variety');
    const requestedSeason = searchParams.get('season');
    const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10);
    const requestedPageSize = Number.parseInt(searchParams.get('pageSize') ?? '20', 10);

    if (!orchard || !packhouse || !cultivar || !variety) {
      return NextResponse.json(
        { error: 'orchard, packhouse, cultivar, and variety are required' },
        { status: 400 }
      );
    }

    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
    const pageSize = Number.isFinite(requestedPageSize)
      ? Math.min(100, Math.max(1, requestedPageSize))
      : 20;
    const offset = (page - 1) * pageSize;

    let season: string | undefined = requestedSeason ?? undefined;
    if (!season) {
      const seasonRows = await executeQuery<SeasonRow>(`
        SELECT MAX(SEASON) AS SEASON
        FROM dbo.vBinRegisterDetail
      `);
      season = seasonRows[0]?.SEASON ?? undefined;
    }

    if (!season) {
      return NextResponse.json({ data: [], total: 0, page, pageSize });
    }

    if (userType === 'Producer' && !clientNumber) {
      return NextResponse.json({ error: 'No client number found' }, { status: 403 });
    }

    if (userType !== 'Admin' && userType !== 'Employee' && userType !== 'Producer') {
      return NextResponse.json({ error: 'No role assigned' }, { status: 403 });
    }

    const params: Record<string, string | number> = {
      season,
      orchard,
      packhouse,
      cultivar,
      variety,
      offset,
      pageSize,
    };
    const filters = [
      'SEASON = @season',
      'ORCHARD = @orchard',
      'PACKHOUSE = @packhouse',
      'Cultivar = @cultivar',
      'VARIETY = @variety',
    ];

    if (userType === 'Producer') {
      filters.push('CLIENT = @clientNumber');
      params.clientNumber = clientNumber;
    }

    const whereClause = filters.join('\n          AND ');
    const countRows = await executeQuery<CountRow>(`
      SELECT COUNT(*) AS total
      FROM dbo.vBinRegisterDetail
      WHERE ${whereClause}
    `, params);
    const rows = await executeQuery<DetailBinRow>(`
          SELECT BINNUMBER, IN_NUMBER, POOL, STOCK_POOL, SUB_POOL, IN_DATE_TIME,
            SALE_NUMBER, RUN_NUMBER, OUT_DATE_TIME, DEGREENING_ROOM, GRADE
      FROM dbo.vBinRegisterDetail
      WHERE ${whereClause}
      ORDER BY IN_DATE_TIME DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `, params);

    return NextResponse.json({
      data: rows,
      total: countRows[0]?.total ?? 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('bin-register detail API error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}