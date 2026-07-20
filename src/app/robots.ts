import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/hackathon2025', '/forms/survey/*'],
      disallow: [
        '/chat/',
        '/settings/',
        '/lms/',
        '/api/',
        '/_next/',
        '/static/',
      ],
    },
    sitemap: 'https://bdc.hpcc.vn/sitemap.xml',
  };
}
