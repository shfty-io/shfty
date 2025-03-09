import React from 'react';
import { Badge } from '@/components/ui/badge';

export const getStatusBadge = (status: string) => {
  if (!status) return <Badge variant="outline">Unknown</Badge>;
  
  const statusLower = status.toLowerCase();
  
  if (['succeeded', 'complete', 'paid', 'active', 'approved'].includes(statusLower)) {
    return <Badge className="bg-green-500">Success</Badge>;
  } else if (['pending', 'processing', 'in_transit', 'transit', 'in_review'].includes(statusLower)) {
    return <Badge variant="outline" className="border-blue-500 text-blue-500">Pending</Badge>;
  } else if (['failed', 'canceled', 'cancelled', 'expired', 'dispute', 'disconnected', 'deleted', 'rejected'].includes(statusLower)) {
    return <Badge variant="destructive">Failed</Badge>;
  } else {
    return <Badge variant="outline">{status}</Badge>;
  }
}; 