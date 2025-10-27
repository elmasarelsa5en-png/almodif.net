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
  LogIn,
  Bed,
  MessageCircle,
  Star,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

// بيانات المستخدم
const USER_CREDENTIALS = {
  username: 'akram',
  password: 'Aa123456',
  role: 'admin',
  name: 'أكرم'
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // محاكاة تأخير الخادم
    await new Promise(resolve => setTimeout(resolve, 1000));

    // التحقق من بيانات تسجيل الدخول
    if (username === USER_CREDENTIALS.username && password === USER_CREDENTIALS.password) {
      // استخدام AuthContext لتسجيل الدخول
      const userData = {
        username: USER_CREDENTIALS.username,
        role: USER_CREDENTIALS.role,
        name: USER_CREDENTIALS.name,
        loginTime: new Date().toISOString()
      };
      
      login(userData);
      
      // تأخير قصير للتأكد من تحديث الـ state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // توجيه إلى لوحة التحكم
      router.push('/dashboard');
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    setIsLoading(false);
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex flex-col items-center mb-4 gap-2">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                <img src="/app-logo.png" alt={t('appName')} className="w-20 h-20 rounded-full object-cover" style={{objectFit:'contain'}} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-2">
              {t('appName')}
            </CardTitle>
            <p className="text-purple-200/70">{t('appSubtitle')}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">{t('loginUsername')}</label>
                <div className="relative" suppressHydrationWarning>
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder={t('loginEnterUsername')}
                    required
                    autoComplete="username"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">{t('loginPassword')}</label>
                <div className="relative" suppressHydrationWarning>
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 pl-12 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder={t('loginEnterPassword')}
                    required
                    autoComplete="current-password"
                    suppressHydrationWarning
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

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 border-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t('loginLoading')}
                  </div>
                ) : (
                  <>
                    <LogIn className="ml-2 w-5 h-5" />
                    {t('loginButton')}
                  </>
                )}
              </Button>
            </form>



            {/* Back to Home */}
            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="text-blue-300 hover:text-blue-200 underline hover:no-underline text-sm transition-all duration-200 font-medium"
              >
                {t('loginBackToHome')}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
            <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{t('loginFeature1')}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
            <Bed className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{t('loginFeature2')}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{t('loginFeature3')}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{t('loginFeature4')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}