import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart, Search, PhoneCall, Trash2, CheckCircle2, Send,
  Ban, Copy, Check, RefreshCw, Key, AlertTriangle, Eye, EyeOff,
  MessageSquare, ClipboardCopy, Clock, Download
} from "lucide-react";
import { formatPrice } from "../../lib/utils";

interface OrdersViewProps {
  token: string;
}

type OrderStatus = "ALL" | "PENDING" | "CONFIRMED" | "SENT" | "CANCELED";

export const OrdersView: React.FC<OrdersViewProps> = ({ token }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("ALL");

  // Per-order actions
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [showCredentials, setShowCredentials] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil daftar pesanan");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memperbarui status order");
      }
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!await window.confirm("Hapus data order ini secara permanen? Tindakan TIDAK BISA dibatalkan.")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus order");
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const copyWaTemplate = async (orderId: string) => {
    try {
      setLoadingTemplate(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}/copy-template`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil template WA");
      const data = await res.json();
      copyToClipboard(data.templateText, orderId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingTemplate(null);
    }
  };

  const buildWaContactLink = (buyerWa: string, buyerName: string) => {
    let clean = buyerWa.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "62" + clean.slice(1);
    const text = `Halo Kak ${buyerName}, saya Admin PILONEKO. Berikut update mengenai pesanan Anda:`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  const toggleExpandNote = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleShowCredentials = (id: string) => {
    setShowCredentials((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Filter application helper
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.refCode?.toLowerCase().includes(q) ||
      o.buyerName?.toLowerCase().includes(q) ||
      o.buyerWa?.toLowerCase().includes(q) ||
      o.productName?.toLowerCase().includes(q) ||
      o.packageName?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    SENT: orders.filter((o) => o.status === "SENT").length,
    CANCELED: orders.filter((o) => o.status === "CANCELED").length,
  };

  const statusStyles: Record<string, string> = {
    PENDING: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
    CONFIRMED: "border-accent-secondary/50 text-accent-secondary bg-accent-secondary/8",
    SENT: "border-[#25D366]/40 text-[#25D366] bg-[#25D366]/8",
    CANCELED: "border-red-500/40 text-red-400 bg-red-500/8",
  };

  const statusBorderMap: Record<string, string> = {
    PENDING: "border-yellow-500/20 shadow-[inset_3px_0_0_#eab308]",
    CONFIRMED: "border-accent-secondary/30 shadow-[inset_3px_0_0_#BF00FF]",
    SENT: "border-[#25D366]/30 shadow-[inset_3px_0_0_#25D366]",
    CANCELED: "border-red-500/20 shadow-[inset_3px_0_0_#ef4444]",
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      alert("Tidak ada data order untuk diexport.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Pesanan,Tanggal,Nama Pembeli,WhatsApp,Produk,Paket,Harga,Status\n";
    
    orders.forEach((o) => {
      const date = new Date(o.createdAt).toLocaleString('id-ID');
      const buyer = o.buyerName ? o.buyerName.replace(/,/g, " ") : "";
      const prodName = o.productName ? o.productName.replace(/,/g, " ") : "";
      const pkgName = o.packageName ? o.packageName.replace(/,/g, " ") : "";
      csvContent += `${o.refCode},${date},${buyer},${o.buyerWa},${prodName},${pkgName},${o.amount},${o.status}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_transaksi_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
            // STATUS CRM ORDERS
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block">
            Kelola transaksi masuk, validasi konfirmasi BCA/QRIS, dan kirim kredensial premium via WA
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-cyber-card text-cyber-muted border border-cyber-muted/30 hover:bg-cyber-surface hover:text-white transition-all text-xs font-orbitron font-bold tracking-widest cursor-pointer flex items-center justify-center gap-1.5 rounded-xs"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">EXPORT CSV</span>
          </button>
          <button
            onClick={fetchOrders}
            className="p-2 bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white transition-all rounded-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Status Quick Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "CONFIRMED", "SENT", "CANCELED"] as OrderStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs border transition-all cursor-pointer ${
              statusFilter === s
                ? "bg-accent-primary text-black border-accent-primary"
                : "border-cyber-muted/20 text-cyber-muted hover:border-accent-primary/40 hover:text-white"
            }`}
          >
            {s} ({statusCounts[s === "CANCELED" ? "CANCELED" : s]})
          </button>
        ))}
      </div>

      {/* Search Row */}
      <div className="relative">
        <Search className="w-4 h-4 text-cyber-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari Ref Code, Pembeli, Nomor WA, nama produk, atau paket..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-cyber-card border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-xs font-sans placeholder-cyber-muted rounded-xs transition-colors"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/15 border border-red-500/30 text-red-400 text-xs font-mono">
          <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center border border-dashed border-accent-primary/10 bg-cyber-card/10 rounded-xs">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-[10px] text-cyber-muted uppercase">SYNCHRONIZING REDIRECT NODES...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const hasStock = !!ord.accountStock;
            const showCreds = showCredentials.has(ord.id);

            return (
              <div
                key={ord.id}
                className={`border p-5 rounded-xs bg-cyber-card relative transition-all duration-300 ${
                  statusBorderMap[ord.status] || "border-cyber-muted/20"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-cyber-muted/10 mb-4 text-xs font-mono">
                  <div>
                    <span className="text-cyber-muted uppercase font-bold tracking-widest text-[9px] block">
                      // REF CODE / SYSTEM SIGNATURE
                    </span>
                    <span className="text-white font-bold text-base tracking-wider select-all font-orbitron">
                      {ord.refCode}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {ord.status === "PENDING" && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, "CONFIRMED")}
                        className="px-2.5 py-1 text-[10px] bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/30 hover:bg-accent-secondary/20 transition-all rounded-xs font-semibold cursor-pointer flex items-center gap-1 uppercase"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Konfirmasi Bayar
                      </button>
                    )}

                    {ord.status === "CONFIRMED" && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, "SENT")}
                        className="px-2.5 py-1 text-[10px] bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all rounded-xs font-semibold cursor-pointer flex items-center gap-1 uppercase"
                      >
                        <Send className="w-3 h-3" /> Tandai Terkirim
                      </button>
                    )}

                    {/* Copy WA Template */}
                    {(ord.status === "CONFIRMED" || ord.status === "SENT") && (
                      <button
                        onClick={() => copyWaTemplate(ord.id)}
                        disabled={loadingTemplate === ord.id}
                        className="px-2.5 py-1 text-[10px] bg-accent-primary/10 text-accent-primary border border-accent-primary/30 hover:bg-accent-primary/20 transition-all rounded-xs font-semibold cursor-pointer flex items-center gap-1 uppercase"
                      >
                        {copiedOrderId === ord.id ? (
                          <><Check className="w-3 h-3 text-[#25D366]" /> Tersalin!</>
                        ) : (
                          <><MessageSquare className="w-3 h-3" /> Copy Pesan WA</>
                        )}
                      </button>
                    )}

                    {/* Contact Buyer via WA */}
                    <a
                      href={buildWaContactLink(ord.buyerWa, ord.buyerName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[10px] bg-[#25D366]/5 text-[#25D366] border border-[#25D366]/25 hover:bg-[#25D366]/15 transition-all rounded-xs font-semibold flex items-center gap-1 uppercase"
                    >
                      <PhoneCall className="w-3 h-3" /> Hubungi WA
                    </a>

                    {/* Cancel */}
                    {ord.status !== "CANCELED" && ord.status !== "SENT" && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, "CANCELED")}
                        className="px-2.5 py-1 text-[10px] bg-red-950/15 text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-all rounded-xs font-semibold cursor-pointer flex items-center gap-1 uppercase"
                      >
                        <Ban className="w-3 h-3" /> Batalkan
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => deleteOrder(ord.id)}
                      className="p-1 px-1.5 text-[10px] text-red-400 hover:text-white bg-red-950/5 border border-red-500/20 hover:border-red-500 hover:bg-red-900/30 transition-colors rounded-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-sans">
                  {/* Buyer Info */}
                  <div className="md:col-span-4 space-y-1">
                    <span className="block text-[9px] font-mono text-cyber-muted uppercase tracking-wider">DATA BUYER</span>
                    <p className="text-white font-bold text-sm font-orbitron">{ord.buyerName}</p>
                    <p className="font-mono text-accent-primary select-all">{ord.buyerWa}</p>
                    <p className="text-cyber-muted text-[10px] font-mono mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ord.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>

                  {/* Product Info */}
                  <div className="md:col-span-5 space-y-1">
                    <span className="block text-[9px] font-mono text-cyber-muted uppercase tracking-wider">PRODUK PESANAN</span>
                    <p className="text-white font-bold text-sm">{ord.productName}</p>
                    <p className="text-cyber-text text-xs">
                      Paket: <span className="text-accent-secondary font-semibold font-mono">{ord.packageName}</span>
                    </p>
                  </div>

                  {/* Billing Summary */}
                  <div className="md:col-span-3 text-left md:text-right shrink-0">
                    <span className="block text-[9px] font-mono text-cyber-muted uppercase tracking-wider">BILLING</span>
                    <p className="text-accent-secondary font-orbitron font-extrabold text-lg">{formatPrice(ord.price)}</p>
                    <div className="mt-1.5">
                      <span
                        className={`px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase border inline-block rounded-xs font-bold ${
                          statusStyles[ord.status] || "border-cyber-muted/30 text-cyber-muted"
                        } ${ord.status === "PENDING" ? "animate-pulse" : ""}`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Note */}
                {ord.adminNote && (
                  <div className="mt-4 pt-3 border-t border-cyber-muted/10">
                    <button
                      onClick={() => toggleExpandNote(ord.id)}
                      className="text-[10px] font-mono text-cyber-muted hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      {expandedNotes.has(ord.id) ? "Sembunyikan" : "Lihat"} Admin Note
                    </button>
                    {expandedNotes.has(ord.id) && (
                      <div className="mt-2 text-[11px] font-mono text-cyber-muted/80 bg-cyber-bg/60 border border-cyber-muted/10 px-3 py-2 rounded-xs leading-relaxed">
                        {ord.adminNote}
                      </div>
                    )}
                  </div>
                )}

                {/* Allocated Credentials Panel */}
                {hasStock && (
                  <div className="mt-4 pt-3.5 border-t border-accent-primary/15 bg-accent-primary/5 border border-accent-primary/20 p-4 rounded-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-orbitron font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" /> AKUN DIALOKASIKAN
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleShowCredentials(ord.id)}
                          className="text-[10px] font-mono text-cyber-muted hover:text-accent-primary flex items-center gap-1 cursor-pointer border border-cyber-muted/20 px-2 py-0.5 rounded-xs"
                        >
                          {showCreds ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showCreds ? "Sembunyikan" : "Tampilkan"}
                        </button>
                        <button
                          onClick={() => copyToClipboard(
                            `Email: ${ord.accountStock.emailAkun}\nPassword: ${ord.accountStock.passwordAkun}${ord.accountStock.infoTambahan ? "\nInfo: " + ord.accountStock.infoTambahan : ""}`,
                            ord.id + "_creds"
                          )}
                          className="text-[10px] font-mono text-accent-primary border border-accent-primary/30 px-2 py-0.5 rounded-xs hover:bg-accent-primary/10 cursor-pointer flex items-center gap-1"
                        >
                          {copiedOrderId === ord.id + "_creds" ? (
                            <><Check className="w-3 h-3 text-[#25D366]" /> Tersalin</>
                          ) : (
                            <><ClipboardCopy className="w-3 h-3" /> Copy</>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-cyber-muted text-[9px] uppercase block">Email / Username</span>
                        <span className={`text-white font-bold select-all ${!showCreds ? "blur-sm" : ""} transition-all`}>
                          {ord.accountStock.emailAkun}
                        </span>
                      </div>
                      <div>
                        <span className="text-cyber-muted text-[9px] uppercase block">Password</span>
                        <span className={`text-white font-bold select-all ${!showCreds ? "blur-sm" : ""} transition-all`}>
                          {ord.accountStock.passwordAkun}
                        </span>
                      </div>
                      {ord.accountStock.infoTambahan && (
                        <div className="sm:col-span-2">
                          <span className="text-cyber-muted text-[9px] uppercase block">Info Tambahan</span>
                          <span className="text-accent-secondary font-bold">{ord.accountStock.infoTambahan}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-accent-primary/15 bg-cyber-card/10 rounded-xs">
          <ShoppingCart className="w-12 h-12 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-orbitron font-semibold text-base text-white uppercase">SISTEM DATA KOSONG</h3>
          <p className="text-xs text-cyber-muted font-sans mt-0.5">
            Tidak ada transaksi order dengan kriteria filter aktif saat ini.
          </p>
        </div>
      )}
    </div>
  );
};
