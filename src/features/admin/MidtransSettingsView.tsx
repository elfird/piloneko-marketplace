import React, { useState, useEffect } from "react";
import {
  CreditCard, Save, Zap, Eye, EyeOff, CheckCircle2,
  XCircle, AlertTriangle, Clock, RefreshCw, Shield,
  ToggleLeft, ToggleRight, Info
} from "lucide-react";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberButton } from "../../components/ui/CyberButton";

interface MidtransSettingsViewProps {
  token: string;
}

type ConnectionStatus = "connected" | "disconnected" | "invalid_key" | "untested";

export const MidtransSettingsView: React.FC<MidtransSettingsViewProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [serverKey, setServerKey] = useState("");
  const [clientKey, setClientKey] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [isProduction, setIsProduction] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showServerKey, setShowServerKey] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("untested");
  const [lastConnectedAt, setLastConnectedAt] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.exists) {
        setExists(true);
        setServerKey(data.serverKey || "");
        setClientKey(data.clientKey || "");
        setMerchantId(data.merchantId || "");
        setIsProduction(data.isProduction || false);
        setIsActive(data.isActive !== false);
        setConnectionStatus(data.connectionStatus || "untested");
        setLastConnectedAt(data.lastConnectedAt || null);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!serverKey || !clientKey) {
      setSaveMsg("❌ Server Key dan Client Key wajib diisi.");
      return;
    }
    try {
      setSaving(true);
      setSaveMsg("");
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serverKey, clientKey, merchantId, isProduction, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setSaveMsg("✅ Pengaturan berhasil disimpan!");
      setExists(true);
      fetchSettings();
    } catch (err: any) {
      setSaveMsg(`❌ ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 5000);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await fetch("/api/admin/payment-settings/test", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.message });
      setConnectionStatus(data.status || "disconnected");
      if (data.lastConnectedAt) setLastConnectedAt(data.lastConnectedAt);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const statusConfig: Record<ConnectionStatus, { label: string; color: string; icon: React.ReactNode }> = {
    connected: {
      label: "CONNECTED",
      color: "text-[#25D366] border-[#25D366]/40 bg-[#25D366]/10",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    disconnected: {
      label: "DISCONNECTED",
      color: "text-red-400 border-red-400/40 bg-red-400/10",
      icon: <XCircle className="w-4 h-4" />,
    },
    invalid_key: {
      label: "INVALID KEY",
      color: "text-orange-400 border-orange-400/40 bg-orange-400/10",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    untested: {
      label: "BELUM DITEST",
      color: "text-cyber-muted border-cyber-muted/20 bg-cyber-surface/50",
      icon: <Clock className="w-4 h-4" />,
    },
  };

  const cfg = statusConfig[connectionStatus];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-xs text-cyber-muted uppercase tracking-widest">LOADING PAYMENT CONFIG...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-accent-primary" />
            PAYMENT GATEWAY
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest mt-1">
            Konfigurasi Midtrans Snap · Kelola keys · Test koneksi
          </p>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xs font-mono text-xs font-bold uppercase ${cfg.color}`}>
          {cfg.icon}
          <span>{cfg.label}</span>
        </div>
      </div>

      {/* Info Note */}
      {!exists && (
        <div className="flex items-start gap-3 p-4 border border-yellow-400/30 bg-yellow-400/5">
          <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">
            Belum ada konfigurasi Midtrans. Isi form di bawah dan klik <strong>SIMPAN</strong> untuk mulai menerima pembayaran.
          </p>
        </div>
      )}

      {/* Main Form */}
      <CyberCard accent="primary" className="p-6 bg-cyber-card/85">
        <div className="space-y-5">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between p-4 border border-cyber-muted/20 bg-cyber-surface/30">
            <div>
              <span className="block text-xs font-orbitron font-bold text-white uppercase tracking-widest">
                Mode Midtrans
              </span>
              <span className="text-[10px] text-cyber-muted font-mono">
                {isProduction ? "🔴 PRODUCTION — Transaksi nyata, gunakan hati-hati!" : "🟡 SANDBOX — Simulasi pembayaran, aman untuk testing"}
              </span>
            </div>
            <button
              onClick={() => setIsProduction(prev => !prev)}
              className="cursor-pointer"
              title="Toggle Mode"
            >
              {isProduction ? (
                <ToggleRight className="w-8 h-8 text-red-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-yellow-400" />
              )}
            </button>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 border border-cyber-muted/20 bg-cyber-surface/30">
            <div>
              <span className="block text-xs font-orbitron font-bold text-white uppercase tracking-widest">
                Status Payment Gateway
              </span>
              <span className="text-[10px] text-cyber-muted font-mono">
                {isActive ? "✅ AKTIF — Pembeli bisa bayar via Midtrans" : "⏸️ NONAKTIF — Pembayaran Midtrans dimatikan"}
              </span>
            </div>
            <button
              onClick={() => setIsActive(prev => !prev)}
              className="cursor-pointer"
              title="Toggle Active"
            >
              {isActive ? (
                <ToggleRight className="w-8 h-8 text-[#25D366]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-cyber-muted" />
              )}
            </button>
          </div>

          {/* Server Key */}
          <div>
            <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
              Midtrans Server Key *
            </label>
            <div className="flex gap-2">
              <input
                type={showServerKey ? "text" : "password"}
                value={serverKey}
                onChange={e => setServerKey(e.target.value)}
                placeholder={isProduction ? "Mid-server-xxxx" : "SB-Mid-server-xxxx"}
                className="flex-1 px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono placeholder-cyber-muted"
              />
              <button
                type="button"
                onClick={() => setShowServerKey(p => !p)}
                className="px-3 border border-cyber-muted/20 text-cyber-muted hover:text-white transition-colors cursor-pointer"
              >
                {showServerKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[9px] text-cyber-muted font-mono mt-1 block">
              🔒 Disimpan terenkripsi AES-256 di database. Tidak pernah ditampilkan sepenuhnya.
            </span>
          </div>

          {/* Client Key */}
          <div>
            <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
              Midtrans Client Key *
            </label>
            <input
              type="text"
              value={clientKey}
              onChange={e => setClientKey(e.target.value)}
              placeholder={isProduction ? "Mid-client-xxxx" : "SB-Mid-client-xxxx"}
              className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono placeholder-cyber-muted"
            />
            <span className="text-[9px] text-cyber-muted font-mono mt-1 block">
              ℹ️ Client Key aman ditampilkan di frontend (digunakan untuk Snap popup).
            </span>
          </div>

          {/* Merchant ID (optional) */}
          <div>
            <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
              Merchant ID <span className="text-[8px] normal-case">(opsional)</span>
            </label>
            <input
              type="text"
              value={merchantId}
              onChange={e => setMerchantId(e.target.value)}
              placeholder="G123456789"
              className="w-full px-3 py-2 bg-cyber-bg border border-cyber-muted/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono placeholder-cyber-muted"
            />
          </div>

          {/* Save Message */}
          {saveMsg && (
            <div className={`p-3 text-xs font-mono border ${saveMsg.startsWith("✅") ? "border-[#25D366]/30 bg-[#25D366]/5 text-[#25D366]" : "border-red-500/30 bg-red-500/5 text-red-400"}`}>
              {saveMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <CyberButton
              onClick={handleSave}
              variant="primary"
              className="flex-1 font-bold"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "MENYIMPAN..." : "SIMPAN PENGATURAN"}
            </CyberButton>

            {exists && (
              <CyberButton
                onClick={handleTestConnection}
                variant="secondary"
                className="flex-1"
                disabled={testing}
              >
                <Zap className="w-4 h-4" />
                {testing ? "TESTING..." : "TEST CONNECTION"}
              </CyberButton>
            )}

            <button
              onClick={fetchSettings}
              className="px-3 py-2 border border-cyber-muted/20 text-cyber-muted hover:text-white transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CyberCard>

      {/* Test Result */}
      {testResult && (
        <div className={`flex items-start gap-3 p-4 border font-mono text-xs ${testResult.success ? "border-[#25D366]/30 bg-[#25D366]/5 text-[#25D366]" : "border-red-500/30 bg-red-500/5 text-red-400"}`}>
          {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Last Connected */}
      {lastConnectedAt && (
        <div className="flex items-center gap-2 text-[10px] font-mono text-cyber-muted">
          <Clock className="w-3.5 h-3.5 text-accent-primary/60" />
          <span>Terakhir terhubung: {new Date(lastConnectedAt).toLocaleString("id-ID")}</span>
        </div>
      )}

      {/* Info Panel */}
      <CyberCard accent="neutral" className="p-5 bg-cyber-card/40">
        <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent-secondary" />
          PANDUAN KONFIGURASI
        </h3>
        <div className="space-y-3 text-xs text-cyber-muted font-mono">
          <p>1. Login ke <span className="text-accent-primary">dashboard.sandbox.midtrans.com</span> (Sandbox) atau <span className="text-accent-primary">dashboard.midtrans.com</span> (Production)</p>
          <p>2. Buka <span className="text-white">Settings → Access Keys</span> untuk mendapatkan Server Key dan Client Key</p>
          <p>3. Paste key di form di atas → Klik <span className="text-accent-primary font-bold">SIMPAN</span></p>
          <p>4. Klik <span className="text-accent-secondary font-bold">TEST CONNECTION</span> untuk memverifikasi koneksi</p>
          <p>5. Update <span className="text-white">index.html</span> dengan Client Key yang sama di atribut <code className="text-accent-secondary">data-client-key</code></p>
          <div className="mt-3 p-3 border border-yellow-400/20 bg-yellow-400/5 text-yellow-300">
            ⚠️ Webhook URL untuk Midtrans: <span className="text-white select-all">https://yourdomain.com/api/payment/notification</span>
          </div>
        </div>
      </CyberCard>
    </div>
  );
};
