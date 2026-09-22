import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeQuery } from '@/lib/mssql';

interface BinDetailFullRow {
  BINNUMBER: string;
  SEASON: string | null;
  CLIENT: string | null;
  ORCHARD: string | null;
  PACKHOUSE: string | null;
  POOL: string | null;
  STOCK_POOL: string | null;
  SUB_POOL: string | null;
  COMMODITY: string | null;
  Cultivar: string | null;
  VARIETY: string | null;
  IN_TYPE: string | null;
  IN_NUMBER: string | null;
  IN_DATE_TIME: string | null;
  IN_WEIGHT: number | null;
  SALE_NUMBER: string | null;
  RUN_NUMBER: string | null;
  OUT_DATE_TIME: string | null;
  OUT_WEIGHT: number | null;
  DEGREENING_ROOM: string | null;
  DEGREEN_START: string | null;
  DEGREEN_DURATION: string | null;
  GRADE: string | null;
  TRANS_USER: string | null;
  TRANS_DATE_TIME: string | null;
  PROCESSED: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ binNumber: string }> }
) {
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

    if (userType === 'Producer' && !clientNumber) {
      return NextResponse.json({ error: 'No client number found' }, { status: 403 });
    }

    if (userType !== 'Admin' && userType !== 'Employee' && userType !== 'Producer') {
      return NextResponse.json({ error: 'No role assigned' }, { status: 403 });
    }

    const { binNumber } = await params;

    const queryParams: Record<string, string> = { binNumber };
    const filters = ['BINNUMBER = @binNumber'];

    if (userType === 'Producer') {
      filters.push('CLIENT = @clientNumber');
      queryParams.clientNumber = clientNumber;
    }

    const whereClause = filters.join('\n        AND ');
    const rows = await executeQuery<BinDetailFullRow>(`
      SELECT BINNUMBER, SEASON, CLIENT, ORCHARD, PACKHOUSE, POOL, STOCK_POOL,
             SUB_POOL, COMMODITY, Cultivar, VARIETY, IN_TYPE, IN_NUMBER,
             IN_DATE_TIME, IN_WEIGHT, SALE_NUMBER, RUN_NUMBER, OUT_DATE_TIME,
             OUT_WEIGHT, DEGREENING_ROOM, DEGREEN_START, DEGREEN_DURATION,
             GRADE, TRANS_USER, TRANS_DATE_TIME, PROCESSED
      FROM dbo.vBinRegisterDetail
      WHERE ${whereClause}
    `, queryParams);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('bin-register single bin API error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
