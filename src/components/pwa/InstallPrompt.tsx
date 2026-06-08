import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { CyberCard } from '../ui/CyberCard';
import { CyberButton } from '../ui/CyberButton';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Mengecek apakah aplikasi sudah diinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Mencegah prompt bawaan Chrome muncul secara otomatis
      e.preventDefault();
      // Menyimpan event agar bisa dipicu nanti
      setDeferredPrompt(e);
      // Menampilkan prompt kustom kita setelah delay singkat agar tidak mengganggu kesan pertama
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Memunculkan prompt instalasi bawaan browser
    deferredPrompt.prompt();
    
    // Menunggu pengguna merespon prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Mengosongkan prompt dan menyembunyikan UI kita
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] md:bottom-6 md:left-auto md:right-6 md:w-96 animate-in slide-in-from-bottom-8 fade-in duration-500">
      <CyberCard accent="primary" className="p-4 bg-cyber-card/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_20px_rgba(0,245,255,0.2)]">
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 text-cyber-muted hover:text-white transition-colors p-1"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-black border border-accent-primary/30 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 relative group">
            <div className="absolute inset-0 bg-accent-primary/10 group-hover:bg-accent-primary/20 transition-colors" />
            <img src="/pwa-192x192.png" alt="Piloneko Logo" className="w-full h-full object-contain relative z-10" />
          </div>
          
          <div className="flex-1 pt-1">
            <h3 className="font-orbitron font-bold text-sm tracking-wider text-white mb-1 uppercase text-neon">
              Install PILONEKO
            </h3>
            <p className="text-[10px] text-cyber-muted font-mono leading-relaxed mb-3">
              Tambahkan ke Home Screen untuk akses lebih cepat, mode offline, dan pengalaman tanpa ngelag!
            </p>
            
            <div className="flex gap-2">
              <CyberButton size="sm" variant="primary" onClick={handleInstallClick} className="flex-1 py-1.5 text-[10px] gap-1.5">
                <Download className="w-3.5 h-3.5" /> INSTALL SEKARANG
              </CyberButton>
            </div>
          </div>
        </div>
      </CyberCard>
    </div>
  );
};
