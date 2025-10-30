import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, type } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Missing phone or code' },
        { status: 400 }
      );
    }

    // إرسال الطلب إلى خادم WhatsApp
    const whatsappResponse = await fetch('http://localhost:3002/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, code, type: type || 'verification' }),
    });

    const result = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      return NextResponse.json(
        { error: result.error || 'Failed to send OTP' },
        { status: whatsappResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error: any) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
