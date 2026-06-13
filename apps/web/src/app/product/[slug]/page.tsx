import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

// Using fetch to backend API directly from Server Component
async function getProduct(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products/${slug}`, {
      next: { revalidate: 3600 } // ISR: Revalidate every hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Failed to fetch product for SEO metadata", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return { title: 'Product Not Found | Nexmarto' };
  }

  const title = product.seoTitle || `${product.title} | ${product.company?.companyName || 'Nexmarto'}`;
  const description = product.seoDescription || product.shortDescription || `Buy ${product.title} wholesale on Nexmarto.`;
  const image = product.images?.[0]?.imageUrl || 'https://nexmarto.com/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const initialProduct = await getProduct(resolvedParams.slug);

  return <ProductDetailClient initialProduct={initialProduct} slug={resolvedParams.slug} />;
}
