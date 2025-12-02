
import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  server: process.env.DB_HOST || '',
  database: process.env.DB_DATABASE || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: true, // Use this if you're on Azure
    trustServerCertificate: true // Change to true for local dev / self-signed certs
  }
};

export async function GET(req: NextRequest) {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().execute('dbo.CurrentSensus');
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error(err);
    return new NextResponse(JSON.stringify({ error: err.message || 'An unknown database error occurred' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
