import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'localhost',
      'backend',
      'lms-backend',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
        pathname: '/api/v1/files/serve/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'lms-backend',
        port: '8081',
        pathname: '/api/v1/files/serve/**',
      },
      {
        protocol: 'http',
        hostname: '103.70.13.93',
        port: '8081',
        pathname: '/api/v1/files/serve/**',
      },
      {
        protocol: 'http',
        hostname: '103.70.13.93',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    unoptimized: true,
  },

  output: 'standalone',
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  experimental: {
    // Synchronous lab grading may include cold image startup and compilation.
    proxyTimeout: 600000,
    optimizePackageImports: [
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'react-icons',
    ],
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://auth-service:8080';
    const lmsUrl = process.env.LMS_API_URL || 'http://lms-service:8081';
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const labUrl = process.env.LAB_API_URL || 'http://localhost:8082';
    const chatUrl = process.env.CHAT_API_URL || 'http://localhost:8083';

    // Traefik forwards /files to Next.js so the BFF can resolve the browser's
    // NextAuth session before requesting protected LMS files. Keep the same
    // route for internal requests and standalone deployments.
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/workspace-ws',
          destination: `${process.env.WORKSPACE_SERVICE_URL || 'http://workspace-service:8088'}/workspace-ws`,
        },
        {
          source: '/files/:path*',
          destination: "/api/files/:path*",
        },
        {
          source: '/uploads/:path*',
          destination: `${backendUrl}/uploads/:path*`,
        },
      ];
    }

    const isRemote = (url: string) => url.startsWith('http://bdc.hpcc.vn') || url.startsWith('https://bdc.hpcc.vn');

    const backendDest = isRemote(backendUrl) ? `${backendUrl}/apiv1/:path*` : `${backendUrl}/:path*`;
    const lmsDest = isRemote(lmsUrl) ? `${lmsUrl}/lmsapiv1/:path*` : `${lmsUrl}/api/v1/:path*`;
    const labDest = isRemote(labUrl) ? `${labUrl}/labapiv1/:path*` : `${labUrl}/api/v1/:path*`;
    const chatDest = isRemote(chatUrl) ? `${chatUrl}/chatapiv1/:path*` : `${chatUrl}/api/v1/:path*`;

    return [
      {
        source: '/workspace-ws',
        destination: `${(process.env.WORKSPACE_SERVICE_URL || 'http://localhost:8088')}/workspace-ws`,
      },
      {
        source: '/apiv1/:path*',
        destination: backendDest, 
      },
      {
        source: '/labapiv1/:path*',
        destination: labDest, 
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`, 
      },
      {
        source: '/lmsapiv1/:path*',
        destination: lmsDest, 
      },
      {
        source: '/chatapiv1/:path*',
        destination: chatDest,
      },
      {
        source: '/lmsapidocs/:path*',
        destination: `${lmsUrl}/:path*`, 
      },
      {
        source: '/ai/docs',
        destination: `${aiUrl}/docs`, 
      },
      {
        source: '/openapi.json',
        destination: `${aiUrl}/openapi.json`, 
      },
      {
        source: '/ai/redoc',
        destination: `${aiUrl}/redoc`, 
      },
      {
        source: '/files/:path*',
        destination: '/api/files/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/files/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
