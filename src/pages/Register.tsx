import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelfieUpload } from "@/components/auth/SelfieUpload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type Step = "info" | "selfie";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user, loading } = useAuth();
  const [step, setStep] = useState<Step>("info");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selfie, setSelfie] = useState<{ file: File; preview: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleNextStep = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon lengkapi semua field",
      });
      return;
    }
    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password minimal 6 karakter",
      });
      return;
    }
    setStep("selfie");
  };

  const handleSubmit = async () => {
    if (!selfie) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon upload selfie untuk verifikasi wajah",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.name);

    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "Email sudah terdaftar. Silakan login.";
      }
      toast({
        variant: "destructive",
        title: "Registrasi Gagal",
        description: message,
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Registrasi Berhasil!",
      description: "Selamat datang di FotoYu!",
    });

    navigate("/dashboard");
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FotoYu</span>
          </Link>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === "info" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "info" ? "gradient-primary text-primary-foreground" : step === "selfie" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {step === "selfie" ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="hidden sm:inline text-sm font-medium">Informasi</span>
            </div>
            <div className="flex-1 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step === "selfie" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "selfie" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                2
              </div>
              <span className="hidden sm:inline text-sm font-medium">Verifikasi Wajah</span>
            </div>
          </div>

          {/* Step 1: Info */}
          {step === "info" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Buat Akun Baru
                </h1>
                <p className="text-muted-foreground">
                  Mulai temukan foto dokumentasi Anda
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNextStep();
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nama lengkap Anda"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Lanjutkan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}

          {/* Step 2: Selfie */}
          {step === "selfie" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Verifikasi Wajah
                </h1>
                <p className="text-muted-foreground">
                  RoboYu membutuhkan selfie untuk mengenali wajah Anda
                </p>
              </div>

              <SelfieUpload
                onSelfieCapture={(file, preview) => setSelfie({ file, preview })}
                existingSelfie={selfie?.preview}
              />

              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep("info")}
                >
                  Kembali
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!selfie || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    <>
                      Daftar Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Login Link */}
          <p className="mt-8 text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="max-w-lg text-center text-primary-foreground">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary-foreground/10 flex items-center justify-center animate-float">
            <Camera className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Kenapa Perlu Selfie?
          </h2>
          <ul className="text-left space-y-4 text-primary-foreground/90">
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 shrink-0 mt-0.5" />
              <span>RoboYu menggunakan AI untuk mencocokkan wajah Anda dengan database foto</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 shrink-0 mt-0.5" />
              <span>Mencegah pencurian identitas dengan verifikasi liveness</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 shrink-0 mt-0.5" />
              <span>Data biometrik terenkripsi dan hanya bisa diakses oleh Anda</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
