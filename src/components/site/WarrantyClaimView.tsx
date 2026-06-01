import React, { useState } from "react";
import { ShieldAlert, ArrowLeft, Send, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import { CyberCard } from "../ui/CyberCard";
import { CyberButton } from "../ui/CyberButton";

interface WarrantyClaimViewProps {
  onBack: () => void;
  storeName: string;
}

export const WarrantyClaimView: React.FC<WarrantyClaimViewProps> = ({ onBack, storeName }) => {
  const [refCode, setRefCode] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerWa, setBuyerWa] = useState("");
  const [problem, setProblem] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successTicket, setSuccessTicket] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/warranty/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refCode: refCode.trim().toUpperCase(),
          buyerName: buyerName.trim(),
          buyerWa: buyerWa.trim().replace(/[^0-9]/g, ""),
          problem: problem.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memproses klaim garansi.");
      }

      const json = await res.json();
      setSuccessTicket(json.ticket);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 relative overflow-hidden bg-cyber-bg my-8">
      <div className="absolute inset-0 grid-perspective opacity-5 pointer-events-none" />

      <div className="w-full max-w-lg relative pointer-events-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 font-orbitron text-xs tracking-widest text-accent-primary hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> KEMBALI KE BERANDA
        </button>

        {successTicket ? (
          <CyberCard accent="primary" className="p-8 bg-cyber-card/90 text-center space-y-6">
            <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/35 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="font-orbitron font-black text-xl text-white tracking-wider uppercase">
                KLAIM GARANSI TERKIRIM!
              </h2>
              <p className="text-[10px] text-cyber-muted font-mono tracking-widest uppercase">
                SISTEM TIKET GARANSI AKTIF // REF ID: {successTicket.refCode}
              </p>
            </div>

            <div className="bg-[#0A0A0F] border border-cyber-muted/10 p-4 rounded-xs text-left text-xs space-y-2">
              <div>
                <span className="text-cyber-muted uppercase text-[9px] font-mono block">Pemohon:</span>
                <span className="font-bold text-white">{successTicket.buyerName}</span>
              </div>
              <div>
                <span className="text-cyber-muted uppercase text-[9px] font-mono block">Status Tiket:</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-500/15 text-red-500 border border-red-500/25">
                  {successTicket.status}
                </span>
              </div>
              <p className="text-cyber-muted text-[10px] italic mt-4 pt-2 border-t border-cyber-muted/10 leading-relaxed font-sans">
                Admin {storeName} akan segera memverifikasi pesanan Anda dan membalas melalui WhatsApp. Harap pantau chat WhatsApp Anda.
              </p>
            </div>

            <CyberButton onClick={onBack} variant="primary" size="md" className="w-full">
              KEMBALI KE HOME
            </CyberButton>
          </CyberCard>
        ) : (
          <CyberCard accent="secondary" className="p-8 bg-cyber-card/90 text-left">
            <div className="flex items-center gap-3 border-b border-cyber-muted/20 pb-4 mb-6">
              <span className="w-11 h-11 bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/35 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-5.5 h-5.5" />
              </span>
              <div>
                <h2 className="font-orbitron font-black text-lg text-white tracking-wider uppercase">
                  PORTAL GARANSI //
                </h2>
                <p className="text-[9px] text-cyber-muted font-mono tracking-widest uppercase">
                  Ajukan klaim perbaikan / ganti akun premium
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/35 p-3 text-red-500 text-xs font-semibold mb-5 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  KODE REFERENSI TRANSAKSI pesanan (Wajib valid) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PILO-XXXXXX"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-secondary/20 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                    NAMA LENGKAP PEMBELI *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama sesuai saat checkout"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-secondary/20 focus:border-accent-secondary focus:outline-none text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                    NO WHATSAPP AKTIF *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08123456789"
                    value={buyerWa}
                    onChange={(e) => setBuyerWa(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-secondary/20 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  DESKRIPSI MASALAH / KENDALA AKUN *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan detail kendala (misal: Netflix terkena screen limit / password salah)..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-secondary/20 focus:border-accent-secondary focus:outline-none text-white text-xs"
                />
              </div>

              <div className="pt-2">
                <CyberButton
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full font-bold flex justify-center gap-2"
                  disabled={loading}
                >
                  <Send className="w-4 h-4 text-white" />
                  {loading ? "MEMROSES TIKET..." : "KIRIM KLAIM GARANSI"}
                </CyberButton>
              </div>
            </form>
          </CyberCard>
        )}
      </div>
    </div>
  );
};
