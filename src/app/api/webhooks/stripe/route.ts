import { headers, cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient, createServiceClient } from '@/lib/server';
import { createExternalServiceError, handleApiError } from '@/lib/error-handler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
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

    // Use the service client instead, which bypasses RLS policies
    const supabase = createServiceClient();

    switch (event.type) {
      // ACCOUNT EVENTS
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        
        // Update seller account status
        const isComplete = account.details_submitted && account.charges_enabled;
        
        const { error } = await supabase
          .from('seller_accounts')
          .update({
            is_onboarded: isComplete,
            account_status: isComplete ? 'complete' : 'pending',
            last_webhook_update: new Date().toISOString(),
            account_details: {
              details_submitted: account.details_submitted,
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled
            }
          })
          .eq('stripe_account_id', account.id)
          .select();

        if (error) {
          console.error('Error updating seller account:', error);
          return createExternalServiceError('Supabase', 'Failed to update seller account');
        }
        
        break;
      }

      case 'account.application.deauthorized': {
        const account = event.data.object as unknown as Stripe.Account;
        
        // Update seller account status to disconnected
        const { error } = await supabase
          .from('seller_accounts')
          .update({
            is_onboarded: false,
            account_status: 'disconnected',
            last_webhook_update: new Date().toISOString()
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
        const { error } = await supabase
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
        
        // Extract metadata
        const productId = session.metadata?.product_id;
        const sellerId = session.metadata?.seller_id;
        const source = session.metadata?.source || 'direct';
        
        if (!productId || !sellerId) {
          console.error('Missing metadata in checkout session:', session.id, 'Metadata:', session.metadata);
          return NextResponse.json(
            { error: 'Missing metadata in checkout session' },
            { status: 400 }
          );
        }
        
        // Get customer information
        const customerId = session.customer as string;
        if (!customerId) {
          console.error('Missing customer ID in checkout session:', session.id);
          return NextResponse.json(
            { error: 'Missing customer ID in session' },
            { status: 400 }
          );
        }

        // Log session details for debugging
        console.log('Processing checkout session:', {
          id: session.id,
          payment_status: session.payment_status,
          customer: customerId,
          payment_intent: session.payment_intent,
          amount_total: session.amount_total
        });

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, github_username')
          .eq('stripe_customer_id', customerId)
          .limit(1);
          
        if (profileError || !profiles || profiles.length === 0) {
          console.error('Error fetching customer profile for customer ID:', customerId, 'Error:', profileError);
          return createExternalServiceError('Supabase', 'Failed to fetch customer profile');
        }
        
        const userId = profiles[0].user_id;
        const githubUsername = profiles[0].github_username || 'unknown';
        
        // Check if purchase already exists
        const { data: existingPurchase, error: checkError } = await supabase
          .from('purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .limit(1);
          
        if (checkError) {
          console.error('Error checking for existing purchase:', checkError);
        } else if (existingPurchase && existingPurchase.length > 0) {
          console.log('Purchase already exists, skipping insertion');
          break; // Skip to next case without error
        }
        
        // Prepare purchase record with proper typing
        interface PurchaseRecord {
          user_id: string;
          product_id: string;
          github_username: string;
          status: string;
          payment_intent?: string;
          amount_total?: number;
          source?: string;
          payment_details?: Record<string, any>;
        }
        
        const purchaseRecord: PurchaseRecord = {
          user_id: userId,
          product_id: productId,
          github_username: githubUsername,
          status: 'completed'
        };
        
        // Add optional fields if available
        if (session.payment_intent) {
          purchaseRecord.payment_intent = session.payment_intent.toString();
        }
        
        if (session.amount_total) {
          purchaseRecord.amount_total = session.amount_total;
        }
        
        if (source) {
          purchaseRecord.source = source;
        }
        
        // Add payment details
        if (session.payment_method_types) {
          purchaseRecord.payment_details = {
            payment_method_types: session.payment_method_types,
            currency: session.currency,
            customer_email: session.customer_details?.email,
            customer_name: session.customer_details?.name
          };
        }
        
        // Record the purchase with proper error logging
        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert(purchaseRecord);
          
        if (purchaseError) {
          console.error('Error recording purchase:', {
            error: purchaseError,
            code: purchaseError.code,
            details: purchaseError.details,
            hint: purchaseError.hint,
            message: purchaseError.message,
            record: purchaseRecord
          });
          return createExternalServiceError('Supabase', 'Failed to record purchase', {
            error_code: purchaseError.code,
            error_message: purchaseError.message
          });
        }
        
        // Log successful purchase
        console.log('Successfully recorded purchase:', {
          user_id: userId,
          product_id: productId,
          payment_intent: session.payment_intent
        });
        
        // Update product purchase count
        const { error: updateError } = await supabase.rpc('increment_purchase_count', {
          product_id: productId
        });
        
        if (updateError) {
          console.error('Error updating purchase count:', updateError);
          // Continue anyway as this is not critical
        }
        
        // Handle GitHub repository access if product has a GitHub repo
        try {
          const { data: product } = await supabase
            .from('products')
            .select('github_repo_url, github_token')
            .eq('id', productId)
            .single();
            
          if (product?.github_repo_url && product?.github_token && githubUsername) {
            // Parse GitHub URL
            const cleanUrl = product.github_repo_url.trim().replace(/\/$/, '');
            const githubUrl = new URL(cleanUrl.startsWith('https://') ? cleanUrl : `https://${cleanUrl}`);
            const parts = githubUrl.pathname.split('/').filter(Boolean);
            
            if (parts.length === 2) {
              const [owner, repo] = parts;
              
              // Add collaborator
              const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/collaborators/${githubUsername}`,
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
                await supabase
                  .from('repository_access')
                  .insert({
                    user_id: userId,
                    product_id: productId,
                    repository_url: product.github_repo_url,
                    access_key: githubUsername
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
          // Continue anyway, as the user can still access via the success page
        }
        
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update purchase status if it exists
        const { error } = await supabase
          .from('purchases')
          .update({
            status: 'succeeded',
            updated_at: new Date().toISOString(),
            payment_details: {
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              payment_method: paymentIntent.payment_method_types,
              payment_method_id: paymentIntent.payment_method as string
            }
          })
          .eq('payment_intent', paymentIntent.id);
        
        if (error) {
          console.error('Error updating payment status:', error);
          // Don't return error as this might be a duplicate event
        }
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update purchase status if it exists
        const { error } = await supabase
          .from('purchases')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
            failure_reason: paymentIntent.last_payment_error?.message,
            payment_details: {
              error_code: paymentIntent.last_payment_error?.code,
              error_message: paymentIntent.last_payment_error?.message,
              decline_code: paymentIntent.last_payment_error?.decline_code
            }
          })
          .eq('payment_intent', paymentIntent.id);
        
        if (error) {
          console.error('Error updating failed payment:', error);
        }
        
        // TODO: Send notification to buyer about failed payment
        
        break;
      }

      // DISPUTE & REFUND EVENTS
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        
        // Get the payment intent from the charge
        const charge = await stripe.charges.retrieve(dispute.charge as string);
        const paymentIntentId = charge.payment_intent as string;
        
        // Create dispute record
        try {
          const { error } = await supabase
            .from('disputes')
            .insert({
              dispute_id: dispute.id,
              payment_intent_id: paymentIntentId, 
              charge_id: dispute.charge,
              amount: dispute.amount,
              currency: dispute.currency,
              status: dispute.status,
              reason: dispute.reason,
              evidence_due_by: dispute.evidence_details?.due_by ? 
                new Date(dispute.evidence_details.due_by * 1000).toISOString() : null,
              created_at: new Date().toISOString()
            });
            
          if (error) {
            console.error('Error recording dispute:', error);
          }
          
          // Update purchase status
          const { error: updateError } = await supabase
            .from('purchases')
            .update({
              dispute_status: 'open',
              status: 'disputed',
              updated_at: new Date().toISOString()
            })
            .eq('payment_intent', paymentIntentId);
            
          if (updateError) {
            console.error('Error updating purchase dispute status:', updateError);
          }
        } catch (err) {
          console.error('Error processing dispute:', err);
        }
        
        // TODO: Send notification to seller and admin about dispute
        
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        // Get payment intent id
        const paymentIntentId = charge.payment_intent as string;
        
        // Update purchase status
        try {
          const { error } = await supabase
            .from('purchases')
            .update({
              status: charge.refunded ? 'refunded' : 'partially_refunded',
              refund_amount: charge.amount_refunded,
              updated_at: new Date().toISOString(),
              refund_details: {
                amount_refunded: charge.amount_refunded,
                is_full_refund: charge.refunded,
                refund_reason: charge.refunds?.data[0]?.reason || null
              }
            })
            .eq('payment_intent', paymentIntentId);
            
          if (error) {
            console.error('Error updating refund status:', error);
          }
        } catch (err) {
          console.error('Error processing refund:', err);
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
          const { error } = await supabase
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
        const { data: sellerData, error: sellerError } = await supabase
          .from('seller_accounts')
          .select('user_id')
          .eq('stripe_account_id', payout.destination)
          .single();
          
        if (sellerError) {
          console.error('Error finding seller for payout:', sellerError);
        }
        
        // Upsert payout record
        const { error } = await supabase
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
          const { error } = await supabase
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
          const { error: updateError } = await supabase
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
          const { error } = await supabase
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
          const { error: updateError } = await supabase
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