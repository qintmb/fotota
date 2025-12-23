import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PhotoGrid } from "@/components/photo/PhotoGrid";
import { Photo } from "@/components/photo/PhotoCard";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, MapPin, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock pending photos from RoboTa
const mockPendingPhotos: Photo[] = [
  {
    id: "p1",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400",
    location: "Semeru, Jawa Timur",
    date: "21 Des 2024",
    isConfirmed: false,
    isPending: true,
    hasWatermark: true,
    matchScore: 96,
  },
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
    location: "Rinjani, Lombok",
    date: "19 Des 2024",
    isConfirmed: false,
    isPending: true,
    hasWatermark: true,
    matchScore: 91,
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400",
    location: "Kawah Ijen",
    date: "17 Des 2024",
    isConfirmed: false,
    isPending: true,
    hasWatermark: true,
    matchScore: 88,
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400",
    location: "Dieng Plateau",
    date: "14 Des 2024",
    isConfirmed: false,
    isPending: true,
    hasWatermark: true,
    matchScore: 85,
  },
];

export default function Fotota() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>(mockPendingPhotos);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
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
          Fotota - Pencarian Foto
        </h1>
        <p className="text-muted-foreground">
          RoboTa mencari foto dokumentasi yang cocok dengan wajah Anda
        </p>
      </div>

      {/* Search Controls */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari berdasarkan lokasi atau tanggal..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg">
              <MapPin className="h-4 w-4 mr-2" />
              Lokasi
            </Button>
            <Button variant="outline" size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Tanggal
            </Button>
            <Button variant="outline" size="lg">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Cari Foto
                </>
              )}
            </Button>
          </div>
        </div>

        {/* RoboTa Status */}
        <div className="mt-4 p-4 rounded-xl bg-muted/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-soft animate-pulse-soft">
            <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">RoboTa Aktif</p>
            <p className="text-sm text-muted-foreground">
              Sedang memindai database foto untuk mencocokkan wajah Anda...
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{photos.filter(p => p.isPending).length}</p>
            <p className="text-xs text-muted-foreground">Foto ditemukan</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Foto yang Ditemukan
        </h2>
        <p className="text-muted-foreground text-sm">
          Konfirmasi foto yang benar-benar Anda untuk melatih RoboTa menjadi lebih akurat
        </p>
      </div>

      <PhotoGrid
        photos={photos}
        onConfirm={handleConfirm}
        onReject={handleReject}
        onView={(id) => console.log("View photo:", id)}
      />
    </DashboardLayout>
  );
}
