import { NextResponse } from 'next/server';
import { updateLaundryRequestStatus, deleteLaundryRequest } from '@/lib/laundry-db';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });
    }

    const updatedRequest = updateLaundryRequestStatus(id, status);

    if (!updatedRequest) {
      return NextResponse.json({ success: false, message: 'Laundry request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update laundry request' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const success = deleteLaundryRequest(id);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Laundry request not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Laundry request deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete laundry request' }, { status: 500 });
  }
}