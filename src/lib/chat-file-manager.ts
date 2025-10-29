// File Upload Manager for Chat (Images, Audio, Files)
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

// ضغط الصور
const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // تصغير الصورة إذا كانت كبيرة
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// رفع صورة
export const uploadChatImage = async (
  file: File,
  chatId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.log('📤 Uploading image...', {
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type
    });

    // ضغط الصورة
    const compressedBlob = await compressImage(file);
    console.log('✅ Image compressed:', {
      original: (file.size / 1024).toFixed(2) + ' KB',
      compressed: (compressedBlob.size / 1024).toFixed(2) + ' KB'
    });

    // رفع الصورة
    const timestamp = Date.now();
    const fileName = `chat-images/${chatId}/${timestamp}-${file.name}`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
      contentType: 'image/jpeg'
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`📊 Upload progress: ${progress.toFixed(0)}%`);
          onProgress?.(progress);
        },
        (error) => {
          console.error('❌ Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ Image uploaded successfully:', downloadURL);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

// رفع ملف صوتي
export const uploadChatAudio = async (
  audioBlob: Blob,
  chatId: string,
  duration: number,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.log('🎤 Uploading audio...', {
      size: (audioBlob.size / 1024).toFixed(2) + ' KB',
      duration: duration.toFixed(1) + 's'
    });

    const timestamp = Date.now();
    const fileName = `chat-audio/${chatId}/${timestamp}.webm`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, audioBlob, {
      contentType: 'audio/webm'
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`📊 Audio upload progress: ${progress.toFixed(0)}%`);
          onProgress?.(progress);
        },
        (error) => {
          console.error('❌ Audio upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ Audio uploaded successfully:', downloadURL);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('❌ Error uploading audio:', error);
    throw error;
  }
};

// رفع ملف عام
export const uploadChatFile = async (
  file: File,
  chatId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.log('📎 Uploading file...', {
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type
    });

    const timestamp = Date.now();
    const fileName = `chat-files/${chatId}/${timestamp}-${file.name}`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`📊 File upload progress: ${progress.toFixed(0)}%`);
          onProgress?.(progress);
        },
        (error) => {
          console.error('❌ File upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ File uploaded successfully:', downloadURL);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

// تسجيل صوت
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('🎤 Recording started...');
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<{ blob: Blob; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const duration = (Date.now() - this.startTime) / 1000;
        
        console.log('🎤 Recording stopped:', {
          duration: duration.toFixed(1) + 's',
          size: (audioBlob.size / 1024).toFixed(2) + ' KB'
        });

        // إيقاف جميع المسارات
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        resolve({ blob: audioBlob, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.audioChunks = [];
      console.log('🎤 Recording cancelled');
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// التحقق من نوع الملف
export const validateFile = (file: File, type: 'image' | 'audio' | 'file'): { valid: boolean; error?: string } => {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10 MB
    audio: 5 * 1024 * 1024,  // 5 MB
    file: 20 * 1024 * 1024   // 20 MB
  };

  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    file: [] // أي نوع
  };

  // التحقق من الحجم
  if (file.size > maxSizes[type]) {
    return {
      valid: false,
      error: `الملف كبير جداً. الحد الأقصى: ${(maxSizes[type] / 1024 / 1024).toFixed(0)} MB`
    };
  }

  // التحقق من النوع
  if (type !== 'file' && !allowedTypes[type].includes(file.type)) {
    return {
      valid: false,
      error: `نوع الملف غير مدعوم: ${file.type}`
    };
  }

  return { valid: true };
};
