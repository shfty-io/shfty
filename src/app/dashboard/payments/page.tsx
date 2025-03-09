'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from "lucide-react";

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

export default function PaymentsDashboard() {
  const supabase = createClient();
  
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [disputes, setDisputes] = useState<DisputeData[]>([]);
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccountData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define functions with useCallback to memoize them
  const checkAdminStatus = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw authError;
      }
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Check if this user is an admin via Supabase
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (adminError && adminError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw adminError;
      }
      
      setIsAdmin(!!adminData);
      
    } catch (error) {
      console.error("Admin check error:", error);
      setError("Failed to verify admin status");
      setIsAdmin(false);
    }
  }, [supabase]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch payment data
      const { data: payments, error: paymentsError } = await supabase
        .from('payments_with_github')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (paymentsError) {
        throw paymentsError;
      }
      
      setPayments(payments || []);

      // Fetch connected accounts data
      const { data: accounts, error: accountsError } = await supabase
        .from('seller_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (accountsError) {
        throw accountsError;
      }
      
      setConnectedAccounts(accounts || []);
      
      // Fetch disputes data
      const { data: disputes, error: disputesError } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (disputesError) {
        throw disputesError;
      }
      
      setDisputes(disputes || []);
      
      // Fetch payouts data
      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (payoutsError) {
        throw payoutsError;
      }
      
      setPayouts(payouts || []);
      
    } catch (error) {
      console.error("Data fetch error:", error);
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

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    const statusLower = status.toLowerCase();
    
    if (['succeeded', 'complete', 'paid', 'active'].includes(statusLower)) {
      return <Badge className="bg-green-500">Success</Badge>;
    } else if (['pending', 'processing', 'in_transit', 'transit'].includes(statusLower)) {
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Pending</Badge>;
    } else if (['failed', 'canceled', 'cancelled', 'expired', 'dispute', 'disconnected', 'deleted'].includes(statusLower)) {
      return <Badge variant="destructive">Failed</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    
    return formatter.format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };
  
  // Function to handle deleting a connected account
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
      const supabase = createClientComponentClient();
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
          </TabsList>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>
                  Monitor recent product purchases and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <div className="flex justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.created_at || '')}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.github_username || 'N/A'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.product_id ? payment.product_id.substring(0, 12) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No purchases found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Management</CardTitle>
                <CardDescription>
                  Handle payment disputes and chargeback claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Dispute ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Evidence Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : disputes.length > 0 ? (
                      disputes.map((dispute) => (
                        <TableRow key={dispute.id}>
                          <TableCell>{formatDate(dispute.created_at)}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {dispute.dispute_id ? dispute.dispute_id.substring(0, 12) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell>{formatCurrency(dispute.amount, dispute.currency)}</TableCell>
                          <TableCell>{dispute.reason}</TableCell>
                          <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                          <TableCell>
                            {dispute.evidence_due_by ? formatDate(dispute.evidence_due_by) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Respond
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No disputes found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Seller Payouts</CardTitle>
                <CardDescription>
                  Track payouts to sellers&apos; bank accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>Seller Account</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : payouts.length > 0 ? (
                      payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>{formatDate(payout.created_at)}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {payout.payout_id ? payout.payout_id.substring(0, 12) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payout.seller_account_id ? payout.seller_account_id.substring(0, 12) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell>{formatCurrency(payout.amount, payout.currency)}</TableCell>
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                          <TableCell>
                            {payout.arrival_date ? formatDate(payout.arrival_date) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No payouts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connected-accounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Connected Stripe Accounts</CardTitle>
                  <CardDescription>
                    Manage seller Stripe connected accounts
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={async () => {
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
                    }}
                  >
                    Sync Stripe Accounts
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Onboarded</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : connectedAccounts?.length > 0 ? (
                      connectedAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono text-xs">
                            {account.stripe_account_id ? account.stripe_account_id.substring(0, 12) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {account.user_id ? account.user_id.substring(0, 8) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell>{getStatusBadge(account.account_status)}</TableCell>
                          <TableCell>{account.is_onboarded ? "Yes" : "No"}</TableCell>
                          <TableCell>
                            {account.last_webhook_update ? formatDate(account.last_webhook_update) : 'N/A'}
                          </TableCell>
                          <TableCell>{formatDate(account.created_at)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteAccount(account.stripe_account_id)}
                              disabled={!account.stripe_account_id}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No connected accounts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 