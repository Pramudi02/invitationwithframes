/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.1.4', '192.168.1.5', '192.168.1.6', '192.168.1.255', 'Kaveeths-MacBook-Air.local'],
  
  // Performance: Enable compression
  compress: true,
  
  images: {
    // Allow all sources for local development
    // In production, lock this down to your CDN domain(s)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Performance: Optimize image formats
    formats: ['image/webp', 'image/avif'],
    // Allow unoptimized local images (useful when deploying static builds)
    unoptimized: false,
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Performance: Enable React Compiler optimizations
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
};

export default nextConfig;
