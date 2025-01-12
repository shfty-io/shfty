import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const rawSignature = headersList.get('stripe-signature');

    if (!rawSignature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      rawSignature,
      webhookSecret
    );

    const supabase = createClient();

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        console.log('Account updated:', account.id, account.details_submitted, account.charges_enabled);
        
        // Update seller account status
        const { error } = await supabase
          .from('seller_accounts')
          .update({
            is_onboarded: account.details_submitted && account.charges_enabled,
            account_status: (account.details_submitted && account.charges_enabled) ? 'complete' : 'pending'
          })
          .eq('stripe_account_id', account.id);

        if (error) {
          console.error('Error updating seller account:', error);
        }
        
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 