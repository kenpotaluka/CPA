import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { feedbackApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import type { FeedbackFormData } from '@/types/types';
import { cn } from '@/lib/utils';

interface FeedbackFormProps {
  complaintId: string;
  onSuccess?: () => void;
}

export default function FeedbackForm({ complaintId, onSuccess }: FeedbackFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [responseTimeRating, setResponseTimeRating] = useState(0);
  const [resolutionQualityRating, setResolutionQualityRating] = useState(0);

  const form = useForm({
    defaultValues: {
      comment: ''
    }
  });

  async function onSubmit(values: { comment: string }) {
    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Please provide an overall rating',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const feedbackData: FeedbackFormData = {
        complaint_id: complaintId,
        rating,
        comment: values.comment || undefined,
        response_time_rating: responseTimeRating || undefined,
        resolution_quality_rating: resolutionQualityRating || undefined
      };

      await feedbackApi.create(feedbackData);
      
      toast({
        title: 'Success',
        description: 'Thank you for your feedback!'
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  }

  function StarRating({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
  }) {
    return (
      <div>
        <label className="text-sm font-medium mb-2 block">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="transition-colors"
            >
              <Star
                className={cn(
                  'h-6 w-6',
                  star <= value
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Please share your experience with the complaint resolution process
      </p>

      <StarRating
        value={rating}
        onChange={setRating}
        label="Overall Rating *"
      />

      <StarRating
        value={responseTimeRating}
        onChange={setResponseTimeRating}
        label="Response Time"
      />

      <StarRating
        value={resolutionQualityRating}
        onChange={setResolutionQualityRating}
        label="Resolution Quality"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Comments</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your thoughts about the resolution..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={submitting || rating === 0}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
