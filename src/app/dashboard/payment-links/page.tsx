'use client';

import { useState, useEffect } from 'react';
import { 
  Link2, 
  Plus, 
  Copy, 
  Share2, 
  CheckCircle, 
  Clock, 
  XCircle,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  CreditCard,
  Smartphone,
  Building2,
  Calendar,
  QrCode,
  Download,
  Send,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'active' | 'paid' | 'expired' | 'cancelled';
  paymentMethods: ('apple-pay' | 'samsung-pay' | 'bank-transfer' | 'credit-card')[];
  link: string;
  qrCode: string;
  createdAt: string;
  expiresAt?: string;
  paidAt?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  bookingId?: string;
  notes?: string;
}

export default function PaymentLinksPage() {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'SAR',
    paymentMethods: [] as string[],
    expiryDays: '7',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingId: '',
    notes: ''
  });

  useEffect(() => {
    loadPaymentLinks();
  }, []);

  const loadPaymentLinks = () => {
    const saved = localStorage.getItem('payment-links');
    if (saved) {
      setPaymentLinks(JSON.parse(saved));
    }
  };

  const savePaymentLinks = (links: PaymentLink[]) => {
    localStorage.setItem('payment-links', JSON.stringify(links));
    setPaymentLinks(links);
  };

  const generatePaymentLink = () => {
    const id = `PL${Date.now()}`;
    const baseUrl = window.location.origin;
    return `${baseUrl}/pay/${id}`;
  };

  const generateQRCode = (link: string) => {
    // في التطبيق الحقيقي، استخدم مكتبة QR Code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  const createPaymentLink = () => {
    if (!formData.title || !formData.amount) {
      alert('الرجاء إدخال العنوان والمبلغ');
      return;
    }

    const link = generatePaymentLink();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiryDays));

    const newLink: PaymentLink = {
      id: `PL${Date.now()}`,
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      status: 'active',
      paymentMethods: formData.paymentMethods as any,
      link,
      qrCode: generateQRCode(link),
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      bookingId: formData.bookingId,
      notes: formData.notes
    };

    savePaymentLinks([...paymentLinks, newLink]);
    
    alert('✅ تم إنشاء رابط الدفع بنجاح');

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      currency: 'SAR',
      paymentMethods: [],
      expiryDays: '7',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      bookingId: '',
      notes: ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ تم نسخ الرابط إلى الحافظة');
  };

  const shareViaWhatsApp = (link: PaymentLink) => {
    const message = `
مرحباً ${link.customerName || 'عزيزي العميل'}

📝 ${link.title}
💰 المبلغ: ${link.amount} ${link.currency}
${link.description ? `\n📋 ${link.description}` : ''}

🔗 رابط الدفع:
${link.link}

✅ طرق الدفع المتاحة:
${link.paymentMethods.includes('apple-pay') ? '🍎 Apple Pay\n' : ''}${link.paymentMethods.includes('samsung-pay') ? '📱 Samsung Pay\n' : ''}${link.paymentMethods.includes('credit-card') ? '💳 بطاقة ائتمان\n' : ''}${link.paymentMethods.includes('bank-transfer') ? '🏦 تحويل بنكي\n' : ''}
⏰ صالح حتى: ${link.expiresAt ? new Date(link.expiresAt).toLocaleDateString('ar-EG') : 'غير محدد'}

شكراً لك! 🙏
    `.trim();

    const whatsappUrl = `https://wa.me/${link.customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'expired': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'paid': return 'مدفوع';
      case 'expired': return 'منتهي';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const filteredLinks = paymentLinks.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || link.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: paymentLinks.length,
    active: paymentLinks.filter(l => l.status === 'active').length,
    paid: paymentLinks.filter(l => l.status === 'paid').length,
    totalAmount: paymentLinks.filter(l => l.status === 'paid').reduce((sum, l) => sum + l.amount, 0)
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Link2 className="w-10 h-10 text-indigo-600" />
            روابط الدفع
          </h1>
          <p className="text-gray-600 mt-2">إنشاء وإدارة روابط الدفع الاحترافية</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg">
              <Plus className="w-5 h-5 ml-2" />
              إنشاء رابط جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Link2 className="w-6 h-6 text-indigo-600" />
                إنشاء رابط دفع جديد
              </DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الدفع لإنشاء رابط احترافي
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* العنوان */}
              <div>
                <Label>العنوان *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: دفع حجز غرفة 201"
                  dir="rtl"
                />
              </div>

              {/* الوصف */}
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تفاصيل إضافية عن الدفع..."
                  dir="rtl"
                  rows={3}
                />
              </div>

              {/* المبلغ والعملة */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المبلغ *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>العملة</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                      <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* طرق الدفع */}
              <div>
                <Label className="mb-2 block">طرق الدفع المتاحة *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'apple-pay', label: 'Apple Pay', icon: Smartphone },
                    { value: 'samsung-pay', label: 'Samsung Pay', icon: Smartphone },
                    { value: 'credit-card', label: 'بطاقة ائتمان', icon: CreditCard },
                    { value: 'bank-transfer', label: 'تحويل بنكي', icon: Building2 }
                  ].map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => {
                          const methods = formData.paymentMethods.includes(method.value)
                            ? formData.paymentMethods.filter(m => m !== method.value)
                            : [...formData.paymentMethods, method.value];
                          setFormData({ ...formData, paymentMethods: methods });
                        }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                          formData.paymentMethods.includes(method.value)
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* معلومات العميل */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">معلومات العميل (اختياري)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم العميل</Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="الاسم الكامل"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="966xxxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* إعدادات إضافية */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>صلاحية الرابط (أيام)</Label>
                  <Select value={formData.expiryDays} onValueChange={(value) => setFormData({ ...formData, expiryDays: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">يوم واحد</SelectItem>
                      <SelectItem value="3">3 أيام</SelectItem>
                      <SelectItem value="7">7 أيام</SelectItem>
                      <SelectItem value="14">14 يوم</SelectItem>
                      <SelectItem value="30">30 يوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>رقم الحجز (اختياري)</Label>
                  <Input
                    value={formData.bookingId}
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    placeholder="BK-12345"
                  />
                </div>
              </div>

              {/* ملاحظات */}
              <div>
                <Label>ملاحظات داخلية</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات لن تظهر للعميل..."
                  dir="rtl"
                  rows={2}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={createPaymentLink}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                >
                  <Link2 className="w-5 h-5 ml-2" />
                  إنشاء الرابط
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الروابط</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Link2 className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">روابط نشطة</p>
                <p className="text-3xl font-bold text-blue-700">{stats.active}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">تم الدفع</p>
                <p className="text-3xl font-bold text-green-700">{stats.paid}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-200 bg-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600">المبلغ المحصل</p>
                <p className="text-3xl font-bold text-indigo-700">{stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-indigo-500">SAR</p>
              </div>
              <DollarSign className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث عن رابط..."
                className="pr-10"
                dir="rtl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Links List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLinks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد روابط دفع</h3>
              <p className="text-gray-500 mb-6">ابدأ بإنشاء رابط دفع احترافي</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-blue-600"
              >
                <Plus className="w-5 h-5 ml-2" />
                إنشاء رابط جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredLinks.map(link => (
            <Card key={link.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{link.title}</h3>
                      <Badge className={cn("flex items-center gap-1", getStatusColor(link.status))}>
                        {getStatusIcon(link.status)}
                        {getStatusText(link.status)}
                      </Badge>
                    </div>
                    
                    {link.description && (
                      <p className="text-gray-600 mb-3">{link.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-bold">{link.amount} {link.currency}</span>
                      </div>
                      
                      {link.customerName && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>👤 {link.customerName}</span>
                        </div>
                      )}
                      
                      {link.bookingId && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{link.bookingId}</span>
                        </div>
                      )}

                      {link.expiresAt && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>صالح حتى: {new Date(link.expiresAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      )}
                    </div>

                    {/* Payment Methods */}
                    <div className="flex gap-2 mb-4">
                      {link.paymentMethods.map(method => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method === 'apple-pay' && '🍎 Apple Pay'}
                          {method === 'samsung-pay' && '📱 Samsung Pay'}
                          {method === 'credit-card' && '💳 بطاقة'}
                          {method === 'bank-transfer' && '🏦 تحويل'}
                        </Badge>
                      ))}
                    </div>

                    {/* Link */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                      <code className="flex-1 text-sm text-gray-600 truncate" dir="ltr">{link.link}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(link.link)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="mr-6 flex flex-col items-center gap-2">
                    <img src={link.qrCode} alt="QR Code" className="w-24 h-24 border-2 border-gray-200 rounded-lg" />
                    <Button size="sm" variant="outline" className="text-xs">
                      <Download className="w-3 h-3 ml-1" />
                      تحميل
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {link.customerPhone && (
                    <Button
                      onClick={() => shareViaWhatsApp(link)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 ml-2" />
                      إرسال عبر WhatsApp
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => window.open(link.link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    فتح
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
