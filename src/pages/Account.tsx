import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Camera, Mail, Phone, MapPin, Shield, Edit2, Upload, X } from "lucide-react";
import { SelfieUpload } from "@/components/auth/SelfieUpload";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

type Profile = Tables<'profiles'>;

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isEditingSelfie, setIsEditingSelfie] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [currentProfilePhotoUrl, setCurrentProfilePhotoUrl] = useState<string>('');
  const [currentSelfieUrl, setCurrentSelfieUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
  });
  const [photoStats, setPhotoStats] = useState({
    totalPhotos: 0,
    confirmed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === "admin@st.id";

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchPhotoStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Refresh profile photo URL when profile changes
  useEffect(() => {
    const refreshProfilePhotoUrl = async () => {
      // Refresh profile photo
      if (profile?.profile_photo_url && !profilePhotoPreview) {
        const url = await getSignedUrl(profile.profile_photo_url);
        if (url) {
          setCurrentProfilePhotoUrl(url);
        }
      }
      // Refresh selfie URL
      if (profile?.selfie_url && !currentSelfieUrl) {
        const url = await getSignedUrl(profile.selfie_url);
        if (url) {
          setCurrentSelfieUrl(url);
        }
      }
    };

    if (profile) {
      refreshProfilePhotoUrl();
    }
  }, [profile, profilePhotoPreview, currentSelfieUrl]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

        if (data) {
          setProfile(data);
          // Fetch profile photo URL if exists
          if (data.profile_photo_url) {
            const url = await getSignedUrl(data.profile_photo_url);
            if (url) setCurrentProfilePhotoUrl(url);
          }
          // Fetch selfie URL if exists
          if (data.selfie_url) {
            const url = await getSignedUrl(data.selfie_url);
            if (url) setCurrentSelfieUrl(url);
          }
        } else {
        // Create profile if it doesn't exist
        const newProfile = {
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          phone: null,
          location: null,
          selfie_url: null,
          profile_photo_url: null,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(createdProfile);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const fetchPhotoStats = async () => {
    if (!user) return;

    try {
      // For now, we'll use mock data since we don't have a photos table yet
      // TODO: Replace with real photo statistics from database
      setPhotoStats({
        totalPhotos: Math.floor(Math.random() * 50) + 10,
        confirmed: Math.floor(Math.random() * 30) + 5,
        pending: Math.floor(Math.random() * 10) + 1,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photo stats:', error);
      setLoading(false);
    }
  };

  const handleSelfieUpdate = async (file: File, preview: string) => {
    if (!user || !profile) return;

    try {
      // Upload to Supabase storage with UUID folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `selfie-registrasi.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-selfies')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading selfie:', uploadError);
        toast({
          title: "Error",
          description: `Gagal mengunggah selfie: ${uploadError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Update or insert profile - use UPDATE first, then INSERT if row doesn't exist
      // This avoids RLS issues with upsert's INSERT path
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          selfie_url: filePath,
        })
        .eq('user_id', user.id);

      if (updateError) {
        // If update failed because row doesn't exist, try INSERT
        if (updateError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              full_name: profile?.full_name || '',
              selfie_url: filePath,
              profile_photo_url: profile?.profile_photo_url || null,
              phone: profile?.phone || null,
              location: profile?.location || null
            });

          if (insertError) {
            console.error('Error inserting profile:', insertError);
            toast({
              title: "Error",
              description: `Gagal menyimpan profil: ${insertError.message}`,
              variant: "destructive",
            });
            return;
          }
        } else {
          console.error('Error updating profile:', updateError);
          toast({
            title: "Error",
            description: "Gagal memperbarui profil. Silakan coba lagi.",
            variant: "destructive",
          });
          return;
        }
      }

      // Get fresh signed URL for immediate display
      const { data: urlData } = await supabase.storage
        .from('user-selfies')
        .createSignedUrl(filePath, 3600);

      // Update local state with signed URL for immediate display
      if (urlData?.signedUrl) {
        setProfile(prev => prev ? { ...prev, selfie_url: filePath } : null);
        setCurrentSelfieUrl(urlData.signedUrl);
      }

      setIsEditingSelfie(false);

      // Refresh profile data to ensure consistency
      await fetchUserProfile();

      toast({
        title: "Berhasil",
        description: "Selfie berhasil diperbarui.",
      });
    } catch (error) {
      console.error('Error updating selfie:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengunggah selfie. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (1MB limit)
      if (file.size > 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 1MB. Silakan pilih file yang lebih kecil.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "File bukan gambar",
          description: "Silakan pilih file gambar (JPG, PNG, dll).",
          variant: "destructive",
        });
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    setFormData({
      phone: profile?.phone || '',
      location: profile?.location || '',
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone || null,
          location: formData.location || null,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Gagal memperbarui profil. Silakan coba lagi.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        phone: formData.phone || null,
        location: formData.location || null
      } : null);
      setIsEditingProfile(false);

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setFormData({ phone: '', location: '' });
    setProfilePhoto(null);
    setProfilePhotoPreview('');
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('user-selfies')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
  };

  const handleAvatarUpload = async () => {
    if (!user || !profilePhoto) return;

    setIsUploadingProfilePhoto(true);
    try {
      // Upload to Supabase storage with UUID folder structure
      const fileExt = profilePhoto.name.split('.').pop();
      const fileName = `profile-photo.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-selfies')
        .upload(filePath, profilePhoto, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading profile photo:', uploadError);
        toast({
          title: "Error",
          description: `Gagal mengunggah foto profil: ${uploadError.message}`,
          variant: "destructive",
        });
        setIsUploadingProfilePhoto(false);
        return;
      }

      // Update or insert profile - use UPDATE first, then INSERT if row doesn't exist
      // This avoids RLS issues with upsert's INSERT path
      // Store in profile_photo_url (NOT selfie_url)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_photo_url: filePath,
        })
        .eq('user_id', user.id);

      if (updateError) {
        // If update failed because row doesn't exist, try INSERT
        if (updateError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              profile_photo_url: filePath,
              selfie_url: profile?.selfie_url || null,
              phone: profile?.phone || null,
              location: profile?.location || null
            });

          if (insertError) {
            console.error('Error inserting profile:', insertError);
            toast({
              title: "Error",
              description: `Gagal menyimpan profil: ${insertError.message}`,
              variant: "destructive",
            });
            setIsUploadingProfilePhoto(false);
            return;
          }
        } else {
          console.error('Error updating profile:', updateError);
          toast({
            title: "Error",
            description: `Gagal memperbarui profil: ${updateError.message}`,
            variant: "destructive",
          });
          setIsUploadingProfilePhoto(false);
          return;
        }
      }

      // Get fresh signed URL for immediate display
      const { data: urlData, error: signedUrlError } = await supabase.storage
        .from('user-selfies')
        .createSignedUrl(filePath, 3600);

      if (signedUrlError || !urlData?.signedUrl) {
        console.error('Error creating signed URL:', signedUrlError);
        // Even without signed URL, the upload was successful, just refresh profile
        setProfilePhoto(null);
        setProfilePhotoPreview('');
        await fetchUserProfile();
        toast({
          title: "Berhasil",
          description: "Foto profil berhasil diperbarui.",
        });
        setIsUploadingProfilePhoto(false);
        return;
      }

      // Update local state with signed URL for immediate display
      // Update profile_photo_url, NOT selfie_url
      if (urlData?.signedUrl) {
        setProfile(prev => prev ? { ...prev, profile_photo_url: filePath } : null);
        setCurrentProfilePhotoUrl(urlData.signedUrl);
      }

      setProfilePhoto(null);
      setProfilePhotoPreview('');

      // Refresh profile data to ensure consistency
      await fetchUserProfile();

      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diperbarui.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengunggah foto. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfilePhoto(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const Layout = isAdmin ? AdminDashboardLayout : DashboardLayout;

  const userData = {
    // Get full_name from profile table first, fallback to auth metadata
    name: profile?.full_name
      || user.user_metadata?.full_name
      || user.email?.split('@')[0]
      || 'User',
    email: profile?.email || user.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    selfie: profile?.selfie_url || '',
    verified: false,
    joinedDate: new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    stats: photoStats,
  };

  return (
    <Layout onLogout={handleLogout}>
      {/* Hidden file input for avatar */}
      <input
        type="file"
        accept="image/*"
        onChange={handleProfilePhotoChange}
        className="hidden"
        id="avatar-input"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Akun Saya
        </h1>
        <p className="text-muted-foreground">
          Kelola profil dan pengaturan akun Anda
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <img
                  src={profilePhotoPreview || currentProfilePhotoUrl}
                  alt={userData.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                />
                {!currentProfilePhotoUrl && !profilePhotoPreview && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-full">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rounded-full px-3 py-1 text-xs shadow-lg"
                  onClick={() => document.getElementById('avatar-input')?.click()}
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {userData.verified && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-soft">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground mt-4">
                {userData.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                Bergabung {userData.joinedDate}
              </p>
              {userData.verified && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                  <Shield className="h-3 w-3" />
                  Wajah Terverifikasi
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{userData.stats.totalPhotos}</p>
                <p className="text-xs text-muted-foreground">Total Foto</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">{userData.stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Dikonfirmasi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">{userData.stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>

            {/* Avatar Upload Controls */}
            {profilePhoto && (
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {profilePhoto.name} ({(profilePhoto.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <Button
                  size="sm"
                  onClick={handleAvatarUpload}
                  disabled={isUploadingProfilePhoto}
                >
                  {isUploadingProfilePhoto ? 'Mengunggah...' : 'Simpan'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProfilePhoto(null);
                    setProfilePhotoPreview('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground ml-2">
                  Maksimal 1MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Section */}
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Informasi Pribadi
              </h3>
              {!isEditingProfile ? (
                <Button variant="ghost" size="sm" onClick={handleEditProfile}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    Simpan
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Phone className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Telepon</p>
                  {isEditingProfile ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Masukkan nomor telepon"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{userData.phone || 'Belum diisi'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Lokasi</p>
                  {isEditingProfile ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Masukkan lokasi"
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{userData.location || 'Belum diisi'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Selfie Section */}
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Selfie Verifikasi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selfie dari proses registrasi yang digunakan RoboTa untuk mencocokkan wajah Anda
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingSelfie(!isEditingSelfie)}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isEditingSelfie ? "Batal" : "Ganti Selfie"}
              </Button>
            </div>

            {isEditingSelfie ? (
              <SelfieUpload
                onSelfieCapture={handleSelfieUpdate}
                existingSelfie={currentSelfieUrl}
              />
            ) : (
              <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/30">
                {currentSelfieUrl ? (
                  <img
                    src={currentSelfieUrl}
                    alt="Selfie Registrasi"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">Selfie Registrasi</p>
                  <p className="text-sm text-muted-foreground">
                    {currentSelfieUrl ? 'Selfie dari proses registrasi untuk pencocokan wajah' : 'Belum ada selfie yang diunggah saat registrasi'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
