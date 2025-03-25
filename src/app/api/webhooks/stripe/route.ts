import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/server';
import { createExternalServiceError, handleApiError } from '@/lib/error-handler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Use serviceClient for all database operations instead of supabase
const serviceClient = createServiceClient();

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

    switch (event.type) {
      // ACCOUNT EVENTS
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        
        console.log('Processing account.updated webhook:', {
          accountId: account.id,
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled
        });
        
        // Check if seller account exists
        const { data: existingAccount, error: lookupError } = await serviceClient
          .from('seller_accounts')
          .select('id, user_id')
          .eq('stripe_account_id', account.id)
          .limit(1);
          
        if (lookupError) {
          console.error('Error looking up seller account by Stripe account ID:', lookupError);
          return createExternalServiceError('Supabase', 'Failed to lookup seller account');
        }
        
        // If no account found, log error and return success (can't update what doesn't exist)
        if (!existingAccount || existingAccount.length === 0) {
          console.warn(`No seller account found for Stripe account ID: ${account.id}. This might be expected for test accounts.`);
          return NextResponse.json({ received: true, warning: 'No matching seller account' });
        }
        
        // Update seller account status
        const isComplete = account.details_submitted && account.charges_enabled;
        
        const { error } = await serviceClient
          .from('seller_accounts')
          .update({
            is_onboarded: isComplete,
            account_status: isComplete ? 'complete' : 'pending'
          })
          .eq('stripe_account_id', account.id);

        if (error) {
          console.error('Error updating seller account:', error);
          return createExternalServiceError('Supabase', 'Failed to update seller account');
        }
        
        console.log('Successfully updated seller account for Stripe account ID:', account.id);
        break;
      }

      case 'account.application.deauthorized': {
        const account = event.data.object as unknown as Stripe.Account;
        
        // Update seller account status to disconnected
        const { error } = await serviceClient
          .from('seller_accounts')
          .update({
            is_onboarded: false,
            account_status: 'disconnected'
          })
          .eq('stripe_account_id', account.id);

        if (error) {
          console.error('Error updating disconnected account:', error);
          return createExternalServiceError('Supabase', 'Failed to update disconnected account');
        }
        
        // TODO: Send notification to admin about disconnected account
        
        break;
      }

      case 'account.external_account.created': 
      case 'account.external_account.updated':
      case 'account.external_account.deleted': {
        const externalAccount = event.data.object as Stripe.BankAccount | Stripe.Card;
        const accountId = externalAccount.account as string;
        
        // Store bank account change in database
        const { error } = await serviceClient
          .from('seller_external_accounts')
          .insert({
            seller_account_id: accountId,
            external_account_id: externalAccount.id,
            account_type: externalAccount.object,
            event_type: event.type,
            status: event.type.includes('deleted') ? 'deleted' : 'active',
            metadata: externalAccount,
            created_at: new Date().toISOString()
          })
          .select();

        if (error) {
          // If the table doesn't exist yet, log but don't fail
          console.error('Error recording external account change:', error);
        }
        
        break;
      }

      // CHECKOUT & PAYMENT EVENTS
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const productId = session.metadata?.product_id;
        const source = session.metadata?.source;
        const amountTotal = session.metadata?.amount_total ? parseInt(session.metadata.amount_total) : session.amount_total;
        const platformFee = session.metadata?.platform_fee ? parseInt(session.metadata.platform_fee) : Math.round((amountTotal || 0) * (Number(process.env.TRANSACTION_FEE_PERCENTAGE) || 10) / 100);

        if (!userId || !productId) {
          console.error('Missing required metadata in session:', session.id);
          return NextResponse.json({ received: true });
        }

        // Create purchase record
        try {
          const { error: purchaseError } = await serviceClient
            .from('purchases')
            .insert({
              user_id: userId,
              product_id: productId,
              payment_intent_id: session.payment_intent?.toString(),
              amount_total: amountTotal,
              platform_fee: platformFee,
              seller_amount: (amountTotal || 0) - (platformFee || 0),
              currency: session.currency,
              status: 'completed',
              payment_status: 'succeeded',
              completed_at: new Date().toISOString(),
              metadata: {
                source: source || 'checkout',
                customer_email: session.customer_details?.email,
                customer_name: session.customer_details?.name,
                payment_method_types: session.payment_method_types,
                session_id: session.id
              }
            });

          if (purchaseError) {
            console.error('Error creating purchase record:', purchaseError);
          } else {
            // Update product purchase count
            const { error: updateError } = await serviceClient.rpc('increment_purchase_count', {
              product_id: productId
            });
            
            if (updateError) {
              console.error('Error updating purchase count:', updateError);
            }

            // Handle GitHub repository access if needed
            if (session.metadata?.github_username) {
              try {
                const { data: product } = await serviceClient
                  .from('products')
                  .select('github_repo_url, github_token')
                  .eq('id', productId)
                  .single();
                  
                if (product?.github_repo_url && product?.github_token) {
                  // Parse GitHub URL
                  const cleanUrl = product.github_repo_url.trim().replace(/\/$/, '');
                  const githubUrl = new URL(cleanUrl.startsWith('https://') ? cleanUrl : `https://${cleanUrl}`);
                  const parts = githubUrl.pathname.split('/').filter(Boolean);
                  
                  if (parts.length === 2) {
                    const [owner, repo] = parts;
                    
                    // Add collaborator
                    const response = await fetch(
                      `https://api.github.com/repos/${owner}/${repo}/collaborators/${session.metadata.github_username}`,
                      {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${product.github_token}`,
                          'Accept': 'application/vnd.github.v3+json',
                          'X-GitHub-Api-Version': '2022-11-28'
                        },
                        body: JSON.stringify({ permission: 'pull' })
                      }
                    );
                    
                    if (response.ok) {
                      // Record successful access
                      await serviceClient
                        .from('repository_access')
                        .insert({
                          user_id: userId,
                          product_id: productId,
                          repository_url: product.github_repo_url,
                          access_key: session.metadata.github_username
                        });
                    } else {
                      console.error('GitHub API error:', {
                        status: response.status,
                        error: await response.text()
                      });
                    }
                  }
                }
              } catch (error) {
                console.error('Error handling GitHub repository access:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error processing checkout session:', error);
        }
        
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update purchase status
        const { error } = await serviceClient
          .from('purchases')
          .update({
            status: 'completed',
            payment_status: 'succeeded',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              payment_method: paymentIntent.payment_method,
              ...paymentIntent.metadata
            }
          })
          .eq('payment_intent_id', paymentIntent.id);
        
        if (error) {
          console.error('Error updating payment status:', error);
        }
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update purchase status
        const { error } = await serviceClient
          .from('purchases')
          .update({
            status: 'failed',
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
            error_message: paymentIntent.last_payment_error?.message,
            metadata: {
              error_code: paymentIntent.last_payment_error?.code,
              decline_code: paymentIntent.last_payment_error?.decline_code,
              ...paymentIntent.metadata
            }
          })
          .eq('payment_intent_id', paymentIntent.id);
        
        if (error) {
          console.error('Error updating failed payment:', error);
        }
        
        break;
      }

      // DISPUTE & REFUND EVENTS
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        
        // Get the payment intent from the charge
        const charge = await stripe.charges.retrieve(dispute.charge as string);
        const paymentIntentId = charge.payment_intent as string;
        
        // Update purchase dispute status
        const { error } = await serviceClient
          .from('purchases')
          .update({
            status: 'disputed',
            dispute_status: 'open',
            updated_at: new Date().toISOString(),
            metadata: {
              dispute_id: dispute.id,
              dispute_reason: dispute.reason,
              dispute_amount: dispute.amount,
              dispute_currency: dispute.currency,
              evidence_due_by: dispute.evidence_details?.due_by
            }
          })
          .eq('payment_intent_id', paymentIntentId);
        
        if (error) {
          console.error('Error updating dispute status:', error);
        }
        
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        
        // Update purchase refund status
        const { error } = await serviceClient
          .from('purchases')
          .update({
            status: charge.refunded ? 'refunded' : 'partially_refunded',
            refund_status: charge.refunded ? 'full' : 'partial',
            updated_at: new Date().toISOString(),
            metadata: {
              refund_amount: charge.amount_refunded,
              refund_reason: charge.refunds?.data[0]?.reason,
              ...charge.metadata
            }
          })
          .eq('payment_intent_id', paymentIntentId);
        
        if (error) {
          console.error('Error updating refund status:', error);
        }
        
        break;
      }

      case 'charge.refund.updated': {
        const refund = event.data.object as Stripe.Refund;
        
        // Get the charge and payment intent
        const chargeId = refund.charge as string;
        const charge = await stripe.charges.retrieve(chargeId);
        const paymentIntentId = charge.payment_intent as string;
        
        // Update refund status
        try {
          const { error } = await serviceClient
            .from('purchases')
            .update({
              refund_status: refund.status,
              updated_at: new Date().toISOString(),
              refund_details: {
                refund_id: refund.id,
                status: refund.status,
                failure_reason: refund.failure_reason,
                amount: refund.amount
              }
            })
            .eq('payment_intent', paymentIntentId);
            
          if (error) {
            console.error('Error updating refund status:', error);
          }
        } catch (err) {
          console.error('Error processing refund update:', err);
        }
        
        break;
      }

      // PAYOUT EVENTS
      case 'payout.created':
      case 'payout.paid':
      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        
        const status = event.type === 'payout.paid' ? 'paid' :
                      event.type === 'payout.failed' ? 'failed' : 'pending';
        
        // Get seller account from connected account
        const { data: sellerData, error: sellerError } = await serviceClient
          .from('seller_accounts')
          .select('user_id')
          .eq('stripe_account_id', payout.destination)
          .single();
          
        if (sellerError) {
          console.error('Error finding seller for payout:', sellerError);
        }
        
        // Upsert payout record
        const { error } = await serviceClient
          .from('seller_payouts')
          .upsert({
            payout_id: payout.id,
            seller_account_id: payout.destination,
            user_id: sellerData?.user_id || null,
            amount: payout.amount,
            currency: payout.currency,
            status: status,
            arrival_date: payout.arrival_date ? 
              new Date(payout.arrival_date * 1000).toISOString() : null,
            failure_code: payout.failure_code || null,
            failure_message: payout.failure_message || null,
            created_at: new Date(payout.created * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'payout_id' });
          
        if (error) {
          console.error('Error recording payout:', error);
        }
        
        // TODO: Send notification to seller about payout status
        
        break;
      }

      // FRAUD & REVIEW EVENTS
      case 'radar.early_fraud_warning.created': {
        const fraudWarning = event.data.object as Stripe.Radar.EarlyFraudWarning;
        
        // Get the payment intent from the charge
        const charge = await stripe.charges.retrieve(fraudWarning.charge as string);
        const paymentIntentId = charge.payment_intent as string;
        
        // Record fraud warning
        try {
          const { error } = await serviceClient
            .from('fraud_warnings')
            .insert({
              warning_id: fraudWarning.id,
              payment_intent_id: paymentIntentId,
              charge_id: fraudWarning.charge,
              actionable: fraudWarning.actionable,
              fraud_type: fraudWarning.fraud_type,
              created_at: new Date().toISOString()
            });
            
          if (error) {
            console.error('Error recording fraud warning:', error);
          }
          
          // Update purchase status
          const { error: updateError } = await serviceClient
            .from('purchases')
            .update({
              fraud_warning: true,
              updated_at: new Date().toISOString()
            })
            .eq('payment_intent', paymentIntentId);
            
          if (updateError) {
            console.error('Error updating purchase fraud status:', updateError);
          }
        } catch (err) {
          console.error('Error processing fraud warning:', err);
        }
        
        // TODO: Send notification to admin about fraud warning
        
        break;
      }

      case 'review.opened':
      case 'review.closed': {
        const review = event.data.object as Stripe.Review;
        
        // Get the payment intent
        const paymentIntentId = review.payment_intent as string;
        
        // Check if review is closed based on event type
        const isClosed = event.type === 'review.closed';
        
        // Upsert review record
        try {
          const { error } = await serviceClient
            .from('payment_reviews')
            .upsert({
              review_id: review.id,
              payment_intent_id: paymentIntentId,
              reason: review.reason,
              status: isClosed ? 'closed' : 'open',
              outcome: isClosed ? review.reason : null,
              created_at: new Date(review.created * 1000).toISOString(),
              updated_at: new Date().toISOString()
            },
            { onConflict: 'review_id' });
            
          if (error) {
            console.error('Error recording review:', error);
          }
          
          // Update purchase status
          const { error: updateError } = await serviceClient
            .from('purchases')
            .update({
              review_status: isClosed ? 'closed' : 'open',
              updated_at: new Date().toISOString()
            })
            .eq('payment_intent', paymentIntentId);
            
          if (updateError) {
            console.error('Error updating purchase review status:', updateError);
          }
        } catch (err) {
          console.error('Error processing review:', err);
        }
        
        break;
      }
      
      default:
        // console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return handleApiError(error);
  }
} 