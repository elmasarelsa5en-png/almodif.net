'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('اسم المستخدم مطلوب');
      return false;
    }
    if (formData.name.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return false;
    }
    if (!formData.email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('البريد الإلكتروني غير صالح');
      return false;
    }
    if (!formData.password) {
      setError('كلمة المرور مطلوبة');
      return false;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // تسجيل دخول بدلاً من التسجيل (يمكن إضافة firebase auth لاحقاً)
      login({
        username: formData.email,
        name: formData.name,
        role: 'admin',
        loginTime: new Date().toLocaleString('ar-SA')
      });

      // توجيه إلى لوحة التحكم بعد التسجيل الناجح
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError('حدث خطأ في التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex flex-col items-center mb-4 gap-2">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                <img src="/app-logo.png" alt="المضيف" className="w-20 h-20 rounded-full object-cover" style={{objectFit:'contain'}} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-2">
              إنشاء حساب جديد
            </CardTitle>
            <p className="text-purple-200/70">أدخل بياناتك لإنشاء حساب جديد</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="أدخل اسم المستخدم"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="أدخل البريد الإلكتروني"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 pl-12 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 pl-12 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Register Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 border-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  <>
                    <UserPlus className="ml-2 w-5 h-5" />
                    إنشاء حساب
                  </>
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-blue-300 hover:text-blue-200 underline hover:no-underline text-sm transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}