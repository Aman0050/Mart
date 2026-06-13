import { create } from 'zustand';

interface FeedbackStore {
  isOpen: boolean;
  event: string | null;
  questions: string[];
  role: 'buyer' | 'seller';
  openFeedback: (event: string, questions: string[], role: 'buyer' | 'seller') => void;
  closeFeedback: () => void;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  isOpen: false,
  event: null,
  questions: [],
  role: 'buyer',
  openFeedback: (event, questions, role) => set({ isOpen: true, event, questions, role }),
  closeFeedback: () => set({ isOpen: false, event: null, questions: [] }),
}));
