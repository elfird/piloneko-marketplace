import React, { useState, useEffect } from "react";
import { Gamepad2, Settings, Zap } from "lucide-react";

interface Props { token: string; }

export const TopupDashboardView: React.FC<Props> = ({ token }) => {
  const [stats, setStats] = useState({
    totalGames: 0,
    activeProducts: 0,
    successOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/topup/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalGames: data.totalGames || 0,
          activeProducts: data.activeProducts || 0,
          successOrders: data.successOrders || 0
        });
      }
    } catch (err) {
      console.error("Failed to fetch topup stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <h1 className="font-orbitron font-black text-2xl text-white tracking-widest text-[#BF00FF] mb-1 uppercase">
        // TOPUP DASHBOARD
      </h1>
      <p className="text-cyber-muted text-xs font-mono">Overview performa modul Game Topup & Digiflazz.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-cyber-card border border-[#BF00FF]/30 rounded-xs">
          <Gamepad2 className="w-8 h-8 text-[#BF00FF] mb-2" />
          <h3 className="text-white font-bold font-orbitron uppercase text-sm mb-1">Total Games</h3>
          <p className="text-2xl font-mono text-white font-bold">
            {loading ? "..." : stats.totalGames}
          </p>
        </div>
        <div className="p-4 bg-cyber-card border border-[#BF00FF]/30 rounded-xs">
          <Settings className="w-8 h-8 text-[#BF00FF] mb-2" />
          <h3 className="text-white font-bold font-orbitron uppercase text-sm mb-1">Active Products</h3>
          <p className="text-2xl font-mono text-white font-bold">
            {loading ? "..." : stats.activeProducts}
          </p>
        </div>
        <div className="p-4 bg-cyber-card border border-[#BF00FF]/30 rounded-xs">
          <Zap className="w-8 h-8 text-[#BF00FF] mb-2" />
          <h3 className="text-white font-bold font-orbitron uppercase text-sm mb-1">Success Orders</h3>
          <p className="text-2xl font-mono text-white font-bold">
            {loading ? "..." : stats.successOrders}
          </p>
        </div>
      </div>
    </div>
  );
};
