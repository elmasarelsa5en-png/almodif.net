// Website Settings Library
// مكتبة إعدادات الموقع الإلكتروني للفنادق

export interface WebsiteSettings {
  hotelName: string;
  hotelSlug: string;
  description: string;
  
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo: string;
  };
  
  booking: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    depositPercentage: number;
  };
  
  content: {
    aboutUs: string;
    privacyPolicy: string;
    termsAndConditions: string;
  };
}

// Default website settings
export const defaultWebsiteSettings: WebsiteSettings = {
  hotelName: '',
  hotelSlug: '',
  description: '',
  
  contact: {
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
  },
  
  theme: {
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    logo: '',
  },
  
  booking: {
    checkInTime: '14:00',
    checkOutTime: '12:00',
    cancellationPolicy: '',
    depositPercentage: 30,
  },
  
  content: {
    aboutUs: '',
    privacyPolicy: '',
    termsAndConditions: '',
  },
};

// Generate slug from hotel name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[أإآ]/g, 'ا') // Normalize Arabic alef
    .replace(/[ى]/g, 'ي') // Normalize Arabic yaa
    .replace(/[ة]/g, 'ه') // Replace taa marbouta with haa
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, '') // Remove special characters but keep Arabic
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Extract colors from image using Canvas API
export const extractColorsFromImage = (file: File): Promise<{
  primary: string;
  secondary: string;
  accent: string;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Set canvas size to image size (scaled down for performance)
          const maxSize = 200;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Color analysis
          const colorMap = new Map<string, number>();
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Skip transparent and very light/dark pixels
            if (a < 128 || (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
              continue;
            }

            // Round to nearest 10 to group similar colors
            const rr = Math.round(r / 10) * 10;
            const gg = Math.round(g / 10) * 10;
            const bb = Math.round(b / 10) * 10;
            const color = `${rr},${gg},${bb}`;

            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }

          // Sort colors by frequency
          const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([color]) => {
              const [r, g, b] = color.split(',').map(Number);
              return { r, g, b };
            });

          // Helper to convert RGB to HEX
          const rgbToHex = (r: number, g: number, b: number) => {
            return '#' + [r, g, b].map(x => {
              const hex = x.toString(16);
              return hex.length === 1 ? '0' + hex : hex;
            }).join('');
          };

          // Get dominant colors
          const primary = sortedColors[0] || { r: 37, g: 99, b: 235 };
          const secondary = sortedColors[1] || { r: 100, g: 116, b: 139 };
          const accent = sortedColors[2] || { r: 245, g: 158, b: 11 };

          resolve({
            primary: rgbToHex(primary.r, primary.g, primary.b),
            secondary: rgbToHex(secondary.r, secondary.g, secondary.b),
            accent: rgbToHex(accent.r, accent.g, accent.b),
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Save website settings to localStorage
export const saveWebsiteSettings = (settings: WebsiteSettings): void => {
  try {
    localStorage.setItem('website-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving website settings:', error);
  }
};

// Load website settings from localStorage
export const loadWebsiteSettings = (): WebsiteSettings | null => {
  try {
    const saved = localStorage.getItem('website-settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading website settings:', error);
  }
  return null;
};

// Check if website is ready to publish
export const isWebsiteReady = (settings: WebsiteSettings): { 
  ready: boolean; 
  totalSections: number;
  completedSections: number;
} => {
  let completed = 0;
  const total = 5;

  if (settings.hotelName && settings.hotelSlug) completed++;
  if (settings.contact.email && settings.contact.phone) completed++;
  if (settings.theme.primaryColor) completed++;
  if (settings.booking.checkInTime) completed++;
  if (settings.content.aboutUs) completed++;

  return {
    ready: completed === total,
    totalSections: total,
    completedSections: completed
  };
};
