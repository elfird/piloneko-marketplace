import React, { useState, useEffect } from "react";
import {
  Sliders, Save, CheckCircle, XCircle, RefreshCw,
  Send, MessageSquare, Phone, Loader2, AlertCircle, Zap
} from "lucide-react";

interface WhatsAppSettingsViewProps {
  token: string;
}

const QUICK_TEMPLATES = [
  {
    label: "🎉 Promo",
    message: "🎉 *Promo Spesial PILONEKO!*\n\nHai kak, ada promo menarik untuk Anda hari ini!\n\nJangan lewatkan penawaran terbatas ini. Kunjungi toko kami sekarang dan dapatkan diskon spesial! 🔥\n\n_PILONEKO - Premium Accounts_",
  },
  {
    label: "⏰ Pengingat",
    message: "⏰ *Pengingat dari PILONEKO*\n\nHai kak, kami mengingatkan bahwa ada pesanan yang belum diselesaikan.\n\nSegera selesaikan pembayaran Anda sebelum kadaluarsa ya! 😊\n\n_Hubungi kami jika ada pertanyaan._",
  },
  {
    label: "✅ Pesanan Selesai",
    message: "✅ *Pesanan Anda Telah Selesai!*\n\nHai kak, pesanan Anda di PILONEKO telah berhasil diproses.\n\nTerima kasih sudah berbelanja bersama kami! Semoga puas dengan produknya 🙏\n\n_Rating & review Anda sangat berarti untuk kami._",
  },
];

