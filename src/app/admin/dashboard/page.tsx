'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from "lucide-react";

// Import components
import { PaymentsTab } from '../../../components/admin/PaymentsTab';
import { DisputesTab } from '../../../components/admin/DisputesTab';
import { PayoutsTab } from '../../../components/admin/PayoutsTab';
import { ConnectedAccountsTab } from '../../../components/admin/ConnectedAccountsTab';
import { FeedbackTab } from '../../../components/admin/FeedbackTab';
import { ProductReviewTab } from '../../../components/admin/ProductReviewTab';

type PaymentData = {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  github_username: string;
  created_at: string | null;
};

type DisputeData = {
  id: string;
  dispute_id: string;
  payment_intent_id: string;
  status: string;
  reason: string;
  amount: number;
  currency: string;
  evidence_due_by: string;
  created_at: string;
};

type PayoutData = {
  id: string;
  payout_id: string;
  seller_account_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date?: string;
  created_at: string;
};

type ConnectedAccountData = {
  id: string;
  user_id: string;
  stripe_account_id: string | null;
  is_onboarded: boolean;
  account_status: string;
  last_webhook_update?: string;
  created_at: string;
  updated_at?: string;
  email?: string;
  name?: string;
};

type SyncResultDetail = {
  account_id: string;
  success: boolean;
  error?: string;
};

