import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Navbar } from '../../features/store/Navbar';
import { Footer } from '../../features/store/Footer';
import { CyberCard } from '../../components/ui/CyberCard';
import { ArrowLeft, Shield } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();
  const { siteContent } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const getSiteText = (key: string, defVal: string): string => {
    return siteContent[key] !== undefined ? siteContent[key] : defVal;
  };

  const storeName = getSiteText("store_name", "PILONEKO");
  const storeWa = getSiteText("store_wa", "085174488804");
  const storeEmail = getSiteText("store_email", "support@piloneko.com");
  const footerDesc = getSiteText("footer_desc", "Marketplace terpercaya untuk sewa akun premium.");
  const storeLogo = getSiteText("store_logo_url", "");
  
  const termsContent = getSiteText("terms_content", "Syarat dan Ketentuan toko belum diatur oleh Admin. Hubungi Admin via WhatsApp untuk info lebih lanjut mengenai pembelian.");

  const handleNavigate = (view: string, slug?: string) => {
    if (view === 'product' && slug) {
      navigate(`/product/${slug}`);
    } else if (view === 'landing') {
      navigate('/');
    } else if (view === 'admin-login') {
      navigate('/admin/login');
    } else {
      navigate(`/${view}`);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col">
      <Navbar 
        storeName={storeName} 
        storeWa={storeWa} 
        logoUrl={storeLogo} 
        onNavigate={handleNavigate} 
        currentView="terms" 
      />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-24 sm:py-32 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 font-orbitron text-xs tracking-widest text-accent-primary hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> KEMBALI KE BERANDA
        </button>

        <CyberCard accent="primary" className="p-8 bg-cyber-card/90">
          <div className="flex items-center gap-3 border-b border-cyber-muted/20 pb-4 mb-6">
            <span className="w-11 h-11 bg-accent-primary/15 text-accent-primary border border-accent-primary/35 rounded-full flex items-center justify-center">
              <Shield className="w-5.5 h-5.5" />
            </span>
            <div>
              <h1 className="font-orbitron font-black text-2xl text-white tracking-wider uppercase">
                SYARAT & KETENTUAN //
              </h1>
              <p className="text-[10px] text-cyber-muted font-mono tracking-widest uppercase">
                Legalitas dan Aturan {storeName}
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none font-sans text-sm sm:text-base leading-relaxed text-gray-300">
            {termsContent.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CyberCard>
      </main>

      <Footer
        storeName={storeName} storeEmail={storeEmail} storeWa={storeWa} footerDesc={footerDesc}
        igUrl={getSiteText("ig_url", "https://instagram.com")}
        tiktokUrl={getSiteText("tiktok_url", "https://tiktok.com")}
        fbUrl={getSiteText("fb_url", "https://facebook.com")}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
