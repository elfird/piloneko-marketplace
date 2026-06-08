import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell } from 'lucide-react';

import { Sidebar } from '../../features/admin/Sidebar';
import { DashboardView } from '../../features/admin/DashboardView';
import { OrdersView } from '../../features/admin/OrdersView';
import { ProductsView } from '../../features/admin/ProductsView';

import { FlashSaleView } from '../../features/admin/FlashSaleView';
import { ContentEditorView } from '../../features/admin/ContentEditorView';
import { WaTemplatesView } from '../../features/admin/WaTemplatesView';
import { ThemeSettingsView } from '../../features/admin/ThemeSettingsView';
import { TestimonialsManagerView } from '../../features/admin/TestimonialsManagerView';
import { FaqAndReviewsView } from '../../features/admin/FaqAndReviewsView';
import { AdminSettingsView } from '../../features/admin/AdminSettingsView';
import { CategoriesView } from '../../features/admin/CategoriesView';
import { AnalyticsView } from '../../features/admin/AnalyticsView';
import { VouchersView } from '../../features/admin/VouchersView';
import { WarrantyView } from '../../features/admin/WarrantyView';
import { BannersView } from '../../features/admin/BannersView';
import { ActivityLogsView } from '../../features/admin/ActivityLogsView';
import { SupportView } from '../../features/admin/SupportView';
import { NotificationsView } from '../../features/admin/NotificationsView';
import { BackupCenterView } from '../../features/admin/BackupCenterView';
import { CustomersView } from '../../features/admin/customers/CustomersView';
import { MidtransSettingsView } from '../../features/admin/MidtransSettingsView';
import { WebhookLogsView } from '../../features/admin/WebhookLogsView';
import { WhatsAppSettingsView } from '../../features/admin/whatsapp/WhatsAppSettingsView';
import { WhatsAppCheckoutView } from '../../features/admin/whatsapp/WhatsAppCheckoutView';
import { WhatsAppAutomationView } from '../../features/admin/whatsapp/WhatsAppAutomationView';
import { WhatsAppBlastView } from '../../features/admin/whatsapp/WhatsAppBlastView';
import { WhatsAppLogsView } from '../../features/admin/whatsapp/WhatsAppLogsView';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminToken, adminProfileName, logout } = useAuthStore();
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Derive current view from URL for Sidebar highlighting
  const currentView = location.pathname.split('/').pop() || 'dashboard';

  useEffect(() => {
    // Protected Route Logic
    if (!adminToken) {
      // Check legacy local storage just in case Zustand isn't hydrated yet
      const legacyToken = localStorage.getItem('token');
      if (!legacyToken) {
        navigate('/admin/login', { replace: true });
        return;
      }
    }

    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/admin/notifications", {
          headers: { Authorization: `Bearer ${adminToken || localStorage.getItem('token')}` }
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

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [adminToken, navigate]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminView");
    navigate("/");
  };

  if (!adminToken && !localStorage.getItem('token')) {
    return null; // Will redirect in useEffect
  }

  const activeToken = adminToken || localStorage.getItem('token') || '';

  return (
    <div className="min-h-screen flex h-screen overflow-hidden bg-cyber-bg text-gray-200">
      {/* Sidebar handles navigation via its onChangeView prop */}
      <Sidebar
        currentView={currentView}
        onChangeView={(view) => navigate(`/admin/${view}`)}
        adminName={adminProfileName || localStorage.getItem('adminName') || "Admin"}
        onLogout={handleLogout}
        onNavigateHome={() => navigate("/")}
      />

      {/* Main workspace */}
      <main className="flex-1 bg-cyber-bg overflow-y-auto p-8 relative flex flex-col">
        <div className="absolute top-0 right-10 w-96 h-96 bg-accent-primary/2 rounded-full blur-[100px] pointer-events-none" />

        {/* Cyber Header Topbar */}
        <div className="flex items-center justify-between border-b border-cyber-muted/10 pb-4 mb-6 shrink-0 font-orbitron select-none print:hidden">
          <div className="text-left">
            <span className="text-cyber-muted text-[8px] sm:text-[9px] tracking-widest font-mono block">
              PILONEKO SECURE SYSTEMS CENTRAL
            </span>
            <h2 className="text-white text-sm sm:text-base font-black tracking-wider uppercase flex items-center gap-1.5">
              <span className="text-accent-primary">[</span> 
              {currentView.replace(/_/g, ' ')} 
              <span className="text-accent-primary">]</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/notifications')}
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

        {/* Sub-Routes */}
        <Routes>
          <Route path="dashboard" element={<DashboardView token={activeToken} onNavigateToView={(view) => navigate(`/admin/${view}`)} />} />
          <Route path="analytics" element={<AnalyticsView token={activeToken} />} />
          <Route path="orders" element={<OrdersView token={activeToken} />} />
          <Route path="categories" element={<CategoriesView token={activeToken} />} />
          <Route path="products" element={<ProductsView token={activeToken} />} />

          <Route path="vouchers" element={<VouchersView token={activeToken} />} />
          <Route path="flashsale" element={<FlashSaleView token={activeToken} />} />
          <Route path="warranty" element={<WarrantyView token={activeToken} />} />
          <Route path="support" element={<SupportView token={activeToken} />} />
          <Route path="notifications" element={<NotificationsView token={activeToken} />} />
          <Route path="banners" element={<BannersView token={activeToken} />} />
          <Route path="activity_logs" element={<ActivityLogsView token={activeToken} />} />
          <Route path="backup" element={<BackupCenterView token={activeToken} />} />
          <Route path="payment_settings" element={<MidtransSettingsView token={activeToken} />} />
          <Route path="webhook_logs" element={<WebhookLogsView token={activeToken} />} />
          <Route path="wa_settings" element={<WhatsAppSettingsView token={activeToken} />} />
          <Route path="wa_checkout" element={<WhatsAppCheckoutView token={activeToken} />} />
          <Route path="wa_automation" element={<WhatsAppAutomationView token={activeToken} />} />
          <Route path="wa_blast" element={<WhatsAppBlastView token={activeToken} />} />
          <Route path="wa_templates" element={<WaTemplatesView token={activeToken} />} />
          <Route path="wa_logs" element={<WhatsAppLogsView token={activeToken} />} />
          <Route path="wa" element={<Navigate to="/admin/wa_templates" replace />} />
          <Route path="cms" element={<ContentEditorView token={activeToken} />} />
          <Route path="theme" element={<ThemeSettingsView token={activeToken} onThemeSaved={() => window.location.reload()} />} />
          <Route path="testimonials" element={<TestimonialsManagerView token={activeToken} />} />
          <Route path="faq" element={<FaqAndReviewsView token={activeToken} />} />
          <Route path="settings" element={<AdminSettingsView token={activeToken} />} />
          <Route path="customers" element={<CustomersView token={activeToken} />} />
          
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
