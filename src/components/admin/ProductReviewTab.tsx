import { useState } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getStatusBadge } from './statusBadges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';

interface ProductData {
  id: string;
  user_id: string;
  name: string;
  byline: string;
  short_description: string;
  price: number;
  image_urls: string[] | null;
  github_repo_url: string | null;
  status: string;
  created_at: string;
  user: {
    avatar_url: string | null;
    full_name: string | null;
  };
}

interface ProductReviewTabProps {
  products: ProductData[];
  loading: boolean;
  onApproveProduct: (id: string) => Promise<void>;
  onRejectProduct: (id: string, reason: string) => Promise<void>;
}

export function ProductReviewTab({ products, loading, onApproveProduct, onRejectProduct }: ProductReviewTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenRejectDialog = (product: ProductData) => {
    setSelectedProduct(product);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) return;
    
    setIsProcessing(true);
    try {
      await onRejectProduct(selectedProduct.id, rejectionReason);
      setIsRejectDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting product:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingProducts = products.filter(product => 
    product.status.toLowerCase() === 'in_review'
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Product Submissions</CardTitle>
          <CardDescription>
            Review and approve product submissions from sellers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitted</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GitHub Repo</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <LoadingState colSpan={7} />
              ) : pendingProducts.length > 0 ? (
                pendingProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{formatDate(product.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={product.user?.avatar_url || ''} alt={product.user?.full_name || 'Seller'} />
                          <AvatarFallback>{(product.user?.full_name || 'User').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[80px]">{product.user?.full_name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{product.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {product.short_description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      {product.github_repo_url ? (
                        <a 
                          href={product.github_repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Repo
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => onApproveProduct(product.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleOpenRejectDialog(product)}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyState colSpan={7} message="No products pending review" />
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting &quot;{selectedProduct?.name}&quot;. This will be sent to the seller.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Reject Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 