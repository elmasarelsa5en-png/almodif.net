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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      {/* خلفية تزيينية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white flex items-center gap-4 drop-shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Link2 className="w-9 h-9 text-white" />
              </div>
              روابط الدفع
            </h1>
            <p className="text-blue-200 mt-3 text-lg font-medium">إنشاء وإدارة روابط الدفع الاحترافية</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-2xl text-white font-bold px-8 py-6 text-lg rounded-xl transform hover:scale-105 transition-all duration-300">
                <Plus className="w-6 h-6 ml-2" />
                إنشاء رابط جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
              <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
                <DialogTitle className="text-2xl flex items-center gap-3 text-white font-bold">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                  إنشاء رابط دفع جديد
                </DialogTitle>
                <DialogDescription className="text-blue-200/80 font-medium">
                  أدخل تفاصيل الدفع لإنشاء رابط احترافي
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
              {/* العنوان */}
              <div>
                <Label className="text-blue-200 font-semibold">العنوان *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: دفع حجز غرفة 201"
                  dir="rtl"
                  className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                />
              </div>

              {/* الوصف */}
              <div>
                <Label className="text-blue-200 font-semibold">الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تفاصيل إضافية عن الدفع..."
                  dir="rtl"
                  rows={3}
                  className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                />
              </div>

              {/* المبلغ والعملة */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-200 font-semibold">المبلغ *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <Label className="text-blue-200 font-semibold">العملة</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="SAR" className="text-white focus:bg-white/10 focus:text-white">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD" className="text-white focus:bg-white/10 focus:text-white">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR" className="text-white focus:bg-white/10 focus:text-white">يورو (EUR)</SelectItem>
                      <SelectItem value="AED" className="text-white focus:bg-white/10 focus:text-white">درهم إماراتي (AED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* طرق الدفع */}
              <div>
                <Label className="mb-3 block text-blue-200 font-semibold">طرق الدفع المتاحة *</Label>
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
                          "flex items-center gap-2 p-3 rounded-lg border-2 transition-all font-medium",
                          formData.paymentMethods.includes(method.value)
                            ? "border-indigo-400 bg-indigo-500/30 text-white shadow-lg"
                            : "border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* معلومات العميل */}
              <div className="border-t border-white/20 pt-4">
                <h3 className="font-bold mb-3 text-white text-lg">معلومات العميل (اختياري)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-blue-200 font-semibold">اسم العميل</Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="الاسم الكامل"
                      dir="rtl"
                      className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200 font-semibold">رقم الهاتف</Label>
                    <Input
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="966xxxxxxxxx"
                      dir="ltr"
                      className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-blue-200 font-semibold">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="example@email.com"
                      dir="ltr"
                      className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
              </div>

              {/* إعدادات إضافية */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-200 font-semibold">صلاحية الرابط (أيام)</Label>
                  <Select value={formData.expiryDays} onValueChange={(value) => setFormData({ ...formData, expiryDays: value })}>
                    <SelectTrigger className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="1" className="text-white focus:bg-white/10 focus:text-white">يوم واحد</SelectItem>
                      <SelectItem value="3" className="text-white focus:bg-white/10 focus:text-white">3 أيام</SelectItem>
                      <SelectItem value="7" className="text-white focus:bg-white/10 focus:text-white">7 أيام</SelectItem>
                      <SelectItem value="14" className="text-white focus:bg-white/10 focus:text-white">14 يوم</SelectItem>
                      <SelectItem value="30" className="text-white focus:bg-white/10 focus:text-white">30 يوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-blue-200 font-semibold">رقم الحجز (اختياري)</Label>
                  <Input
                    value={formData.bookingId}
                    onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                    placeholder="BK-12345"
                    className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                  />
                </div>
              </div>

              {/* ملاحظات */}
              <div>
                <Label className="text-blue-200 font-semibold">ملاحظات داخلية</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات لن تظهر للعميل..."
                  dir="rtl"
                  rows={2}
                  className="border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 bg-slate-800/50 rounded-lg p-4 -m-6 mt-6">
                <Button
                  onClick={createPaymentLink}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold shadow-lg"
                >
                  <Link2 className="w-5 h-5 ml-2" />
                  إنشاء الرابط
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1 border-2 border-white/30 hover:bg-slate-700/50 text-white font-medium"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/80 via-blue-900/80 to-purple-900/80 backdrop-blur-xl border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200 font-semibold">إجمالي الروابط</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">{stats.total}</p>
                </div>
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Link2 className="w-9 h-9 text-indigo-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/80 to-cyan-600/80 backdrop-blur-xl border border-blue-400/30 shadow-2xl hover:scale-105 transition-transform duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 font-semibold">روابط نشطة</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">{stats.active}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-9 h-9 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/80 to-emerald-600/80 backdrop-blur-xl border border-green-400/30 shadow-2xl hover:scale-105 transition-transform duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100 font-semibold">تم الدفع</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">{stats.paid}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-9 h-9 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600/80 to-purple-600/80 backdrop-blur-xl border border-indigo-400/30 shadow-2xl hover:scale-105 transition-transform duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-100 font-semibold">المبلغ المحصل</p>
                  <p className="text-4xl font-black text-white drop-shadow-lg">{stats.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-indigo-200 font-bold mt-1">SAR</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="w-9 h-9 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث عن رابط..."
                  className="pr-10 border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white placeholder:text-white/60"
                  dir="rtl"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-2 border-white/30 focus:border-blue-400 bg-white/10 text-white">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="all" className="text-white focus:bg-white/10 focus:text-white">جميع الحالات</SelectItem>
                  <SelectItem value="active" className="text-white focus:bg-white/10 focus:text-white">نشط</SelectItem>
                  <SelectItem value="paid" className="text-white focus:bg-white/10 focus:text-white">مدفوع</SelectItem>
                  <SelectItem value="expired" className="text-white focus:bg-white/10 focus:text-white">منتهي</SelectItem>
                  <SelectItem value="cancelled" className="text-white focus:bg-white/10 focus:text-white">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

      {/* Payment Links List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLinks.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Link2 className="w-12 h-12 text-indigo-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">لا توجد روابط دفع</h3>
              <p className="text-blue-200 mb-6">ابدأ بإنشاء رابط دفع احترافي</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold px-8 py-3 shadow-lg"
              >
                <Plus className="w-5 h-5 ml-2" />
                إنشاء رابط جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredLinks.map(link => (
            <Card key={link.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">{link.title}</h3>
                      <Badge className={cn("flex items-center gap-1 font-bold shadow-lg", 
                        link.status === 'active' ? 'bg-blue-500/80 text-white border-blue-400/40' :
                        link.status === 'paid' ? 'bg-green-500/80 text-white border-green-400/40' :
                        link.status === 'expired' ? 'bg-gray-500/80 text-white border-gray-400/40' :
                        'bg-red-500/80 text-white border-red-400/40'
                      )}>
                        {getStatusIcon(link.status)}
                        {getStatusText(link.status)}
                      </Badge>
                    </div>
                    
                    {link.description && (
                      <p className="text-blue-200 mb-4 text-base">{link.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-lg border border-green-400/30">
                        <DollarSign className="w-5 h-5 text-green-300" />
                        <span className="font-bold text-white text-lg">{link.amount} {link.currency}</span>
                      </div>
                      
                      {link.customerName && (
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20">
                          <span className="text-blue-200">👤 {link.customerName}</span>
                        </div>
                      )}
                      
                      {link.bookingId && (
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20">
                          <Calendar className="w-4 h-4 text-blue-300" />
                          <span className="text-blue-200">{link.bookingId}</span>
                        </div>
                      )}

                      {link.expiresAt && (
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20">
                          <Clock className="w-4 h-4 text-blue-300" />
                          <span className="text-blue-200">صالح حتى: {new Date(link.expiresAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      )}
                    </div>

                    {/* Payment Methods */}
                    <div className="flex gap-2 mb-4">
                      {link.paymentMethods.map(method => (
                        <Badge key={method} className="bg-indigo-500/30 text-white border border-indigo-400/30 font-medium">
                          {method === 'apple-pay' && '🍎 Apple Pay'}
                          {method === 'samsung-pay' && '📱 Samsung Pay'}
                          {method === 'credit-card' && '💳 بطاقة'}
                          {method === 'bank-transfer' && '🏦 تحويل'}
                        </Badge>
                      ))}
                    </div>

                    {/* Link */}
                    <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-white/20">
                      <code className="flex-1 text-sm text-blue-200 truncate font-mono" dir="ltr">{link.link}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(link.link)}
                        className="text-white hover:bg-white/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="mr-6 flex flex-col items-center gap-2">
                    <div className="p-2 bg-white rounded-lg shadow-xl">
                      <img src={link.qrCode} alt="QR Code" className="w-24 h-24" />
                    </div>
                    <Button size="sm" className="text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20">
                      <Download className="w-3 h-3 ml-1" />
                      تحميل
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/20">
                  {link.customerPhone && (
                    <Button
                      onClick={() => shareViaWhatsApp(link)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg"
                    >
                      <Send className="w-4 h-4 ml-2" />
                      إرسال عبر WhatsApp
                    </Button>
                  )}
                  <Button
                    onClick={() => window.open(link.link, '_blank')}
                    className="bg-blue-500/30 hover:bg-blue-500/50 text-white border border-blue-400/30 font-medium"
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    فتح
                  </Button>
                  <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button className="bg-red-500/30 hover:bg-red-500/50 text-white border border-red-400/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
