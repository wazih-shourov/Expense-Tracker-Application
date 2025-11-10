
import React from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationsDropdown = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return '💰';
      case 'transaction_added':
        return '➕';
      case 'transaction_deleted':
        return '🗑️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return 'bg-red-50 border-red-200';
      case 'transaction_added':
        return 'bg-green-50 border-green-200';
      case 'transaction_deleted':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 bg-background border border-border shadow-lg p-0">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs h-6 px-2"
              >
                <CheckCheck size={14} className="mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96 w-full">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`
                    mb-2 p-3 rounded-md cursor-pointer transition-colors group
                    ${!notification.is_read ? getNotificationColor(notification.type) : 'hover:bg-accent'}
                    ${!notification.is_read ? 'border-l-4' : ''}
                  `}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium truncate ${!notification.is_read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
