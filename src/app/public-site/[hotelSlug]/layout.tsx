'use client';

import { useEffect, useState } from 'react';
import { loadWebsiteSettings, WebsiteSettings } from '@/lib/website-settings';
import Link from 'next/link';
import { Phone, Mail, Facebook, Instagram, Twitter, Youtube, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ hotelSlug: string }>;
}) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hotelSlug, setHotelSlug] = useState<string>('');

  useEffect(() => {
    // Unwrap params
    params.then((p) => setHotelSlug(p.hotelSlug));

    // Load settings
    const loaded = loadWebsiteSettings();
    setSettings(loaded);

    // Apply theme
    if (loaded) {
      document.documentElement.style.setProperty('--primary-color', loaded.theme.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', loaded.theme.secondaryColor);
      document.documentElement.style.setProperty('--accent-color', loaded.theme.accentColor);
      
      // Set RTL/LTR
      if (loaded.language === 'ar' || loaded.language === 'both') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
      }
    }

    // Handle scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center text-white">
          <Globe className="h-16 w-16 animate-spin mx-auto mb-4" />
          <h1 className="text-3xl font-bold">جاري التحميل...</h1>
        </div>
      </div>
    );
  }

  // Remove unpublished check - show website immediately after save
  // if (!settings.isPublished) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
  //       <div className="text-center text-white px-4">
  //         <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 max-w-md">
  //           <Globe className="h-20 w-20 mx-auto mb-6 text-gray-400" />
  //           <h1 className="text-3xl font-bold mb-4">الموقع قيد الإنشاء</h1>
  //           <p className="text-gray-300 mb-6">
  //             هذا الموقع قيد التطوير حالياً. سنكون معكم قريباً!
  //           </p>
  //           <div className="text-sm text-gray-400">
  //             {settings.hotelName}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const navLinks = [
    { href: `/public-site/${hotelSlug}`, label: 'الرئيسية' },
    { href: `/public-site/${hotelSlug}/rooms`, label: 'الغرف' },
    { href: `/public-site/${hotelSlug}/services`, label: 'الخدمات' },
    { href: `/public-site/${hotelSlug}/gallery`, label: 'المعرض' },
    { href: `/public-site/${hotelSlug}/contact`, label: 'اتصل بنا' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: settings.theme.fontFamily }}>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={`/public-site/${hotelSlug}`} className="flex items-center gap-3">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.hotelName}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.secondaryColor})` }}
                >
                  {settings.hotelName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                  {settings.hotelName}
                </h1>
                {settings.tagline && (
                  <p className={`text-sm ${scrolled ? 'text-gray-600' : 'text-white/80'}`}>
                    {settings.tagline}
                  </p>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors hover:opacity-80 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {settings.bookingSettings.enableOnlineBooking && (
                <Link href={`/public-site/${hotelSlug}/booking`}>
                  <Button
                    className="text-white shadow-lg hover:shadow-xl transition-all"
                    style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.accentColor})` }}
                  >
                    احجز الآن
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-900' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-gray-700 hover:text-gray-900 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {settings.bookingSettings.enableOnlineBooking && (
                <Link href={`/public-site/${hotelSlug}/booking`}>
                  <Button
                    className="w-full text-white"
                    style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.accentColor})` }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    احجز الآن
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{settings.hotelName}</h3>
              <p className="text-gray-400 mb-4 max-w-md">
                {settings.description}
              </p>
              {settings.socialMedia && (
                <div className="flex gap-3">
                  {settings.socialMedia.facebook && (
                    <a
                      href={settings.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {settings.socialMedia.instagram && (
                    <a
                      href={settings.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {settings.socialMedia.twitter && (
                    <a
                      href={settings.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {settings.socialMedia.youtube && (
                    <a
                      href={settings.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">تواصل معنا</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                    {settings.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                    {settings.email}
                  </a>
                </div>
                <div className="text-sm">
                  {settings.address}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {settings.hotelName}. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6 text-sm">
              {settings.content.privacyPolicy && (
                <Link href={`/public-site/${hotelSlug}/privacy`} className="text-gray-400 hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              )}
              {settings.content.termsAndConditions && (
                <Link href={`/public-site/${hotelSlug}/terms`} className="text-gray-400 hover:text-white transition-colors">
                  الشروط والأحكام
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        :root {
          --primary-color: ${settings.theme.primaryColor};
          --secondary-color: ${settings.theme.secondaryColor};
          --accent-color: ${settings.theme.accentColor};
        }
      `}</style>
    </div>
  );
}
