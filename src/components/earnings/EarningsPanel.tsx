'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { EarningsSummary, EarningsSummaryData } from './EarningsSummary';
import { PayoutHistory, PayoutData } from './PayoutHistory';
import { PayoutSettings } from './PayoutSettings';

export function EarningsPanel() {
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [summary, setSummary] = useState<EarningsSummaryData>({
    totalPending: 0,
    totalPaid: 0,
    totalLifetime: 0,
    currency: 'usd',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Fetch payouts for this seller
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('seller_payouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (payoutsError) throw payoutsError;
        setPayouts(payoutsData || []);
        
        // Calculate earnings summary
        let totalPending = 0;
        let totalPaid = 0;
        
        (payoutsData || []).forEach(payout => {
          if (payout.status === 'paid') {
            totalPaid += payout.amount;
          } else if (payout.status === 'pending') {
            totalPending += payout.amount;
          }
        });
        
        setSummary({
          totalPending,
          totalPaid,
          totalLifetime: totalPending + totalPaid,
          currency: 'usd', // Default currency
        });
      } catch (error) {
        console.error('Error fetching payout data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Your Earnings</h2>
      <EarningsSummary data={summary} isLoading={isLoading} />
      <PayoutHistory payouts={payouts} isLoading={isLoading} />
      <PayoutSettings />
    </div>
  );
} 