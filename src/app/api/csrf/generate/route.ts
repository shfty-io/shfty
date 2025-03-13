import { setCsrfCookie } from '@/lib/csrf';
import { NextResponse } from 'next/server';

interface CsrfResponse {
  success: boolean;
  token?: string;
}

export async function POST() {
  try {
    console.log('Generating new CSRF token');
    
    // Generate a new CSRF token and set it in a cookie
    const token = await setCsrfCookie();
    
    // Return the token in development mode for easier debugging
    const response: CsrfResponse = { success: true };
    if (process.env.NODE_ENV !== 'production') {
      response.token = token;
      console.log('CSRF token generated (development):', token.substring(0, 8) + '...');
    } else {
      console.log('CSRF token generated (production)');
    }
    
    // Create response with proper headers
    const nextResponse = NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    return nextResponse;
  } catch (error) {
    console.error('Failed to generate CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for better compatibility
export async function GET() {
  return POST();
} 