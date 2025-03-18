import { Alert, AlertDescription } from '@/components/ui/alert';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/server';

// Import components
import ClientTabs from '../../../components/admin/ClientTabs';

// Define type definitions to match the ClientTabs component
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

export default async function AdminDashboardPage() {
  try {
    // Create a Supabase client using the server component client function
    const supabase = await createServerComponentClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/auth/login');
    }
    
    // Check if user is admin
    // Get the user's profile to check admin status
    let isUserAdmin = false;
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        throw new Error(profileError.message);
      }
      
      if (profile && profile.is_admin) {
        isUserAdmin = true;
      } else {
        // For development: force admin role
        if (process.env.NODE_ENV === 'development') {
          isUserAdmin = true;
        }
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      
      // For development: force admin role
      if (process.env.NODE_ENV === 'development') {
        isUserAdmin = true;
      }
    }
    
    if (!isUserAdmin) {
      redirect('/');
    }
    
    // Get data for dashboard
    
    // Get payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id, amount, status, created_at, payment_intent_id,
        user:user_id(id, email),
        product:product_id(id, name, price)
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
    }
    
    // Get connected accounts
    const { data: accountsData, error: accountsError } = await supabase
      .from('seller_accounts')
      .select(`
        id, created_at, account_status, is_onboarded, stripe_account_id,
        profile:user_id(id, username, display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (accountsError) {
      console.error("Error fetching connected accounts:", accountsError);
    }
    
    // Get disputes
    const { data: disputesData, error: disputesError } = await supabase
      .from('disputes')
      .select(`
        id, created_at, status, amount, payment_intent_id,
        user:user_id(id, username)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (disputesError) {
      console.error("Error fetching disputes:", disputesError);
    }
    
    // Get payouts
    const { data: payoutsData, error: payoutsError } = await supabase
      .from('payouts')
      .select(`
        id, created_at, status, amount, arrival_date,
        user:user_id(id, username)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (payoutsError) {
      console.error("Error fetching payouts:", payoutsError);
    }
    
    // Get feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select(`
        id, created_at, type, message, resolved,
        user:user_id(id, username)
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
    }
    
    // Get recently added products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        id, created_at, name, price, status, views,
        seller:user_id(id, username, display_name),
        categories!products_categories(name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (productsError) {
      console.error("Error fetching products:", productsError);
    }
    
    // Convert null to empty arrays and transform data to match expected interfaces
    const rawPayments = paymentsData || [];
    const rawAccounts = accountsData || [];
    const rawDisputes = disputesData || [];
    const rawPayouts = payoutsData || [];
    const rawFeedback = feedbackData || [];
    const rawProducts = productsData || [];

    // Transform the data to match the expected interfaces
    const payments: PaymentData[] = rawPayments.map(p => ({
      id: p.id,
      user_id: p.user?.[0]?.id || '',
      product_id: p.product?.[0]?.id || '',
      status: p.status,
      github_username: '', // This field might not be available from your query
      created_at: p.created_at,
      amount: p.amount,
      payment_intent_id: p.payment_intent_id
    }));

    const disputes: DisputeData[] = rawDisputes.map(d => ({
      id: d.id,
      dispute_id: d.id, // Use id as dispute_id if not available
      payment_intent_id: d.payment_intent_id,
      status: d.status,
      reason: '', // This field might not be available from your query
      amount: d.amount,
      currency: 'USD', // Default currency if not available
      evidence_due_by: '', // This field might not be available
      created_at: d.created_at
    }));

    const payouts: PayoutData[] = rawPayouts.map(p => ({
      id: p.id,
      payout_id: p.id, // Use id as payout_id if not available
      seller_account_id: '', // This field might not be available
      user_id: p.user?.[0]?.id || '',
      amount: p.amount,
      currency: 'USD', // Default currency if not available
      status: p.status,
      arrival_date: p.arrival_date,
      created_at: p.created_at
    }));

    const accounts: ConnectedAccountData[] = rawAccounts.map(a => ({
      id: a.id,
      user_id: a.profile?.[0]?.id || '',
      created_at: a.created_at,
      account_status: a.account_status,
      is_onboarded: a.is_onboarded,
      stripe_account_id: a.stripe_account_id
    }));

    const products: ProductData[] = rawProducts.map(p => ({
      id: p.id,
      user_id: p.seller?.[0]?.id || '',
      name: p.name,
      byline: '', // This field might not be available
      short_description: '', // This field might not be available
      price: p.price,
      image_urls: null, // This field might not be available
      github_repo_url: null, // This field might not be available
      status: p.status,
      created_at: p.created_at,
      user: {
        avatar_url: null, // This field might not be available
        full_name: p.seller?.[0]?.display_name || null
      },
      views: p.views
    }));

    const feedback: FeedbackData[] = rawFeedback.map(f => ({
      id: f.id,
      user_id: f.user?.[0]?.id || '',
      content: f.message || '',
      status: f.resolved ? 'resolved' : 'open',
      created_at: f.created_at,
      updated_at: f.created_at // Use created_at as updated_at if not available
    }));

    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Payment Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor and manage all payment activities across the platform.
          </p>
          
          <ClientTabs 
            payments={payments} 
            disputes={disputes}
            payouts={payouts}
            accounts={accounts}
            products={products}
            feedback={feedback}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in AdminDashboardPage:", error);
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertDescription>{error instanceof Error ? error.message : 'An error occurred'}</AlertDescription>
        </Alert>
      </div>
    );
  }
} 