import React from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';
import { CyberButton } from '../ui/CyberButton';
import { CyberCard } from '../ui/CyberCard';

export const OfflinePage: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <CyberCard accent="primary" className="p-8 max-w-sm w-full bg-cyber-bg/80 backdrop-blur-sm relative overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 grid-perspective opacity-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-accent-primary/5 rounded-2xl border border-accent-primary/20 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-accent-primary/10 animate-pulse rounded-2xl" />
            <WifiOff className="w-10 h-10 text-accent-primary opacity-80" />
            
            {/* Glitch effects */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-accent-primary/50" />
            <div className="absolute bottom-3 right-2 w-1 h-3 bg-accent-primary/40" />
          </div>

          <h2 className="font-orbitron font-black text-xl tracking-widest text-white mb-2 uppercase text-neon">
            Sistem Offline
          </h2>
          
          <p className="text-xs text-cyber-muted font-mono leading-relaxed mb-8 max-w-[250px]">
            Koneksi saraf terputus. Silakan periksa jaringan internet Anda untuk kembali terhubung dengan PILONEKO Central.
          </p>

          <CyberButton 
            variant="primary" 
            size="lg" 
            onClick={handleRetry}
            className="w-full font-bold tracking-wider flex items-center justify-center gap-2 group"
          >
            <RefreshCcw className="w-4 h-4 group-hover:animate-spin-slow" />
            COBA LAGI
          </CyberButton>
        </div>
      </CyberCard>
    </div>
  );
};
