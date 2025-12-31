import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { cn } from "@/lib/utils";

interface AdminDashboardLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

export function AdminDashboardLayout({ children, onLogout }: AdminDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar onLogout={onLogout} />
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}