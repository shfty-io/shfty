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
    
    // Fetch notifications using service role client
    const { data: notifications, error: notificationsError } = await serviceClient
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return NextResponse.json(
        { error: 'Error fetching notifications' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ notifications: notifications || [] });
  } catch (error) {
    console.error('Unexpected error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
    
    // Get request body
    const body = await request.json();
    const { id, status = 'read' } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    // Update notification status
    const { error: updateError } = await serviceClient
      .from('notifications')
      .update({ 
        status, 
        read_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating notification:', updateError);
      return NextResponse.json(
        { error: 'Error updating notification' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT() {
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
    
    // Update all unread notifications to read
    const { error: updateError } = await serviceClient
      .from('notifications')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString() 
      })
      .eq('status', 'unread')
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating notifications:', updateError);
      return NextResponse.json(
        { error: 'Error updating notifications' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 