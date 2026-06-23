import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'api.dicebear.com', 
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
    unoptimized: process.env.NODE_ENV === 'development',
  },

  output: 'standalone',
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  experimental: {
    proxyTimeout: 120000,
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

  webpack: (config, { isServer }) => {
    // Optimize for production
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const lmsUrl = process.env.LMS_API_URL || 'http://localhost:8081';
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const labUrl = process.env.LAB_API_URL || 'http://localhost:8082';
    const chatUrl = process.env.CHAT_API_URL || 'http://localhost:8083';
    const latexUrl = process.env.LATEX_API_URL || 'http://localhost:8084';

    // In production, Traefik handles all API routing at the edge.
    // However, the Next.js internal image optimizer requests relative paths (like /files/... or /uploads/...)
    // from itself (localhost). We need rewrites in production so that Next.js can internally resolve
    // these requests by fetching from the backend services directly.
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/files/:path*',
          destination: `${lmsUrl}/api/v1/files/serve/:path*`,
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
    const latexDest = isRemote(latexUrl) ? `${latexUrl}/latexapiv1/:path*` : `${latexUrl}/api/v1/:path*`;

    return [
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
        source: '/latexapiv1/:path*',
        destination: latexDest,
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
            value: 'public, max-age=31536000, immutable',
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