import React, { useState } from "react";
import { LifeBuoy, ArrowLeft, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberButton } from "../../components/ui/CyberButton";

interface SupportTicketViewProps {
  onBack: () => void;
  storeName: string;
}

export const SupportTicketView: React.FC<SupportTicketViewProps> = ({ onBack, storeName }) => {
  const [buyerName, setBuyerName] = useState("");
  const [buyerWa, setBuyerWa] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successTicket, setSuccessTicket] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerWa: buyerWa.trim().replace(/[^0-9]/g, ""),
          subject: subject.trim(),
          message: message.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memproses tiket bantuan.");
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
                TIKET BANTUAN TERCATAT!
              </h2>
              <p className="text-[10px] text-cyber-muted font-mono tracking-widest uppercase">
                SUPPORT TICKETING ID // {successTicket.refCode}
              </p>
            </div>

            <div className="bg-[#0A0A0F] border border-cyber-muted/10 p-4 rounded-xs text-left text-xs space-y-2">
              <div>
                <span className="text-cyber-muted uppercase text-[9px] font-mono block">Subjek Bantuan:</span>
                <span className="font-bold text-white font-sans">{successTicket.subject}</span>
              </div>
              <div>
                <span className="text-cyber-muted uppercase text-[9px] font-mono block">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#00F5FF]/15 text-[#00F5FF] border border-[#00F5FF]/25">
                  {successTicket.status}
                </span>
              </div>
              <p className="text-cyber-muted text-[10px] italic mt-4 pt-2 border-t border-cyber-muted/10 leading-relaxed font-sans">
                Terima kasih atas laporan Anda. Staf support {storeName} akan segera menjawab tiket bantuan Anda langsung ke nomor WhatsApp yang terdaftar.
              </p>
            </div>

            <CyberButton onClick={onBack} variant="primary" size="md" className="w-full">
              KEMBALI KE HOME
            </CyberButton>
          </CyberCard>
        ) : (
          <CyberCard accent="primary" className="p-8 bg-cyber-card/90 text-left">
            <div className="flex items-center gap-3 border-b border-cyber-muted/20 pb-4 mb-6">
              <span className="w-11 h-11 bg-accent-primary/15 text-accent-primary border border-accent-primary/35 rounded-full flex items-center justify-center animate-pulse">
                <LifeBuoy className="w-5.5 h-5.5" />
              </span>
              <div>
                <h2 className="font-orbitron font-black text-lg text-white tracking-wider uppercase">
                  BANTUAN PELANGGAN //
                </h2>
                <p className="text-[9px] text-cyber-muted font-mono tracking-widest uppercase">
                  Kirim keluhan bantuan teknis / pertanyaan umum
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                    NAMA LENGKAP ANDA *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pemohon"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs"
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
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  SUBJEK PERTANYAAN / TOPIK *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Deposit saldo gagal, Kendala topup game"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  ISI DETAIL PESAN KELUHAN *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan secara rinci bantuan apa yang Anda butuhkan..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs"
                />
              </div>

              <div className="pt-2">
                <CyberButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold flex justify-center gap-2"
                  disabled={loading}
                >
                  <Send className="w-4 h-4 text-white" />
                  {loading ? "MEMROSES..." : "KIRIM TIKET BANTUAN"}
                </CyberButton>
              </div>
            </form>
          </CyberCard>
        )}
      </div>
    </div>
  );
};
