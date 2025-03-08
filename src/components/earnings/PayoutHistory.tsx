'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { formatCurrency } from './EarningsSummary';

export type PayoutData = {
  id: string;
  payout_id: string;
  seller_account_id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date?: string;
  created_at: string;
};

interface PayoutHistoryProps {
  payouts: PayoutData[];
  isLoading: boolean;
}

export function PayoutHistory({ payouts, isLoading }: PayoutHistoryProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string, label: string }> = {
      'paid': { variant: 'default', label: 'Paid' },
      'pending': { variant: 'outline', label: 'Pending' },
      'in_transit': { variant: 'outline', label: 'In Transit' },
      'failed': { variant: 'destructive', label: 'Failed' },
      'canceled': { variant: 'secondary', label: 'Canceled' },
    };
    
    const statusConfig = statusMap[status] || { variant: 'outline', label: status };
    
    return (
      <Badge variant={statusConfig.variant as any}>
        {statusConfig.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
        <CardDescription>
          Track your payouts to your bank account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payouts.length > 0 ? (
          <div className="rounded-md border">
            <div className="grid grid-cols-4 bg-muted px-4 py-3 text-sm font-medium">
              <div>Date</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Expected Arrival</div>
            </div>
            <div className="divide-y">
              {payouts.map((payout) => (
                <div key={payout.id} className="grid grid-cols-4 px-4 py-3 text-sm">
                  <div>{formatDate(payout.created_at)}</div>
                  <div>{formatCurrency(payout.amount, payout.currency)}</div>
                  <div>{getStatusBadge(payout.status)}</div>
                  <div>
                    {payout.arrival_date ? formatDate(payout.arrival_date) : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You don't have any payouts yet.
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Payouts are processed automatically. Once you make sales, your earnings will be deposited to your bank account according to your payout schedule.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 