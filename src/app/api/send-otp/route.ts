import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, type } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: 'رقم الجوال أو الكود مفقود' },
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
        { success: false, message: result.error || 'فشل إرسال الرسالة' },
        { status: whatsappResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم الإرسال بنجاح',
    });
  } catch (error: any) {
    console.error('Error in send-otp API:', error);
    
    // التحقق من نوع الخطأ
    if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'خدمة الواتساب غير متاحة. شغّل start-whatsapp-service.bat',
          details: 'WhatsApp service is not running on port 3002'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'خطأ في الخادم', details: error.message },
      { status: 500 }
    );
  }
}
