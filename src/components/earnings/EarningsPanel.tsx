'use client';

import { useState, useEffect } from 'react';
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
        // Use API endpoint instead of direct Supabase query
        const response = await fetch('/api/user/payouts');
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        setPayouts(data.payouts || []);
        setSummary(data.summary || {
          totalPending: 0,
          totalPaid: 0,
          totalLifetime: 0,
          currency: 'usd',
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