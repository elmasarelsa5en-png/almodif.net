import { NextResponse } from 'next/server';
import { getOrders, addOrder, findMenuItemById } from '@/lib/restaurant-db';

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerName, roomNumber, totalAmount, paymentMethod, notes } = body;

    if (!items || !customerName || !totalAmount || !paymentMethod) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Ensure menu items exist
    for (const item of items) {
      if (!findMenuItemById(item.menuItem.id)) {
        return NextResponse.json({ success: false, message: `Menu item with id ${item.menuItem.id} not found` }, { status: 400 });
      }
    }

    const newOrder = addOrder({ items, customerName, roomNumber, totalAmount, paymentMethod, notes, status: 'pending' });
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 });
  }
}