import React from "react";
import { MessageSquare, Mail, Shield, Instagram, Facebook } from "lucide-react";

interface FooterProps {
  storeName: string;
  storeEmail: string;
  storeWa: string;
  footerDesc: string;
  igUrl: string;
  tiktokUrl: string;
  fbUrl: string;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeName,
  storeEmail,
  storeWa,
  footerDesc,
  igUrl,
  tiktokUrl,
  fbUrl,
  onNavigate,
}) => {
  return (
    <footer className="bg-cyber-bg border-t border-accent-primary/20 relative z-10 pt-16 pb-8">
      {/* Decorative colored glow panels */}
      <div className="absolute top-0 left-10 w-48 h-48 bg-accent-primary/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-48 h-48 bg-accent-secondary/2 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div className="md:col-span-2 text-left">
            <span className="font-orbitron font-black text-2xl tracking-widest text-accent-primary text-neon mb-4 inline-block">
              [{storeName.toUpperCase()}]
            </span>
            <p className="text-sm text-cyber-muted font-sans leading-relaxed mt-2 max-w-sm">
              {footerDesc}
            </p>

            {/* Social handles */}
            <div className="flex gap-4 mt-6">
              <a href={igUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-cyber-muted/20 hover:border-accent-primary hover:text-accent-primary bg-cyber-card flex items-center justify-center rounded-xs transition-colors cursor-pointer">
                <Instagram className="w-4.5 h-4.5" />
              </a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-cyber-muted/20 hover:border-accent-primary hover:text-accent-primary bg-cyber-card flex items-center justify-center rounded-xs transition-colors cursor-pointer">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.15.99 1.11 2.39 1.83 3.93 2.01v3.83c-1.42-.04-2.82-.48-4.01-1.28-.2-.14-.39-.28-.58-.44-.04 1.95-.02 3.91-.03 5.86 0 2.22-.64 4.46-2.18 6.07-1.46 1.59-3.66 2.45-5.83 2.31-2.91-.12-5.71-2.15-6.55-4.99-.95-3.04.14-6.6 2.63-8.32 1.62-1.15 3.69-1.54 5.64-1.14v3.9c-1.15-.36-2.48-.12-3.4.61-1.04.79-1.44 2.22-1.1 3.5.38 1.48 1.82 2.53 3.37 2.41 1.45-.04 2.76-1.15 2.92-2.59.12-1.21.05-2.43.06-3.64.01-3.79-.01-7.58-.01-11.37z" />
                </svg>
              </a>
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-cyber-muted/20 hover:border-accent-primary hover:text-accent-primary bg-cyber-card flex items-center justify-center rounded-xs transition-colors cursor-pointer">
                <Facebook className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Navigation link widgets */}
          <div>
            <h4 className="font-orbitron font-bold text-xs tracking-widest text-white uppercase mb-5">
              // SITE PORTAL
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-cyber-muted">
              <li>
                <a href="#catalog" className="hover:text-accent-primary hover:underline transition-colors block">
                  &gt; PRODUK KATALOG
                </a>
              </li>
              <li>
                <a href="#flash-sale" className="hover:text-accent-primary hover:underline transition-colors block">
                  &gt; CHRONOS FLASH SALE
                </a>
              </li>
              <li>
                <a href="#howto" className="hover:text-accent-primary hover:underline transition-colors block">
                  &gt; DIAGRAM CARA BELI
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-accent-primary hover:underline transition-colors block">
                  &gt; CLIENT TESTIMONI
                </a>
              </li>
            </ul>
          </div>

          {/* Contact and admin portal */}
          <div>
            <h4 className="font-orbitron font-bold text-xs tracking-widest text-white uppercase mb-5">
              // SECURE CHANNELS
            </h4>
            <div className="space-y-3.5 text-xs text-cyber-muted">
              <div className="flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-accent-primary shrink-0 transition-colors" />
                <div>
                  <span className="block font-semibold text-white">WA Help Desk</span>
                  <a href={`https://wa.me/${storeWa}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent-primary hover:underline mt-0.5 block">
                    +{storeWa}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-accent-secondary shrink-0" />
                <div>
                  <span className="block font-semibold text-white">Secure Mail</span>
                  <span className="block mt-0.5 select-all">{storeEmail}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate("admin-login")}
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono text-accent-primary bg-accent-primary/10 border border-accent-primary/30 px-2.5 py-1.5 rounded-sm hover:bg-accent-primary/20 hover:text-white transition-all cursor-pointer uppercase tracking-widest"
              >
                <Shield className="w-3.5 h-3.5" />
                ADMIN LOGIN SHIELD
              </button>
            </div>
          </div>
        </div>

        {/* Lower bar copy protections */}
        <div className="border-t border-cyber-muted/15 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-cyber-muted">
          <p>© {new Date().getFullYear()} [{storeName.toUpperCase()}]. SECURED CYBER MARKETPLACE PROTOCOL.</p>
          <div className="flex gap-4 text-[10px]">
            <span className="text-accent-primary select-none flex items-center gap-1">
              ● HOST STATUS: ONLINE
            </span>
            <span>|</span>
            <span className="text-accent-secondary select-none flex items-center gap-1 animate-pulse">
              ● SECURE SYSTEM
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
