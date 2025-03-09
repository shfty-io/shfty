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
import { formatDate } from '../../utils/formatters';
import { getStatusBadge } from './statusBadges';

interface PaymentData {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  github_username: string;
  created_at: string | null;
}

interface PaymentsTabProps {
  payments: PaymentData[];
  loading: boolean;
}

export function PaymentsTab({ payments, loading }: PaymentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Purchases</CardTitle>
        <CardDescription>
          Monitor recent product purchases and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingState colSpan={5} />
            ) : payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.created_at || '')}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.github_username || 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.product_id ? payment.product_id.substring(0, 12) + '...' : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={5} message="No purchases found" />
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 