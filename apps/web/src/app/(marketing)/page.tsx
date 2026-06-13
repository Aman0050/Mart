import React from 'react';
import { 
  HeroSection, 
  TrustBar, 
  CategoryGrid, 
  FeaturedProducts, 
  VerifiedSuppliers, 
  RfqSection, 
  SuccessStories, 
  AnalyticsSection 
} from '@/components/home';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <CategoryGrid />
      <FeaturedProducts />
      <VerifiedSuppliers />
      <RfqSection />
      <SuccessStories />
      <AnalyticsSection />
    </>
  );
}
