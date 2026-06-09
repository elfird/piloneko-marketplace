import React, { useState, useEffect } from "react";
import { Gamepad2, Settings, Zap } from "lucide-react";

interface Props { token: string; }

export const TopupDashboardView: React.FC<Props> = ({ token }) => {
  return (
    <div className="space-y-6">
      <h1 className="font-orbitron font-black text-2xl text-white tracking-widest text-[#BF00FF] mb-1 uppercase">
        // TOPUP DASHBOARD
      </h1>
      <p className="text-cyber-muted text-xs font-mono">Overview performa modul Game Topup & Digiflazz.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-cyber-card border border-[#BF00FF]/30 rounded-xs">
          <Gamepad2 className="w-8 h-8 text-[#BF00FF] mb-2" />
          <h3 className="text-white font-bold font-orbitron">TOTAL GAMES</h3>
          <p className="text-2xl font-mono text-cyber-muted">--</p>
        </div>
        <div className="p-4 bg-cyber-card border border-[#BF00FF]/30 rounded-xs">
          <Settings className="w-8 h-8 text-[#BF00FF] mb-2" />
          <h3 className="text-white font-bold font-orbitron">ACTIVE PRODUCTS</h3>
          <p className="text-2xl font-mono text-cyber-muted">--</p>
        </div>
        <div className="p-4 bg-cyber-card border border-[#BF00FF]/30 rounded-xs">
          <Zap className="w-8 h-8 text-[#BF00FF] mb-2" />
          <h3 className="text-white font-bold font-orbitron">SUCCESS ORDERS</h3>
          <p className="text-2xl font-mono text-cyber-muted">--</p>
        </div>
      </div>
    </div>
  );
};
