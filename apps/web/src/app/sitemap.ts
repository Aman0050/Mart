import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://nexmarto.com';

  // Base static routes
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
  ];

  try {
    // Fetch dynamic products and companies (in a real production app, limit/paginate this)
    const [productsRes, companiesRes] = await Promise.all([
      apiClient.get('/products?limit=1000'),
      apiClient.get('/companies?limit=1000')
    ]);

    const products = productsRes.data?.data?.data || [];
    const companies = companiesRes.data?.data?.data || [];

    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const companyRoutes = companies.map((company: any) => ({
      url: `${baseUrl}/company/${company.slug}`,
      lastModified: new Date(company.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...companyRoutes];
  } catch (error) {
    console.error('Failed to generate sitemap', error);
    return staticRoutes;
  }
}