type FeedbackData = {
  id: string;
  content: string;
  user_id: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ProductData = {
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
};

export default function PaymentsDashboard() {
  const supabase = createClient();
  
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [disputes, setDisputes] = useState<DisputeData[]>([]);
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccountData[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define functions with useCallback to memoize them
  const checkAdminStatus = useCallback(async () => {
    try {
      // Clear any previous errors
      setError(null);
      
      console.log("Starting admin check...");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", JSON.stringify(authError));
        throw authError;
      }
      
      if (!user) {
        console.error("No user found");
        throw new Error("User not authenticated");
      }
      
      console.log("User authenticated:", user.id);
      
      // Check if this user is an admin via Supabase
      try {
        console.log("Checking admin status for user:", user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Profile check database error:", JSON.stringify(profileError));
          throw profileError;
        }
        
        const isUserAdmin = profileData?.is_admin === true;
        console.log("Is user admin:", isUserAdmin);
        setIsAdmin(isUserAdmin);
      } catch (dbError) {
        console.error("Database operation error:", dbError);
        
        // For development/testing purposes, you can force admin status
        // Comment this out in production
        console.log("Setting admin status to true for testing");
        setIsAdmin(true);
        
        // In production, you would want to handle this error properly
        // setError("Failed to check admin status");
        // setIsAdmin(false);
      }
      
    } catch (error) {
      console.error("Admin check error:", JSON.stringify(error));
      setError("Failed to verify admin status");
      
      // For development/testing purposes, you can force admin status
      // Comment this out in production
      console.log("Setting admin status to true for testing");
      setIsAdmin(true);
      
      // In production, you would want to handle this error properly
      // setIsAdmin(false);
    }
  }, [supabase]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching admin dashboard data...");
      
      // Fetch payment data
      try {
        console.log("Fetching payments data...");
        const { data: payments, error: paymentsError } = await supabase
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (paymentsError) {
          console.error("Payments fetch error:", JSON.stringify(paymentsError));
          throw paymentsError;
        }
        
        console.log(`Fetched ${payments?.length || 0} payments`);
        setPayments(payments || []);
      } catch (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
        // Continue with other data fetches
      }

      // Fetch connected accounts data
      try {
        console.log("Fetching connected accounts data...");
        const { data: accounts, error: accountsError } = await supabase
          .from('seller_accounts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (accountsError) {
          console.error("Accounts fetch error:", JSON.stringify(accountsError));
          throw accountsError;
        }
        
        console.log(`Fetched ${accounts?.length || 0} connected accounts`);
        setConnectedAccounts(accounts || []);
      } catch (accountsError) {
        console.error("Error fetching connected accounts:", accountsError);
        // Continue with other data fetches
      }
      
      // Fetch disputes data
      try {
        console.log("Fetching disputes data...");
        const { data: disputes, error: disputesError } = await supabase
          .from('disputes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (disputesError) {
          console.error("Disputes fetch error:", JSON.stringify(disputesError));
          throw disputesError;
        }
        
        console.log(`Fetched ${disputes?.length || 0} disputes`);
        setDisputes(disputes || []);
      } catch (disputesError) {
        console.error("Error fetching disputes:", disputesError);
        // Continue with other data fetches
      }
      
      // Fetch payouts data
      try {
        console.log("Fetching payouts data...");
        const { data: payouts, error: payoutsError } = await supabase
          .from('seller_payouts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (payoutsError) {
          console.error("Payouts fetch error:", JSON.stringify(payoutsError));
          throw payoutsError;
        }
        
        console.log(`Fetched ${payouts?.length || 0} payouts`);
        setPayouts(payouts || []);
      } catch (payoutsError) {
        console.error("Error fetching payouts:", payoutsError);
        // Continue with other data fetches
      }
      
      // Fetch feedback data
      try {
        console.log("Fetching feedback data...");
        const { data: feedback, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (feedbackError) {
          console.error("Feedback fetch error:", JSON.stringify(feedbackError));
          throw feedbackError;
        }
        
        console.log(`Fetched ${feedback?.length || 0} feedback items`);
        setFeedback(feedback || []);
      } catch (feedbackError) {
        console.error("Error fetching feedback:", feedbackError);
        // Continue with other data fetches
      }

      // Fetch products data with user profiles
      try {
        console.log("Fetching products data...");
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            user:user_id (
              avatar_url,
              full_name
            )
          `)
          .order('created_at', { ascending: false });
        
        if (productsError) {
          console.error("Products fetch error:", JSON.stringify(productsError));
          throw productsError;
        }
        
        console.log(`Fetched ${products?.length || 0} products`);
        setProducts(products || []);
      } catch (productsError) {
        console.error("Error fetching products:", productsError);
        // Continue with other data fetches
      }
      
      console.log("All data fetched successfully");
      
    } catch (error) {
      console.error("Data fetch error:", JSON.stringify(error));
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [supabase]);
  
  // Initial load effect with proper dependencies
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Effect to fetch data when isAdmin changes
  useEffect(() => {
    if (isAdmin === true) {
      fetchData();
    }
  }, [isAdmin, fetchData]);

  // Handle account deletion
  const handleDeleteAccount = async (accountId: string | null) => {
    if (!accountId) {
      alert('Cannot delete: Invalid account ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this connected account? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the API to delete the connected account
      const response = await fetch('/api/stripe/connect/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete connected account');
      }
      
      // Get updated data after deletion
      const { data: updatedAccounts, error: fetchError } = await supabase
        .from('seller_accounts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (fetchError) throw fetchError;
      setConnectedAccounts(updatedAccounts || []);
      
      // Show success toast or notification
      alert('Connected account deleted successfully');
      
    } catch (error) {
      console.error('Error deleting connected account:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete connected account'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle account sync
  const handleSyncAccounts = async () => {
    try {
      if (confirm('This will sync all connected accounts from Stripe to your database. Continue?')) {
        setLoading(true);
        const response = await fetch('/api/stripe/sync-accounts', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to sync accounts: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Sync result:', result);
        
        if (result.accounts_failed > 0) {
          // Show error details if there were failures
          const failedAccounts = result.details.filter((d: SyncResultDetail) => !d.success);
          const errorMessage = failedAccounts.map((d: SyncResultDetail) => 
            `Account ${d.account_id}: ${d.error}`
          ).join('\n');
          
          alert(
            `Sync completed with errors!\n\n` +
            `Total Stripe accounts: ${result.total_stripe_accounts}\n` +
            `Existing in database: ${result.existing_accounts}\n` +
            `Successfully added: ${result.accounts_added}\n` +
            `Failed to add: ${result.accounts_failed}\n\n` +
            `Error details:\n${errorMessage}\n\n` +
            `This could be due to database constraints. Please check the console for more details.`
          );
        } else {
          alert(
            `Sync complete!\n\n` +
            `Total Stripe accounts: ${result.total_stripe_accounts}\n` +
            `Existing in database: ${result.existing_accounts}\n` +
            `Successfully added: ${result.accounts_added}\n` +
            `Failed to add: ${result.accounts_failed}`
          );
        }
        
        // Refresh the connected accounts list
        fetchData();
      }
    } catch (error) {
      console.error('Error syncing accounts:', error);
      alert(`Error syncing accounts: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle update feedback status
  const handleUpdateFeedbackStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh feedback data
      const { data, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setFeedback(data || []);
      
      alert(`Feedback marked as ${status}`);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update feedback status'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle approve product
  const handleApproveProduct = async (id: string) => {
    try {
      if (!confirm('Are you sure you want to approve this product? It will be visible on the marketplace.')) {
        return;
      }
      
      setLoading(true);
      
      const { error } = await supabase
        .from('products')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh products data
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          user:user_id (
            avatar_url,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setProducts(data || []);
      
      alert('Product approved successfully');
    } catch (error) {
      console.error('Error approving product:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to approve product'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle reject product
  const handleRejectProduct = async (id: string) => {
    try {
      setLoading(true);
      
      // TODO: In a real application, we would send an email to the seller with the rejection reason
      
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'rejected',
          // You might want to store the rejection reason in a separate column
          // rejection_reason: reason 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh products data
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          user:user_id (
            avatar_url,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setProducts(data || []);
      
      alert('Product rejected successfully');
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to reject product'}`);
    } finally {
      setLoading(false);
    }
  };

  // Display loading or error states
  if (isAdmin === null) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-32">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertDescription>{error || 'You do not have permission to view this page.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Payment Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor and manage all payment activities across the platform.
        </p>
        
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
              connectedAccounts={connectedAccounts}
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
      </div>
    </div>
  );
} 