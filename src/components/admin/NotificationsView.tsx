import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Check, 
  Trash, 
  ShoppingCart, 
  ShieldAlert, 
  AlertTriangle,
  Star,
  RefreshCw,
  Clock
} from "lucide-react";
import { CyberCard } from "../ui/CyberCard";
import { CyberButton } from "../ui/CyberButton";
import { Notification } from "../../types";

interface NotificationsViewProps {
  token: string;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ token }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      
      // Update local state reactive representation
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingCart className="w-4 h-4 text-accent-primary" />;
      case "WARRANTY":
        return <ShieldAlert className="w-4 h-4 text-accent-secondary" />;
      case "STOCK":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "REVIEW":
        return <Star className="w-4 h-4 text-[#25D366]" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <Bell className="w-6 h-6 text-accent-primary animate-pulse" />
            NOTIFICATION HUB //
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
            Audit instan, peringatan stock tipis, ulasan masuk, dan garansi order baru
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <CyberButton onClick={handleReadAll} variant="primary" size="sm" className="flex items-center gap-1.5 font-mono text-xs">
            <Check className="w-4 h-4" /> TANDAI BACA SEMUA
          </CyberButton>
        )}
      </div>

      <CyberCard accent="primary" className="p-6 bg-cyber-card/85">
        <div className="flex items-center justify-between border-b border-cyber-muted/20 pb-3 mb-5">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">// ARSIP ALARM SISTEM</span>
          <button
            onClick={fetchNotifications}
            className="p-1.5 bg-cyber-surface/50 border border-cyber-muted/20 text-cyber-muted hover:text-white rounded-xs transition-colors cursor-pointer"
            title="Refresh Notifikasi"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-[10px] text-cyber-muted uppercase">CONNECTING ALARM RECEIVER...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-cyber-muted/20 font-mono text-xs text-cyber-muted uppercase">
            [BELUM ADA PESAN NOTIFIKASI ALARM BARU TERCATAT]
          </div>
        ) : (
          <div className="divide-y divide-cyber-muted/15 space-y-2">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`py-3.5 px-4 rounded-xs border transition-colors flex gap-3.5 items-start ${
                  n.isRead 
                    ? "bg-cyber-bg/50 border-cyber-muted/10 opacity-70" 
                    : "bg-accent-primary/5 border-accent-primary/20 hover:border-accent-primary/45"
                }`}
              >
                <span className={`p-2 rounded-xs border shrink-0 ${
                  n.isRead 
                    ? "bg-cyber-surface/50 border-cyber-muted/20 text-cyber-muted" 
                    : "bg-[#0A0A0F] border-accent-primary/30"
                }`}>
                  {getNotifIcon(n.type)}
                </span>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-xs font-bold tracking-wide font-sans ${n.isRead ? "text-cyber-muted" : "text-white"}`}>
                      {n.title}
                    </span>
                    <span className="font-mono text-[8px] text-cyber-muted flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className={`text-xs ${n.isRead ? "text-cyber-muted" : "text-gray-300"}`}>
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CyberCard>
    </div>
  );
};
