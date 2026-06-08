import React from "react";
import { Tv, Gamepad, Key, ShieldCheck, ShoppingCart, Info, Flame } from "lucide-react";
import { Product } from "../../types";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberBadge } from "../../components/ui/CyberBadge";
import { CyberButton } from "../../components/ui/CyberButton";
import { formatPrice } from "../../lib/utils";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  flashSalePrice?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  flashSalePrice,
}) => {
  // Determine Lucide Icon based on Category
  const getIcon = (catName: string) => {
    switch (catName) {
      case "Akun Premium":
        return <Tv className="w-4 h-4" />;
      case "Top Up Game":
        return <Gamepad className="w-4 h-4" />;
      case "Lisensi Software":
        return <Key className="w-4 h-4" />;
      default:
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  // Find lowest price or flash price
  const activePackages = product.packages || [];
  const lowestPricePkg = activePackages.length > 0 ? activePackages[0] : null;
  const priceDisplay = flashSalePrice !== undefined
    ? flashSalePrice
    : lowestPricePkg ? lowestPricePkg.price : 0;
  const originalPriceDisplay = lowestPricePkg ? lowestPricePkg.originalPrice : 0;

  const isGameTopUp = product.category?.type === "GAME_TOPUP" || product.slug.includes("game") || product.category?.name.includes("Game");

  return (
    <CyberCard
      className="flex flex-col h-full bg-cyber-card/90"
      accent={flashSalePrice !== undefined ? "secondary" : "primary"}
    >
      {/* Thumbnail with overlay tags */}
      <div className="relative w-full h-42 overflow-hidden bg-cyber-bg/80 border-b border-accent-primary/10">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        {/* Semi transparent cyan backdrop overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-card to-transparent" />

        {/* Action badge tags */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
          <CyberBadge variant={flashSalePrice !== undefined ? "flash" : "primary"}>
            {getIcon(product.category?.name || "")}
            <span>{product.category?.name || "Premium"}</span>
          </CyberBadge>
          {lowestPricePkg && lowestPricePkg.warrantyDays > 0 && (
            <CyberBadge variant="secondary">
              <ShieldCheck className="w-3 h-3 text-accent-secondary" />
              <span>GARANSI</span>
            </CyberBadge>
          )}
        </div>

        {flashSalePrice !== undefined && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-red-600 text-white text-[10px] font-orbitron font-extrabold px-1.5 py-0.5 border border-red-500 animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>FLASH SALE</span>
          </div>
        )}
      </div>

      {/* Meta details */}
      <div className="flex-1 flex flex-col pt-4">
        {/* Name and Sold Badge */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-orbitron font-semibold text-sm sm:text-base text-white tracking-wide hover:text-accent-primary transition-colors">
            {product.name}
          </h3>
          <span className="font-mono text-[9px] text-cyber-muted whitespace-nowrap bg-cyber-surface border border-cyber-muted/20 px-1 py-0.5">
            {product.totalSold || 0} TERJUAL
          </span>
        </div>

        {/* Shortened description */}
        <p className="text-xs text-cyber-muted line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        {/* Price and Stock Status */}
        <div className="border-t border-accent-primary/10 pt-3 flex items-end justify-between mt-auto">
          <div>
            <span className="block text-[9px] text-cyber-muted uppercase font-orbitron tracking-wider">
              {flashSalePrice !== undefined ? "Flash Sale Price" : "Mulai Dari"}
            </span>

            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-base sm:text-lg text-accent-primary whitespace-nowrap">
                {formatPrice(priceDisplay)}
              </span>
              {originalPriceDisplay > priceDisplay && (
                <span className="font-orbitron text-[10px] line-through text-cyber-muted whitespace-nowrap">
                  {formatPrice(originalPriceDisplay)}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            {isGameTopUp ? (
              <span className="text-[10px] bg-accent-primary/10 text-accent-primary px-1.5 py-0.5 font-mono border border-accent-primary/30 rounded-xs uppercase">
                ⚡ INSTANT
              </span>
            ) : (
              <span className="text-[10px] bg-accent-wa/10 text-accent-wa px-1.5 py-0.5 font-mono border border-accent-wa/30 rounded-xs uppercase">
                READY
              </span>
            )}
          </div>
        </div>

        {/* CTA triggers detail page form action */}
        <CyberButton
          variant={flashSalePrice !== undefined ? "secondary" : "primary"}
          size="sm"
          className="w-full mt-4 font-bold"
          onClick={() => onSelect(product)}
        >
          {isGameTopUp ? (
            <>
              <ShoppingCart className="w-4 h-4" />
              TOP UP NOW
            </>
          ) : (
            <>
              <Info className="w-4 h-4" />
              BELI SEKARANG
            </>
          )}
        </CyberButton>
      </div>
    </CyberCard>
  );
};
