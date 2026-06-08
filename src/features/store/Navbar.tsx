import React, { useState } from "react";
import { Phone, Shield, Menu, X } from "lucide-react";
import { CyberButton } from "../../components/ui/CyberButton";
import { cn } from "../../lib/utils";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
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

  const NavLinks = ({ mobile }: { mobile?: boolean }) => (
    <>
      <button onClick={() => scrollToSection("catalog")} className={cn("hover:text-accent-primary transition-all cursor-pointer", mobile && "w-full text-left py-3 border-b border-cyber-muted/10")}>
        KATALOG
      </button>
      <button onClick={() => scrollToSection("flash-sale")} className={cn("hover:text-accent-primary transition-all cursor-pointer", mobile && "w-full text-left py-3 border-b border-cyber-muted/10")}>
        FLASH SALE
      </button>
      <button onClick={() => scrollToSection("howto")} className={cn("hover:text-accent-primary transition-all cursor-pointer", mobile && "w-full text-left py-3 border-b border-cyber-muted/10")}>
        CARA BELI
      </button>
      <button onClick={() => scrollToSection("testimonials")} className={cn("hover:text-accent-primary transition-all cursor-pointer", mobile && "w-full text-left py-3 border-b border-cyber-muted/10")}>
        TESTIMONI
      </button>
      <button onClick={() => scrollToSection("faq")} className={cn("hover:text-accent-primary transition-all cursor-pointer", mobile && "w-full text-left py-3 border-b border-cyber-muted/10")}>
        FAQ
      </button>
      <button onClick={() => { onNavigate("warranty-claim"); setMobileMenuOpen(false); }} className={cn("hover:text-accent-secondary transition-all cursor-pointer font-bold text-accent-secondary", mobile && "w-full text-left py-3 border-b border-cyber-muted/10")}>
        GARANSI
      </button>
      <button onClick={() => { onNavigate("support-ticket"); setMobileMenuOpen(false); }} className={cn("hover:text-accent-primary transition-all cursor-pointer font-bold text-accent-primary", mobile && "w-full text-left py-3 border-b border-cyber-muted/10")}>
        BANTUAN
      </button>
      <button 
        onClick={() => { onNavigate("admin-login"); setMobileMenuOpen(false); }} 
        className={cn("text-cyber-muted hover:text-accent-secondary hover:underline transition-all cursor-pointer font-mono text-[10px]", mobile && "w-full text-left py-3")}
      >
        [ADMIN]
      </button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-accent-primary/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between">
        
        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden text-cyber-muted hover:text-accent-primary transition-colors p-2 -ml-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo with Cyber brackets and text glow shadow */}
        <div 
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 cursor-pointer relative group mx-auto md:mx-0"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName}
              className="h-8 md:h-10 max-w-[140px] md:max-w-[160px] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="font-orbitron font-black text-lg md:text-xl text-accent-primary tracking-widest text-neon">
              <span className="text-white group-hover:text-accent-secondary transition-colors duration-300">[</span>
              {storeName.toUpperCase()}
              <span className="text-white group-hover:text-accent-secondary transition-colors duration-300">]</span>
            </span>
          )}
          <ChipShield />
        </div>

        {/* Links bar (Desktop) */}
        <nav className="hidden md:flex items-center gap-5 font-orbitron text-[11px] tracking-wider text-cyber-text">
          <NavLinks />
        </nav>

        {/* Support CTA WA action Button with fast response animation */}
        <div className="flex items-center gap-3">
          <CyberButton 
            variant="wa" 
            size="sm" 
            onClick={handleWAContact}
            className="font-orbitron font-semibold flex items-center gap-1.5 focus:shadow-neon px-3 py-1.5 md:px-4 md:py-2"
          >
            <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 animate-bounce" />
            <span className="hidden sm:inline text-xs md:text-sm">CHAT</span>
          </CyberButton>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div 
        className={cn(
          "md:hidden absolute top-full left-0 w-full bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-accent-primary/20 overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col px-6 py-4 font-orbitron text-sm tracking-wider text-cyber-text overflow-y-auto max-h-[70vh]">
          <NavLinks mobile />
        </div>
      </div>

      {/* Under-Navbar Cyber gradient glow accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-80" />
    </header>
  );
};

const ChipShield = () => (
  <div className="absolute -top-2.5 -right-5 md:-top-3 md:-right-6 flex items-center">
    <span className="bg-accent-primary/20 text-accent-primary text-[6px] md:text-[7px] font-mono border border-accent-primary/40 px-1 rounded-xs flex items-center gap-0.5">
      <Shield className="w-2 h-2 text-accent-primary" /> SECURE
    </span>
  </div>
);
