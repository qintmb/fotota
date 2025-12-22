import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PhotoGrid } from "@/components/photo/PhotoGrid";
import { Photo } from "@/components/photo/PhotoCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Bell, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Mock data for demo
const mockPhotos: Photo[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    location: "Bali, Indonesia",
    date: "20 Des 2024",
    isConfirmed: false,
    isPending: true,
    hasWatermark: true,
    matchScore: 94,
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
    location: "Yogyakarta",
    date: "18 Des 2024",
    isConfirmed: true,
    isPending: false,
    hasWatermark: false,
    matchScore: 98,
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
    location: "Labuan Bajo",
    date: "15 Des 2024",
    isConfirmed: false,
    isPending: true,
    hasWatermark: true,
    matchScore: 87,
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400",
    location: "Raja Ampat",
    date: "12 Des 2024",
    isConfirmed: true,
    isPending: false,
    hasWatermark: false,
    matchScore: 92,
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400",
    location: "Bromo",
    date: "10 Des 2024",
    isConfirmed: false,
    isPending: true,
    hasWatermark: true,
    matchScore: 89,
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400",
    location: "Bandung",
    date: "8 Des 2024",
    isConfirmed: true,
    isPending: false,
    hasWatermark: false,
    matchScore: 95,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa lagi!",
    });
    navigate("/");
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
      description: "RoboYu akan belajar dari feedback ini",
    });
  };

  const filteredPhotos = photos.filter((photo) => {
    if (filter === "pending") return photo.isPending;
    if (filter === "confirmed") return photo.isConfirmed;
    return true;
  });

  const pendingCount = photos.filter((p) => p.isPending).length;
  const confirmedCount = photos.filter((p) => p.isConfirmed).length;

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
            RoboYu menemukan {pendingCount} foto baru yang mungkin Anda
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
            <span className="text-2xl font-bold text-foreground">{photos.length}</span>
          </div>
          <p className="text-muted-foreground text-sm">Total Foto Ditemukan</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-amber-500" />
            </div>
            <span className="text-2xl font-bold text-foreground">{pendingCount}</span>
          </div>
          <p className="text-muted-foreground text-sm">Menunggu Konfirmasi</p>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Semua ({photos.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Menunggu ({pendingCount})
        </Button>
        <Button
          variant={filter === "confirmed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("confirmed")}
        >
          Terkonfirmasi ({confirmedCount})
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Photo Grid */}
      <PhotoGrid
        photos={filteredPhotos}
        onConfirm={handleConfirm}
        onReject={handleReject}
        onView={(id) => console.log("View photo:", id)}
      />
    </DashboardLayout>
  );
}
