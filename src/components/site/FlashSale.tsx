import React from "react";
import { Zap, Flame } from "lucide-react";
import { FlashSaleItem, Product } from "../../types";
import { CountdownTimer } from "../ui/CountdownTimer";
import { ProductCard } from "./ProductCard";

interface FlashSaleProps {
  isActive: boolean;
  endsAt: string;
  items: FlashSaleItem[];
  onSelectProduct: (product: Product, flashPrice?: number) => void;
}

export const FlashSale: React.FC<FlashSaleProps> = ({
  isActive,
  endsAt,
  items,
  onSelectProduct,
}) => {
  if (!isActive || items.length === 0) return null;

  return (
    <section 
      id="flash-sale"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-6 border border-red-500/10 bg-red-950/5 relative z-10 rounded-xs overflow-hidden"
    >
      {/* Decorative gradient corner elements */}
      <span className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* Grid line boundary frame */}
      <div className="absolute top-0 right-12 left-12 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
      <div className="absolute bottom-0 right-12 left-12 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10 border-b border-red-500/15 pb-6">
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-pulse">
            <Flame className="w-6 h-6 text-red-500 fill-current" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-red-400 tracking-wider">
                CHRONOS FLASH SALE
              </h2>
              <span className="bg-red-500 text-white text-[9px] font-orbitron px-1 py-0.5 rounded-sm uppercase tracking-widest leading-none font-bold animate-pulse-fast">
                LIMIT TIDAK GILA
              </span>
            </div>
            <p className="text-xs text-cyber-muted font-sans mt-0.5 uppercase tracking-wider">
              Stok sewa akun premium promo terbatas. Habis dalam hitungan jam!
            </p>
          </div>
        </div>

        {/* Dynamic Countdown clock box */}
        <div className="flex items-center gap-2">
          <Zap className="hidden sm:inline w-4 h-4 text-accent-secondary" />
          <CountdownTimer endsAt={endsAt} />
        </div>
      </div>

      {/* Sales Items list container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it) => {
          if (!it.product) return null;
          // Assign fallback loaded category so product image badge rendered correctly
          const safeProduct: Product = {
            ...it.product,
            packages: it.package ? [it.package] : [],
          };
          return (
            <ProductCard
              key={it.id}
              product={safeProduct}
              onSelect={() => onSelectProduct(safeProduct, it.salePrice)}
              flashSalePrice={it.salePrice}
            />
          );
        })}
      </div>
    </section>
  );
};
