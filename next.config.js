/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xbwfjonmiddqfrgwdhmi.supabase.co', 'avatars.githubusercontent.com']
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
  }
}

module.exports = nextConfig 