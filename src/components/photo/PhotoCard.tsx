import { useState } from "react";
import { Check, X, Download, Eye, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  location?: string;
  date?: string;
  isConfirmed: boolean;
  isPending: boolean;
  hasWatermark: boolean;
  matchScore?: number;
}

interface PhotoCardProps {
  photo: Photo;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
}

export function PhotoCard({ photo, onConfirm, onReject, onView }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden bg-card shadow-card transition-all duration-500",
        "hover:shadow-hover hover:scale-[1.02] cursor-pointer",
        "animate-scale-in"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(photo.id)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Photo */}
        <img
          src={photo.thumbnailUrl}
          alt="Foto dokumentasi"
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered && "scale-110",
            !imageLoaded && "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Face Privacy Overlay (for pending photos) */}
        {photo.isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="face-privacy-overlay absolute top-1/4 left-1/4 w-1/2 h-1/3 rounded-full" />
          </div>
        )}

        {/* Watermark Overlay */}
        {photo.hasWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-primary-foreground/30 text-4xl font-bold rotate-[-30deg] select-none">
              FOTOYU
            </span>
          </div>
        )}

        {/* Match Score Badge */}
        {photo.matchScore && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold backdrop-blur-sm">
            {photo.matchScore}% cocok
          </div>
        )}

        {/* Status Badge */}
        {photo.isConfirmed && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-semibold flex items-center gap-1 backdrop-blur-sm">
            <Check className="h-3 w-3" />
            Dikonfirmasi
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Action Buttons (on hover) */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 transition-all duration-300",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(photo.id);
              }}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Lihat
            </Button>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 space-y-2">
        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {photo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {photo.location}
            </span>
          )}
          {photo.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {photo.date}
            </span>
          )}
        </div>

        {/* Confirmation Buttons (for pending) */}
        {photo.isPending && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="confirm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm?.(photo.id);
              }}
            >
              <Check className="h-4 w-4 mr-1" />
              Ya, ini saya
            </Button>
            <Button
              size="sm"
              variant="reject"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onReject?.(photo.id);
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Bukan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
