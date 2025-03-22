/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xbwfjonmiddqfrgwdhmi.supabase.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ixunjnqwpjypsajhdcxo.supabase.co',
        pathname: '**',
      }
    ]
  },
  // eslint: {
  //   ignoreDuringBuilds: true
  // },
  // typescript: {
  //   ignoreBuildErrors: true
  // }
  // Remove webpack config as it doesn't work with Turbopack
  
  // Add experimental Turbopack configuration
  experimental: {
    turbo: {
      // Turbopack specific options
      resolveAlias: {
        // Handle punycode deprecation by providing a fallback
        'punycode': 'punycode/'
      }
    }
  },
  // Force HTTPS for Stripe livemode requests
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig 