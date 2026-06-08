import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Navbar } from '../../features/store/Navbar';
import { HeroSection } from '../../features/store/HeroSection';
import { StatsBar } from '../../features/store/StatsBar';
import { CategorySection } from '../../features/store/CategorySection';
import { FlashSale } from '../../features/store/FlashSale';
import { HowToBuy } from '../../features/store/HowToBuy';
import { Testimonials } from '../../features/store/Testimonials';
import { FaqSection } from '../../features/store/FaqSection';
import { Footer } from '../../features/store/Footer';
import { FloatingWA } from '../../features/store/FloatingWA';

export default function LandingPage() {
  const navigate = useNavigate();
  const { 
    siteContent, categories, products, testimonials, faqs, banners,
    flashSaleActive, flashSaleEndsAt, flashSaleItems
  } = useStore();

  const handleNavigate = (view: string, slug?: string) => {
    if (view === 'product' && slug) {
      navigate(`/product/${slug}`);
    } else if (view === 'landing') {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
  const storeLogo = getSiteText("store_logo_url", "");

  return (
    <>
      <Navbar storeName={storeName} storeWa={storeWa} logoUrl={storeLogo} onNavigate={handleNavigate} currentView="landing" />
      <HeroSection
        headline={getSiteText("hero_headline", "SEWA AKUN PREMIUM & TOP UP GAME")}
        subtext={getSiteText("hero_subtext", "Solusi instan hiburan Anda!")}
        badge1={getSiteText("hero_badge1", "1000+ TRANSAKSI BERHASIL")}
        badge2={getSiteText("hero_badge2", "GARANSI RESMI SLA")}
        badge3={getSiteText("hero_badge3", "INSTANT DELIVERY 10 MIN")}
        ctaPrimary={getSiteText("hero_cta_primary", "X-PLORE KATALOG")}
        ctaSecondary={getSiteText("hero_cta_secondary", "CHAT KONSULTASI")}
        storeName={storeName} storeWa={storeWa} banners={banners}
      />
      <StatsBar
        statsBuyers={getSiteText("stats_buyers_count", "4.5K")}
        statsProducts={getSiteText("stats_products_count", "48+")}
        statsRating={getSiteText("stats_satisfaction_percent", "99.2%")}
        statsYears={getSiteText("stats_years_establishing", "3 YRS")}
      />
      <FlashSale
        isActive={flashSaleActive}
        endsAt={flashSaleEndsAt}
        items={flashSaleItems}
        onSelectProduct={(prod) => navigate(`/product/${prod.slug}`)}
      />
      <CategorySection
        categories={categories}
        products={products}
        onSelectProduct={(prod) => navigate(`/product/${prod.slug}`)}
      />
      <HowToBuy
        step1Title={getSiteText("how_step1_title", "PILIH PRODUK & PAKET")}
        step1Desc={getSiteText("how_step1_desc", "Jelajahi katalog premium kami.")}
        step2Title={getSiteText("how_step2_title", "ISI DATA PENERIMA")}
        step2Desc={getSiteText("how_step2_desc", "Ketik nama lengkap & nomor Whatsapp.")}
        step3Title={getSiteText("how_step3_title", "AKSI ORDER VIA WHATSAPP")}
        step3Desc={getSiteText("how_step3_desc", "Sistem otomatis me-redirect ke WA.")}
      />
      <Testimonials testimonials={testimonials} />
      <FaqSection faqItems={faqs} />
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
