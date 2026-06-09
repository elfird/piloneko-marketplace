import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useMidtrans } from './hooks/useMidtrans';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { OfflinePage } from './components/pwa/OfflinePage';

// Lazy loading customer pages (Code splitting)
const LandingPage = React.lazy(() => import('./pages/customer/LandingPage'));
const ProductDetailPage = React.lazy(() => import('./pages/customer/ProductDetailPage'));
const InvoicePage = React.lazy(() => import('./pages/customer/InvoicePage'));
const GameTopupCheckout = React.lazy(() => import('./pages/customer/GameTopupCheckout'));
const WarrantyPage = React.lazy(() => import('./pages/customer/WarrantyPage'));
const SupportPage = React.lazy(() => import('./pages/customer/SupportPage'));
const TermsPage = React.lazy(() => import('./pages/customer/TermsPage'));

// Lazy loading Admin pages
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));

// Loading Fallback UI
const CyberLoading = () => (
  <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-center">
    <div className="space-y-6">
      <div className="w-18 h-18 border-4 border-[#00F5FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      <h2 className="font-orbitron font-black text-xl text-[#00F5FF] tracking-widest animate-pulse">
        BOOTING PILONEKO PROTOCOLS...
      </h2>
      <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
        ESTABLISHING ENCRYPTED SECURE LINK NODES
      </p>
    </div>
  </div>
);

export default function App() {
  useMidtrans(); // Inject Midtrans SNAP Script
  const { 
    siteContent,
    setSiteContent, 
    setCategories, 
    setProducts, 
    setTestimonials, 
    setFaqs, 
    setBanners, 
    setFlashSale, 
    setLoading, 
    isLoading 
  } = useStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [resContent, resCat, resProd, resFlash, resTest, resFaq, resBanners] = await Promise.all([
          fetch("/api/site-content"),
          fetch("/api/categories"),
          fetch("/api/products"),
          fetch("/api/flash-sales"),
          fetch("/api/testimonials"),
          fetch("/api/faqs"),
          fetch("/api/banners"),
        ]);

        if (resContent.ok) {
          const rawContent = await resContent.json();
          const mappedContent: Record<string, string> = {};
          rawContent.forEach((item: any) => {
            mappedContent[item.key] = item.value;
          });
          setSiteContent(mappedContent);
          
          if (resFlash.ok) {
            setFlashSale(mappedContent.flash_sale_active === "true", mappedContent.flash_sale_ends_at || "", await resFlash.json());
          }
        }
        
        if (resCat.ok) setCategories(await resCat.json());
        if (resProd.ok) setProducts(await resProd.json());
        if (resTest.ok) setTestimonials(await resTest.json());
        if (resFaq.ok) setFaqs(await resFaq.json());
        if (resBanners.ok) setBanners(await resBanners.json());
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [setSiteContent, setCategories, setProducts, setTestimonials, setFaqs, setBanners, setFlashSale, setLoading]);

  // Apply dynamic theme variables
  const accentPrimary = siteContent['theme_accent_primary'] || "#00F5FF";
  const accentSecondary = siteContent['theme_accent_secondary'] || "#BF00FF";
  
  const hexToRgb = (hex: string): string => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "0, 245, 255";
  };

  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return <CyberLoading />;
  }

  if (isOffline) {
    return (
      <div 
        className="min-h-screen bg-[#0A0A0F] text-gray-200 relative overflow-hidden"
        style={{
          "--accent-primary": accentPrimary,
          "--accent-secondary": accentSecondary,
          "--accent-primary-rgb": hexToRgb(accentPrimary),
          "--accent-secondary-rgb": hexToRgb(accentSecondary),
        } as React.CSSProperties}
      >
        <OfflinePage />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#0A0A0F] text-gray-200 relative overflow-hidden"
      style={{
        "--accent-primary": accentPrimary,
        "--accent-secondary": accentSecondary,
        "--accent-primary-rgb": hexToRgb(accentPrimary),
        "--accent-secondary-rgb": hexToRgb(accentSecondary),
      } as React.CSSProperties}
    >
      <div className="grid-bg" />
      <div className="scanline" />

      <InstallPrompt />

      <BrowserRouter>
        <Suspense fallback={<CyberLoading />}>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/topup/:slug" element={<GameTopupCheckout />} />
            <Route path="/invoice/:invoiceId" element={<InvoicePage />} />
            <Route path="/warranty-claim" element={<WarrantyPage />} />
            <Route path="/support-ticket" element={<SupportPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Admin Routes (menggunakan Layout dan Routing internal) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLayout />} />
            
            {/* Catch All -> Redirect to Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}
