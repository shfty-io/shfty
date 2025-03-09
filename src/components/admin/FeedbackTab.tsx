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
import { Badge } from '@/components/ui/badge';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { formatDate } from '../../utils/formatters';

interface FeedbackData {
  id: string;
  content: string;
  user_id: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface FeedbackTabProps {
  feedback: FeedbackData[];
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

export function FeedbackTab({ feedback, loading, onUpdateStatus }: FeedbackTabProps) {
  const getFeedbackStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">New</Badge>;
    
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'addressed') {
      return <Badge className="bg-green-500">Addressed</Badge>;
    } else if (statusLower === 'reviewed') {
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Reviewed</Badge>;
    } else {
      return <Badge variant="outline">New</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Feedback</CardTitle>
        <CardDescription>
          Review and respond to user feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingState colSpan={5} />
            ) : feedback && feedback.length > 0 ? (
              feedback.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.created_at || '')}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.user_id ? item.user_id.substring(0, 8) + '...' : 'Anonymous'}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate">{item.content}</div>
                  </TableCell>
                  <TableCell>{getFeedbackStatusBadge(item.status)}</TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onUpdateStatus(item.id, 'reviewed')}
                      disabled={item.status === 'reviewed' || item.status === 'addressed'}
                    >
                      Mark Reviewed
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onUpdateStatus(item.id, 'addressed')}
                      disabled={item.status === 'addressed'}
                    >
                      Mark Addressed
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState colSpan={5} message="No feedback found" />
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 