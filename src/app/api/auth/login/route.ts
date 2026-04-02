import { NextResponse } from 'next/server';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const dbConfig = {
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'ProduceTrack',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    },
};

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('[LOGIN] FATAL ERROR: JWT_SECRET not found in environment variables!');
    throw new Error('JWT_SECRET not configured. Please check your .env.local file.');
}

console.log('[LOGIN] JWT_SECRET loaded (length:', JWT_SECRET.length, ')');

const JWT_EXPIRES_IN = '7d';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        console.log('[LOGIN] Incoming request:', { email });

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const pool = await sql.connect(dbConfig);
        
        const result = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query(`
                SELECT 
                    UserID, 
                    Email, 
                    Username, 
                    PasswordHash, 
                    UserType, 
                    FirstName, 
                    LastName,
                    IsActive,
                    IsEmailVerified,
                    FailedLoginAttempts,
                    LockedUntil
                FROM Users 
                WHERE Email = @Email
            `);
        await pool.close();

        if (result.recordset.length === 0) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const user = result.recordset[0];

        if (user.LockedUntil && new Date() < new Date(user.LockedUntil)) {
            return NextResponse.json(
                { error: 'Account is temporarily locked. Please try again later.' },
                { status: 401 }
            );
        }

        if (!user.IsActive) {
            return NextResponse.json(
                { error: 'Account is deactivated. Please contact support.' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
        
        if (!isPasswordValid) {
            await pool.connect();
            await pool.request()
                .input('UserID', sql.Int, user.UserID)
                .query(`
                    UPDATE Users 
                    SET FailedLoginAttempts = FailedLoginAttempts + 1,
                        LockedUntil = CASE 
                            WHEN FailedLoginAttempts + 1 >= 5 THEN DATEADD(minute, 15, GETDATE())
                            ELSE LockedUntil
                        END
                    WHERE UserID = @UserID
                `);
            await pool.close();
            
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        await pool.connect();
        await pool.request()
            .input('UserID', sql.Int, user.UserID)
            .query(`
                UPDATE Users 
                SET FailedLoginAttempts = 0,
                    LockedUntil = NULL,
                    LastLoginAt = GETDATE()
                WHERE UserID = @UserID
            `);
        await pool.close();

        // Generate JWT token - NO algorithm in sign options
        const token = jwt.sign(
            {
                userId: user.UserID,
                email: user.Email,
                userType: user.UserType,
                username: user.Username
            },
            JWT_SECRET as string,
            { expiresIn: JWT_EXPIRES_IN }
        );

        console.log('[LOGIN] Token generated for:', user.Email);
        console.log('[LOGIN] Token length:', token.length);
        console.log('[LOGIN] Token first 50 chars:', token.substring(0, 50));

        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: user.UserID,
                email: user.Email,
                username: user.Username,
                userType: user.UserType,
                firstName: user.FirstName,
                lastName: user.LastName
            }
        });

        const cookieValue = `token=${token}; Max-Age=${7 * 24 * 60 * 60}; Path=/; SameSite=Lax`;
        response.headers.set('Set-Cookie', cookieValue);
        console.log('[LOGIN] Cookie header set');

        return response;

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error.message || 'Unknown') },
            { status: 500 }
        );
    }
}