export const WhatsAppSettingsView: React.FC<WhatsAppSettingsViewProps> = ({ token }) => {
  const [settings, setSettings] = useState<any>({
    whatsappNumber: "",
    adminName: "",
    fonteToken: "",
    deviceId: "",
    isConnected: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  // Test blast state
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/whatsapp/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Gagal menyimpan pengaturan");
      }
      alert("Pengaturan WhatsApp berhasil disimpan!");
      fetchSettings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await fetch("/api/admin/whatsapp/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fonteToken: settings.fonteToken }),
      });
      const data = await res.json();
      setTestResult(data.success);
      if (data.success) setSettings((prev: any) => ({ ...prev, isConnected: true }));
    } catch {
      setTestResult(false);
    } finally {
      setTesting(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetPhone: testPhone, message: testMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendResult({ type: "error", message: data.error || "Gagal mengirim pesan." });
      } else {
        setSendResult({ type: "success", message: data.message || "Pesan berhasil dikirim!" });
      }
    } catch (err: any) {
      setSendResult({ type: "error", message: err.message });
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center text-cyber-muted font-mono text-xs animate-pulse">
        LOADING SETTINGS...
      </div>
    );

  return (
    <div className="space-y-10 font-sans">
      {/* ── Header ── */}
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // WHATSAPP CORE SETTINGS
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Konfigurasi koneksi ke Foonte API
        </p>
      </div>

      {/* ── Connection + Form Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Status Card */}
        <div className="lg:col-span-1">
          <div className="bg-cyber-card border border-accent-primary/20 p-6 rounded-xs relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-primary/5 rounded-full blur-2xl" />
            <h2 className="text-xs font-orbitron font-bold text-accent-secondary tracking-widest uppercase mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Connection Status
            </h2>

            <div className="flex flex-col items-center justify-center py-6 border border-cyber-muted/10 bg-cyber-bg/50 rounded-xs mb-4">
              {settings.isConnected ? (
                <>
                  <CheckCircle className="w-12 h-12 text-[#25D366] mb-2" />
                  <span className="font-orbitron font-bold text-[#25D366] tracking-widest">CONNECTED</span>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-red-500 mb-2" />
                  <span className="font-orbitron font-bold text-red-500 tracking-widest">DISCONNECTED</span>
                </>
              )}
            </div>

            {testResult !== null && (
              <div
                className={`text-xs text-center p-2 mb-4 border ${
                  testResult
                    ? "border-[#25D366]/30 text-[#25D366] bg-[#25D366]/10"
                    : "border-red-500/30 text-red-500 bg-red-500/10"
                }`}
              >
                {testResult ? "Test Success! API Connected." : "Test Failed! Check your token."}
              </div>
            )}

            <button
              onClick={handleTestConnection}
              disabled={testing || !settings.fonteToken}
              className="w-full py-2.5 bg-cyber-surface/50 border border-accent-primary/30 text-white hover:bg-accent-primary/20 transition-all text-xs font-orbitron tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
              {testing ? "TESTING..." : "TEST CONNECTION"}
            </button>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="bg-cyber-card border border-accent-primary/20 p-6 rounded-xs space-y-5"
          >
            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">
                WhatsApp Admin Number
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                placeholder="e.g. 08123456789"
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Admin Name</label>
              <input
                type="text"
                value={settings.adminName}
                onChange={(e) => handleChange("adminName", e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Fonte API Token</label>
              <input
                type="password"
                value={settings.fonteToken}
                onChange={(e) => handleChange("fonteToken", e.target.value)}
                placeholder="Input new token here..."
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
              {settings.fonteToken === "ENCRYPTED_TOKEN_SET" && (
                <p className="text-[9px] text-[#25D366] mt-1 font-mono">✓ Token is encrypted and saved.</p>
              )}
            </div>

            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">
                Device ID (Optional)
              </label>
              <input
                type="text"
                value={settings.deviceId}
                onChange={(e) => handleChange("deviceId", e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div className="pt-4 text-right">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-accent-primary text-black hover:bg-white transition-all text-sm font-orbitron font-black tracking-widest cursor-pointer rounded-xs flex items-center gap-2 inline-flex"
              >
                <Save className="w-4 h-4" />
                {saving ? "SAVING..." : "SAVE SETTINGS"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TEST WA BLAST PANEL
      ═══════════════════════════════════════════ */}
      <div className="border-t border-accent-primary/10 pt-8">
        {/* Section header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xs">
            <Zap className="w-4 h-4 text-[#25D366]" />
          </div>
          <div>
            <h2 className="font-orbitron font-black text-lg text-white tracking-widest uppercase">
              // Test WA Blast
            </h2>
            <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
              Kirim pesan uji coba ke nomor tertentu via Fonnte
            </p>
          </div>
        </div>

        <form onSubmit={handleSendTest} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left: Input Panel ── */}
          <div className="bg-cyber-card border border-[#25D366]/20 p-6 rounded-xs space-y-4 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#25D366]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Phone input */}
            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Nomor Tujuan
              </label>
              <input
                id="test-wa-phone"
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                required
                className="w-full px-3 py-2.5 bg-cyber-bg border border-[#25D366]/25 focus:border-[#25D366] focus:outline-none text-white text-xs font-mono transition-colors"
              />
              <p className="text-[9px] text-cyber-muted mt-1 font-mono">Format: 08xxx atau 62xxx</p>
            </div>

            {/* Message textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-cyber-muted text-[10px] font-mono uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Pesan
                </label>
                <span
                  className={`text-[9px] font-mono ${
                    testMessage.length > 900 ? "text-red-400" : "text-cyber-muted"
                  }`}
                >
                  {testMessage.length} / 1000
                </span>
              </div>
              <textarea
                id="test-wa-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Ketik pesan uji coba di sini..."
                required
                rows={7}
                maxLength={1000}
                className="w-full px-3 py-2.5 bg-cyber-bg border border-[#25D366]/25 focus:border-[#25D366] focus:outline-none text-white text-xs font-mono resize-none transition-colors"
              />
            </div>

            {/* Send result feedback */}
            {sendResult && (
              <div
                className={`flex items-start gap-2 p-3 border rounded-xs text-xs font-mono ${
                  sendResult.type === "success"
                    ? "border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366]"
                    : "border-red-500/40 bg-red-500/10 text-red-400"
                }`}
              >
                {sendResult.type === "success" ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                )}
                <span>{sendResult.message}</span>
              </div>
            )}

            {/* Send button */}
            <button
              id="test-wa-send-btn"
              type="submit"
              disabled={sending || !testPhone.trim() || !testMessage.trim()}
              className="w-full py-3 bg-[#25D366] hover:bg-[#20b558] text-black font-orbitron font-black text-xs tracking-widest rounded-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> MENGIRIM...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> KIRIM TEST PESAN
                </>
              )}
            </button>
          </div>

          {/* ── Right: Templates + Preview ── */}
          <div className="space-y-4">
            {/* Quick templates */}
            <div className="bg-cyber-card border border-accent-primary/20 p-5 rounded-xs">
              <h3 className="text-[10px] font-orbitron font-bold text-accent-secondary uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Template Cepat
              </h3>
              <div className="space-y-2">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => {
                      setTestMessage(tpl.message);
                      setSendResult(null);
                    }}
                    className="w-full text-left px-3 py-2.5 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary/60 hover:bg-accent-primary/10 rounded-xs transition-all group"
                  >
                    <span className="block text-[10px] font-orbitron font-bold text-accent-primary uppercase tracking-wider group-hover:text-white transition-colors">
                      {tpl.label}
                    </span>
                    <span className="block text-[9px] text-cyber-muted font-mono mt-0.5 truncate">
                      {tpl.message.replace(/\*/g, "").replace(/\n/g, " ").substring(0, 65)}…
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live message preview */}
            {testMessage && (
              <div className="bg-cyber-card border border-[#25D366]/15 p-5 rounded-xs">
                <h3 className="text-[10px] font-orbitron font-bold text-[#25D366] uppercase tracking-widest mb-3">
                  Preview Pesan
                </h3>
                <div className="bg-[#075e54]/20 border border-[#25D366]/20 rounded-xs p-3 max-h-52 overflow-y-auto">
                  <div className="bg-[#25D366]/15 rounded-lg rounded-tl-none px-3 py-2 inline-block max-w-full">
                    <pre className="text-[10px] text-white/90 font-sans whitespace-pre-wrap break-words leading-relaxed">
                      {testMessage}
                    </pre>
                    <span className="text-[8px] text-[#25D366]/60 block text-right mt-1 font-mono">
                      {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} ✓✓
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 border border-accent-primary/15 bg-accent-primary/5 rounded-xs">
              <AlertCircle className="w-3.5 h-3.5 text-accent-primary shrink-0 mt-0.5" />
              <p className="text-[9px] text-cyber-muted font-mono leading-relaxed">
                Pesan test dikirim menggunakan token Fonnte yang sudah tersimpan.
                Pastikan WA Settings sudah disimpan dan koneksi sudah OK sebelum test.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
