// src/middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Edge-safe middleware.
 * 
 * IMPORTANT: Do NOT import from './auth' here — that file imports mssql,
 * which cannot run in the Edge Runtime and will break the build.
 * 
 * All routing logic lives in the `authorized` callback inside auth.config.ts.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    // Match everything except static assets and files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|otf|eot)).*)',
  ],
};

export default middleware;