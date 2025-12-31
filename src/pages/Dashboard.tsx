import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PhotoGrid } from "@/components/photo/PhotoGrid";
import { Photo } from "@/components/photo/PhotoCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Bell, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");
  const [userActions, setUserActions] = useState<Record<string, 'confirmed' | 'rejected'>>({});
  const [totalFound, setTotalFound] = useState(0);
  const [confirmedPhotosCount, setConfirmedPhotosCount] = useState(0);

  // Fetch photos and user actions
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // First fetch user actions
        const { data: actionsData, error: actionsError } = await supabase
          .from('user_photo_actions')
          .select('photo_path, action')
          .eq('user_id', user.id);

        if (actionsError) throw actionsError;

        const actionsMap: Record<string, 'confirmed' | 'rejected'> = {};
        actionsData.forEach(action => {
          actionsMap[action.photo_path] = action.action as 'confirmed' | 'rejected';
        });
        console.log('actionsMap:', actionsMap);
        setUserActions(actionsMap);

        // Then fetch photos
        const { data: rootItems, error } = await supabase.storage.from('FOTO').list();
        if (error) throw error;

        const folders = rootItems.filter(item => !item.name.includes('.')); // Folders have no extension
        const rootFiles = rootItems.filter(item => item.name.includes('.') && (item.name.toLowerCase().endsWith('.jpg') || item.name.toLowerCase().endsWith('.png') || item.name.toLowerCase().endsWith('.jpeg')));

        const allFiles = [...rootFiles];

        // Fetch files from each folder
        for (const folder of folders) {
          const { data: folderFiles, error: folderError } = await supabase.storage.from('FOTO').list(folder.name);
          if (folderError) continue;

          const filesInFolder = folderFiles.filter(file => file.name.includes('.') && (file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpeg')));
          allFiles.push(...filesInFolder.map(file => ({ ...file, name: `${folder.name}/${file.name}` })));
        }

        console.log('allFiles:', allFiles);

        const photoPromises = allFiles.map(async (file) => {
          try {
            const { data: signedUrl, error: urlError } = await supabase.storage
              .from('FOTO')
              .createSignedUrl(file.name, 3600); // 1 hour expiry
            if (urlError) throw urlError;

            const action = actionsMap[file.name];
            const isConfirmed = action === 'confirmed';
            const isRejected = action === 'rejected';

            return {
              id: file.id,
              url: signedUrl.signedUrl,
              thumbnailUrl: signedUrl.signedUrl, // Use same for now
              location: undefined,
              date: undefined,
              isConfirmed,
              isPending: !isConfirmed && !isRejected,
              hasWatermark: !isConfirmed,
              matchScore: 95,
              path: file.name, // Add path for tracking
            } as Photo;
          } catch (error) {
            console.error(`Error loading photo ${file.name}:`, error);
            return null;
          }
        });

        const photosData = await Promise.all(photoPromises);
        const validPhotos = photosData.filter(photo => photo !== null) as Photo[];
        console.log('validPhotos:', validPhotos);
        // All valid photos except rejected
        const allPhotos = validPhotos.filter(photo => actionsMap[photo.path || ''] !== 'rejected');
        // Pending photos (not confirmed)
        const pendingPhotos = allPhotos.filter(photo => actionsMap[photo.path || ''] !== 'confirmed');
        console.log('pendingPhotos:', pendingPhotos);
        setPhotos(pendingPhotos);

        // Calculate counts
        const totalFoundCount = allPhotos.length;
        const pendingCount = pendingPhotos.length;
        const confirmedCount = Object.values(actionsMap).filter(action => action === 'confirmed').length;

        setTotalFound(totalFoundCount);
        setConfirmedPhotosCount(confirmedCount);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Gagal memuat foto",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, toast]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (user && user.email === "admin@st.id") {
      navigate("/admin");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa lagi!",
    });
    navigate("/");
  };

  const handleConfirm = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo || !photo.path || !user) return;

    try {
      // Save action to database
      const { error } = await supabase
        .from('user_photo_actions')
        .upsert({
          user_id: user.id,
          photo_path: photo.path,
          action: 'confirmed'
        });

      if (error) throw error;

      // Update local state
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, isConfirmed: true, isPending: false, hasWatermark: false }
            : p
        )
      );

      // Update user actions
      setUserActions(prev => ({ ...prev, [photo.path]: 'confirmed' }));

      toast({
        title: "Foto Dikonfirmasi!",
        description: "Foto telah ditambahkan ke koleksi Anda",
      });
    } catch (error) {
      console.error('Error confirming photo:', error);
      toast({
        title: "Error",
        description: "Gagal mengonfirmasi foto",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo || !photo.path || !user) return;

    try {
      // Save action to database
      const { error } = await supabase
        .from('user_photo_actions')
        .upsert({
          user_id: user.id,
          photo_path: photo.path,
          action: 'rejected'
        });

      if (error) throw error;

      // Remove from local state
      setPhotos((prev) => prev.filter((p) => p.id !== id));

      // Update user actions
      setUserActions(prev => ({ ...prev, [photo.path]: 'rejected' }));

      toast({
        title: "Foto Ditolak",
        description: "RoboTa akan belajar dari feedback ini",
      });
    } catch (error) {
      console.error('Error rejecting photo:', error);
      toast({
        title: "Error",
        description: "Gagal menolak foto",
        variant: "destructive",
      });
    }
  };

  const handleView = (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      setSelectedPhoto(photo);
    }
  };

  const filteredPhotos = photos.filter((photo) => {
    if (filter === "pending") return photo.isPending;
    if (filter === "confirmed") return photo.isConfirmed;
    return true;
  });

  const pendingCount = photos.filter((p) => p.isPending).length;
  const confirmedCount = confirmedPhotosCount;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <DashboardLayout onLogout={handleLogout}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Selamat Datang, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            RoboTa menemukan {pendingCount} foto baru yang mungkin Anda didalamnya
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari foto..."
              className="h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{totalFound}</span>
          </div>
          <p className="text-muted-foreground text-sm">Total Foto Ditemukan</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">{confirmedCount}</span>
          </div>
          <p className="text-muted-foreground text-sm">Foto Terkonfirmasi</p>
        </div>
      </div>

      {/* Photo Grid */}
      <PhotoGrid
        photos={filteredPhotos}
        onConfirm={handleConfirm}
        onReject={handleReject}
        onView={handleView}
      />

      {/* Photo Preview Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview Foto</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex justify-center">
              <img
                src={selectedPhoto.url}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
