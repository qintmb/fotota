import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Camera, Mail, Phone, MapPin, Shield, Edit2 } from "lucide-react";
import { SelfieUpload } from "@/components/auth/SelfieUpload";
import { useState } from "react";

export default function Account() {
  const navigate = useNavigate();
  const [isEditingSelfie, setIsEditingSelfie] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const user = {
    name: "Demo User",
    email: "demo@fotoyu.com",
    phone: "+62 812 3456 7890",
    location: "Jakarta, Indonesia",
    selfie: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    verified: true,
    joinedDate: "Desember 2024",
    stats: {
      totalPhotos: 24,
      confirmed: 18,
      pending: 6,
    },
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
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
                  src={user.selfie}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                />
                {user.verified && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-soft">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground mt-4">
                {user.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                Bergabung {user.joinedDate}
              </p>
              {user.verified && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                  <Shield className="h-3 w-3" />
                  Wajah Terverifikasi
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{user.stats.totalPhotos}</p>
                <p className="text-xs text-muted-foreground">Total Foto</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">{user.stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Dikonfirmasi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">{user.stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
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
              <Button variant="ghost" size="sm">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Telepon</p>
                  <p className="font-medium text-foreground">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Lokasi</p>
                  <p className="font-medium text-foreground">{user.location}</p>
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
                  Selfie digunakan RoboYu untuk mencocokkan wajah Anda
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
                onSelfieCapture={(file, preview) => {
                  console.log("New selfie:", file);
                  setIsEditingSelfie(false);
                }}
                existingSelfie={user.selfie}
              />
            ) : (
              <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/30">
                <img
                  src={user.selfie}
                  alt="Selfie"
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">Selfie Aktif</p>
                  <p className="text-sm text-muted-foreground">
                    Digunakan untuk pencocokan wajah oleh RoboYu
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
