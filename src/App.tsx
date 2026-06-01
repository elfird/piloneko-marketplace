import React, { useState, useEffect } from "react";
import { 
  Navbar 
} from "./components/site/Navbar";
import { 
  HeroSection 
} from "./components/site/HeroSection";
import { 
  StatsBar 
} from "./components/site/StatsBar";
import { 
  CategorySection 
} from "./components/site/CategorySection";
import { 
  FlashSale 
} from "./components/site/FlashSale";
import { 
  HowToBuy 
} from "./components/site/HowToBuy";
import { 
  Testimonials 
} from "./components/site/Testimonials";
import { 
  FaqSection 
} from "./components/site/FaqSection";
import { 
  Footer 
} from "./components/site/Footer";
import { 
  FloatingWA 
} from "./components/site/FloatingWA";
import { 
  ProductDetailView 
} from "./components/site/ProductDetailView";

// Admin views
import { Sidebar } from "./components/admin/Sidebar";
import { DashboardView } from "./components/admin/DashboardView";
import { OrdersView } from "./components/admin/OrdersView";
import { ProductsView } from "./components/admin/ProductsView";
import { StocksView } from "./components/admin/StocksView";
import { FlashSaleView } from "./components/admin/FlashSaleView";
import { ContentEditorView } from "./components/admin/ContentEditorView";
import { WaTemplatesView } from "./components/admin/WaTemplatesView";
import { ThemeSettingsView } from "./components/admin/ThemeSettingsView";
import { TestimonialsManagerView } from "./components/admin/TestimonialsManagerView";
import { FaqAndReviewsView } from "./components/admin/FaqAndReviewsView";
import { AdminSettingsView } from "./components/admin/AdminSettingsView";
import { CategoriesView } from "./components/admin/CategoriesView";

// Phase 2 Admin views
import { AnalyticsView } from "./components/admin/AnalyticsView";
import { VouchersView } from "./components/admin/VouchersView";
import { WarrantyView } from "./components/admin/WarrantyView";
import { SupportView } from "./components/admin/SupportView";
import { NotificationsView } from "./components/admin/NotificationsView";
import { BannersView } from "./components/admin/BannersView";
import { ActivityLogsView } from "./components/admin/ActivityLogsView";
import { BackupCenterView } from "./components/admin/BackupCenterView";

// Phase 2 Site views
import { WarrantyClaimView } from "./components/site/WarrantyClaimView";
import { SupportTicketView } from "./components/site/SupportTicketView";

import { Category, Product, Testimonial, FaqItem } from "./types";
import { ShieldCheck, Mail, KeyRound, ArrowLeft, RefreshCw, AlertTriangle, Bell } from "lucide-react";
import { CyberButton } from "./components/ui/CyberButton";
import { CyberCard } from "./components/ui/CyberCard";

// Helpers
function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 245, 255";
}

