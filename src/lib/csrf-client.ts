'use client';

// Get the CSRF token from cookies
export const getCsrfToken = (): string | undefined => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return value;
    }
  }
  return undefined;
};

// Fetch options with CSRF token for POST/PUT/DELETE requests
export const fetchWithCsrf = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  let csrfToken = getCsrfToken();
  
  // If no token is found, try to generate one
  if (!csrfToken) {
    try {
      await generateCsrfToken();
      // Get the token again after generation
      csrfToken = getCsrfToken();
      
      // If still no token, we have a problem
      if (!csrfToken) {
        console.error('CSRF token generation succeeded but token not found in cookies');
      }
    } catch (error) {
      console.error('Failed to generate CSRF token on demand:', error);
    }
  }
  
  // Add CSRF token to headers if available
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };
  
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }
  
  // For GET requests, we can proceed even without a CSRF token
  // For other methods, log a warning if no token is available
  if (!csrfToken && options.method && options.method !== 'GET') {
    console.warn('Making a non-GET request without CSRF token');
  }
  
  return fetch(url, {
    ...options,
    credentials: 'include', // Always include credentials to ensure cookies are sent
    headers,
  });
};

// Generate a new CSRF token - this will call the server to set a cookie
export async function generateCsrfToken(): Promise<string> {
  // Check if we already have a token in localStorage
  const existingToken = localStorage.getItem('csrf_token');
  
  if (existingToken) {
    // Check if token is still valid (not expired)
    const tokenData = JSON.parse(existingToken);
    const expiryTime = new Date(tokenData.expiry);
    
    if (expiryTime > new Date()) {
      return tokenData.token;
    }
  }
  
  // If no token or expired, generate a new one
  try {
    console.log('Generating CSRF token');
    const response = await fetch('/api/csrf/generate', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate CSRF token');
    }
    
    const data = await response.json();
    
    // Store token in localStorage with expiry (1 hour)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    
    localStorage.setItem('csrf_token', JSON.stringify({
      token: data.token,
      expiry: expiry.toISOString(),
    }));
    
    console.log('CSRF token generated successfully');
    return data.token;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    throw error;
  }
} 