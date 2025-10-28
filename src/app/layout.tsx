import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { LanguageProvider } from "@/contexts/language-context";
import GlobalNotificationInitializer from "@/components/GlobalNotificationInitializer";
import CapacitorInitializer from "@/components/CapacitorInitializer";

export const metadata: Metadata = {
  title: "المضيف - النظام الذكي",
  description: "نظام إدارة شامل مع مساعد ذكي متطور",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/service-worker.js'); }); }`
        }} />
      </head>
      <body className="font-sans antialiased">
        <CapacitorInitializer />
        <GlobalNotificationInitializer />
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
        <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 py-2 px-4 z-50">
          <div className="max-w-7xl mx-auto flex justify-center items-center">
            <p className="text-slate-400 text-xs text-center">
              © 2025 Eng/Akram elmasry . جميع الحقوق محفوظة.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
