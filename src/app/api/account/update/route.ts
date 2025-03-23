import { createClient, createServiceClient } from '@/lib/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fullName = formData.get('fullName') as string;
    const avatarUrl = formData.get('avatarUrl') as string;

    // Create Supabase client for auth and service client for database operations
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const serviceClient = createServiceClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Update the profile
    const updates: { 
      full_name?: string; 
      avatar_url?: string;
    } = {};
    
    if (fullName) {
      updates.full_name = fullName;
    }
    
    if (avatarUrl) {
      updates.avatar_url = avatarUrl;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await serviceClient
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in profile update:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 