'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentsTab } from './PaymentsTab';
import { DisputesTab } from './DisputesTab';
import { PayoutsTab } from './PayoutsTab';
import { ConnectedAccountsTab } from './ConnectedAccountsTab';
import { ProductReviewTab } from './ProductReviewTab';
import { FeedbackTab } from './FeedbackTab';
import { toast } from '@/components/ui/use-toast';

// Define interfaces based on component expectations
interface PaymentData {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  github_username: string;
  created_at: string | null;
  amount: number;
  payment_intent_id: string;
}

interface DisputeData {
  id: string;
  dispute_id: string;
  payment_intent_id: string;
  status: string;
  reason: string;
  amount: number;
  currency: string;
  evidence_due_by: string;
  created_at: string;
}

interface PayoutData {
  id: string;
  payout_id: string;
  seller_account_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: string;
  created_at: string;
}

interface ConnectedAccountData {
  id: string;
  user_id: string;
  created_at: string;
  account_status: string;
  is_onboarded: boolean;
  stripe_account_id: string;
}

interface ProductData {
  id: string;
  user_id: string;
  name: string;
  byline: string;
  short_description: string;
  price: number;
  image_urls: string[] | null;
  github_repo_url: string | null;
  status: string;
  created_at: string;
  user: {
    avatar_url: string | null;
    full_name: string | null;
  };
  views?: number;
}

interface FeedbackData {
  id: string;
  user_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ClientTabsProps {
  payments: PaymentData[];
  disputes: DisputeData[];
  payouts: PayoutData[];
  accounts: ConnectedAccountData[];
  products: ProductData[];
  feedback: FeedbackData[];
}

export default function ClientTabs({
  payments,
  disputes,
  payouts,
  accounts,
  products,
  feedback
}: ClientTabsProps) {
  const [loading, setLoading] = useState(false);

  const handleSyncAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/sync-accounts', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync accounts');
      }
      
      toast({
        title: 'Accounts Synced',
        description: 'Stripe accounts have been synchronized',
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error syncing accounts:', error);
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: 'Failed to sync Stripe accounts',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string | null) => {
    if (!accountId || !confirm('Are you sure you want to delete this connected account?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/connect/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      toast({
        title: 'Account Deleted',
        description: 'The connected account has been deleted',
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Failed to delete connected account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (id: string) => {
    if (!id || !confirm('Are you sure you want to approve this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}/approve`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve product');
      }
      
      toast({
        title: 'Product Approved',
        description: 'The product has been approved',
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error approving product:', error);
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: 'Failed to approve product',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProduct = async (id: string, reason: string = '') => {
    if (!id || !confirm('Are you sure you want to reject this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject product');
      }
      
      toast({
        title: 'Product Rejected',
        description: 'The product has been rejected',
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        variant: 'destructive',
        title: 'Rejection Failed',
        description: 'Failed to reject product',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/feedback/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update feedback status');
      }
      
      toast({
        title: 'Status Updated',
        description: `Feedback marked as ${status}`,
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to update feedback status',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="payments">
      <TabsList>
        <TabsTrigger value="payments">Purchases</TabsTrigger>
        <TabsTrigger value="disputes">Disputes</TabsTrigger>
        <TabsTrigger value="payouts">Payouts</TabsTrigger>
        <TabsTrigger value="connected-accounts">Connected Accounts</TabsTrigger>
        <TabsTrigger value="product-review">Product Review</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>
      
      <TabsContent value="payments">
        <PaymentsTab 
          payments={payments}
          loading={loading}
        />
      </TabsContent>
      
      <TabsContent value="disputes">
        <DisputesTab 
          disputes={disputes}
          loading={loading}
        />
      </TabsContent>
      
      <TabsContent value="payouts">
        <PayoutsTab 
          payouts={payouts}
          loading={loading}
        />
      </TabsContent>
      
      <TabsContent value="connected-accounts">
        <ConnectedAccountsTab 
          connectedAccounts={accounts}
          loading={loading}
          onDeleteAccount={handleDeleteAccount}
          onSyncAccounts={handleSyncAccounts}
        />
      </TabsContent>

      <TabsContent value="product-review">
        <ProductReviewTab 
          products={products}
          loading={loading}
          onApproveProduct={handleApproveProduct}
          onRejectProduct={handleRejectProduct}
        />
      </TabsContent>

      <TabsContent value="feedback">
        <FeedbackTab 
          feedback={feedback}
          loading={loading}
          onUpdateStatus={handleUpdateFeedbackStatus}
        />
      </TabsContent>
    </Tabs>
  );
} 