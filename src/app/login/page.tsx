'use client';

import { useState, useEffect } from 'react';
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
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // استيراد دالة الموظفين من Firebase
      const { getEmployees } = await import('@/lib/firebase-data');
      
      // جلب الموظفين من Firebase
      const employees = await getEmployees();
      
      // البحث عن الموظف
      const foundEmployee = employees.find((emp: any) => 
        (emp.username === username || emp.email === username) && emp.password === password
      );

      if (foundEmployee) {
        // استخدام AuthContext لتسجيل الدخول
        const userData = {
          username: foundEmployee.username,
          role: foundEmployee.role || 'admin',
          name: foundEmployee.name,
          loginTime: new Date().toISOString(),
          permissions: foundEmployee.permissions || [],
          department: foundEmployee.department,
          employeeId: foundEmployee.id
        };
        
        login(userData);
        
        // تأخير قصير للتأكد من تحديث الـ state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // توجيه إلى لوحة التحكم
        router.push('/dashboard');
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }

    setIsLoading(false);
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      <AnimatedBackground />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 w-full max-w-sm sm:max-w-md transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-6 relative">
            {/* Sparkles Animation */}
            <div className="absolute top-4 right-4 animate-pulse">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="absolute top-4 left-4 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            
            <div className={`flex flex-col items-center mb-4 gap-2 transition-all duration-1000 delay-300 ${
              isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              <div className="relative">
                {/* Rotating Ring */}
                <div className="absolute inset-0 w-28 h-28 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 animate-spin-slow"></div>
                
                {/* Logo Container */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20 relative animate-pulse-glow">
                  <img 
                    src="/app-logo.png" 
                    alt={t('appName')} 
                    className="w-20 h-20 rounded-full object-cover animate-bounce-slow" 
                    style={{objectFit:'contain'}} 
                  />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shine"></div>
                </div>

                {/* Orbiting Dots */}
                <div className="absolute inset-0 animate-orbit">
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-yellow-400 rounded-full -ml-1.5 shadow-lg shadow-yellow-400/50"></div>
                </div>
                <div className="absolute inset-0 animate-orbit-reverse">
                  <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-pink-400 rounded-full -ml-1.5 shadow-lg shadow-pink-400/50"></div>
                </div>
              </div>
            </div>
            
            <CardTitle className={`text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent mb-2 transition-all duration-1000 delay-500 bg-[length:200%_auto] animate-gradient ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              {t('appName')}
            </CardTitle>
            <p className={`text-purple-200/70 transition-all duration-1000 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              {t('appSubtitle')}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div className={`space-y-2 transition-all duration-700 delay-900 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}>
                <label className="text-white font-medium text-sm">{t('loginUsername')}</label>
                <div className="relative group" suppressHydrationWarning>
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 group-hover:scale-110 transition-transform" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:bg-white/15 hover:border-white/30"
                    placeholder={t('loginEnterUsername')}
                    required
                    autoComplete="username"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className={`space-y-2 transition-all duration-700 delay-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}>
                <label className="text-white font-medium text-sm">{t('loginPassword')}</label>
                <div className="relative group" suppressHydrationWarning>
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 group-hover:scale-110 transition-transform" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 pl-12 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:bg-white/15 hover:border-white/30"
                    placeholder={t('loginEnterPassword')}
                    required
                    autoComplete="current-password"
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200 hover:scale-110 transition-all"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-shake">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <div className={`transition-all duration-700 delay-1100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 border-none relative overflow-hidden group"
                >
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t('loginLoading')}
                    </div>
                  ) : (
                    <>
                      <LogIn className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      {t('loginButton')}
                    </>
                  )}
                </Button>
              </div>
            </form>



            {/* Back to Home */}
            <div className={`text-center transition-all duration-700 delay-1200 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <button
                onClick={() => router.push('/')}
                className="text-blue-300 hover:text-blue-200 underline hover:no-underline text-sm transition-all duration-200 font-medium hover:scale-105 inline-block"
              >
                {t('loginBackToHome')}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: MessageCircle, text: t('loginFeature1'), color: 'text-green-400', delay: '1300' },
            { icon: Bed, text: t('loginFeature2'), color: 'text-blue-400', delay: '1400' },
            { icon: Star, text: t('loginFeature3'), color: 'text-purple-400', delay: '1500' },
            { icon: CheckCircle, text: t('loginFeature4'), color: 'text-emerald-400', delay: '1600' }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center transition-all duration-700 hover:bg-white/10 hover:scale-110 hover:border-white/30 cursor-pointer group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${feature.delay}ms` }}
              >
                <Icon className={`w-8 h-8 ${feature.color} mx-auto mb-2 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300`} />
                <p className="text-white text-sm font-medium">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(147, 51, 234, 0.5);
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }
        
        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes orbit-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
        
        .animate-orbit {
          animation: orbit 4s linear infinite;
        }
        
        .animate-orbit-reverse {
          animation: orbit-reverse 3s linear infinite;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}