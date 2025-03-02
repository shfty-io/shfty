import { setCsrfCookie } from '@/lib/csrf';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Generate a new CSRF token and set it in a cookie
    const token = await setCsrfCookie();
    
    // Return the token in development mode for easier debugging
    const response: any = { success: true };
    if (process.env.NODE_ENV !== 'production') {
      response.token = token;
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