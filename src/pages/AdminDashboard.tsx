import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FileExplorer } from "@/components/admin/FileExplorer";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Check if user is admin
  useEffect(() => {
    if (user && user.email !== "admin@st.id") {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki akses ke dashboard admin",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa lagi!",
    });
    navigate("/");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';

  return (
    <AdminDashboardLayout onLogout={handleLogout}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Dashboard Admin - {userName} 👑
          </h1>
          <p className="text-muted-foreground">
            File Explorer untuk mengelola seluruh data dan folder dari storage Database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* File Explorer */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-card">
        <FileExplorer />
      </div>
    </AdminDashboardLayout>
  );
}