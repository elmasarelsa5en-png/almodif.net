import { NextRequest, NextResponse } from 'next/server';
import * as NotificationService from '@/lib/notification-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = parseInt(searchParams.get('since') || '0');

    console.log('📡 API: Fetching notifications since:', new Date(since).toLocaleString());

    // Get smart notifications from the service
    const notifications = NotificationService.getSmartNotifications();

    // Filter notifications that are newer than the 'since' timestamp
    const newNotifications = notifications.filter(notification =>
      notification.timestamp > since
    );

    console.log(`📡 API: Found ${newNotifications.length} new notifications out of ${notifications.length} total`);

    // Return the response
    return NextResponse.json({
      success: true,
      notifications: newNotifications,
      timestamp: Date.now(),
      total: notifications.length
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();

    console.log('📡 API: Received notification to broadcast:', notification);

    // Add the notification to the service (this will trigger sync across devices)
    const addedNotification = NotificationService.addSmartNotification(notification);

    return NextResponse.json({
      success: true,
      notification: addedNotification,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ API Error posting notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to post notification',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}