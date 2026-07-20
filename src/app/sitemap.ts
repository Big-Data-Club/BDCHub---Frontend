import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bdc.hpcc.vn';

  // Base routes
  const routes = [
    '',
    '/hackathon2025',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Survey routes from JSON data files
  try {
    const formsDirectory = path.join(process.cwd(), 'src/data/forms');
    if (fs.existsSync(formsDirectory)) {
      const filenames = fs.readdirSync(formsDirectory);
      const surveyRoutes = filenames
        .filter((file) => file.endsWith('.json') && file !== 'formData.json')
        .map((file) => {
          const surveyName = file.replace('.json', '');
          return {
            url: `${baseUrl}/forms/survey/${surveyName}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
          };
        });
      return [...routes, ...surveyRoutes];
    }
  } catch (error) {
    console.error('Error reading forms directory for sitemap:', error);
  }

  return routes;
}
