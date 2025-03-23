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
    
    // Fetch seller account payment status
    const { data: sellerAccount, error: sellerError } = await serviceClient
      .from('seller_accounts')
      .select('stripe_account_id, is_onboarded, account_status')
      .eq('user_id', user.id)
      .single();
    
    if (sellerError && sellerError.code !== 'PGRST116') {
      console.error('Error fetching seller account:', sellerError);
      return NextResponse.json(
        { error: 'Error fetching seller payment status' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      paymentSetup: sellerAccount?.is_onboarded || false,
      sellerAccount: sellerAccount || null
    });
  } catch (error) {
    console.error('Unexpected error in payment status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 