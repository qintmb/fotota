import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PhotoGrid } from "@/components/photo/PhotoGrid";
import { Photo } from "@/components/photo/PhotoCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, SlidersHorizontal, MapPin, Calendar, Loader2, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Fotota() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Check if user is admin and redirect
  useEffect(() => {
    if (user && user.email === "admin@st.id") {
      toast({
        title: "Akses Ditolak",
        description: "Admin tidak memiliki akses ke halaman Fotota",
        variant: "destructive",
      });
      navigate("/admin");
    }
  }, [user, navigate, toast]);

  // Fetch confirmed photos for the user
  useEffect(() => {
    const fetchConfirmedPhotos = async () => {
      if (!user) return;

      try {
        // Get user's confirmed photo actions
        const { data: actionsData, error: actionsError } = await supabase
          .from('user_photo_actions')
          .select('photo_path')
          .eq('user_id', user.id)
          .eq('action', 'confirmed');

        if (actionsError) throw actionsError;

        if (actionsData.length === 0) {
          setPhotos([]);
          setLoading(false);
          return;
        }

        // Get signed URLs for confirmed photos
        const photoPromises = actionsData.map(async (action) => {
          try {
            const { data: signedUrl, error: urlError } = await supabase.storage
              .from('FOTO')
              .createSignedUrl(action.photo_path, 3600);

            if (urlError) throw urlError;

            return {
              id: action.photo_path,
              url: signedUrl.signedUrl,
              thumbnailUrl: signedUrl.signedUrl,
              location: undefined,
              date: undefined,
              isConfirmed: true,
              isPending: false,
              hasWatermark: false,
              matchScore: undefined,
            } as Photo;
          } catch (error) {
            console.error(`Error loading photo ${action.photo_path}:`, error);
            return null;
          }
        });

        const photosData = await Promise.all(photoPromises);
        const validPhotos = photosData.filter(photo => photo !== null) as Photo[];
        setPhotos(validPhotos);
      } catch (error) {
        console.error('Error fetching confirmed photos:', error);
        toast({
          title: "Error",
          description: "Gagal memuat foto",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmedPhotos();
  }, [user, toast]);

  const handleLogout = () => {
    navigate("/");
  };

  const handleView = (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      setSelectedPhoto(photo);
    }
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      if (!response.ok) throw new Error('Failed to fetch photo');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `foto-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Dimulai",
        description: "Foto sedang diunduh ke perangkat Anda",
      });
    } catch (error) {
      console.error('Error downloading photo:', error);
      toast({
        title: "Gagal Download",
        description: "Terjadi kesalahan saat mengunduh foto",
        variant: "destructive",
      });
    }
  };

  const handleConfirm = (id: string) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id
          ? { ...photo, isConfirmed: true, isPending: false, hasWatermark: false }
          : photo
      )
    );
    toast({
      title: "Foto Dikonfirmasi!",
      description: "Foto telah ditambahkan ke koleksi Anda",
    });
  };

  const handleReject = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    toast({
      title: "Foto Ditolak",
      description: "RoboTa akan belajar dari feedback Anda",
    });
  };

  const handleSearch = async () => {
    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSearching(false);
    toast({
      title: "Pencarian Selesai",
      description: "RoboTa menemukan 4 foto baru yang mungkin Anda",
    });
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Koleksi Foto Saya
        </h1>
        <p className="text-muted-foreground">
          Foto-foto yang telah Anda konfirmasi sebagai milik Anda
        </p>
      </div>

      {/* Stats */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Total Foto Koleksi</h3>
            <p className="text-muted-foreground text-sm">
              Foto yang telah Anda konfirmasi sebagai milik Anda
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{photos.length}</p>
            <p className="text-sm text-muted-foreground">Foto</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {photos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Koleksi Foto Anda
          </h2>
          <p className="text-muted-foreground text-sm">
            Semua foto yang telah Anda konfirmasi tersimpan di sini
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Belum ada foto</h3>
          <p className="text-muted-foreground mb-6">
            Anda belum mengonfirmasi foto apapun. Kunjungi Dashboard untuk melihat foto yang mungkin cocok dengan Anda.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Kunjungi Dashboard
          </Button>
        </div>
      ) : (
        <PhotoGrid
          photos={photos}
          onConfirm={handleConfirm}
          onReject={handleReject}
          onView={handleView}
        />
      )}

      {/* Photo Preview Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview Foto</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedPhoto.url}
                  alt="Preview"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedPhoto)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPhoto(null)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
