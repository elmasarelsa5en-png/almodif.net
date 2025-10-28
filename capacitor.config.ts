import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.almudif.guest',
  appName: 'المضيف الذكي - النزلاء',
  webDir: 'public',
  server: {
    // للتطوير - اتصال بالسيرفر المحلي
    url: 'http://10.0.2.2:3000',  // عنوان localhost من Android Emulator
    cleartext: true,
    androidScheme: 'http'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e3a8a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1e3a8a"
    }
  }
};

export default config;