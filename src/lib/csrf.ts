import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Generate a CSRF token
export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}

// Set CSRF token in a cookie
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  cookieStore.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return token;
}

// Validate CSRF token
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('csrf_token')?.value;
  const headerToken = request.headers.get('x-csrf-token');
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return cookieToken === headerToken;
}

// CSRF protection middleware for API routes
export function csrfProtection<T extends unknown[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T) => {
    // Skip CSRF check for GET requests as they should be idempotent
    if (request.method === 'GET') {
      return handler(request, ...args);
    }
    
    // For all other methods, validate CSRF token
    if (!(await validateCsrfToken(request))) {
      return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return handler(request, ...args);
  };
} 