import React from "react";
import { Star, ShieldCheck, Heart } from "lucide-react";
import { Testimonial } from "../../types";
import { CyberCard } from "../../components/ui/CyberCard";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-accent-primary/10">
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-accent-primary/3 rounded-full blur-[90px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white tracking-widest text-neon relative inline-block mb-3 uppercase">
          // CLIENT RECON
        </h2>
        <p className="text-xs sm:text-sm text-cyber-muted font-sans uppercase tracking-widest">
          Bagaimana ulasan mereka setelah menggunakan layanan PILONEKO?
        </p>
      </div>

      {/* Testimonial grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((test) => (
          <CyberCard
            key={test.id}
            accent="primary"
            hoverable={true}
            glowing={false}
            className="flex flex-col h-full justify-between bg-cyber-card/80 p-6 relative rounded-xs border border-accent-primary/10"
          >
            {/* Quote container */}
            <div className="flex-1">
              {/* Star Rating array */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < test.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-cyber-muted/30"
                    }`}
                  />
                ))}
              </div>

              {/* Message text */}
              <p className="text-sm text-cyber-text leading-relaxed font-sans italic opacity-95">
                "{test.comment}"
              </p>
            </div>

            {/* Profile bottom bar details */}
            <div className="flex items-center gap-3.5 border-t border-accent-primary/10 pt-4 mt-6">
              <div className="relative w-11 h-11 bg-cyber-surface border border-accent-secondary/40 shrink-0 p-0.5 rounded-xs overflow-hidden">
                <img
                  src={test.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                  alt={test.buyerName}
                  className="w-full h-full object-cover filter brightness-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-left filter select-none">
                <span className="block font-orbitron font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                  {test.buyerName}
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                </span>
                <span className="text-[10px] text-accent-secondary font-semibold font-mono tracking-widest block mt-0.5 uppercase">
                  📦 {test.productName.toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Heart heart background visual watermarks */}
            <div className="absolute bottom-4 right-6 text-white/5 font-bold tracking-widest font-mono text-3xl select-none">
              <Heart className="w-8 h-8 opacity-25" />
            </div>
          </CyberCard>
        ))}
      </div>
    </section>
  );
};
