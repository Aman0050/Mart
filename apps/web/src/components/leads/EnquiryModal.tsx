"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@nexmarto/ui';
import { apiClient } from '@/lib/api/client';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { trackEvent } from '@/lib/utils/analytics';

const enquirySchema = z.object({
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Please provide more details in your message"),
  quantityRequired: z.coerce.number().min(1).optional(),
  budget: z.coerce.number().min(0).optional(),
});

type EnquiryForm = z.infer<typeof enquirySchema>;

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  companyId?: string;
  targetName: string;
}

import { useFeedbackTrigger } from '@/hooks/useFeedbackTrigger';

export function EnquiryModal({ isOpen, onClose, productId, companyId, targetName }: EnquiryModalProps) {
  const { user } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const { showFeedbackIfEligible } = useFeedbackTrigger();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EnquiryForm>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      subject: `Enquiry regarding ${targetName}`,
    }
  });

  const onSubmit = async (data: EnquiryForm) => {
    try {
      setError('');
      await apiClient.post('/leads', {
        ...data,
        productId,
        companyId,
        source: productId ? 'product_page' : 'company_profile'
      });
      setIsSuccess(true);
      
      trackEvent('generate_lead', {
        item_id: productId,
        lead_source: productId ? 'product_page' : 'company_profile',
        lead_budget: data.budget || 0,
        value: data.budget || 0,
        currency: 'INR'
      });
      
      showFeedbackIfEligible(
        'FIRST_ENQUIRY_SENT',
        ['How easy was it to send an enquiry?'],
        'buyer'
      );

      setTimeout(() => {
        setIsSuccess(false);
        reset();
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send enquiry. Please try again later.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!user ? (
          <div className="text-center py-8">
            <DialogTitle className="text-xl font-bold mb-4">Login Required</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">Please log in or create an account to send an enquiry to verified suppliers.</DialogDescription>
            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.href = '/login'}>Login</Button>
              <Button variant="outline" onClick={() => window.location.href = '/register'}>Create Account</Button>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="text-center py-8 animate-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">Enquiry Sent!</DialogTitle>
            <DialogDescription className="text-muted-foreground">The supplier has been notified and will respond shortly. You can track this enquiry in your dashboard.</DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send Enquiry</DialogTitle>
              <DialogDescription>
                Contacting supplier about <span className="font-medium text-foreground">{targetName}</span>
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" {...register('subject')} />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantityRequired">Quantity Needed</Label>
                  <Input id="quantityRequired" type="number" placeholder="e.g. 100" {...register('quantityRequired')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Target Budget (₹)</Label>
                  <Input id="budget" type="number" placeholder="e.g. 50000" {...register('budget')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <textarea 
                  id="message" 
                  rows={5}
                  placeholder="Describe your requirements, delivery location, and specific technical needs..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('message')}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Enquiry
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
