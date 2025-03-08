'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
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
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

type PaymentData = {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  payment_intent: string;
  amount_total: number;
  dispute_status?: string;
  refund_status?: string;
  fraud_warning?: boolean;
  created_at: string;
  updated_at?: string;
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

export default function PaymentsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('purchases');
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [disputes, setDisputes] = useState<DisputeData[]>([]);
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check if user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const supabase = createClient();
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // If no user is logged in, redirect to login
          router.push('/auth/login');
          return;
        }
        
        // Get the user's profile to check admin status
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Set admin status
        setIsAdmin(!!profile?.is_admin);
        
        // If not an admin, redirect after a short delay
        if (!profile?.is_admin) {
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch data if the user is an admin
      if (isAdmin !== true) return;
      
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Fetch purchases
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (purchasesError) throw purchasesError;
        setPayments(purchasesData || []);
        
        // Fetch disputes
        const { data: disputesData, error: disputesError } = await supabase
          .from('disputes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (disputesError) throw disputesError;
        setDisputes(disputesData || []);
        
        // Fetch payouts
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('seller_payouts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (payoutsError) throw payoutsError;
        setPayouts(payoutsData || []);
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin]);
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string, label: string }> = {
      'completed': { variant: 'default', label: 'Completed' },
      'succeeded': { variant: 'default', label: 'Succeeded' },
      'pending': { variant: 'outline', label: 'Pending' },
      'failed': { variant: 'destructive', label: 'Failed' },
      'refunded': { variant: 'secondary', label: 'Refunded' },
      'partially_refunded': { variant: 'secondary', label: 'Partial Refund' },
      'disputed': { variant: 'destructive', label: 'Disputed' },
      'paid': { variant: 'default', label: 'Paid' },
      'open': { variant: 'outline', label: 'Open' },
      'closed': { variant: 'secondary', label: 'Closed' },
      'warning_under_review': { variant: 'warning', label: 'Under Review' },
      'needs_response': { variant: 'destructive', label: 'Needs Response' },
    };
    
    const statusConfig = statusMap[status] || { variant: 'outline', label: status };
    
    return (
      <Badge variant={statusConfig.variant as React.ComponentProps<typeof Badge>['variant']}>
        {statusConfig.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    
    return formatter.format(amount / 100);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };

  // Show access denied message if not an admin
  if (isAdmin === false) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Payments Dashboard</h1>
        <Alert variant="destructive">
          <AlertDescription>
            Access denied. This page is only available to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || isAdmin === null) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Payments Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payments Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>
                View and manage recent product purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {payment.payment_intent.substring(3, 15)}...
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount_total)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {payment.dispute_status && (
                            <Badge variant="destructive" className="mr-1">Dispute</Badge>
                          )}
                          {payment.refund_status && (
                            <Badge variant="secondary" className="mr-1">Refund</Badge>
                          )}
                          {payment.fraud_warning && (
                            <Badge variant="outline" className="border-red-500 text-red-500">Fraud</Badge>
                          )}
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
                      <TableCell colSpan={6} className="text-center py-4">
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
              <CardTitle>Disputes</CardTitle>
              <CardDescription>
                Manage customer disputes that require your attention
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
                    <TableHead>Due By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes.length > 0 ? (
                    disputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell>{formatDate(dispute.created_at)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {dispute.dispute_id.substring(0, 12)}...
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
                    <TableHead>Seller Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length > 0 ? (
                    payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>{formatDate(payout.created_at)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {payout.seller_account_id.substring(0, 12)}...
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
                      <TableCell colSpan={6} className="text-center py-4">
                        No payouts found
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
  );
} 