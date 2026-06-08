import React from "react";
import { MessageSquareOff, MessageSquare } from "lucide-react";

interface FloatingWAProps {
  storeName: string;
  storeWa: string;
}

export const FloatingWA: React.FC<FloatingWAProps> = ({
  storeName,
  storeWa,
}) => {
  const handleRedirect = () => {
    let cleanWa = storeWa.replace(/[^0-9]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    }
    const txt = encodeURIComponent(`Halo Admin ${storeName}, saya sedang mengunjungi web Anda dan ingin tanya info promo atau stok akun premium.`);
    window.open(`https://api.whatsapp.com/send/?phone=${cleanWa}&text=${txt}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 group flex items-center">
      {/* Pop-up message box displaying custom hover text */}
      <div className="bg-cyber-card border border-accent-wa/30 text-white font-orbitron font-semibold text-[10px] tracking-widest px-3.5 py-2 mr-3 opacity-0 translate-x-5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none shadow-[0_0_15px_rgba(37,211,102,0.15)] rounded-xs flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-wa animate-ping" />
        <span>CHAT KAMI ONLINE</span>
      </div>

      {/* Pulsating green WhatsApp bubble button icon */}
      <button
        onClick={handleRedirect}
        className="w-13 h-13 rounded-full bg-accent-wa/15 text-accent-wa border-2 border-accent-wa hover:bg-accent-wa hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(37,211,102,0.4)] hover:shadow-[0_0_25px_rgba(37,211,102,0.8)] select-none focus:outline-none relative animate-bounce"
        aria-label="Direct Chat via Whatsapp"
      >
        <span className="absolute inset-0 rounded-full border border-accent-wa/60 animate-ping opacity-75" />
        <MessageSquare className="w-5.5 h-5.5 fill-current" />
      </button>
    </div>
  );
};
