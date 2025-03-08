import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/server';
import { handleApiError } from '@/lib/error-handler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { disputeId, evidence } = body;
    
    if (!disputeId || !evidence) {
      return NextResponse.json(
        { error: 'Dispute ID and evidence are required' },
        { status: 400 }
      );
    }
    
    // Authenticate user and check permissions
    const supabase = createClient(await cookies());
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
      
    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    // Get dispute from database to verify it exists
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('*')
      .eq('dispute_id', disputeId)
      .single();
      
    if (disputeError || !dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }
    
    // Submit evidence to Stripe
    const updatedDispute = await stripe.disputes.update(
      disputeId,
      { evidence }
    );
    
    // Update dispute in database
    await supabase
      .from('disputes')
      .update({
        status: updatedDispute.status,
        updated_at: new Date().toISOString(),
        has_evidence: true,
        evidence_details: {
          submitted_at: new Date().toISOString(),
          submitted_by: user.id,
          evidence_fields: Object.keys(evidence).filter(k => !!evidence[k])
        }
      })
      .eq('dispute_id', disputeId);
    
    // Log the evidence submission
    await supabase
      .from('admin_logs')
      .insert({
        user_id: user.id,
        action: 'dispute_evidence_submitted',
        resource_id: disputeId,
        resource_type: 'dispute',
        metadata: {
          dispute_id: disputeId,
          evidence_fields: Object.keys(evidence).filter(k => !!evidence[k])
        }
      });
    
    return NextResponse.json({
      success: true,
      dispute: {
        id: updatedDispute.id,
        status: updatedDispute.status
      }
    });
  } catch (error) {
    console.error('Error submitting dispute evidence:', error);
    return handleApiError(error);
  }
} 