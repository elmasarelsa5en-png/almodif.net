'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PermissionGuard } from '@/components/PermissionGuard';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Camera,
  Save,
  X,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  dateJoined?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    address: '',
    bio: '',
  });

  // Load employee profile
  useEffect(() => {
    const loadProfile = async () => {
      console.log('🔍 Loading profile for user:', user);
      
      if (!user) {
        console.log('❌ No user found');
        setMessage({ type: 'error', text: 'لم يتم العثور على بيانات المستخدم' });
        return;
      }

      // Try to get employee ID from username, email, or id
      const employeeId = user.username || user.email || user.id;
      
      if (!employeeId) {
        console.log('❌ No employee ID found in user:', user);
        setMessage({ type: 'error', text: 'لم يتم العثور على معرف الموظف' });
        return;
      }

      console.log('📝 Fetching employee data with ID:', employeeId);

      try {
        const employeeRef = doc(db, 'employees', employeeId);
        const employeeSnap = await getDoc(employeeRef);

        console.log('📦 Employee snapshot exists:', employeeSnap.exists());

        if (employeeSnap.exists()) {
          const data = employeeSnap.data();
          console.log('✅ Employee data:', data);
          
          const profileData: EmployeeProfile = {
            id: employeeSnap.id,
            name: data.name || user.name || '',
            email: data.email || user.email || '',
            phone: data.phone,
            position: data.position,
            department: data.department,
            address: data.address,
            bio: data.bio,
            avatar: data.avatar,
            dateJoined: data.dateJoined,
          };
          
          console.log('✅ Profile data set:', profileData);
          
          setProfile(profileData);
          setFormData({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone || '',
            position: profileData.position || '',
            department: profileData.department || '',
            address: profileData.address || '',
            bio: profileData.bio || '',
          });
        } else {
          console.log('⚠️ Employee document does not exist for ID:', employeeId);
          console.log('🔧 Creating employee document automatically...');
          
          // Create employee document automatically
          const basicProfile: EmployeeProfile = {
            id: employeeId,
            name: user.name || user.username || '',
            email: user.email || '',
            dateJoined: new Date().toISOString(),
          };
          
          try {
            // Create the document in Firebase
            await setDoc(doc(db, 'employees', employeeId), {
              username: user.username || employeeId,
              name: basicProfile.name,
              email: basicProfile.email,
              role: user.role || 'employee',
              dateJoined: basicProfile.dateJoined,
              permissions: user.permissions || [],
              department: user.department || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            
            console.log('✅ Employee document created successfully');
            
            setProfile(basicProfile);
            setFormData({
              name: basicProfile.name,
              email: basicProfile.email,
              phone: '',
              position: '',
              department: user.department || '',
              address: '',
              bio: '',
            });
            
            setMessage({ type: 'success', text: 'تم إنشاء ملفك الشخصي بنجاح! يمكنك الآن تعديل بياناتك.' });
            setTimeout(() => setMessage(null), 5000);
          } catch (createError) {
            console.error('❌ Error creating employee document:', createError);
            setProfile(basicProfile);
            setFormData({
              name: basicProfile.name,
              email: basicProfile.email,
              phone: '',
              position: '',
              department: '',
              address: '',
              bio: '',
            });
            setMessage({ type: 'error', text: 'تم إنشاء ملف مؤقت. قد تحتاج لإعادة تسجيل الدخول.' });
          }
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        setMessage({ type: 'error', text: 'فشل تحميل البيانات: ' + (error as Error).message });
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) {
      console.log('❌ Cannot save: missing user or profile');
      return;
    }

    const employeeId = user.username || user.email || user.id;
    
    if (!employeeId) {
      console.log('❌ Cannot save: no employee ID');
      setMessage({ type: 'error', text: 'لم يتم العثور على معرف الموظف' });
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Saving profile for:', employeeId);
      
      const employeeRef = doc(db, 'employees', employeeId);
      
      // Check if document exists
      const docSnap = await getDoc(employeeRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(employeeRef, {
          name: formData.name,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          address: formData.address,
          bio: formData.bio,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new document
        console.log('📝 Document does not exist, creating new one...');
        await setDoc(employeeRef, {
          username: user.username || employeeId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          address: formData.address,
          bio: formData.bio,
          role: user.role || 'employee',
          permissions: user.permissions || [],
          dateJoined: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      console.log('✅ Profile saved successfully');

      setProfile({
        ...profile,
        name: formData.name,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        address: formData.address,
        bio: formData.bio,
      });

      setMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح!' });
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setMessage({ type: 'error', text: 'فشل حفظ التغييرات: ' + (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const employeeId = user.username || user.email || user.id;
    
    if (!employeeId) {
      console.log('❌ Cannot upload avatar: no employee ID');
      setMessage({ type: 'error', text: 'لم يتم العثور على معرف الموظف' });
      return;
    }

    console.log('📸 Original file size:', (file.size / 1024).toFixed(2), 'KB');

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'الملف يجب أن يكون صورة' });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      console.log('📤 Uploading avatar for:', employeeId);

      // Compress and convert image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = async () => {
        // Calculate new dimensions (max 400x400)
        let width = img.width;
        let height = img.height;
        const maxSize = 400;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.7 quality)
        const base64String = canvas.toDataURL('image/jpeg', 0.7);
        
        console.log('📦 Compressed size:', (base64String.length / 1024).toFixed(2), 'KB');
        console.log('📏 New dimensions:', width, 'x', height);

        // Check compressed size (max 500KB for base64)
        if (base64String.length > 500 * 1024) {
          setMessage({ type: 'error', text: 'الصورة كبيرة جداً حتى بعد الضغط. جرب صورة أصغر.' });
          setIsUploadingAvatar(false);
          return;
        }

        try {
          const employeeRef = doc(db, 'employees', employeeId);
          
          // Check if document exists
          const docSnap = await getDoc(employeeRef);
          
          if (docSnap.exists()) {
            // Update existing document
            await updateDoc(employeeRef, {
              avatar: base64String,
              updatedAt: new Date().toISOString(),
            });
          } else {
            // Create new document with avatar
            console.log('📝 Document does not exist, creating with avatar...');
            await setDoc(employeeRef, {
              username: user.username || employeeId,
              name: user.name || '',
              email: user.email || '',
              avatar: base64String,
              role: user.role || 'employee',
              permissions: user.permissions || [],
              department: user.department || '',
              dateJoined: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          console.log('✅ Avatar uploaded successfully');
          
          setProfile(prev => prev ? { ...prev, avatar: base64String } : null);
          setMessage({ type: 'success', text: 'تم تحديث الصورة الشخصية!' });
          setTimeout(() => setMessage(null), 3000);
        } catch (error) {
          console.error('❌ Error uploading avatar:', error);
          setMessage({ type: 'error', text: 'فشل رفع الصورة: ' + (error as Error).message });
        } finally {
          setIsUploadingAvatar(false);
        }
      };

      img.onerror = () => {
        console.error('❌ Error loading image');
        setMessage({ type: 'error', text: 'فشل قراءة الصورة' });
        setIsUploadingAvatar(false);
      };

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('❌ Error processing image:', error);
      setMessage({ type: 'error', text: 'فشل معالجة الصورة' });
      setIsUploadingAvatar(false);
    }
  };

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">جاري تحميل البيانات...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PermissionGuard permission="edit_own_profile">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">الملف الشخصي</h1>
              <p className="text-gray-300">إدارة معلوماتك الشخصية</p>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                  : 'bg-red-500/20 border border-red-500/50 text-red-300'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Card */}
              <Card className="lg:col-span-1 bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">الصورة الشخصية</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt={profile.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                    </div>
                    
                    <PermissionGuard permission="change_own_avatar" hideIfNoPermission>
                      <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {isUploadingAvatar ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <Camera className="w-8 h-8 text-white" />
                        )}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                      />
                    </PermissionGuard>
                  </div>

                  <h2 className="text-xl font-bold text-white mt-4">{profile.name}</h2>
                  <p className="text-gray-300 text-sm">{profile.position || 'موظف'}</p>
                  {profile.department && (
                    <p className="text-gray-400 text-xs mt-1">{profile.department}</p>
                  )}

                  {profile.dateJoined && (
                    <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>انضم في {new Date(profile.dateJoined).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Info Card */}
              <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">المعلومات الشخصية</CardTitle>
                      <CardDescription className="text-gray-300">
                        {isEditing ? 'قم بتعديل معلوماتك' : 'عرض معلوماتك الشخصية'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                name: profile.name,
                                email: profile.email,
                                phone: profile.phone || '',
                                position: profile.position || '',
                                department: profile.department || '',
                                address: profile.address || '',
                                bio: profile.bio || '',
                              });
                            }}
                            className="border-white/30 text-white hover:bg-white/10"
                          >
                            <X className="w-4 h-4 mr-2" />
                            إلغاء
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            حفظ
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          تعديل
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <Label htmlFor="name" className="text-white mb-2 block">
                        <User className="w-4 h-4 inline ml-2" />
                        الاسم
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-white mb-2 block">
                        <Mail className="w-4 h-4 inline ml-2" />
                        البريد الإلكتروني
                      </Label>
                      <Input
                        id="email"
                        value={formData.email}
                        disabled
                        className="bg-white/10 border-white/20 text-gray-400 cursor-not-allowed"
                        title="لا يمكن تعديل البريد الإلكتروني"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="text-white mb-2 block">
                        <Phone className="w-4 h-4 inline ml-2" />
                        رقم الهاتف
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="05xxxxxxxx"
                      />
                    </div>

                    {/* Position */}
                    <div>
                      <Label htmlFor="position" className="text-white mb-2 block">
                        <Briefcase className="w-4 h-4 inline ml-2" />
                        المنصب
                      </Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="مثال: مدير استقبال"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <Label htmlFor="department" className="text-white mb-2 block">
                        <Briefcase className="w-4 h-4 inline ml-2" />
                        القسم
                      </Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="مثال: الاستقبال"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <Label htmlFor="address" className="text-white mb-2 block">
                        <MapPin className="w-4 h-4 inline ml-2" />
                        العنوان
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="مثال: أبها، السعودية"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio" className="text-white mb-2 block">
                      نبذة عني
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      placeholder="اكتب نبذة قصيرة عنك..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </ProtectedRoute>
  );
}
