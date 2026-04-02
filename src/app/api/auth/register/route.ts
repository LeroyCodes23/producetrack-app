import { NextRequest, NextResponse } from 'next/server';
import { executeStoredProcedure } from '@/lib/mssql';
import bcrypt from 'bcrypt';
import sql from 'mssql';
import jwt from 'jsonwebtoken';

// Define the expected return type from the stored procedure
interface ProcedureResult {
  Status?: string;
  Message?: string;
  UserID?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Normalize role: accept both cases but store capitalized in DB
    const normalizedRole = role.toLowerCase() === 'admin' ? 'Admin' : 'Producer';
    
    // Validate role
    if (normalizedRole !== 'Admin' && normalizedRole !== 'Producer') {
      return NextResponse.json(
        { error: 'Role must be either Admin or Producer' }, 
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' }, 
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate username from email
    const username = email.split('@')[0];

    // Call stored procedure with capitalized role for DB
    const result = await executeStoredProcedure('sp_RegisterUser', {
      Email: email,
      Username: username,
      PasswordHash: passwordHash,
      FirstName: firstName,
      LastName: lastName,
      Role: normalizedRole // Send capitalized role to DB
    }) as sql.IProcedureResult<any>;

    const records = result.recordset as ProcedureResult[];

    // Check if the stored procedure returned an error
    if (records && records.length > 0 && records[0].Status === 'ERROR') {
      return NextResponse.json(
        { error: records[0].Message || 'Registration failed' },
        { status: 400 }
      );
    }

    const userId = records && records.length > 0 ? records[0].UserID : null;

    // Generate JWT token with lowercase role for middleware consistency
    const token = jwt.sign(
      {
        userId: userId,
        email: email,
        userType: role.toLowerCase(), // Store lowercase in JWT for middleware
        username: username
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Success response with original role from frontend
    return NextResponse.json({ 
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        userId: userId,
        email: email,
        username: username,
        firstName: firstName,
        lastName: lastName,
        role: role // Return the role as received from frontend
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