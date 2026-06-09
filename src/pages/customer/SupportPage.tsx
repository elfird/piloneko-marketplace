import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Navbar } from '../../features/store/Navbar';
import { Footer } from '../../features/store/Footer';
import { SupportTicketView } from '../../features/store/SupportTicketView';

export default function SupportPage() {
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
    <>
      <Navbar 
        storeName={storeName} 
        storeWa={storeWa} 
        logoUrl={storeLogo} 
        onNavigate={handleNavigate} 
        currentView="support" 
      />
      
      <div className="pt-20">
        <SupportTicketView 
          onBack={() => navigate('/')} 
          storeName={storeName}
          customTitle={getSiteText("support_title", "BANTUAN PELANGGAN //")}
          customDesc={getSiteText("support_desc", "Kirim keluhan bantuan teknis / pertanyaan umum")}
        />
      </div>

      <Footer
        storeName={storeName} storeEmail={storeEmail} storeWa={storeWa} footerDesc={footerDesc}
        igUrl={getSiteText("ig_url", "https://instagram.com")}
        tiktokUrl={getSiteText("tiktok_url", "https://tiktok.com")}
        fbUrl={getSiteText("fb_url", "https://facebook.com")}
        onNavigate={handleNavigate}
      />
    </>
  );
}
