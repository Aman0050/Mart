import { sendGAEvent } from '@next/third-parties/google';

export const useAnalytics = () => {
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (process.env.NEXT_PUBLIC_GA_ID) {
      sendGAEvent('event', eventName, params || {});
    }
  };

  const trackRegistration = (method: 'email' | 'google', role: string) => {
    trackEvent('sign_up', { method, user_role: role });
  };

  const trackCompanyCreation = (companyName: string, businessType: string) => {
    trackEvent('create_company', { company_name: companyName, business_type: businessType });
  };

  const trackProductUpload = (productName: string, category: string) => {
    trackEvent('upload_product', { product_name: productName, category });
  };

  const trackSearch = (query: string, category?: string) => {
    trackEvent('search', { search_term: query, category });
  };

  const trackEnquiry = (productId: string, companyId: string) => {
    trackEvent('generate_lead', { product_id: productId, target_company: companyId });
  };

  const trackFeedback = (feature: string, rating: number) => {
    trackEvent('submit_feedback', { feature, rating });
  };

  return {
    trackEvent,
    trackRegistration,
    trackCompanyCreation,
    trackProductUpload,
    trackSearch,
    trackEnquiry,
    trackFeedback,
  };
};
