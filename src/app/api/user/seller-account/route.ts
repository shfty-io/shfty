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
    
    // Fetch seller account using service client
    const { data: sellerAccount, error } = await serviceClient
      .from('seller_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no records found
      console.error('Error fetching seller account:', error);
      return NextResponse.json(
        { error: 'Error fetching seller account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ sellerAccount });
  } catch (error) {
    console.error('Unexpected error in seller account API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 