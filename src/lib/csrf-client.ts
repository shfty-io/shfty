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
      console.log('No CSRF token found, generating now');
      await generateCsrfToken();
      // Get the token again after generation
      csrfToken = getCsrfToken();
      
      // If still no token, we have a problem
      if (!csrfToken) {
        console.error('CSRF token generation succeeded but token not found in cookies');
      } else {
        console.log('CSRF token successfully generated');
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
export const generateCsrfToken = async (): Promise<boolean> => {
  try {
    console.log('Generating CSRF token');
    const response = await fetch('/api/csrf/generate', { 
      method: 'POST',
      credentials: 'include' 
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('CSRF token generation failed:', errorData.error || 'Unknown error');
      return false;
    }
    
    // Wait a short time to ensure cookie is set in the browser
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify that the token was actually set
    const token = getCsrfToken();
    if (!token) {
      console.error('CSRF token was not set in cookies after generation');
      return false;
    }
    
    console.log('CSRF token generated successfully');
    return true;
  } catch (error) {
    console.error('Failed to generate CSRF token:', error);
    return false;
  }
}; 