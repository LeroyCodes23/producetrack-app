// src/auth.ts
import NextAuth from 'next-auth';
import sql from 'mssql';
import { authConfig } from './auth.config';

// ---- DB connection ----
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

/**
 * Look up a user by email in the Users table.
 * If not found, create them with UserType = 'Producer'.
 */
async function findOrCreateUser(email: string, name: string) {
  const pool = await sql.connect(dbConfig);
  try {
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query(`
        SELECT UserID, Email, Username, UserType, FirstName, LastName, IsActive
        FROM Users
        WHERE Email = @Email
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      if (!user.IsActive) {
        throw new Error('Account is deactivated. Please contact support.');
      }
      return {
        id: user.UserID,
        email: user.Email,
        name: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || email,
        userType: user.UserType as 'Admin' | 'Producer',
        firstName: user.FirstName,
        lastName: user.LastName,
        username: user.Username,
      };
    }

    // Auto-register as Producer
    const parts = (name || email).split(' ');
    const firstName = parts[0] || email.split('@')[0];
    const lastName = parts.slice(1).join(' ') || '';
    const username = email.split('@')[0].toLowerCase();

    const insert = await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('Username', sql.NVarChar, username)
      .input('FirstName', sql.NVarChar, firstName)
      .input('LastName', sql.NVarChar, lastName)
      .input('UserType', sql.NVarChar, 'Producer')
      .input('PasswordHash', sql.NVarChar, 'MICROSOFT_AUTH')
      .query(`
        INSERT INTO Users (Email, Username, FirstName, LastName, UserType, PasswordHash, IsActive, CreatedAt)
        OUTPUT INSERTED.UserID
        VALUES (@Email, @Username, @FirstName, @LastName, @UserType, @PasswordHash, 1, GETDATE())
      `);

    return {
      id: insert.recordset[0].UserID,
      email,
      name: name || email,
      userType: 'Producer' as const,
      firstName,
      lastName,
      username,
    };
  } finally {
    await pool.close();
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile }) {
      // On first login, look up or create the user
      if (account && profile && profile.email) {
        try {
          const dbUser = await findOrCreateUser(
            profile.email as string,
            (profile.name as string) || ''
          );
          token.userId = dbUser.id;
          token.userType = dbUser.userType;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.username = dbUser.username;
        } catch (err) {
          console.error('[AUTH] Failed to find/create user:', err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).userType = token.userType;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).username = token.username;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});