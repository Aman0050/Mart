import { Metadata } from 'next';
import CompanyProfileClient from './CompanyProfileClient';

async function getCompany(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/companies/${slug}`, {
      next: { revalidate: 3600 } // ISR
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const company = await getCompany(resolvedParams.slug);

  if (!company) {
    return { title: 'Supplier Not Found | Nexmarto' };
  }

  const title = company.seoTitle || `${company.companyName} | Verified Supplier on Nexmarto`;
  const description = company.seoDescription || company.description?.substring(0, 160) || `Wholesale products from ${company.companyName} on Nexmarto.`;
  const image = company.logoUrl || 'https://nexmarto.com/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    }
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const initialCompany = await getCompany(resolvedParams.slug);

  return <CompanyProfileClient initialCompany={initialCompany} slug={resolvedParams.slug} />;
}
