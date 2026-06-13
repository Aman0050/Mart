"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@nexmarto/ui';
import { Button } from '@nexmarto/ui';
import { Label } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';

import { useFeedbackStore } from '@/store/useFeedbackStore';

export function FeedbackModal() {
  const { isOpen, closeFeedback, event, questions, role } = useFeedbackStore();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleDismiss = async () => {
    try {
      await apiClient.post('/feedbacks/dismiss');
    } catch (e) { }
    closeFeedback();
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.post('/feedbacks', {
        rating,
        category: event,
        message,
        answers
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        closeFeedback();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>We value your feedback!</DialogTitle>
          <DialogDescription>
            Help us improve the Nexmarto Closed Beta experience.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in" />
            <h3 className="text-xl font-semibold">Thank you!</h3>
            <p className="text-muted-foreground text-sm">Your feedback helps us build a better marketplace.</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="flex flex-col items-center space-y-2">
              <Label className="text-sm font-medium">How would you rate your experience?</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      (hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>

            {/* Quick Questions */}
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Label className="text-xs">{q}</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={answers[q] === 'Yes' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setAnswers({ ...answers, [q]: 'Yes' })}
                      className="w-full"
                    >
                      Yes
                    </Button>
                    <Button 
                      variant={answers[q] === 'No' ? 'destructive' : 'outline'} 
                      size="sm" 
                      onClick={() => setAnswers({ ...answers, [q]: 'No' })}
                      className="w-full"
                    >
                      No
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Any additional feedback? (Optional)</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us what you liked or how we can improve..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleDismiss} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
