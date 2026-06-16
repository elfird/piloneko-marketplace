import React, { useState, useEffect } from "react";
import { Play, MessageCircle, Shield, Award, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { CyberButton } from "../../components/ui/CyberButton";

interface HeroSectionProps {
  headline: string;
  subtext: string;
  badge1: string;
  badge2: string;
  badge3: string;
  ctaPrimary: string;
  ctaSecondary: string;
  storeName: string;
  storeWa: string;
  banners?: any[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  subtext,
  badge1,
  badge2,
  badge3,
  ctaPrimary,
  ctaSecondary,
  storeName,
  storeWa,
  banners = [],
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleScrollToCatalog = () => {
    const el = document.getElementById("catalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleWAAdvisor = () => {
    let cleanWa = storeWa.replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    }
    window.open(
      `https://wa.me/${cleanWa}?text=Halo%20Admin%20${encodeURIComponent(
        storeName
      )}!%20Saya%20tertarik%20dengan%20layanan%20jual-beli%20akun%20premium%20&%20top%20up%20game%20Anda.`,
      "_blank"
    );
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-cyber-bg scanlines overflow-hidden pt-10 pb-16">
      {/* 3D Perspective Cyber space Grid and Background Glow Panels */}
      <div className="absolute inset-0 grid-perspective opacity-50 z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
        {/* Promotional Sliding Banner Carousel */}
        {banners && banners.length > 0 && (
          <div className="max-w-4xl mx-auto mb-10 relative group rounded-xs overflow-hidden border border-accent-primary/20 bg-cyber-card/45 shadow-[0_0_15px_rgba(0,245,255,0.05)]">
            <div className="relative aspect-[16/6] sm:aspect-[21/9] w-full overflow-hidden">
              {banners.map((b, idx) => (
                <div
                  key={b.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    idx === activeSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 z-0 pointer-events-none"
                  }`}
                >
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6 text-left">
                    <span className="bg-accent-primary/25 border border-accent-primary/50 text-accent-primary text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase mb-1.5 inline-block">
                      SPECIAL EVENT
                    </span>
                    <h3 className="text-white text-sm sm:text-lg font-black font-orbitron tracking-wider drop-shadow-md">
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p className="text-cyber-muted text-[10px] sm:text-xs font-sans drop-shadow-md line-clamp-1 mt-0.5">
                        {b.subtitle}
                      </p>
                    )}
                    {b.link && (
                      <a
                        href={b.link}
                        className="inline-flex items-center gap-1 text-accent-primary hover:text-white font-mono text-[9px] sm:text-xs uppercase font-bold tracking-widest mt-2 hover:underline"
                      >
                        CHECK OUT NOW &gt;&gt;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === activeSlide ? "bg-accent-primary w-4" : "bg-cyber-muted/40 hover:bg-cyber-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}




        {/* Headline with font Orbitron and cyan neon text-shadow */}
        <h1 className="font-orbitron font-black text-4xl sm:text-6xl md:text-7xl leading-tight tracking-tighter text-white mb-6">
          <span className="text-neon block mb-2">{headline.split(" & ")[0]}</span>
          {headline.includes(" & ") && (
            <span className="text-neon-sec animate-glitch font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
              & {headline.split(" & ")[1]}
            </span>
          )}
        </h1>

        {/* Subtitle text */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-cyber-text leading-relaxed tracking-wide opacity-90 mb-10 font-sans">
          {subtext}
        </p>

        {/* Dual Actions CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
          <CyberButton variant="primary" size="lg" onClick={handleScrollToCatalog} className="w-full sm:w-auto font-bold flex gap-2">
            <Play className="w-4 h-4 fill-current text-white" />
            {ctaPrimary}
          </CyberButton>

          <CyberButton variant="wa" size="lg" onClick={handleWAAdvisor} className="w-full sm:w-auto font-bold flex gap-2">
            <MessageCircle className="w-4 h-4 text-white" />
            {ctaSecondary}
          </CyberButton>
        </div>

        {/* Trust Badges section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-accent-primary/10 pt-10">
          <div className="flex items-center justify-center gap-3 bg-cyber-surface/40 p-4 border border-accent-primary/10 rounded-xs">
            <Shield className="w-6 h-6 text-accent-primary" />
            <div className="text-left">
              <span className="block font-orbitron font-bold text-sm text-white">{badge1}</span>
              <span className="block text-xs text-cyber-muted font-mono">Verified Security</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 bg-cyber-surface/40 p-4 border border-accent-primary/10 rounded-xs">
            <Award className="w-6 h-6 text-accent-secondary" />
            <div className="text-left">
              <span className="block font-orbitron font-bold text-sm text-white">{badge2}</span>
              <span className="block text-xs text-cyber-muted font-mono">100% Refunds SLA</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 bg-cyber-surface/40 p-4 border border-accent-primary/10 rounded-xs">
            <Zap className="w-6 h-6 text-accent-wa" />
            <div className="text-left">
              <span className="block font-orbitron font-bold text-sm text-white">{badge3}</span>
              <span className="block text-xs text-cyber-muted font-mono">Instant delivery via WA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

