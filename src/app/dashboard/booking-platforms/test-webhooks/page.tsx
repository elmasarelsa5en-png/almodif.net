'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Building2, 
  Plane, 
  MapPin,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cn } from '@/lib/utils';

export default function WebhookTestPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('booking');
  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const platforms = [
    {
      id: 'booking',
      name: 'Booking.com',
      icon: Globe,
      color: 'from-blue-500 to-blue-600',
      webhook: '/api/webhooks/booking',
      sampleData: {
        reservation_id: 'BKG' + Math.floor(Math.random() * 100000),
        customer_name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+966551234567',
        room_type: 'Deluxe Room',
        room_id: '201',
        check_in: '2025-10-' + (20 + Math.floor(Math.random() * 10)),
        check_out: '2025-10-' + (25 + Math.floor(Math.random() * 5)),
        nights: 5,
        total_price: 2500,
        commission: 375,
        currency: 'SAR',
        number_of_guests: 2,
        special_requests: 'Late check-in requested',
        status: 'confirmed'
      }
    },
    {
      id: 'almosafer',
      name: 'المسافر',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      webhook: '/api/webhooks/almosafer',
      sampleData: {
        booking_reference: 'ALM' + Math.floor(Math.random() * 100000),
        guest_name: 'محمد أحمد السعيد',
        email: 'mohammed@email.com',
        mobile: '+966559876543',
        room_type: 'جناح فاخر',
        unit_id: '305',
        checkin_date: '2025-10-' + (20 + Math.floor(Math.random() * 10)),
        checkout_date: '2025-10-' + (25 + Math.floor(Math.random() * 5)),
        number_of_nights: 6,
        total_amount: 3600,
        commission_amount: 540,
        adults: 2,
        children: 1,
        special_requests: 'غرفة بإطلالة على البحر'
      }
    },
    {
      id: 'agoda',
      name: 'Agoda',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
      webhook: '/api/webhooks/agoda',
      sampleData: {
        BookingId: 'AGD' + Math.floor(Math.random() * 100000),
        GuestName: 'Emma Watson',
        FirstName: 'Emma',
        LastName: 'Watson',
        Email: 'emma.watson@email.com',
        Phone: '+966551112233',
        RoomType: 'Superior Suite',
        RoomId: '102',
        CheckInDate: '2025-10-' + (20 + Math.floor(Math.random() * 10)),
        CheckOutDate: '2025-10-' + (25 + Math.floor(Math.random() * 5)),
        Nights: 3,
        TotalAmount: 1800,
        Commission: 270,
        Currency: 'SAR',
        NumberOfGuests: 2,
        SpecialRequest: 'Extra pillows please'
      }
    },
    {
      id: 'airport',
      name: 'المطار',
      icon: Plane,
      color: 'from-orange-500 to-orange-600',
      webhook: '/api/webhooks/airport',
      sampleData: {
        confirmation_number: 'APT' + Math.floor(Math.random() * 100000),
        passenger_name: 'عبدالله سعيد',
        email: 'abdullah@email.com',
        phone: '+966554445566',
        room_number: '401',
        unit_id: '401',
        checkin: '2025-10-' + (20 + Math.floor(Math.random() * 10)),
        checkout: '2025-10-' + (21 + Math.floor(Math.random() * 2)),
        nights: 1,
        total_price: 500,
        commission: 50,
        guests: 1,
        flight_number: 'SV123',
        terminal: 'T1',
        notes: 'Transit passenger'
      }
    },
    {
      id: 'expedia',
      name: 'Expedia',
      icon: Globe,
      color: 'from-yellow-500 to-yellow-600',
      webhook: '/api/webhooks/expedia',
      sampleData: {
        itinerary_id: 'EXP' + Math.floor(Math.random() * 100000),
        confirmation_number: 'EXP' + Math.floor(Math.random() * 100000),
        primary_contact: {
          name: 'David Miller',
          email: 'david.miller@email.com',
          phone: '+966557778899'
        },
        room_type: {
          name: 'Executive Room',
          id: '303'
        },
        check_in_date: '2025-10-' + (20 + Math.floor(Math.random() * 10)),
        check_out_date: '2025-10-' + (25 + Math.floor(Math.random() * 5)),
        number_of_nights: 4,
        total_amount: 2200,
        currency: 'SAR',
        number_of_adults: 2,
        number_of_children: 0,
        special_requests: 'King size bed'
      }
    },
    {
      id: 'airbnb',
      name: 'Airbnb',
      icon: Building2,
      color: 'from-pink-500 to-pink-600',
      webhook: '/api/webhooks/airbnb',
      sampleData: {
        confirmation_code: 'ABB' + Math.floor(Math.random() * 100000),
        guest: {
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+966556667788'
        },
        listing: {
          name: 'Luxury Apartment',
          id: '404'
        },
        start_date: '2025-10-' + (20 + Math.floor(Math.random() * 10)),
        end_date: '2025-10-' + (25 + Math.floor(Math.random() * 5)),
        nights: 7,
        listing_price: 4200,
        listing_currency: 'SAR',
        number_of_guests: 3,
        guest_note: 'Traveling with family'
      }
    }
  ];

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  const handleSendWebhook = async () => {
    if (!selectedPlatformData) return;

    setSending(true);
    setLastResponse(null);

    try {
      // Simulate sending webhook
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real scenario, this would call the API
      // const response = await fetch(selectedPlatformData.webhook, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(selectedPlatformData.sampleData)
      // });
      // const data = await response.json();

      // Simulate success response
      const mockResponse = {
        success: true,
        bookingId: `${selectedPlatform}-${Date.now()}`,
        bookingNumber: selectedPlatformData.sampleData.reservation_id || 
                       selectedPlatformData.sampleData.booking_reference ||
                       selectedPlatformData.sampleData.BookingId ||
                       selectedPlatformData.sampleData.confirmation_number,
        message: 'تم استلام الحجز بنجاح'
      };

      setLastResponse(mockResponse);

      // Save to localStorage to simulate database
      const existingBookings = JSON.parse(localStorage.getItem('platform_bookings') || '[]');
      const newBooking = {
        ...selectedPlatformData.sampleData,
        id: mockResponse.bookingId,
        platform: selectedPlatform,
        receivedAt: new Date().toISOString()
      };
      existingBookings.push(newBooking);
      localStorage.setItem('platform_bookings', JSON.stringify(existingBookings));

      alert(`✅ تم إرسال الحجز بنجاح!\nرقم الحجز: ${mockResponse.bookingNumber}\n\nيمكنك الآن رؤيته في صفحة "منصات الحجز"`);

    } catch (error) {
      setLastResponse({
        success: false,
        error: 'فشل في إرسال الحجز',
        message: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6" dir="rtl">
        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-400" />
              اختبار Webhooks
            </h1>
            <p className="text-white/60 mt-1">محاكاة استقبال الحجوزات من المنصات المختلفة</p>
          </div>

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="space-y-2 text-white/80">
                  <h4 className="font-bold text-white text-lg">كيف يعمل النظام:</h4>
                  <ol className="space-y-1 text-sm list-decimal list-inside">
                    <li>العميل يحجز من خلال إحدى المنصات (Booking.com، Agoda، المسافر، إلخ)</li>
                    <li>المنصة ترسل Webhook إلى التطبيق تلقائياً</li>
                    <li>التطبيق يستقبل البيانات ويحفظها في قاعدة البيانات</li>
                    <li>يظهر الحجز مباشرة في صفحة "منصات الحجز"</li>
                    <li>يتم إرسال إشعار للموظفين</li>
                  </ol>
                  <p className="pt-2 text-yellow-300">
                    <strong>ملاحظة:</strong> هذه الصفحة للتجربة والاختبار فقط. في الواقع، الحجوزات ستأتي تلقائياً من المنصات.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">اختر المنصة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      selectedPlatform === platform.id
                        ? "bg-gradient-to-br " + platform.color + " border-white/50"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    )}
                  >
                    <platform.icon className="w-8 h-8 text-white mx-auto mb-2" />
                    <div className="text-white text-sm font-medium text-center">{platform.name}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sample Data Display */}
          {selectedPlatformData && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>بيانات الحجز التجريبية</span>
                  <Badge className={cn("bg-gradient-to-r", selectedPlatformData.color, "text-white border-none")}>
                    {selectedPlatformData.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-xs">
                    {JSON.stringify(selectedPlatformData.sampleData, null, 2)}
                  </pre>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <Button
                    onClick={handleSendWebhook}
                    disabled={sending}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        إرسال الحجز
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-white/60">
                    Webhook URL: <span className="text-blue-400">{selectedPlatformData.webhook}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Display */}
          {lastResponse && (
            <Card className={cn(
              "border-2",
              lastResponse.success 
                ? "bg-green-900/20 border-green-500/50" 
                : "bg-red-900/20 border-red-500/50"
            )}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {lastResponse.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      نجح الإرسال
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      فشل الإرسال
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4">
                  <pre className={cn(
                    "text-xs",
                    lastResponse.success ? "text-green-400" : "text-red-400"
                  )}>
                    {JSON.stringify(lastResponse, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
