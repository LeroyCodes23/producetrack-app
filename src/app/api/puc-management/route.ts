import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeQuery } from '@/lib/mssql';

interface PUCManagementRow {
  PUC: string;
  Producer: string;
  Varieties: string;
  Location: string | null;
  Status: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userType = (session.user as any).userType;
    const clientNumber = (session.user as any).clientNumber;
    const requestedSeason = request.nextUrl.searchParams.get('season');

    if (!userType) {
      return NextResponse.json({ error: 'No role assigned' }, { status: 403 });
    }

    // Determine the client filter based on role
    let clientFilter: string | null = null;

    if (userType === 'Producer') {
      if (!clientNumber) {
        return NextResponse.json(
          { error: 'No client number found' },
          { status: 403 }
        );
      }
      clientFilter = clientNumber;
    } else if (userType !== 'Admin' && userType !== 'Employee') {
      return NextResponse.json({ error: 'No role assigned' }, { status: 403 });
    }

    // Call the TVF with parameterized inputs
    const rows = await executeQuery<PUCManagementRow>(
      `
      SELECT PUC, Producer, Varieties, Location, Status
      FROM dbo.fnPUCManagement(@season, @clientNumber)
      ORDER BY PUC
      `,
      {
        season: requestedSeason || null,
        clientNumber: clientFilter,
      }
    );

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('puc-management API error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
