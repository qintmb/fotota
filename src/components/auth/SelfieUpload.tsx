import { useState, useRef } from "react";
import { Camera, Upload, RotateCcw, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SelfieUploadProps {
  onSelfieCapture: (file: File, preview: string) => void;
  existingSelfie?: string;
}

export function SelfieUpload({ onSelfieCapture, existingSelfie }: SelfieUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingSelfie || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onSelfieCapture(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      setIsCapturing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the image
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreview(dataUrl);
      onSelfieCapture(file, dataUrl);
      stopCamera();
    }, "image/jpeg", 0.9);
  };

  const resetSelfie = () => {
    setPreview(null);
    stopCamera();
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
          isDragging
            ? "border-primary bg-primary/5"
            : preview
            ? "border-primary/50"
            : "border-muted-foreground/30 hover:border-primary/50",
          !preview && !isCapturing && "cursor-pointer"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && !isCapturing && fileInputRef.current?.click()}
      >
        {/* Camera View */}
        {isCapturing && (
          <div className="relative aspect-square">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-2 border-primary-foreground/50 rounded-full" />
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && !isCapturing && (
          <div className="relative aspect-square">
            <img
              src={preview}
              alt="Selfie preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-sm font-medium">
              <Check className="h-4 w-4" />
              Selfie berhasil
            </div>
          </div>
        )}

        {/* Upload Prompt */}
        {!preview && !isCapturing && (
          <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Camera className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload Selfie Anda
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Selfie akan digunakan RoboYu untuk mencocokkan wajah Anda dengan database foto
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="h-3 w-3" />
              Drag & drop atau klik untuk upload
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isCapturing && !preview && (
          <>
            <Button
              type="button"
              variant="hero"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Ambil Selfie
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </>
        )}

        {isCapturing && (
          <>
            <Button
              type="button"
              variant="hero"
              className="flex-1"
              onClick={capturePhoto}
            >
              <Camera className="h-4 w-4 mr-2" />
              Ambil Foto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
            >
              Batal
            </Button>
          </>
        )}

        {preview && !isCapturing && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={resetSelfie}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Ganti Selfie
          </Button>
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 text-sm">
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground mb-1">Privasi Terjamin</p>
          <p className="text-muted-foreground text-xs">
            Data biometrik wajah Anda dienkripsi dan hanya bisa dibaca oleh RoboYu pribadi Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
