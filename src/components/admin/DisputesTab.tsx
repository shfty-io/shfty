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

interface DisputeData {
  id: string;
  dispute_id: string;
  payment_intent_id: string;
  status: string;
  reason: string;
  amount: number;
  currency: string;
  evidence_due_by: string;
  created_at: string;
}

interface DisputesTabProps {
  disputes: DisputeData[];
  loading: boolean;
}

export function DisputesTab({ disputes, loading }: DisputesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispute Management</CardTitle>
        <CardDescription>
          Handle payment disputes and chargeback claims
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Dispute ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Evidence Due</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingState colSpan={7} />
            ) : disputes.length > 0 ? (
              disputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>{formatDate(dispute.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {dispute.dispute_id ? dispute.dispute_id.substring(0, 12) + '...' : 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(dispute.amount, dispute.currency)}</TableCell>
                  <TableCell>{dispute.reason}</TableCell>
                  <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                  <TableCell>
                    {dispute.evidence_due_by ? formatDate(dispute.evidence_due_by) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Respond
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={7} message="No disputes found" />
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 