import { createServiceClient } from '@/lib/server';
import { NextResponse } from 'next/server';

// This endpoint will be called by a scheduled job (e.g. Vercel Cron)
export async function GET(request: Request) {
  // Verify this is an authorized request from the cron job service
  // This is a simple example - in production, use proper authentication
  const authHeader = request.headers.get('Authorization');
  const expectedToken = process.env.CRON_SECRET;

  console.log("CRON_SECRET from env:", expectedToken ? "set" : "not set");
  console.log("Auth header provided:", authHeader ? "yes" : "no");

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create Supabase client with service role
    const supabase = createServiceClient();

    // Get all seller accounts with GitHub tokens - try a more basic query first
    const { data: allSellers, error: allError } = await supabase
      .from('seller_accounts')
      .select('*');
    
    if (allError) {
      console.error('Error fetching all sellers:', allError);
      return NextResponse.json(
        { error: 'Failed to fetch sellers' },
        { status: 500 }
      );
    }
    
    console.log(`Found ${allSellers?.length || 0} total seller accounts`);
    
    // Filter sellers with tokens manually to avoid query issues
    const sellersWithTokens = allSellers?.filter(seller => 
      seller.github_token !== null && seller.github_token !== undefined && seller.github_token !== ''
    ) || [];
    
    console.log(`Found ${sellersWithTokens.length} sellers with tokens after filtering`);

    if (sellersWithTokens.length === 0) {
      return NextResponse.json({ message: "No sellers with GitHub tokens found", 
        totalSellers: allSellers?.length || 0 
      });
    }

    // Process each seller's token
    const notifications = [];

    for (const seller of sellersWithTokens) {
      if (!seller.github_token) continue;

      // Check if the token is valid by making a test API call
      try {
        console.log(`Verifying token for seller ${seller.id}`);
        const scopeResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${seller.github_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          },
        });

        const isValid = scopeResponse.ok;
        const tokenStatus = isValid ? 'valid' : 'expired';
        console.log(`Token status for seller ${seller.id}: ${tokenStatus}`);
        
        // Update seller_accounts with token status
        const { error: updateError } = await supabase
          .from('seller_accounts')
          .update({
            token_status: tokenStatus,
            token_last_verified: new Date().toISOString()
          })
          .eq('id', seller.id);
          
        if (updateError) {
          console.error(`Error updating seller ${seller.id}:`, updateError);
        } else {
          console.log(`Successfully updated seller ${seller.id} token status`);
        }

        // If token is expired, prepare notification
        if (!isValid) {
          // Get the seller's email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, email_notifications_enabled')
            .eq('id', seller.user_id)
            .single();

          if (profile?.email && profile.email_notifications_enabled) {
            // Get seller's products
            const { data: products } = await supabase
              .from('products')
              .select('id, name, byline')
              .eq('user_id', seller.user_id)
              .eq('status', 'approved')
              .not('github_repo_url', 'is', null);
            
            // If they have active products using GitHub, we need to notify them
            if (products && products.length > 0) {
              notifications.push({
                email: profile.email,
                user_id: seller.user_id,
                products: products,
                token_status: tokenStatus
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error checking token for seller ${seller.id}:`, error);
      }
    }

    // Send notifications to sellers with expired tokens
    if (notifications.length > 0) {
      for (const notification of notifications) {
        // In a real implementation, you'd use your email service here
        console.log(`Sending expired token notification to ${notification.email}`);
        
        try {
          // Store the notification in the database
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: notification.user_id,
              type: 'github_token_expired',
              content: {
                message: 'Your GitHub token has expired. Please update it to ensure buyers can access your repositories.',
                affected_products: notification.products.map(p => ({ id: p.id, name: p.name }))
              },
              status: 'unread',
              created_at: new Date().toISOString()
            });
            
          if (notifError) {
            console.error('Error creating notification:', notifError);
          }
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    }

    return NextResponse.json({ 
      message: `Verified ${sellersWithTokens.length} GitHub tokens`,
      expired: notifications.length,
      totalSellers: allSellers?.length
    });
  } catch (error) {
    console.error('Error in GitHub token verification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify GitHub tokens' },
      { status: 500 }
    );
  }
} 