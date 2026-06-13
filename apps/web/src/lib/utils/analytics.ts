/**
 * Nexmarto Global Analytics Utility
 * Wrapper for GA4 and Custom Event Tracking
 */

// Define standard GA4 and Custom Events
export type AnalyticsEventName = 
  | 'sign_up' 
  | 'login' 
  | 'company_created' 
  | 'product_created' 
  | 'search' 
  | 'view_item' 
  | 'generate_lead' // Enquiry Submission
  | 'rfq_submitted'
  | 'lead_response' // Quick Reply or Message
  | 'purchase'; // Subscription Purchase

export interface AnalyticsEventParams {
  [key: string]: string | number | boolean | undefined;
  method?: string;
  search_term?: string;
  item_id?: string;
  item_name?: string;
  item_category?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  lead_source?: string;
  lead_budget?: number;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

/**
 * Pushes an event to the dataLayer / gtag
 */
export const trackEvent = (eventName: AnalyticsEventName, params?: AnalyticsEventParams) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
      
      // Optional console log for development debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] Tracked Event: ${eventName}`, params);
      }
    }
  } catch (error) {
    console.error(`[Analytics] Failed to track event ${eventName}`, error);
  }
};

/**
 * Track Page Views (Usually handled automatically by GA4 Next.js integration, 
 * but exposed here for manual virtual page views if needed)
 */
export const trackPageView = (url: string) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_path: url,
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to track page view', error);
  }
};
