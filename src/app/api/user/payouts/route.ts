import { createServiceClient, createServerComponentClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create clients
    const supabase = await createServerComponentClient();
    const serviceClient = createServiceClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Fetch payouts for this seller
    const { data: payoutsData, error: payoutsError } = await serviceClient
      .from('seller_payouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (payoutsError) {
      console.error('Error fetching payouts:', payoutsError);
      return NextResponse.json(
        { error: 'Error fetching payouts' },
        { status: 500 }
      );
    }
    
    // Calculate earnings summary
    let totalPending = 0;
    let totalPaid = 0;
    
    (payoutsData || []).forEach(payout => {
      if (payout.status === 'paid') {
        totalPaid += payout.amount;
      } else if (payout.status === 'pending') {
        totalPending += payout.amount;
      }
    });
    
    const summary = {
      totalPending,
      totalPaid,
      totalLifetime: totalPending + totalPaid,
      currency: 'usd', // Default currency
    };
    
    return NextResponse.json({
      payouts: payoutsData || [],
      summary
    });
  } catch (error) {
    console.error('Unexpected error in payouts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 