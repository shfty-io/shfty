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

interface ConnectedAccountData {
  id: string;
  user_id: string;
  stripe_account_id: string | null;
  is_onboarded: boolean;
  account_status: string;
  last_webhook_update?: string;
  created_at: string;
  updated_at?: string;
  email?: string;
  name?: string;
}

interface ConnectedAccountsTabProps {
  connectedAccounts: ConnectedAccountData[];
  loading: boolean;
  onDeleteAccount: (accountId: string | null) => Promise<void>;
  onSyncAccounts: () => Promise<void>;
}

export function ConnectedAccountsTab({ 
  connectedAccounts, 
  loading, 
  onDeleteAccount,
  onSyncAccounts
}: ConnectedAccountsTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Connected Stripe Accounts</CardTitle>
          <CardDescription>
            Manage seller Stripe connected accounts
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onSyncAccounts}
          >
            Sync Stripe Accounts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Onboarded</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingState colSpan={7} />
            ) : connectedAccounts?.length > 0 ? (
              connectedAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono text-xs">
                    {account.stripe_account_id ? account.stripe_account_id.substring(0, 12) + '...' : 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {account.user_id ? account.user_id.substring(0, 8) + '...' : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(account.account_status)}</TableCell>
                  <TableCell>{account.is_onboarded ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {account.last_webhook_update ? formatDate(account.last_webhook_update) : 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(account.created_at)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDeleteAccount(account.stripe_account_id)}
                      disabled={!account.stripe_account_id}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={7} message="No connected accounts found" />
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 