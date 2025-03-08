'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

const formSchema = z.object({
  evidence: z.string().min(10, {
    message: "Dispute evidence must be at least 10 characters.",
  }),
  productDescription: z.string().min(5, {
    message: "Product description must be at least 5 characters.",
  }),
  customerCommunication: z.string().optional(),
  additionalEvidence: z.string().optional(),
});

type DisputeResponseFormProps = {
  disputeId: string;
  chargeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function DisputeResponseForm({
  disputeId,
  chargeId,
  isOpen,
  onClose,
  onSuccess,
}: DisputeResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evidence: "",
      productDescription: "",
      customerCommunication: "",
      additionalEvidence: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/disputes/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disputeId,
          chargeId,
          evidence: {
            product_description: values.productDescription,
            customer_communication: values.customerCommunication || null,
            uncategorized_text: values.evidence,
            additional_evidence: values.additionalEvidence || null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit dispute evidence');
      }

      toast({
        title: "Evidence submitted",
        description: "Your dispute evidence has been submitted to Stripe.",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting dispute evidence:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Respond to Dispute</DialogTitle>
          <DialogDescription>
            Provide evidence to respond to this dispute. Your evidence will be submitted to Stripe.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must respond to this dispute by the due date or you will automatically lose the dispute and the funds will be returned to the customer.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dispute Information</CardTitle>
              <CardDescription>Dispute ID: {disputeId}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                <strong>Charge ID:</strong> {chargeId}
              </p>
            </CardContent>
          </Card>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="evidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dispute Evidence</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide evidence explaining why this charge is legitimate..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe the product or service provided..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerCommunication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Communication (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide any relevant communication with the customer..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalEvidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Evidence (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide any additional evidence..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Evidence"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 