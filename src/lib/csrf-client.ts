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
        // Try one more time with a delay
        await new Promise(resolve => setTimeout(resolve, 100));
        csrfToken = getCsrfToken();
        
        if (!csrfToken) {
          console.error('Failed to retrieve CSRF token after second attempt');
        }
      }
    } catch (error) {
      console.error('Failed to generate CSRF token on demand:', error);
    }
  }
  
  // Add CSRF token to headers if available
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    'Content-Type': 'application/json',
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
  try {
    const response = await fetch('/api/csrf/generate', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Ensure cookies are sent/received
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate CSRF token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.token) {
      console.error('No token returned in CSRF generation response');
      return '';
    }
    
    // Verify the cookie was set
    const cookieToken = getCsrfToken();
    if (!cookieToken) {
      console.warn('CSRF token not found in cookies after generation');
      
      // As a fallback, manually set the cookie from the response
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);
      document.cookie = `csrf_token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    }
    
    return data.token;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    throw error;
  }
} 