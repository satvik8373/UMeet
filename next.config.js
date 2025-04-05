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
  
  // Cache build outputs
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Optimize for production
  optimizeFonts: true,
  
  // Configure experimental features
  experimental: {
    // Disable optimizeCss since we're using critters directly
    optimizeCss: false,
    // Enable scroll restoration
    scrollRestoration: true,
    // Improve static generation
    isrMemoryCacheSize: 0,
    // Ensure proper edge runtime handling
    runtime: 'nodejs',
  },
  
  // Configure headers for security
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