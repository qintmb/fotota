import { Photo, PhotoCard } from "./PhotoCard";
import { cn } from "@/lib/utils";

interface PhotoGridProps {
  photos: Photo[];
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export function PhotoGrid({ photos, onConfirm, onReject, onView, className }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Belum ada foto ditemukan
        </h3>
        <p className="text-muted-foreground max-w-md">
          RoboYu sedang mencari foto dokumentasi Anda. Foto akan muncul di sini ketika ditemukan.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("photo-grid", className)}>
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <PhotoCard
            photo={photo}
            onConfirm={onConfirm}
            onReject={onReject}
            onView={onView}
          />
        </div>
      ))}
    </div>
  );
}
