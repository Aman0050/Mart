import { useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { useFeedbackStore } from '@/store/useFeedbackStore';
import { useAuthStore } from '@/store/auth.store';

export function useFeedbackTrigger() {
  const { openFeedback } = useFeedbackStore();
  const { user } = useAuthStore();

  const showFeedbackIfEligible = useCallback(async (
    event: string, 
    questions: string[], 
    role: 'buyer' | 'seller' = 'buyer'
  ) => {
    if (!user) return; // Must be authenticated
    
    try {
      const res = await apiClient.get(`/feedbacks/eligibility?event=${event}`);
      if (res.data.eligible) {
        // Log that we've shown it to prevent spamming within the same session
        await apiClient.post('/feedbacks/shown', { event });
        openFeedback(event, questions, role);
      } else {
        console.log(`[FeedbackTrigger] Not eligible: ${res.data.reason}`);
      }
    } catch (err) {
      console.error('[FeedbackTrigger] Error checking eligibility', err);
    }
  }, [user, openFeedback]);

  return { showFeedbackIfEligible };
}
