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
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
      if (!user?.username) return;

      try {
        const employeeRef = doc(db, 'employees', user.username);
        const employeeSnap = await getDoc(employeeRef);

        if (employeeSnap.exists()) {
          const data = employeeSnap.data();
          const profileData: EmployeeProfile = {
            id: employeeSnap.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone,
            position: data.position,
            department: data.department,
            address: data.address,
            bio: data.bio,
            avatar: data.avatar,
            dateJoined: data.dateJoined,
          };
          
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
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: 'فشل تحميل البيانات' });
      }
    };

    loadProfile();
  }, [user?.username]);

  const handleSave = async () => {
    if (!user?.username || !profile) return;

    try {
      setIsSaving(true);
      const employeeRef = doc(db, 'employees', user.username);
      
      await updateDoc(employeeRef, {
        name: formData.name,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        address: formData.address,
        bio: formData.bio,
      });

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
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'فشل حفظ التغييرات' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.username) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'حجم الصورة كبير جداً (الحد الأقصى 2 ميجا)' });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'الملف يجب أن يكون صورة' });
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          const employeeRef = doc(db, 'employees', user.username);
          await updateDoc(employeeRef, {
            avatar: base64String,
          });

          setProfile(prev => prev ? { ...prev, avatar: base64String } : null);
          setMessage({ type: 'success', text: 'تم تحديث الصورة الشخصية!' });
          setTimeout(() => setMessage(null), 3000);
        } catch (error) {
          console.error('Error uploading avatar:', error);
          setMessage({ type: 'error', text: 'فشل رفع الصورة' });
        } finally {
          setIsUploadingAvatar(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setMessage({ type: 'error', text: 'فشل قراءة الملف' });
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
