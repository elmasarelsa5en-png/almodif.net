'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOGO_STORAGE_KEY = 'app-logo';

export const LogoUploader = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (savedLogo) {
      setLogo(savedLogo);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('حجم الملف كبير جدًا. الحد الأقصى 2 ميجابايت.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
        localStorage.setItem(LOGO_STORAGE_KEY, base64String);
        window.dispatchEvent(new CustomEvent('logo-updated'));
      };
      reader.onerror = () => {
        setError('حدث خطأ أثناء قراءة الملف.');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp'],
    },
    multiple: false,
  });

  const handleRemoveLogo = () => {
    setLogo(null);
    localStorage.removeItem(LOGO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('logo-updated'));
  };

  return (
    <div className="space-y-4">
      <label className="text-sm text-slate-200">شعار المنشأة</label>
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-colors
          ${isDragActive ? 'border-purple-400 bg-purple-500/10' : 'border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5'}`}
      >
        <input {...getInputProps()} />
        {logo ? (
          <>
            <img src={logo} alt="شعار الشركة" className="max-h-36 object-contain" />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10" onClick={handleRemoveLogo}>
              <XCircle className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <div className="text-center text-slate-400">
            <UploadCloud className="mx-auto h-10 w-10 mb-2" />
            <p className="font-semibold">{isDragActive ? 'أفلت الشعار هنا' : 'اسحب الشعار أو انقر للرفع'}</p>
            <p className="text-xs mt-1">PNG, JPG, SVG (بحد أقصى 2 ميجابايت)</p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};