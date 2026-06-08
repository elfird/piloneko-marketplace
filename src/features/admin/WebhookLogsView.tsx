import React, { useState, useEffect } from "react";
import {
  Webhook, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  CreditCard, Filter, Trash2
} from "lucide-react";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberButton } from "../../components/ui/CyberButton";

interface WebhookLogsViewProps {
  token: string;
}

const STATUS_CONFIGS: Record<string, { color: string; label: string }> = {
  settlement: { color: "text-[#25D366] border-[#25D366]/40 bg-[#25D366]/5", label: "SETTLEMENT" },
  capture:    { color: "text-[#25D366] border-[#25D366]/40 bg-[#25D366]/5", label: "CAPTURE" },
  pending:    { color: "text-yellow-400 border-yellow-400/40 bg-yellow-400/5", label: "PENDING" },
  expire:     { color: "text-red-400 border-red-400/40 bg-red-400/5", label: "EXPIRE" },
  cancel:     { color: "text-red-400 border-red-400/40 bg-red-400/5", label: "CANCEL" },
  deny:       { color: "text-red-400 border-red-400/40 bg-red-400/5", label: "DENY" },
  challenge:  { color: "text-orange-400 border-orange-400/40 bg-orange-400/5", label: "CHALLENGE" },
  unknown:    { color: "text-cyber-muted border-cyber-muted/20 bg-cyber-surface/30", label: "UNKNOWN" },
};

export const WebhookLogsView: React.FC<WebhookLogsViewProps> = ({ token }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cleanupMsg, setCleanupMsg] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [page, filterStatus]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(filterStatus !== "all" ? { status: filterStatus } : {}),
      });
      const res = await fetch(`/api/admin/webhook-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      const res = await fetch("/api/admin/webhook-logs/cleanup", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCleanupMsg(`✅ ${data.deleted} log lama berhasil dihapus`);
      fetchLogs();
      setTimeout(() => setCleanupMsg(""), 4000);
    } catch {
      setCleanupMsg("❌ Gagal cleanup");
    }
  };

  const getStatusCfg = (status: string) =>
    STATUS_CONFIGS[status] || STATUS_CONFIGS["unknown"];

  const formatPaymentType = (type: string) => {
    const map: Record<string, string> = {
      bank_transfer: "Bank Transfer",
      credit_card: "Kartu Kredit",
      gopay: "GoPay",
      shopeepay: "ShopeePay",
      qris: "QRIS",
      dana: "DANA",
      bca_va: "BCA VA",
      bni_va: "BNI VA",
      bri_va: "BRI VA",
      mandiri_bill: "Mandiri",
    };
    return map[type] || type?.toUpperCase() || "-";
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <Webhook className="w-6 h-6 text-accent-primary" />
            LOG WEBHOOK MIDTRANS
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest mt-1">
            Arsip notifikasi pembayaran dari Midtrans · Total: {total} log
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2 border border-cyber-muted/20 text-cyber-muted hover:text-white transition-colors cursor-pointer rounded-xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <CyberButton onClick={handleCleanup} variant="secondary" size="sm" className="text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Hapus Log &gt;30 Hari
          </CyberButton>
        </div>
      </div>

      {cleanupMsg && (
        <div className="p-3 text-xs font-mono border border-[#25D366]/30 bg-[#25D366]/5 text-[#25D366]">
          {cleanupMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-cyber-muted/20 pb-0">
        {["all", "settlement", "capture", "pending", "expire", "cancel", "deny"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-2 font-orbitron text-[9px] uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
              filterStatus === s
                ? "border-accent-primary text-accent-primary"
                : "border-transparent text-cyber-muted hover:text-white"
            }`}
          >
            {s === "all" ? "SEMUA" : s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Log Table */}
      <CyberCard accent="primary" className="p-0 bg-cyber-card/85 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-[10px] text-cyber-muted uppercase">LOADING WEBHOOK LOGS...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <Webhook className="w-10 h-10 text-cyber-muted/30 mx-auto mb-4" />
            <p className="font-mono text-xs text-cyber-muted uppercase">[BELUM ADA LOG WEBHOOK TERCATAT]</p>
          </div>
        ) : (
          <div className="divide-y divide-cyber-muted/10">
            {logs.map((log) => {
              const sc = getStatusCfg(log.transactionStatus);
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="group">
                  <div
                    className="flex flex-wrap items-center gap-3 p-4 hover:bg-cyber-surface/20 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    {/* Signature Valid indicator */}
                    <span title={log.signatureValid ? "Signature Valid" : "Signature Invalid"}>
                      {log.signatureValid
                        ? <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                        : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    </span>

                    {/* Order ID */}
                    <span className="font-mono font-bold text-xs text-accent-secondary select-all min-w-0 truncate">
                      {log.orderId}
                    </span>

                    {/* Status badge */}
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border rounded-xs shrink-0 ${sc.color}`}>
                      {sc.label}
                    </span>

                    {/* Payment type */}
                    <span className="flex items-center gap-1 text-[10px] text-cyber-muted font-mono shrink-0">
                      <CreditCard className="w-3 h-3" />
                      {formatPaymentType(log.paymentType)}
                    </span>

                    {/* Amount */}
                    <span className="font-orbitron font-bold text-xs text-white shrink-0">
                      Rp{Number(log.grossAmount).toLocaleString("id-ID")}
                    </span>

                    {/* Time */}
                    <span className="flex items-center gap-1 text-[9px] text-cyber-muted font-mono ml-auto shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </span>

                    {/* Expand toggle */}
                    <span className="text-cyber-muted shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>

                  {/* Expanded Raw Payload */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-cyber-bg/50">
                      {!log.signatureValid && (
                        <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 mb-2 p-2 border border-orange-400/20 bg-orange-400/5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>⚠️ Signature tidak valid — kemungkinan webhook palsu atau konfigurasi server key salah</span>
                        </div>
                      )}
                      <div className="text-[10px] font-mono text-cyber-muted mb-2 uppercase tracking-widest">RAW PAYLOAD:</div>
                      <pre className="bg-[#0A0A0F] border border-cyber-muted/15 p-3 text-[10px] font-mono text-green-400/80 overflow-x-auto rounded-xs whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(log.rawPayload || "{}"), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CyberCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between font-mono text-xs text-cyber-muted">
          <span>Halaman {page} dari {totalPages} · {total} total log</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 border border-cyber-muted/20 hover:border-accent-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ← PREV
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 border border-cyber-muted/20 hover:border-accent-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
