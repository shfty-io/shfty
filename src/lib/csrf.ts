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
  
  // Set the cookie with appropriate options
  cookieStore.set('csrf_token', token, {
    httpOnly: false, // Allow JavaScript access in client
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // More permissive to work across environments
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
  
  if (!cookieToken) {
    console.warn('CSRF validation failed: No token in cookies');
    return false;
  }
  
  if (!headerToken) {
    console.warn('CSRF validation failed: No token in request headers');
    return false;
  }
  
  const isValid = cookieToken === headerToken;
  if (!isValid) {
    console.warn('CSRF validation failed: Token mismatch', {
      cookieTokenLength: cookieToken.length,
      headerTokenLength: headerToken.length,
      cookieTokenPrefix: cookieToken.substring(0, 8),
      headerTokenPrefix: headerToken.substring(0, 8),
    });
  }
  
  return isValid;
}

// CSRF protection middleware for API routes
export function csrfProtection<T>(
  handler: (req: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T) => {
    // Skip CSRF check for GET requests as they should be idempotent
    if (request.method === 'GET') {
      return handler(request, context);
    }
    
    // For all other methods, validate CSRF token
    if (!(await validateCsrfToken(request))) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid CSRF token',
        message: 'Security validation failed. Please refresh the page and try again.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return handler(request, context);
  };
} 