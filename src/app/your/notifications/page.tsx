'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: {
    message?: string;
    affected_products?: Array<{
      id: string;
      name: string;
    }>;
    [key: string]: unknown;
  };
  status: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Use effect to fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [toast]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, status: 'read' } : n
      ));
      
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('status', 'unread');

      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    }
  };

  // Render notification based on type
  const renderNotification = (notification: Notification) => {
    switch (notification.type) {
      case 'github_token_expired':
        return (
          <Card key={notification.id} className={`mb-4 ${notification.status === 'unread' ? 'border-red-300' : ''}`}>
            <CardHeader>
              <CardTitle className="text-lg">GitHub Token Expired</CardTitle>
              <CardDescription>
                {new Date(notification.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Repository Access Issue</AlertTitle>
                <AlertDescription>
                  {notification.content.message}
                </AlertDescription>
              </Alert>
              
              {notification.content.affected_products && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Affected Products:</h4>
                  <ul className="list-disc list-inside">
                    {notification.content.affected_products.map((product) => (
                      <li key={product.id} className="text-sm">
                        {product.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => markAsRead(notification.id)}
                disabled={notification.status === 'read'}
              >
                {notification.status === 'read' ? 'Read' : 'Mark as Read'}
              </Button>
              <Link href="/your/setup">
                <Button variant="default">Update Token</Button>
              </Link>
            </CardFooter>
          </Card>
        );
      
      default:
        return (
          <Card key={notification.id} className={`mb-4 ${notification.status === 'unread' ? 'border-blue-300' : ''}`}>
            <CardHeader>
              <CardTitle className="text-lg">Notification</CardTitle>
              <CardDescription>
                {new Date(notification.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{JSON.stringify(notification.content)}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => markAsRead(notification.id)}
                disabled={notification.status === 'read'}
              >
                {notification.status === 'read' ? 'Read' : 'Mark as Read'}
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on important marketplace events
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={markAllAsRead}
          disabled={!notifications.some(n => n.status === 'unread')}
        >
          Mark All as Read
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          You don&apos;t have any notifications yet.
        </div>
      ) : (
        <div>
          {notifications.map(renderNotification)}
        </div>
      )}
    </div>
  );
} 