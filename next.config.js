/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // Handle punycode deprecation warning
    config.resolve.fallback = {
      ...config.resolve.fallback,
      punycode: false,
    };

    return config;
  },
  // Optimize image domains
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  // Transpile specific modules
  transpilePackages: ['@giphy/js-fetch-api'],
  // Add API route handling
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
        has: [
          {
            type: 'query',
            key: 'auth',
            value: undefined,
          },
        ],
      },
    ]
  },
  // Add necessary headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  }
}

export default nextConfig 