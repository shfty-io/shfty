import { createServerClient, type CookieOptions } from '@supabase/ssr'

// This version is meant to be used in Server Components and Route Handlers
export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // No-op cookie methods for server-side
        get(name: string) {
          return ''
        },
        set(name: string, value: string, options: CookieOptions) {
          // Server-side cookie setting not available in no-cookies context
        },
        remove(name: string, options: CookieOptions) {
          // Server-side cookie removal not available in no-cookies context
        }
      },
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
}

// Use this version for middleware
export const createMiddlewareClient = (request: Request, response: Response) => {
  // For middleware, we need to handle cookies properly
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Get the cookie from the request
          const cookies = request.headers.get('cookie') || ''
          const cookie = cookies
            .split(';')
            .find(c => c.trim().startsWith(`${name}=`))
          
          if (!cookie) return ''
          const value = cookie.split('=')[1]
          return decodeURIComponent(value)
        },
        set(name: string, value: string, options: CookieOptions) {
          // Format the cookie with all options
          let cookieString = `${name}=${encodeURIComponent(value)}; Path=${options.path || '/'}`
          
          if (options.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`
          }
          
          if (options.domain) {
            cookieString += `; Domain=${options.domain}`
          }
          
          if (options.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`
          }
          
          if (options.secure) {
            cookieString += '; Secure'
          }
          
          if (options.httpOnly) {
            cookieString += '; HttpOnly'
          }
          
          // Set the cookie header
          response.headers.append('Set-Cookie', cookieString)
        },
        remove(name: string, options: CookieOptions) {
          // To remove a cookie, set it with an expiration in the past
          let cookieString = `${name}=; Path=${options.path || '/'}; Max-Age=0`
          
          if (options.domain) {
            cookieString += `; Domain=${options.domain}`
          }
          
          if (options.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`
          }
          
          if (options.secure) {
            cookieString += '; Secure'
          }
          
          if (options.httpOnly) {
            cookieString += '; HttpOnly'
          }
          
          // Set the cookie header to remove the cookie
          response.headers.append('Set-Cookie', cookieString)
        }
      },
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
}

// Use this for client-side components
let clientInstance: ReturnType<typeof createServerClient> | null = null;

export const createClientComponentClient = () => {
  if (typeof window !== 'undefined' && clientInstance) {
    return clientInstance;
  }

  const newClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return ''
          const cookie = document.cookie
            .split(';')
            .find(c => c.trim().startsWith(`${name}=`))
          
          if (!cookie) return ''
          // Need to handle URL encoding in cookie values
          return decodeURIComponent(cookie.split('=')[1])
        },
        set(name: string, value: string, options: CookieOptions) {
          if (typeof document === 'undefined') return
          
          // Construct a proper cookie string with all options
          let cookie = `${name}=${encodeURIComponent(value)}; path=${options.path || '/'}`
          
          if (options.maxAge) {
            cookie += `; max-age=${options.maxAge}`
          }
          
          if (options.domain) {
            cookie += `; domain=${options.domain}`
          }
          
          if (options.sameSite) {
            cookie += `; samesite=${options.sameSite}`
          }
          
          if (options.secure) {
            cookie += '; secure'
          }
          
          if (options.httpOnly) {
            cookie += '; httponly'
          }
          
          document.cookie = cookie
        },
        remove(name: string, options: CookieOptions) {
          if (typeof document === 'undefined') return
          
          // To remove a cookie, set it with expiration in the past
          let cookie = `${name}=; path=${options.path || '/'}; max-age=0`
          
          if (options.domain) {
            cookie += `; domain=${options.domain}`
          }
          
          if (options.sameSite) {
            cookie += `; samesite=${options.sameSite}`
          }
          
          if (options.secure) {
            cookie += '; secure'
          }
          
          document.cookie = cookie
        }
      },
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  if (typeof window !== 'undefined') {
    clientInstance = newClient;
  }

  return newClient;
} 