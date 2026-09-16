import { MetadataRoute } from 'next';
import { sampleBatches } from '@/data/companyConfig';

const BASE_URL = 'https://www.topgradericemillers.co.ke';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Core public routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/#products`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/#milling-services`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/#wholesale`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/#about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/#contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Verified batch traceability certificates
  for (const batchKey of Object.keys(sampleBatches)) {
    routes.push({
      url: `${BASE_URL}/trace/${batchKey}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return routes;
}
