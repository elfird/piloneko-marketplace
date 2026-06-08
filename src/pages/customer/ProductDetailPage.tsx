import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Navbar } from '../../features/store/Navbar';
import { ProductDetailView } from '../../features/store/ProductDetailView';
import { Footer } from '../../features/store/Footer';
import { FloatingWA } from '../../features/store/FloatingWA';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { siteContent } = useStore();

  const handleNavigate = (view: string, targetSlug?: string) => {
    if (view === 'product' && targetSlug) {
      navigate(`/product/${targetSlug}`);
    } else if (view === 'landing') {
      navigate('/');
    } else if (view === 'admin-login') {
      navigate('/admin/login');
    } else {
      navigate(`/${view}`);
    }
  };

  const getSiteText = (key: string, defVal: string): string => {
    return siteContent[key] !== undefined ? siteContent[key] : defVal;
  };

  const storeName = getSiteText("store_name", "PILONEKO");
  const storeWa = getSiteText("store_wa", "085174488804");
  const storeEmail = getSiteText("store_email", "support@piloneko.com");
  const footerDesc = getSiteText("footer_desc", "Marketplace terpercaya untuk sewa akun premium.");

  return (
    <>
      <Navbar storeName={storeName} storeWa={storeWa} onNavigate={handleNavigate} currentView="product" />
      <ProductDetailView 
        productSlug={slug || ""}
        onBack={() => navigate('/')}
        onNavigateToInvoice={(id) => navigate(`/invoice/${id}`)}
        storeName={storeName}
        storeWa={storeWa}
        bankName={getSiteText("bank_name", "BANK CENTRAL ASIA (BCA)")}
        bankNumber={getSiteText("bank_number", "8032731032")}
        bankHolder={getSiteText("bank_holder", "PT. PILONEKO GLOBAL JAYA")}
        qrisImageUrl={getSiteText("qris_url", "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qris-mock-payment")}
      />
      <Footer
        storeName={storeName} storeEmail={storeEmail} storeWa={storeWa} footerDesc={footerDesc}
        igUrl={getSiteText("ig_url", "https://instagram.com")}
        tiktokUrl={getSiteText("tiktok_url", "https://tiktok.com")}
        fbUrl={getSiteText("fb_url", "https://facebook.com")}
        onNavigate={handleNavigate}
      />
      <FloatingWA storeName={storeName} storeWa={storeWa} />
    </>
  );
}
