import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Shield,
  Layers,

  Star,
  HelpCircle,
  Clock,
  MessageSquare,
  Sparkles,
  Sliders,
  LogOut,
  AppWindow,
  Settings,
  Folder,
  BarChart3,
  Ticket,
  LifeBuoy,
  Bell,
  History,
  DownloadCloud,
  Image,
  CreditCard,
  Webhook,
  Users,
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  adminName: string;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  adminName,
  onLogout,
  onNavigateHome,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "analytics", label: "Analitik & Chart", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "orders", label: "Order Masuk", icon: <ShoppingCart className="w-4 h-4" /> },
    { id: "categories", label: "Kategori", icon: <Folder className="w-4 h-4" /> },
    { id: "products", label: "Produk & Paket", icon: <Layers className="w-4 h-4" /> },
    { id: "vouchers", label: "Kupon Voucher", icon: <Ticket className="w-4 h-4" /> },
    { id: "flashsale", label: "Flash Sale", icon: <Clock className="w-4 h-4" /> },
    { id: "payment_settings", label: "Payment Gateway", icon: <CreditCard className="w-4 h-4" /> },
    { id: "webhook_logs", label: "Log Webhook", icon: <Webhook className="w-4 h-4" /> },
    { id: "warranty", label: "Klaim Garansi", icon: <Shield className="w-4 h-4" /> },
    { id: "support", label: "Bantuan Tiket", icon: <LifeBuoy className="w-4 h-4" /> },
    { id: "notifications", label: "Notifikasi Sistem", icon: <Bell className="w-4 h-4" /> },
    { id: "banners", label: "Banner Promo", icon: <Image className="w-4 h-4" /> },
    { id: "activity_logs", label: "Log Aktivitas", icon: <History className="w-4 h-4" /> },
    { id: "backup", label: "Backup Center", icon: <DownloadCloud className="w-4 h-4" /> },
    { id: "wa", label: "Template WA", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "cms", label: "CMS Konten", icon: <Sliders className="w-4 h-4" /> },
    { id: "theme", label: "Theme Customizer", icon: <Sparkles className="w-4 h-4" /> },
    { id: "faq", label: "Kelola FAQ", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "testimonials", label: "Testimoni", icon: <Star className="w-4 h-4" /> },
    { id: "settings", label: "Profil Admin", icon: <Settings className="w-4 h-4" /> },
  ];

  const waSettingsItems = [
    { id: "wa_settings", label: "WhatsApp Settings", icon: <Sliders className="w-4 h-4" /> },
    { id: "wa_checkout", label: "Checkout Methods", icon: <CreditCard className="w-4 h-4" /> },
    { id: "wa_automation", label: "Automations", icon: <Settings className="w-4 h-4" /> },
  ];

  const waMarketingItems = [
    { id: "wa_blast", label: "WhatsApp Blast", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "wa_templates", label: "Templates", icon: <Layers className="w-4 h-4" /> },
    { id: "wa_logs", label: "Delivery Logs", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0F0F1A] border-r border-accent-primary/20 flex flex-col justify-between shrink-0 h-full font-orbitron select-none">
      {/* Upper header */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-18 border-b border-accent-primary/20 flex items-center justify-center px-4 shrink-0">
          <div className="text-center">
            <span className="block text-accent-secondary font-black tracking-widest text-base hover:text-accent-primary transition-colors cursor-pointer" onClick={onNavigateHome}>
              [ PILONEKO ]
            </span>
            <span className="text-[8px] text-cyber-muted tracking-widest block font-mono mt-0.5 uppercase">
              // Control Terminal v1.1
            </span>
          </div>
        </div>

        {/* Administrator Profile widget badge */}
        <div className="p-4 border-b border-cyber-muted/10 bg-cyber-surface/40 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full border border-accent-primary/40 flex items-center justify-center text-accent-primary font-bold bg-[#0A0A0F] font-mono text-xs shadow-md shadow-black">
            {adminName.slice(0, 1).toUpperCase()}
          </div>
          <div className="text-left font-sans">
            <span className="block text-xs text-white font-bold tracking-wide">{adminName}</span>
            <span className="text-[9px] text-[#25D366] font-mono tracking-widest block mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
              ONLINE [ADMIN]
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-accent-primary/10 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-left text-xs tracking-wider transition-all duration-200 cursor-pointer rounded-xs border uppercase border-transparent ${
                  isActive
                    ? "border-accent-primary/30 text-accent-primary bg-accent-primary/10 shadow-[0_0_8px_rgba(0,245,255,0.15)] font-bold"
                    : "text-cyber-muted hover:border-accent-primary/10 hover:bg-cyber-surface/50 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-accent-primary" : "text-cyber-muted"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Section: CRM */}
          <div className="mt-6 mb-2 px-3 flex items-center justify-between">
            <span className="text-[10px] font-orbitron font-bold text-accent-primary/80 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> CRM
            </span>
            <div className="h-[1px] bg-accent-primary/20 flex-1 ml-3 shadow-[0_0_5px_rgba(0,245,255,0.3)]"></div>
          </div>
          <button
            onClick={() => onChangeView("customers")}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-left text-xs tracking-wider transition-all duration-200 cursor-pointer rounded-xs border uppercase border-transparent ${
              currentView === "customers"
                ? "border-accent-primary/30 text-accent-primary bg-accent-primary/10 shadow-[0_0_8px_rgba(0,245,255,0.15)] font-bold"
                : "text-cyber-muted hover:border-accent-primary/10 hover:bg-cyber-surface/50 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Data</span>
          </button>

          {/* Section: SETTINGS (WHATSAPP) */}
          <div className="pt-6 pb-2 px-4">
            <span className="text-[10px] text-accent-secondary font-orbitron font-black tracking-widest uppercase">
              --- WA SETTINGS ---
            </span>
          </div>
          {waSettingsItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-left text-xs tracking-wider transition-all duration-200 cursor-pointer rounded-xs border uppercase border-transparent ${
                  isActive
                    ? "border-accent-secondary/30 text-accent-secondary bg-accent-secondary/10 shadow-[0_0_8px_rgba(191,0,255,0.15)] font-bold"
                    : "text-cyber-muted hover:border-accent-secondary/10 hover:bg-cyber-surface/50 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-accent-secondary" : "text-cyber-muted"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Section: MARKETING (WHATSAPP) */}
          <div className="mt-6 mb-2 px-3 flex items-center justify-between">
            <span className="text-[10px] font-orbitron font-bold text-[#25D366]/80 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> WA MARKETING
            </span>
          </div>
          {waMarketingItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-left text-xs tracking-wider transition-all duration-200 cursor-pointer rounded-xs border uppercase border-transparent ${
                  isActive
                    ? "border-accent-secondary/30 text-accent-secondary bg-accent-secondary/10 shadow-[0_0_8px_rgba(191,0,255,0.15)] font-bold"
                    : "text-cyber-muted hover:border-accent-secondary/10 hover:bg-cyber-surface/50 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-accent-secondary" : "text-cyber-muted"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-cyber-muted/10 space-y-2">
        <button
          onClick={onNavigateHome}
          className="w-full flex items-center gap-3.5 px-4 py-2 text-left text-xs tracking-wider text-accent-primary hover:text-white transition-colors cursor-pointer py-2 border border-accent-primary/20 rounded-xs uppercase leading-none font-sans"
        >
          <AppWindow className="w-4 h-4 shrink-0" />
          <span className="font-orbitron">Kunjungi Web</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-2 text-left text-xs tracking-wider text-red-500 hover:text-white hover:bg-red-950/20 transition-colors cursor-pointer border border-red-500/10 rounded-xs uppercase font-sans"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-orbitron font-semibold">LOG OUT</span>
        </button>
      </div>
    </aside>
  );
};
