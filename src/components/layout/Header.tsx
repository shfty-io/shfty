import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/client';
import { Bell } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  [key: string]: unknown;
}

const Header = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user] = useState<User | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'unread')
        .order('created_at', { ascending: false });
        
      if (data) {
        setUnreadCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div>
      {/* Add notification bell */}
      {user && (
        <Link 
          href="/your/notifications" 
          className="relative mr-2 p-2 rounded-full hover:bg-accent"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>
      )}
    </div>
  );
};

export default Header; 