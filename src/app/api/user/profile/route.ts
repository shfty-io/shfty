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
    
    // Fetch profile using service client
    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('*')
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Error fetching profile' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Unexpected error in profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 