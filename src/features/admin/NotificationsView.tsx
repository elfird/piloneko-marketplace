import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Check, 
  ShoppingCart, 
  ShieldAlert, 
  AlertTriangle,
  Star,
  RefreshCw,
  Clock,
  CreditCard,
  Info,
  Zap
} from "lucide-react";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberButton } from "../../components/ui/CyberButton";
import { Notification } from "../../types";

interface NotificationsViewProps {
  token: string;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ token }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengambil data notifikasi");
      const list = await res.json();
      setNotifications(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      const res = await fetch("/api/admin/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menandai semua telah dibaca");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getNotifConfig = (type: string) => {
    switch (type) {
      case "ORDER":
        return {
          icon: <ShoppingCart className="w-4 h-4" />,
          color: "text-accent-primary",
          border: "border-accent-primary/40",
          bg: "bg-accent-primary/10",
          label: "ORDER BARU",
          labelColor: "text-accent-primary bg-accent-primary/15 border-accent-primary/30"
        };
      case "WARRANTY":
        return {
          icon: <ShieldAlert className="w-4 h-4" />,
          color: "text-accent-secondary",
          border: "border-accent-secondary/40",
          bg: "bg-accent-secondary/10",
          label: "GARANSI",
          labelColor: "text-accent-secondary bg-accent-secondary/15 border-accent-secondary/30"
        };
      case "STOCK":
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: "text-yellow-400",
          border: "border-yellow-400/40",
          bg: "bg-yellow-400/10",
          label: "STOK TIPIS",
          labelColor: "text-yellow-400 bg-yellow-400/15 border-yellow-400/30"
        };
      case "REVIEW":
        return {
          icon: <Star className="w-4 h-4 fill-current" />,
          color: "text-[#25D366]",
          border: "border-[#25D366]/40",
          bg: "bg-[#25D366]/10",
          label: "ULASAN",
          labelColor: "text-[#25D366] bg-[#25D366]/15 border-[#25D366]/30"
        };
      case "PAYMENT":
        return {
          icon: <CreditCard className="w-4 h-4" />,
          color: "text-blue-400",
          border: "border-blue-400/40",
          bg: "bg-blue-400/10",
          label: "PEMBAYARAN",
          labelColor: "text-blue-400 bg-blue-400/15 border-blue-400/30"
        };
      default:
        return {
          icon: <Info className="w-4 h-4" />,
          color: "text-cyber-muted",
          border: "border-cyber-muted/20",
          bg: "bg-cyber-surface/50",
          label: "SISTEM",
          labelColor: "text-cyber-muted bg-cyber-surface border-cyber-muted/20"
        };
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filtered = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <Bell className="w-6 h-6 text-accent-primary animate-pulse" />
            NOTIFICATION HUB
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest mt-1">
            Audit instan · peringatan stok · ulasan masuk · garansi · pembayaran
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <CyberButton onClick={handleReadAll} variant="primary" size="sm" className="flex items-center gap-1.5 font-mono text-xs">
              <Check className="w-4 h-4" /> BACA SEMUA
            </CyberButton>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2 bg-cyber-surface/50 border border-cyber-muted/20 text-cyber-muted hover:text-white hover:border-accent-primary/40 rounded-xs transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-cyber-card/60 border border-cyber-muted/10 p-3 text-center">
          <span className="block font-orbitron font-black text-xl text-white">{notifications.length}</span>
          <span className="text-[9px] font-mono text-cyber-muted uppercase tracking-widest">Total</span>
        </div>
        <div className="bg-accent-primary/5 border border-accent-primary/20 p-3 text-center">
          <span className="block font-orbitron font-black text-xl text-accent-primary">{unreadCount}</span>
          <span className="text-[9px] font-mono text-accent-primary/70 uppercase tracking-widest">Belum Dibaca</span>
        </div>
        <div className="bg-cyber-card/60 border border-cyber-muted/10 p-3 text-center">
          <span className="block font-orbitron font-black text-xl text-[#25D366]">
            {notifications.filter(n => n.isRead).length}
          </span>
          <span className="text-[9px] font-mono text-cyber-muted uppercase tracking-widest">Dibaca</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-cyber-muted/20 pb-0">
        {(["all", "unread"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-orbitron text-[10px] uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
              filter === f
                ? "border-accent-primary text-accent-primary"
                : "border-transparent text-cyber-muted hover:text-white"
            }`}
          >
            {f === "all" ? `SEMUA (${notifications.length})` : `BELUM DIBACA (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <CyberCard accent="primary" className="p-0 bg-cyber-card/85 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-[10px] text-cyber-muted uppercase tracking-wider">
              CONNECTING ALARM RECEIVER...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 font-mono text-sm">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-60" />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-10 h-10 text-cyber-muted/30 mx-auto mb-4" />
            <p className="font-mono text-xs text-cyber-muted uppercase tracking-widest">
              {filter === "unread" ? "[SEMUA NOTIFIKASI SUDAH DIBACA]" : "[BELUM ADA NOTIFIKASI TERCATAT]"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-cyber-muted/10">
            {filtered.map((n) => {
              const cfg = getNotifConfig(n.type);
              return (
                <div
                  key={n.id}
                  className={`relative flex gap-4 p-4 transition-all group ${
                    !n.isRead
                      ? `border-l-2 ${cfg.border} bg-cyber-surface/20`
                      : "border-l-2 border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  {/* Unread pulse dot */}
                  {!n.isRead && (
                    <span className={`absolute top-3.5 right-3.5 w-2 h-2 rounded-full ${cfg.color} flex items-center justify-center`}>
                      <span className={`absolute inset-0 rounded-full ${cfg.color} animate-ping opacity-60`} />
                      <span className={`w-2 h-2 rounded-full ${cfg.bg} border ${cfg.border}`} />
                    </span>
                  )}

                  {/* Icon Badge */}
                  <div className={`p-2.5 rounded-xs border shrink-0 mt-0.5 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-bold tracking-wide ${n.isRead ? "text-cyber-muted" : "text-white"}`}>
                        {n.title}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border rounded-xs uppercase tracking-widest ${cfg.labelColor}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${n.isRead ? "text-cyber-muted" : "text-gray-300"}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 text-cyber-muted/50" />
                      <span className="font-mono text-[9px] text-cyber-muted/70">
                        {new Date(n.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CyberCard>

      {/* Footer note */}
      <div className="flex items-center gap-2 text-[9px] font-mono text-cyber-muted/50 uppercase tracking-widest">
        <Zap className="w-3 h-3 text-accent-primary/40" />
        <span>Notifikasi otomatis diperbarui setiap kali ada order baru, klaim garansi, ulasan, atau pembayaran masuk</span>
      </div>
    </div>
  );
};
