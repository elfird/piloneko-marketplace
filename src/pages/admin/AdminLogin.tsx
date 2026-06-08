import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { KeyRound, ArrowLeft, AlertTriangle } from 'lucide-react';
import { CyberButton } from '../../components/ui/CyberButton';
import { CyberCard } from '../../components/ui/CyberCard';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

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
      const adminName = data.admin?.name || "Admin Premium";
      
      // Update Zustand Auth Store (which persists to localStorage)
      login(data.token, adminName);
      
      // Legacy storage just in case old components still check it
      localStorage.setItem("token", data.token);
      localStorage.setItem("adminName", adminName);
      localStorage.setItem("adminView", "dashboard");

      navigate("/admin/dashboard");
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cyber-bg">
      <div className="absolute inset-0 grid-perspective opacity-10" />

      <div className="w-full max-w-sm relative pointer-events-auto">
        <button
          onClick={() => navigate("/")}
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

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                Secure Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="Masukkan email admin"
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
  );
}
