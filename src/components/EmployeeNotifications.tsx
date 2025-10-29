'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  subscribeToEmployeeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type EmployeeNotification,
} from '@/lib/firebase-data';
import { playNotificationSound } from '@/lib/notification-sounds';

interface EmployeeNotificationsProps {
  employeeId: string;
  employeeName: string;
}

export default function EmployeeNotifications({ employeeId, employeeName }: EmployeeNotificationsProps) {
  const [notifications, setNotifications] = useState<EmployeeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => {
    if (!employeeId) return;

    console.log(`🔔 Setting up notifications for employee: ${employeeName} (${employeeId})`);

    // الاستماع للإشعارات
    const unsubscribe = subscribeToEmployeeNotifications(
      employeeId,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        const unread = updatedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);

        // تشغيل صوت عند وصول إشعار جديد
        if (unread > previousCount && previousCount > 0) {
          console.log('🔊 إشعار جديد! تشغيل الصوت...');
          playNotificationSound('new-request');
          
          // إظهار browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const latestNotification = updatedNotifications.find(n => !n.read);
            if (latestNotification) {
              new Notification(latestNotification.title, {
                body: latestNotification.message,
                icon: '/images/logo.png',
                badge: '/images/logo.png',
              });
            }
          }
        }
        setPreviousCount(unread);
      },
      (error) => {
        console.error('❌ Error listening to notifications:', error);
      }
    );

    return () => unsubscribe();
  }, [employeeId, employeeName, previousCount]);

  // طلب إذن الإشعارات
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(employeeId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عاجل';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'عادي';
      default:
        return '';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-slate-800 border-slate-700" align="end">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">الإشعارات</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                تعليم الكل كمقروء
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-slate-700/50 transition-colors ${
                  !notification.read ? 'bg-blue-500/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white text-sm">
                        {notification.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                          notification.priority
                        )}`}
                      >
                        {getPriorityLabel(notification.priority)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>
                        {new Date(notification.createdAt).toLocaleString('ar-EG', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {notification.roomNumber && (
                        <span className="text-blue-400">غرفة {notification.roomNumber}</span>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
