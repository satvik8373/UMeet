/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Minify HTML and optimize CSS
  swcMinify: true,
  
  // Enable React strict mode for better development
  reactStrictMode: true,
  
  // Optimize page loading
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Cache outputs
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Optimize for production
  optimizeFonts: true,
  
  // Configure experimental features
  experimental: {
    // Enable modern optimizations
    optimizePackageImports: ['@headlessui/react', 'react-icons'],
    // Enable scroll restoration
    scrollRestoration: true,
  },

  // Configure webpack for CSS optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize CSS only in production
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
    }
    return config;
  },
  
  // Configure headers for security and font loading
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Link',
            value: '<https://fonts.googleapis.com>; rel=preconnect; crossorigin=anonymous'
          }
        ]
      }
    ]
  },

  // Handle static generation errors
  onError(err) {
    console.error('Next.js build error:', err);
    // Don't fail the build for static generation errors
    return true;
  }
}

export default nextConfig 