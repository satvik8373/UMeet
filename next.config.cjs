/** @type {import('next').NextConfig} */
module.exports = {
  // Enable static optimization
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
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
  
  // Enable progressive web app features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
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

  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    return config;
  },
} 