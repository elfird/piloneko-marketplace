import React from "react";
import { MessageSquare, Phone, Shield } from "lucide-react";
import { CyberButton } from "../../components/ui/CyberButton";

interface NavbarProps {
  storeName: string;
  storeWa: string;
  logoUrl?: string;
  onNavigate: (view: string, slug?: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  storeName,
  storeWa,
  logoUrl,
  onNavigate,
  currentView,
}) => {
  const scrollToSection = (id: string) => {
    if (currentView !== "landing") {
      onNavigate("landing");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWAContact = () => {
    let cleanWa = storeWa.replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    }
    window.open(`https://wa.me/${cleanWa}?text=Halo%20Admin%20${encodeURIComponent(storeName)}%2c%20saya%20ingin%20tanya%20stok%20akun%20premium`, "_blank");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0F]/85 backdrop-blur-md border-b border-accent-primary/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo with Cyber brackets and text glow shadow */}
        <div 
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 cursor-pointer relative group"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName}
              className="h-10 max-w-[160px] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="font-orbitron font-black text-xl text-accent-primary tracking-widest text-neon">
              <span className="text-white group-hover:text-accent-secondary transition-colors duration-300">[</span>
              {storeName.toUpperCase()}
              <span className="text-white group-hover:text-accent-secondary transition-colors duration-300">]</span>
            </span>
          )}
          <ChipShield />
        </div>

        {/* Links bar */}
        <nav className="hidden md:flex items-center gap-5 font-orbitron text-[11px] tracking-wider text-cyber-text">
          <button onClick={() => scrollToSection("catalog")} className="hover:text-accent-primary transition-all cursor-pointer">
            KATALOG
          </button>
          <button onClick={() => scrollToSection("flash-sale")} className="hover:text-accent-primary transition-all cursor-pointer">
            FLASH SALE
          </button>
          <button onClick={() => scrollToSection("howto")} className="hover:text-accent-primary transition-all cursor-pointer">
            CARA BELI
          </button>
          <button onClick={() => scrollToSection("testimonials")} className="hover:text-accent-primary transition-all cursor-pointer">
            TESTIMONI
          </button>
          <button onClick={() => scrollToSection("faq")} className="hover:text-accent-primary transition-all cursor-pointer">
            FAQ
          </button>
          <button onClick={() => onNavigate("warranty-claim")} className="hover:text-accent-secondary transition-all cursor-pointer font-bold text-accent-secondary">
            GARANSI
          </button>
          <button onClick={() => onNavigate("support-ticket")} className="hover:text-accent-primary transition-all cursor-pointer font-bold text-accent-primary">
            BANTUAN
          </button>
          <button 
            onClick={() => onNavigate("admin-login")} 
            className="text-cyber-muted hover:text-accent-secondary hover:underline transition-all cursor-pointer font-mono text-[10px]"
          >
            [ADMIN]
          </button>
        </nav>

        {/* Support CTA WA action Button with fast response animation */}
        <div className="flex items-center gap-3">
          <CyberButton 
            variant="wa" 
            size="sm" 
            onClick={handleWAContact}
            className="font-orbitron font-semibold flex items-center gap-1.5 focus:shadow-neon"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">CHAT ADMIN</span>
          </CyberButton>
        </div>
      </div>

      {/* Under-Navbar Cyber gradient glow accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-80" />
    </header>
  );
};

const ChipShield = () => (
  <div className="absolute -top-3 -right-6 flex items-center">
    <span className="bg-accent-primary/20 text-accent-primary text-[7px] font-mono border border-accent-primary/40 px-1 rounded-xs flex items-center gap-0.5">
      <Shield className="w-2 h-2 text-accent-primary" /> SECURE
    </span>
  </div>
);
