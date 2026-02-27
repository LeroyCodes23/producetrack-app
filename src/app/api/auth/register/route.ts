import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/mssql';

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();
  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    const result = await executeStoredProcedure('sp_RegisterUser', {
      Email: email,
      Password: password,
      Role: role,
    });
    // Check result for success/failure
    return NextResponse.json({ message: 'User registered successfully' });
  } catch (error) {
  if (error instanceof Error) {
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Registration failed', details: 'Unknown error' },
    { status: 500 }
  );
}
}
