import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/mssql';
import bcrypt from 'bcrypt';
import sql from 'mssql';  // Import sql for types

// Define the expected return type from the stored procedure
interface ProcedureResult {
  Status?: string;
  Message?: string;
  UserID?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await req.json();
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'admin' && role !== 'producer') {
      return NextResponse.json(
        { error: 'Role must be either Admin or Producer' }, 
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Call stored procedure - remove the generic type parameter
    const result = await executeStoredProcedure('sp_RegisterUser', {
      Email: email,
      PasswordHash: passwordHash,
      FirstName: firstName,
      LastName: lastName,
      Role: role
    }) as sql.IProcedureResult<any>;  // Cast the result

    // Access the recordset which contains the actual data
    const records = result.recordset as ProcedureResult[];

    // Check if the stored procedure returned an error
    if (records && records.length > 0 && records[0].Status === 'ERROR') {
      return NextResponse.json(
        { error: records[0].Message || 'Registration failed' },
        { status: 400 }
      );
    }

    // Success response
    return NextResponse.json({ 
      success: true,
      message: 'User registered successfully',
      user: {
        userId: records && records.length > 0 ? records[0].UserID : null,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: role
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}