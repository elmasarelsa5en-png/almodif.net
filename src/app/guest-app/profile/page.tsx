'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, User, Mail, Phone, CreditCard, Camera, Save,
  Upload, Image as ImageIcon, X, CheckCircle2, Loader2,
  Calendar, MapPin, Globe, Shield, Edit2, Hotel, Lock, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

interface GuestProfile {
  name: string;
  phone: string;
  email: string;
  nationalId: string;
  roomNumber: string;
  checkInDate: string;
  photo?: string;
  address?: string;
  nationality?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<GuestProfile>({
    name: '',
    phone: '',
    email: '',
    nationalId: '',
    roomNumber: '',
    checkInDate: '',
    photo: '',
    address: '',
    nationality: 'سعودي'
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Load guest session
    const session = localStorage.getItem('guest_session');
    if (!session) {
      router.push('/guest-app/login');
      return;
    }

    const guestData = JSON.parse(session);
    setProfile({
      name: guestData.name || '',
      phone: guestData.phone || '',
      email: guestData.email || '',
      nationalId: guestData.nationalId || '',
      roomNumber: guestData.roomNumber || '',
      checkInDate: guestData.checkInDate || '',
      photo: guestData.photo || '',
      address: guestData.address || '',
      nationality: guestData.nationality || 'سعودي'
    });
    setPreviewImage(guestData.photo || '');
    setLoading(false);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار صورة فقط');
        return;
      }

      // التحقق من حجم الملف (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setProfile(prev => ({ ...prev, photo: result }));
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // حفظ في localStorage
      const session = localStorage.getItem('guest_session');
      if (session) {
        const guestData = JSON.parse(session);
        const updatedData = {
          ...guestData,
          ...profile
        };
        localStorage.setItem('guest_session', JSON.stringify(updatedData));
        
        // يمكن إضافة حفظ في Firebase هنا
        
        setShowSuccess(true);
        setIsEditing(false);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = () => {
    setPreviewImage('');
    setProfile(prev => ({ ...prev, photo: '' }));
    setIsEditing(true);
  };

  const handlePasswordChange = async () => {
    // التحقق من المدخلات
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('الرجاء إدخال جميع الحقول');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setSaving(true);
    
    try {
      // التحقق من كلمة المرور الحالية
      const session = localStorage.getItem('guest_session');
      if (session) {
        const guestData = JSON.parse(session);
        
        // هنا يمكن إضافة التحقق من Firebase
        // للتبسيط الآن نحفظ مباشرة
        
        const updatedData = {
          ...guestData,
          password: passwordData.newPassword
        };
        
        localStorage.setItem('guest_session', JSON.stringify(updatedData));
        
        setShowSuccess(true);
        setShowPasswordSection(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(217, 179, 69, 0.2) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)`,
            backgroundSize: '400% 400%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-amber-500/30 shadow-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/20"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-200">
                  الملف الشخصي
                </h1>
                <p className="text-sm text-slate-400 mt-1">إدارة بياناتك الشخصية</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-green-300/50">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">تم حفظ التغييرات بنجاح!</span>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Photo Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-amber-500/30 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <motion.div
                      className="relative group cursor-pointer mb-6"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <motion.div
                        className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-60"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      
                      <div className="relative w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-16 h-16 text-white" />
                          </div>
                        )}
                        
                        {/* Camera overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Remove photo button */}
                      {previewImage && (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto();
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        >
                          <X className="w-4 h-4 text-white" />
                        </motion.button>
                      )}
                    </motion.div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-200 mb-2">
                      {profile.name}
                    </h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full border border-amber-400/30">
                      <Hotel className="w-4 h-4 text-amber-300" />
                      <span className="text-sm text-amber-100">غرفة {profile.roomNumber}</span>
                    </div>

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-6 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {previewImage ? 'تغيير الصورة' : 'رفع صورة'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Personal Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-amber-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-amber-400" />
                      المعلومات الشخصية
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <Label className="text-slate-300 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-400" />
                        الاسم الكامل
                      </Label>
                      <Input
                        value={profile.name}
                        onChange={(e) => {
                          setProfile(prev => ({ ...prev, name: e.target.value }));
                          setIsEditing(true);
                        }}
                        className="bg-slate-900/50 border-slate-700 text-white focus:border-amber-400"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label className="text-slate-300 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-400" />
                        رقم الجوال
                      </Label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => {
                          setProfile(prev => ({ ...prev, phone: e.target.value }));
                          setIsEditing(true);
                        }}
                        className="bg-slate-900/50 border-slate-700 text-white focus:border-amber-400"
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label className="text-slate-300 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400" />
                        البريد الإلكتروني
                      </Label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => {
                          setProfile(prev => ({ ...prev, email: e.target.value }));
                          setIsEditing(true);
                        }}
                        className="bg-slate-900/50 border-slate-700 text-white focus:border-amber-400"
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>

                    {/* National ID */}
                    <div>
                      <Label className="text-slate-300 mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        رقم الهوية
                      </Label>
                      <Input
                        value={profile.nationalId}
                        disabled
                        className="bg-slate-900/30 border-slate-700 text-slate-400 cursor-not-allowed"
                        dir="ltr"
                      />
                    </div>

                    {/* Nationality */}
                    <div>
                      <Label className="text-slate-300 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-400" />
                        الجنسية
                      </Label>
                      <Input
                        value={profile.nationality}
                        onChange={(e) => {
                          setProfile(prev => ({ ...prev, nationality: e.target.value }));
                          setIsEditing(true);
                        }}
                        className="bg-slate-900/50 border-slate-700 text-white focus:border-amber-400"
                        placeholder="الجنسية"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <Label className="text-slate-300 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        العنوان
                      </Label>
                      <Input
                        value={profile.address}
                        onChange={(e) => {
                          setProfile(prev => ({ ...prev, address: e.target.value }));
                          setIsEditing(true);
                        }}
                        className="bg-slate-900/50 border-slate-700 text-white focus:border-amber-400"
                        placeholder="المدينة، المنطقة"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-purple-500/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-purple-400" />
                    معلومات الإقامة
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Hotel className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">رقم الغرفة</p>
                          <p className="text-lg font-bold text-white">{profile.roomNumber}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">تاريخ الوصول</p>
                          <p className="text-lg font-bold text-white">
                            {new Date(profile.checkInDate).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Password Change Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-red-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" />
                      الأمان وكلمة المرور
                    </h3>
                    <Button
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      size="sm"
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {showPasswordSection ? 'إخفاء' : 'تغيير كلمة المرور'}
                    </Button>
                  </div>

                  {showPasswordSection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Current Password */}
                      <div>
                        <Label className="text-slate-300 mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-red-400" />
                          كلمة المرور الحالية
                        </Label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="bg-slate-900/50 border-slate-700 text-white focus:border-red-400 pr-12"
                            placeholder="أدخل كلمة المرور الحالية"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <Label className="text-slate-300 mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-green-400" />
                          كلمة المرور الجديدة
                        </Label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="bg-slate-900/50 border-slate-700 text-white focus:border-green-400 pr-12"
                            placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <Label className="text-slate-300 mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-blue-400" />
                          تأكيد كلمة المرور الجديدة
                        </Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="bg-slate-900/50 border-slate-700 text-white focus:border-blue-400 pr-12"
                            placeholder="أعد إدخال كلمة المرور الجديدة"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Password strength indicator */}
                      {passwordData.newPassword && (
                        <div className="p-3 bg-white/5 rounded-lg border border-slate-700/50">
                          <p className="text-xs text-slate-400 mb-2">قوة كلمة المرور:</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`h-2 flex-1 rounded-full transition-all ${
                                  passwordData.newPassword.length >= level * 2
                                    ? passwordData.newPassword.length < 6
                                      ? 'bg-red-500'
                                      : passwordData.newPassword.length < 8
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                    : 'bg-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs mt-2 text-slate-400">
                            {passwordData.newPassword.length < 6
                              ? 'ضعيفة - يجب أن تكون 6 أحرف على الأقل'
                              : passwordData.newPassword.length < 8
                              ? 'متوسطة - يفضل 8 أحرف أو أكثر'
                              : 'قوية ✓'}
                          </p>
                        </div>
                      )}

                      {/* Save Password Button */}
                      <Button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            جاري تغيير كلمة المرور...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            حفظ كلمة المرور الجديدة
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky bottom-6"
              >
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white text-lg py-6 shadow-2xl"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
