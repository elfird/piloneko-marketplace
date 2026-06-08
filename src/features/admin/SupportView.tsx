import React, { useState, useEffect } from "react";
import { 
  LifeBuoy, 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronDown,
  User,
  Phone,
  HelpCircle
} from "lucide-react";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberButton } from "../../components/ui/CyberButton";
import { SupportTicket } from "../../types";

interface SupportViewProps {
  token: string;
}

export const SupportView: React.FC<SupportViewProps> = ({ token }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Reply states
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [status, setStatus] = useState<"OPEN" | "REPLIED" | "CLOSED">("REPLIED");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/support", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengambil tiket bantuan");
      const list = await res.json();
      setTickets(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReply = (t: SupportTicket) => {
    setReplyingId(t.id);
    setAdminReply(t.adminReply || "");
    setStatus(t.status);
    setSubmitError("");
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingId) return;

    try {
      setSubmitting(true);
      setSubmitError("");
      const res = await fetch(`/api/admin/support/${replyingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminReply })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal mengirim balasan bantuan");
      }

      setReplyingId(null);
      fetchTickets();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "OPEN":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "REPLIED":
        return "bg-accent-primary/10 text-accent-primary border-accent-primary/20";
      case "CLOSED":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-cyber-surface text-white border-cyber-muted";
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.refCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && t.status === filterStatus;
  });

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-accent-primary animate-pulse" />
            SUPPORT HELP TICKETS //
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
            Kelola, respon, dan saring saluran bantuan, pertanyaan umum, dan keluhan kendala transaksi buyer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          <CyberCard accent="primary" className="p-5 bg-cyber-card/80">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-cyber-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari tiket bantuan, nama pembeli, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0A0A0F] border border-cyber-muted/30 focus:border-accent-primary focus:outline-none text-xs text-white placeholder-cyber-muted/60"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-[#0A0A0F] border border-cyber-muted/30 text-xs text-white focus:outline-none focus:border-accent-primary font-mono uppercase"
              >
                <option value="ALL">SEMUA STATUS</option>
                <option value="OPEN">BARU [OPEN]</option>
                <option value="REPLIED">TERBALAS</option>
                <option value="CLOSED">SELESAI [CLOSED]</option>
              </select>

              <button
                onClick={fetchTickets}
                className="p-2 bg-cyber-surface/60 border border-cyber-muted/20 text-cyber-muted hover:text-white transition-colors cursor-pointer"
                title="Refresh Tiket"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-mono text-[10px] text-cyber-muted uppercase">LOADING SUPPORT REGISTRY...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-cyber-muted/20 font-mono text-xs text-cyber-muted uppercase">
                [TIDAK ADA DATA TIKET BANTUAN TERCATAT]
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredTickets.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => handleOpenReply(t)}
                    className={`p-4 border text-left cursor-pointer transition-all duration-200 ${
                      replyingId === t.id 
                        ? "bg-accent-primary/5 border-accent-primary shadow-[0_0_10px_rgba(0,245,255,0.1)]" 
                        : "bg-[#0A0A0F] border-cyber-muted/20 hover:border-cyber-muted/40 hover:bg-cyber-surface/30"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-cyber-muted/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-accent-primary uppercase tracking-widest">{t.refCode}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border font-bold ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-cyber-muted">
                        {new Date(t.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="text-xs text-white font-bold mb-2 tracking-wide font-sans">
                      {t.subject}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                      <div className="flex items-center gap-1.5 text-white">
                        <User className="w-3.5 h-3.5 text-cyber-muted shrink-0" />
                        <span className="font-bold">{t.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-cyber-muted font-mono">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.buyerWa}</span>
                      </div>
                    </div>

                    <div className="bg-cyber-surface/40 p-2.5 border border-cyber-muted/10 text-xs text-gray-300 rounded-xs mb-2">
                      <div className="text-[9px] text-cyber-muted font-mono uppercase tracking-widest mb-1">// PERTANYAAN/PESAN:</div>
                      <p className="line-clamp-2 italic font-sans">{t.message}</p>
                    </div>

                    {t.adminReply && (
                      <div className="bg-accent-primary/5 p-2.5 border border-accent-primary/10 text-xs text-accent-primary/80 rounded-xs">
                        <div className="text-[9px] text-cyber-muted font-mono uppercase tracking-widest mb-1">// RESPONSE LOG:</div>
                        <p className="line-clamp-1 italic">{t.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CyberCard>
        </div>

        {/* Right Column: Ticket reply detail form */}
        <div>
          {replyingId ? (
            (() => {
              const ticket = tickets.find(t => t.id === replyingId);
              if (!ticket) return null;
              return (
                <CyberCard accent="secondary" className="p-5 bg-cyber-card/90 space-y-4 sticky top-6">
                  <div className="border-b border-cyber-muted/20 pb-3">
                    <span className="text-[8px] text-cyber-muted font-mono tracking-widest uppercase block">// PANEL MODERASI BANTUAN</span>
                    <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase truncate">
                      BALAS TIKET {ticket.refCode}
                    </h3>
                  </div>

                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/30 p-2 text-red-500 text-xs font-semibold">
                      {submitError}
                    </div>
                  )}

                  <div className="text-xs space-y-2 text-left bg-cyber-bg p-3 border border-cyber-muted/10">
                    <div>
                      <span className="text-cyber-muted uppercase text-[9px] font-mono block">Pembuat Tiket:</span>
                      <span className="font-bold text-white font-sans">{ticket.buyerName}</span>
                    </div>
                    <div>
                      <span className="text-cyber-muted uppercase text-[9px] font-mono block">Whatsapp Number:</span>
                      <a href={`https://wa.me/${ticket.buyerWa}`} target="_blank" rel="noreferrer" className="text-accent-primary font-mono hover:underline">
                        +{ticket.buyerWa}
                      </a>
                    </div>
                    <div>
                      <span className="text-cyber-muted uppercase text-[9px] font-mono block">Topik / Subjek Pertanyaan:</span>
                      <span className="font-bold text-white block mt-0.5">{ticket.subject}</span>
                    </div>
                    <div>
                      <span className="text-cyber-muted uppercase text-[9px] font-mono block">Isi Pesan Pertanyaan:</span>
                      <p className="text-gray-300 italic font-sans mt-0.5 leading-relaxed bg-[#0A0A0F] p-2 border border-cyber-muted/10 whitespace-pre-wrap">
                        "{ticket.message}"
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitReply} className="space-y-4">
                    <div>
                      <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                        UPDATE TIPE STATUS TIKET *
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-cyber-bg border border-accent-secondary/20 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono"
                      >
                        <option value="OPEN">BARU [OPEN]</option>
                        <option value="REPLIED">REPLIED [DIBALAS]</option>
                        <option value="CLOSED">CLOSED [SELESAI - DITUTUP]</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                        RESPON / JAWABAN ADMINISTRATOR
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Ketik detail tanggapan untuk dikirim kembali..."
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        className="w-full px-3 py-2 bg-cyber-bg border border-accent-secondary/20 focus:border-accent-secondary focus:outline-none text-white text-xs font-sans leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 border-t border-cyber-muted/15 flex justify-end gap-2.5">
                      <CyberButton type="button" onClick={() => setReplyingId(null)} variant="secondary" size="sm">
                        BATALKAN
                      </CyberButton>
                      <CyberButton type="submit" variant="primary" size="sm" disabled={submitting}>
                        {submitting ? "MENGIRIM..." : "KIRIM BALASAN"}
                      </CyberButton>
                    </div>
                  </form>
                </CyberCard>
              );
            })()
          ) : (
            <div className="bg-[#0A0A0F] border border-cyber-muted/10 p-8 text-center text-cyber-muted font-mono text-xs uppercase h-full flex items-center justify-center min-h-[300px]">
              [PILIH SATU TIKET PERTANYAAN DI SEBELAH KIRI UNTUK MEMBACA DAN MEMBERI BALASAN]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
