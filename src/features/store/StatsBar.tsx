import React from "react";

interface StatsBarProps {
  statsBuyers: string;
  statsProducts: string;
  statsRating: string;
  statsYears: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  statsBuyers,
  statsProducts,
  statsRating,
  statsYears,
}) => {
  const items = [
    { label: "TOTAL PEMBELI", value: statsBuyers },
    { label: "PRODUK TERSEDIA", value: statsProducts },
    { label: "RATING KEPUASAN", value: statsRating },
    { label: "TAHUN BERDIRI", value: statsYears },
  ];

  return (
    <div className="bg-cyber-surface border-y border-accent-primary/20 relative z-10 py-8">
      {/* Absolute background visual helper */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5 opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {items.map((it) => (
            <div key={it.label} className="flex flex-col items-center">
              <span className="font-orbitron font-black text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-primary to-accent-secondary select-none tracking-tight">
                {it.value}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-cyber-muted tracking-widest mt-2">
                // {it.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
