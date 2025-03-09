import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusBadge } from './statusBadges';

interface PayoutData {
  id: string;
  payout_id: string;
  seller_account_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date?: string;
  created_at: string;
}

interface PayoutsTabProps {
  payouts: PayoutData[];
  loading: boolean;
}

export function PayoutsTab({ payouts, loading }: PayoutsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seller Payouts</CardTitle>
        <CardDescription>
          Track payouts to sellers&apos; bank accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payout ID</TableHead>
              <TableHead>Seller Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingState colSpan={7} />
            ) : payouts.length > 0 ? (
              payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>{formatDate(payout.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {payout.payout_id ? payout.payout_id.substring(0, 12) + '...' : 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {payout.seller_account_id ? payout.seller_account_id.substring(0, 12) + '...' : 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(payout.amount, payout.currency)}</TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                  <TableCell>
                    {payout.arrival_date ? formatDate(payout.arrival_date) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={7} message="No payouts found" />
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 