export default function App() {
  // Routes router states
  const [currentView, setCurrentView] = useState<string>("landing"); // landing | product | admin | admin-login
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>("");
  const [adminToken, setAdminToken] = useState<string>("");
  const [adminProfileName, setAdminProfileName] = useState<string>("Admin Premium");
  const [adminActiveSubpanel, setAdminActiveSubpanel] = useState<string>("dashboard");

  // Dynamic API loads
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleActive, setFlashSaleActive] = useState<boolean>(false);
  const [flashSaleEndsAt, setFlashSaleEndsAt] = useState<string>("");
  const [flashSaleItems, setFlashSaleItems] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  
  // App initialization states
  const [loading, setLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  useEffect(() => {
    // Check administrative token persistence
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setAdminToken(savedToken);
    }
    initializeData();
  }, []);

  const fetchUnreadNotificationsCount = async () => {
    const currentToken = localStorage.getItem("token") || adminToken;
    if (!currentToken) return;
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const unread = data.filter((n: any) => !n.isRead).length;
        setUnreadNotifsCount(unread);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchUnreadNotificationsCount();
      const interval = setInterval(fetchUnreadNotificationsCount, 15000);
      return () => clearInterval(interval);
    } else {
      setUnreadNotifsCount(0);
    }
  }, [adminToken]);

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

      if (!resContent.ok) throw new Error("Gagal menyambungkan server.");

      const rawContent = await resContent.json();
      const mappedContent: Record<string, string> = {};
      rawContent.forEach((item: any) => {
        mappedContent[item.key] = item.value;
      });

      setSiteContent(mappedContent);
      setCategories(await resCat.json());
      setProducts(await resProd.json());
      setTestimonials(await resTest.json());
      setFaqs(await resFaq.json());
      setBanners(await resBanners.json());

      // Parse Flash sale active states
      setFlashSaleActive(mappedContent.flash_sale_active === "true");
      setFlashSaleEndsAt(mappedContent.flash_sale_ends_at || "");
      setFlashSaleItems(await resFlash.json());
      
      // Load notifs count
      fetchUnreadNotificationsCount();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login gagal.");
      }

      const data = await res.json();
      setAdminToken(data.token);
      setAdminProfileName(data.admin?.name || "Admin Premium");
      localStorage.setItem("token", data.token);
      setCurrentView("admin");
      setAdminActiveSubpanel("dashboard");
      setLoginEmail("");
      setLoginPassword("");
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    setAdminToken("");
    localStorage.removeItem("token");
    setCurrentView("landing");
  };

  const handleNavigate = (view: string, slug?: string) => {
    setCurrentView(view);
    if (slug) {
      setSelectedProductSlug(slug);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Safe Fallback string getter
  const getSiteText = (key: string, defVal: string): string => {
    return siteContent[key] !== undefined ? siteContent[key] : defVal;
  };

  const storeName = getSiteText("store_name", "PILONEKO");
  const storeWa = getSiteText("store_wa", "085174488804");
  const storeEmail = getSiteText("store_email", "support@piloneko.com");
  const footerDesc = getSiteText("footer_desc", "Marketplace terpercaya untuk sewa akun premium Netflix, Spotify, Canva, YouTube Premium, dan Top Up voucher game favorit Anda.");

  // Theme settings injection
  const accentPrimary = getSiteText("theme_accent_primary", "#00F5FF");
  const accentSecondary = getSiteText("theme_accent_secondary", "#BF00FF");
  const primaryRgb = hexToRgb(accentPrimary);
  const secondaryRgb = hexToRgb(accentSecondary);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-center">
        <div className="space-y-6">
          <div className="w-18 h-18 border-4 border-[#00F5FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <h2 className="font-orbitron font-black text-xl text-[#00F5FF] tracking-widest animate-pulse">
            BOOTING PREMIUM_KU PROTOCOLS...
          </h2>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            ESTABLISHING ENCRYPTED SECURE LINK NODES
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#0A0A0F] text-gray-200 relative overflow-hidden"
      style={{
        "--accent-primary": accentPrimary,
        "--accent-secondary": accentSecondary,
        "--accent-primary-rgb": primaryRgb,
        "--accent-secondary-rgb": secondaryRgb,
      } as React.CSSProperties}
    >
      <div className="grid-bg" />
      <div className="scanline" />

      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 1: CUSTOMER LANDING PAGE */}
      {currentView === "landing" && (
        <>
          <Navbar 
            storeName={storeName} 
            storeWa={storeWa} 
            onNavigate={handleNavigate}
            currentView={currentView}
          />

          <HeroSection
            headline={getSiteText("hero_headline", "SEWA AKUN PREMIUM & TOP UP GAME")}
            subtext={getSiteText("hero_subtext", "Solusi instan hiburan Anda! Sewa Netflix Premium HD, Spotify Family, Youtube Bebas Iklan, & Top Up ML, Free Fire teraman, tuntas langsung dikirim via WhatsApp otomatis.")}
            badge1={getSiteText("hero_badge1", "1000+ TRANSAKSI BERHASIL")}
            badge2={getSiteText("hero_badge2", "GARANSI RESMI SLA")}
            badge3={getSiteText("hero_badge3", "INSTANT DELIVERY 10 MIN")}
            ctaPrimary={getSiteText("hero_cta_primary", "X-PLORE KATALOG")}
            ctaSecondary={getSiteText("hero_cta_secondary", "CHAT KONSULTASI")}
            storeName={storeName}
            storeWa={storeWa}
            banners={banners}
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
            onSelectProduct={(prod) => handleNavigate("product", prod.slug)}
          />

          <CategorySection
            categories={categories}
            products={products}
            onSelectProduct={(prod) => handleNavigate("product", prod.slug)}
          />

          <HowToBuy
            step1Title={getSiteText("how_step1_title", "PILIH PRODUK & PAKET")}
            step1Desc={getSiteText("how_step1_desc", "Jelajahi katalog premium kami. Cari paket durasi sewa, diskon promo, atau top up nominal yang cocok untuk Anda.")}
            step2Title={getSiteText("how_step2_title", "ISI DATA PENERIMA")}
            step2Desc={getSiteText("how_step2_desc", "Ketik nama lengkap & nomor Whatsapp penerima aktif Anda. Untuk game masukkan User ID game server secara valid.")}
            step3Title={getSiteText("how_step3_title", "AKSI ORDER VIA WHATSAPP")}
            step3Desc={getSiteText("how_step3_desc", "Tekan Booking Order. Sistem akan merangkum slip pembelian dan otomatis me-redirect Anda langsung ke nomor Whatsapp Admin.")}
          />

          <Testimonials testimonials={testimonials} />

          <FaqSection faqItems={faqs} />

          <Footer
            storeName={storeName}
            storeEmail={storeEmail}
            storeWa={storeWa}
            footerDesc={footerDesc}
            igUrl={getSiteText("ig_url", "https://instagram.com")}
            tiktokUrl={getSiteText("tiktok_url", "https://tiktok.com")}
            fbUrl={getSiteText("fb_url", "https://facebook.com")}
            onNavigate={handleNavigate}
          />

          <FloatingWA storeName={storeName} storeWa={storeWa} />
        </>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 1B: WARRANTY CLAIM PAGE */}
      {currentView === "warranty-claim" && (
        <>
          <Navbar 
            storeName={storeName} 
            storeWa={storeWa} 
            onNavigate={handleNavigate}
            currentView={currentView}
          />

          <WarrantyClaimView 
            onBack={() => handleNavigate("landing")}
            storeName={storeName}
          />

          <Footer
            storeName={storeName}
            storeEmail={storeEmail}
            storeWa={storeWa}
            footerDesc={footerDesc}
            igUrl={getSiteText("ig_url", "https://instagram.com")}
            tiktokUrl={getSiteText("tiktok_url", "https://tiktok.com")}
            fbUrl={getSiteText("fb_url", "https://facebook.com")}
            onNavigate={handleNavigate}
          />

          <FloatingWA storeName={storeName} storeWa={storeWa} />
        </>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 1C: SUPPORT TICKET PAGE */}
      {currentView === "support-ticket" && (
        <>
          <Navbar 
            storeName={storeName} 
            storeWa={storeWa} 
            onNavigate={handleNavigate}
            currentView={currentView}
          />

          <SupportTicketView 
            onBack={() => handleNavigate("landing")}
            storeName={storeName}
          />

          <Footer
            storeName={storeName}
            storeEmail={storeEmail}
            storeWa={storeWa}
            footerDesc={footerDesc}
            igUrl={getSiteText("ig_url", "https://instagram.com")}
            tiktokUrl={getSiteText("tiktok_url", "https://tiktok.com")}
            fbUrl={getSiteText("fb_url", "https://facebook.com")}
            onNavigate={handleNavigate}
          />

          <FloatingWA storeName={storeName} storeWa={storeWa} />
        </>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 2: PRODUCT DETAIL PAGE */}
      {currentView === "product" && (
        <>
          <Navbar 
            storeName={storeName} 
            storeWa={storeWa} 
            onNavigate={handleNavigate}
            currentView={currentView}
          />

          <ProductDetailView 
            productSlug={selectedProductSlug}
            storeName={storeName}
            storeWa={storeWa}
            bankName={getSiteText("bank_name", "BANK CENTRAL ASIA (BCA)")}
            bankNumber={getSiteText("bank_number", "8032731032")}
            bankHolder={getSiteText("bank_holder", "PT. PILONEKO GLOBAL JAYA")}
            qrisImageUrl={getSiteText("qris_url", "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qris-mock-payment")}
            onBack={() => handleNavigate("landing")}
          />

          <Footer
            storeName={storeName}
            storeEmail={storeEmail}
            storeWa={storeWa}
            footerDesc={footerDesc}
            igUrl={getSiteText("ig_url", "https://instagram.com")}
            tiktokUrl={getSiteText("tiktok_url", "https://tiktok.com")}
            fbUrl={getSiteText("fb_url", "https://facebook.com")}
            onNavigate={handleNavigate}
          />

          <FloatingWA storeName={storeName} storeWa={storeWa} />
        </>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 3: ADMIN LOGIN SHIELD */}
      {currentView === "admin-login" && (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cyber-bg">
          <div className="absolute inset-0 grid-perspective opacity-10" />

          <div className="w-full max-w-sm relative pointer-events-auto">
            {/* Back button */}
            <button
              onClick={() => handleNavigate("landing")}
              className="flex items-center gap-1 font-orbitron text-xs tracking-widest text-[#00F5FF] hover:text-white transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> KEMBALI KUNJUNGI BERANDA
            </button>

            <CyberCard accent="primary" className="p-8 bg-cyber-card/90">
              <span className="w-11 h-11 bg-accent-primary/10 text-accent-primary border border-accent-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-5.5 h-5.5 shrink-0 animate-pulse" />
              </span>

              <h2 className="font-orbitron font-black text-xl text-center tracking-widest text-[#00F5FF] text-neon mb-1 uppercase">
                // AUTH_SHIELD CENTRAL
              </h2>
              <p className="text-[9px] text-cyber-muted font-mono tracking-widest text-center uppercase mb-6">
                Masukkan kredensial administrator piloneko
              </p>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-500 text-xs text-left mb-4 flex gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Form Input fields */}
              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                    Secure Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@piloneko.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                    System Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                  />
                </div>

                <div className="pt-2">
                  <CyberButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold"
                  >
                    DEPLOY ACCESS KEY
                  </CyberButton>
                </div>
              </form>
            </CyberCard>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 4: ADMIN OPERATIONS PANEL CONTAINER */}
      {currentView === "admin" && (
        <div className="min-h-screen flex h-screen overflow-hidden bg-cyber-bg">
          {/* Admin Sidebar Navigation */}
          <Sidebar
            currentView={adminActiveSubpanel}
            onChangeView={setAdminActiveSubpanel}
            adminName={adminProfileName}
            onLogout={handleLogout}
            onNavigateHome={() => handleNavigate("landing")}
          />

          {/* Main workspace panels */}
          <main className="flex-1 bg-cyber-bg overflow-y-auto p-8 relative flex flex-col">
            <div className="absolute top-0 right-10 w-96 h-96 bg-accent-primary/2 rounded-full blur-[100px] pointer-events-none" />

            {/* Cyber Header Topbar */}
            <div className="flex items-center justify-between border-b border-cyber-muted/10 pb-4 mb-6 shrink-0 font-orbitron select-none print:hidden">
              <div className="text-left">
                <span className="text-cyber-muted text-[8px] sm:text-[9px] tracking-widest font-mono block">PILONEKO SECURE SYSTEMS CENTRAL</span>
                <h2 className="text-white text-sm sm:text-base font-black tracking-wider uppercase flex items-center gap-1.5">
                  <span className="text-accent-primary">[</span> 
                  {adminActiveSubpanel === "activity_logs" 
                    ? "LOG AKTIVITAS MUTASI" 
                    : adminActiveSubpanel === "backup" 
                    ? "BACKUP DATABASE CENTER" 
                    : adminActiveSubpanel === "vouchers"
                    ? "MANAJEMEN KODE VOUCHER"
                    : adminActiveSubpanel === "warranty"
                    ? "TINDAK LANJUT GARANSI"
                    : adminActiveSubpanel === "support"
                    ? "TIKET LAYANAN PELANGGAN"
                    : adminActiveSubpanel === "notifications"
                    ? "ALARM NOTIFIKASI SISTEM"
                    : adminActiveSubpanel === "banners"
                    ? "CMS BANNER HOMEPAGE"
                    : adminActiveSubpanel === "analytics"
                    ? "ANALITIK PENJUALAN & HISTOGRAM"
                    : adminActiveSubpanel} 
                  <span className="text-accent-primary">]</span>
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button
                  onClick={() => setAdminActiveSubpanel("notifications")}
                  className="relative p-2 rounded-xs border border-cyber-muted/20 bg-cyber-surface/30 hover:border-accent-primary/50 text-cyber-muted hover:text-accent-primary transition-all duration-200 cursor-pointer"
                  title="Notifikasi Alarm"
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse border border-cyber-bg">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {adminActiveSubpanel === "dashboard" && (
              <DashboardView 
                token={adminToken} 
                onNavigateToView={(view) => setAdminActiveSubpanel(view)} 
              />
            )}

            {adminActiveSubpanel === "analytics" && (
              <AnalyticsView token={adminToken} />
            )}

            {adminActiveSubpanel === "orders" && (
              <OrdersView token={adminToken} />
            )}

            {adminActiveSubpanel === "categories" && (
              <CategoriesView token={adminToken} />
            )}

            {adminActiveSubpanel === "products" && (
              <ProductsView token={adminToken} />
            )}

            {adminActiveSubpanel === "stocks" && (
              <StocksView token={adminToken} />
            )}

            {adminActiveSubpanel === "vouchers" && (
              <VouchersView token={adminToken} />
            )}

            {adminActiveSubpanel === "flashsale" && (
              <FlashSaleView token={adminToken} />
            )}

            {adminActiveSubpanel === "warranty" && (
              <WarrantyView token={adminToken} />
            )}

            {adminActiveSubpanel === "support" && (
              <SupportView token={adminToken} />
            )}

            {adminActiveSubpanel === "notifications" && (
              <NotificationsView token={adminToken} />
            )}

            {adminActiveSubpanel === "banners" && (
              <BannersView token={adminToken} />
            )}

            {adminActiveSubpanel === "activity_logs" && (
              <ActivityLogsView token={adminToken} />
            )}

            {adminActiveSubpanel === "backup" && (
              <BackupCenterView token={adminToken} />
            )}

            {adminActiveSubpanel === "wa" && (
              <WaTemplatesView token={adminToken} />
            )}

            {adminActiveSubpanel === "cms" && (
              <ContentEditorView token={adminToken} />
            )}

            {adminActiveSubpanel === "theme" && (
              <ThemeSettingsView 
                token={adminToken} 
                onThemeSaved={initializeData} 
              />
            )}

            {adminActiveSubpanel === "testimonials" && (
              <TestimonialsManagerView token={adminToken} />
            )}

            {adminActiveSubpanel === "faq" && (
              <FaqAndReviewsView token={adminToken} />
            )}

            {adminActiveSubpanel === "settings" && (
              <AdminSettingsView token={adminToken} />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
