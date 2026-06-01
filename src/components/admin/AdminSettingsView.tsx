import React, { useState, useEffect } from "react";
import { Settings, Save, ShieldAlert, Cpu, Database, Activity, RefreshCw, Terminal, CheckCircle } from "lucide-react";

interface AdminSettingsProps {
  token: string;
}

export const AdminSettingsView: React.FC<AdminSettingsProps> = ({ token }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Decorative terminal telemetry logs
  const [logs, setLogs] = useState<string[]>([
    "SYS_INIT: Booting security mainframe...",
    "SEC_SHIELD: Port encryption protocol AES-256-GCM established.",
    "DB_NODE: Connection state with Laragon MySQL verified.",
    "DB_NODE: Table maps sync completed (12 tables mapped).",
  ]);

  // Decorative real-time mock telemetry stats
  const [cpuUsage, setCpuUsage] = useState(18);
  const [ramUsage, setRamUsage] = useState(42.5);
  const [activeSockets, setActiveSockets] = useState(3);

  useEffect(() => {
    fetchProfile();

    // Telemetry updates simulation
    const telemetryTimer = setInterval(() => {
      setCpuUsage(Math.floor(10 + Math.random() * 25));
      setRamUsage(Number((40 + Math.random() * 4).toFixed(1)));
      if (Math.random() > 0.7) {
        setActiveSockets(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)));
      }
    }, 3000);

    // Terminal log simulator
    const logPool = [
      "DB_NODE: Queried recent orders index successfully.",
      "SEC_AUDIT: Token signature verified by firewall.",
      "SYSTEM: Sync with WhatsApp SLA dispatcher successful.",
      "SYSTEM: Garbage collection freed 12MB heap memory.",
      "SEC_SHIELD: Integrity check ok. Zero intrusion nodes found.",
      "DB_NODE: Synced stock items availability count.",
    ];

    const logTimer = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toLocaleTimeString("id-ID");
      setLogs(prev => [...prev.slice(-8), `[${timestamp}] ${randomLog}`]);
    }, 7000);

    return () => {
      clearInterval(telemetryTimer);
      clearInterval(logTimer);
    };
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data profil admin");
      const data = await res.json();
      if (data.admin) {
        setName(data.admin.name);
        setEmail(data.admin.email);
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!name.trim() || !email.trim()) {
      setMessage({ text: "Nama dan Email wajib diisi.", type: "error" });
      return;
    }

    try {
      setSubmittingProfile(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memperbarui profil.");
      }

      const data = await res.json();
      setMessage({ text: "Profil administrator berhasil diperbarui!", type: "success" });
      
      // Push event into terminal logs
      const timestamp = new Date().toLocaleTimeString("id-ID");
      setLogs(prev => [...prev, `[${timestamp}] SEC_AUDIT: Administrator profile data updated.`]);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!password) {
      setMessage({ text: "Password baru wajib diisi.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: "Konfirmasi password baru tidak cocok.", type: "error" });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: "Password minimal terdiri dari 6 karakter.", type: "error" });
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memperbarui password.");
      }

      setMessage({ text: "Password administrator berhasil diganti!", type: "success" });
      setPassword("");
      setConfirmPassword("");

      // Push event into terminal logs
      const timestamp = new Date().toLocaleTimeString("id-ID");
      setLogs(prev => [...prev, `[${timestamp}] SEC_SHIELD: System password changed and hashed successfully.`]);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-cyber-muted animate-pulse">
        CALIBRATING MAIN SECURITY CREDENTIALS...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
            // SECURE SYSTEM CONFIG
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
            Kelola nama administrator, email korespondensi, reset password, dan pantau diagnostik node server
          </p>
        </div>
        <button
          onClick={fetchProfile}
          className="p-1 px-3 text-xs bg-cyber-card border border-accent-primary text-accent-primary rounded-xs flex items-center gap-1 cursor-pointer font-mono uppercase font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> RE-BOOT SHIELD
        </button>
      </div>

      {/* Global Status/Feedback Messages */}
      {message && (
        <div
          className={`p-4 border rounded-xs flex gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 animate-bounce" />
          )}
          <div>
            <p className="font-orbitron uppercase text-[10px] tracking-wider font-bold">
              {message.type === "success" ? "STATUS: COMPLETED" : "STATUS: ACTION TERMINATED"}
            </p>
            <p className="mt-0.5 font-sans leading-relaxed">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Settings and Password Column (Left) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="p-6 bg-cyber-card border border-accent-primary/20 space-y-4 rounded-xs">
            <span className="block text-xs font-orbitron font-bold text-accent-primary uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent-primary animate-spin-slow" />
              <span>// ADMIN PROFILE CREDENTIALS</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Nama Lengkap Admin *</label>
                <input
                  type="text"
                  required
                  placeholder="Super Admin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Email Administrator *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@premiumku.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={submittingProfile}
                className="px-4 py-2 bg-accent-primary text-black hover:bg-white hover:text-black transition-all text-xs font-orbitron font-black tracking-widest cursor-pointer rounded-xs flex items-center justify-center gap-1.5 ml-auto"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>{submittingProfile ? "STORING DATA..." : "UPDATE PROFILE"}</span>
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="p-6 bg-cyber-card border border-accent-secondary/20 space-y-4 rounded-xs">
            <span className="block text-xs font-orbitron font-bold text-accent-secondary uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-secondary animate-pulse" />
              <span>// DEPLOY NEW SECURITY KEY</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Password Baru *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-secondary/25 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Konfirmasi Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Ketik ulang password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-secondary/25 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={submittingPassword}
                className="px-4 py-2 bg-accent-secondary/15 text-accent-secondary border border-accent-secondary hover:bg-accent-secondary hover:text-white transition-all text-xs font-orbitron font-black tracking-widest cursor-pointer rounded-xs flex items-center justify-center gap-1.5 ml-auto"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>{submittingPassword ? "RE-HASHING KEY..." : "CHANGE SYSTEM KEY"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Telemetry and Hacking-style terminal Logger Column (Right) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hardware/Server Telemetry Grid */}
          <div className="border border-cyber-muted/10 bg-[#0F0F1A] p-5 rounded-xs text-left">
            <span className="block text-[10px] font-orbitron font-bold text-cyber-muted uppercase tracking-widest mb-4">
              // TELEMETRY ACTIVE NODE PREVIEW
            </span>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* CPU Meter */}
              <div className="border border-cyber-muted/15 p-3 bg-cyber-surface/50 rounded-xs">
                <Cpu className="w-5 h-5 text-accent-primary mx-auto mb-1.5 animate-pulse" />
                <span className="block text-[8px] font-mono text-cyber-muted uppercase tracking-wider">CPU UTIL</span>
                <strong className="block text-base font-orbitron font-black text-white mt-0.5">{cpuUsage}%</strong>
              </div>

              {/* Memory Meter */}
              <div className="border border-cyber-muted/15 p-3 bg-cyber-surface/50 rounded-xs">
                <Database className="w-5 h-5 text-accent-secondary mx-auto mb-1.5" />
                <span className="block text-[8px] font-mono text-cyber-muted uppercase tracking-wider">RAM ALLOC</span>
                <strong className="block text-base font-orbitron font-black text-white mt-0.5">{ramUsage}%</strong>
              </div>

              {/* Sockets Meter */}
              <div className="border border-cyber-muted/15 p-3 bg-cyber-surface/50 rounded-xs">
                <Activity className="w-5 h-5 text-[#25D366] mx-auto mb-1.5" />
                <span className="block text-[8px] font-mono text-cyber-muted uppercase tracking-wider">SOCKETS</span>
                <strong className="block text-base font-orbitron font-black text-white mt-0.5">{activeSockets} active</strong>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-cyber-muted/10 text-xs font-sans text-cyber-muted space-y-1.5">
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="font-mono text-white font-semibold">MySQL (Laragon local)</span>
              </div>
              <div className="flex justify-between">
                <span>Database Name:</span>
                <span className="font-mono text-accent-primary font-semibold">piloneko</span>
              </div>
              <div className="flex justify-between">
                <span>SSL Encrypted:</span>
                <span className="font-mono text-[#25D366] font-semibold">ACTIVE (Local Tunnel)</span>
              </div>
            </div>
          </div>

          {/* Interactive Shell terminal Logger */}
          <div className="border border-accent-primary/20 bg-black p-5 rounded-xs relative">
            <span className="absolute top-0 right-3.5 w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping mt-4" />
            
            <span className="block text-[10px] font-orbitron font-bold text-accent-primary uppercase tracking-widest leading-none mb-3.5 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-accent-primary" />
              <span>// CENTRAL_FIREWALL LOG_SHELL</span>
            </span>

            <div className="h-44 bg-[#05050A] border border-cyber-muted/15 p-3 text-[10px] font-mono text-[#00F5FF]/90 space-y-1.5 overflow-y-auto font-semibold leading-relaxed rounded-xs select-all text-left">
              {logs.map((log, idx) => (
                <div key={idx} className="truncate">
                  <span className="text-cyber-muted select-none">&gt;&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
