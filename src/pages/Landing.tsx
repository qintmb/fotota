import { Camera, Shield, Sparkles, Users, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: "Face Recognition AI",
      description: "RoboYu menggunakan teknologi AI canggih untuk mencocokkan wajah Anda dengan jutaan foto dokumentasi.",
    },
    {
      icon: Shield,
      title: "Privasi Terjamin",
      description: "Data biometrik dienkripsi secara lokal. Bahkan staf kami tidak dapat mengaksesnya.",
    },
    {
      icon: Sparkles,
      title: "Temukan Foto Anda",
      description: "Foto dokumentasi Anda di event, wisata, atau tempat umum kini mudah ditemukan.",
    },
    {
      icon: Users,
      title: "Marketplace Kreator",
      description: "Fotografer profesional mengunggah karya mereka. Anda menemukan momen berharga.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FotoYu</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Masuk
            </Button>
            <Button variant="hero" onClick={() => navigate("/register")}>
              Daftar Gratis
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 lg:px-12 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Powered by AI Face Recognition
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
              Temukan Foto <span className="text-gradient">Dokumentasi Anda</span> dengan Selfie
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
              FotoYu menghubungkan Anda dengan fotografer profesional. Upload selfie, dan RoboYu akan menemukan semua foto Anda dari database jutaan dokumentasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" onClick={() => navigate("/register")}>
                Mulai Sekarang
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="hero-outline" size="xl">
                <Play className="h-5 w-5 mr-2" />
                Lihat Cara Kerja
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="relative z-10 container mx-auto px-6 lg:px-12 pb-20">
          <div className="relative rounded-3xl overflow-hidden shadow-hover bg-card border border-border/50">
            <div className="aspect-[16/9] lg:aspect-[21/9] bg-gradient-to-br from-primary/5 via-transparent to-primary/10 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-float">
                  <Camera className="h-12 w-12 text-primary-foreground" />
                </div>
                <p className="text-muted-foreground">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Bagaimana FotoYu Bekerja
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Teknologi AI kami membuat pencarian foto dokumentasi menjadi mudah dan aman
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                3 Langkah Mudah Menemukan Foto Anda
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Daftar & Verifikasi Wajah",
                    description: "Buat akun dan ambil selfie untuk verifikasi. RoboYu akan menyimpan biometrik wajah Anda dengan aman.",
                  },
                  {
                    step: "02",
                    title: "RoboYu Mencari",
                    description: "AI kami bekerja 24/7 mencocokkan wajah Anda dengan jutaan foto dari fotografer profesional.",
                  },
                  {
                    step: "03",
                    title: "Konfirmasi & Unduh",
                    description: "Review foto yang ditemukan. Konfirmasi yang benar-benar Anda, dan unduh dalam kualitas penuh.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full gradient-primary opacity-20 animate-pulse-soft" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 gradient-primary">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
            Siap Menemukan Foto Dokumentasi Anda?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Bergabung dengan ribuan pengguna yang sudah menemukan momen berharga mereka melalui FotoYu
          </p>
          <Button
            size="xl"
            className="bg-background text-primary hover:bg-background/90 shadow-hover"
            onClick={() => navigate("/register")}
          >
            Daftar Gratis Sekarang
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Camera className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">FotoYu</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FotoYu. Marketplace Dokumentasi Personal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
