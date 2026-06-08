import React, { useState, useEffect } from "react";
import {
  ShoppingCart, DollarSign, Database, ClipboardList,
  ChevronRight, AlertTriangle, CreditCard, CheckCircle2,
  Clock, TrendingUp
} from "lucide-react";
import { formatPrice } from "../../lib/utils";

interface DashboardViewProps {
  token: string;
  onNavigateToView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ token, onNavigateToView }) => {
  const [stats, setStats] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [resStats, resPayment] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/payment/stats/today"),
      ]);
      if (!resStats.ok) throw new Error("Gagal mengambil data statistik");
      setStats(await resStats.json());
      if (resPayment.ok) setPaymentStats(await resPayment.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-xs text-cyber-muted uppercase">LOADING DATA HOST SYSTEM...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 font-bold mb-4">Error: {error}</p>
        <button onClick={fetchAll} className="px-4 py-2 bg-cyber-surface border border-accent-primary text-white text-xs cursor-pointer">RETRY</button>
      </div>
    );
  }

  // Order stats cards
  const orderCards = [
    {
      title: "PENDAPATAN MASUK",
      value: formatPrice(stats.totalEarning),
      icon: <DollarSign className="w-5 h-5 text-[#25D366]" />,
      desc: "Lunas / Terkirim",
      color: "border-[#25D366]/30 bg-[#25D366]/5 text-[#25D366]",
    },
    {
      title: "TOTAL TRANSAKSI",
      value: `${stats.totalOrders} Order`,
      icon: <ShoppingCart className="w-5 h-5 text-accent-primary" />,
      desc: "Semua status tercatat",
      color: "border-accent-primary/30 bg-accent-primary/5 text-accent-primary",
    },
    {
      title: "PENDING / CONFIRMED",
      value: `${stats.pendingOrders} / ${stats.confirmedOrders}`,
      icon: <ClipboardList className="w-5 h-5 text-accent-secondary" />,
      desc: "Menunggu / Terkonfirmasi",
      color: "border-accent-secondary/30 bg-accent-secondary/5 text-accent-secondary",
    },
    {
      title: "PRODUK AKTIF",
      value: `${stats.productsCount} Item`,
      icon: <Database className="w-5 h-5 text-yellow-400" />,
      desc: "Aktif di katalog sewa",
      color: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
    },
  ];

  // Payment stats cards (from Midtrans)
  const paymentCards = paymentStats
    ? [
        {
          title: "TRANSAKSI HARI INI",
          value: `${paymentStats.totalToday} Trx`,
          icon: <CreditCard className="w-5 h-5 text-blue-400" />,
          desc: "Via Midtrans",
          color: "border-blue-400/30 bg-blue-400/5 text-blue-400",
          onClick: () => onNavigateToView("orders"),
        },
        {
          title: "PEMBAYARAN BERHASIL",
          value: `${paymentStats.successToday} Trx`,
          icon: <CheckCircle2 className="w-5 h-5 text-[#25D366]" />,
          desc: "Settlement hari ini",
          color: "border-[#25D366]/30 bg-[#25D366]/5 text-[#25D366]",
          onClick: () => onNavigateToView("webhook_logs"),
        },
        {
          title: "PEMBAYARAN PENDING",
          value: `${paymentStats.pendingToday} Trx`,
          icon: <Clock className="w-5 h-5 text-yellow-400" />,
          desc: "Menunggu konfirmasi",
          color: "border-yellow-400/30 bg-yellow-400/5 text-yellow-400",
          onClick: () => onNavigateToView("webhook_logs"),
        },
        {
          title: "PENDAPATAN HARI INI",
          value: formatPrice(paymentStats.revenueToday),
          icon: <TrendingUp className="w-5 h-5 text-accent-secondary" />,
          desc: "Via Midtrans",
          color: "border-accent-secondary/30 bg-accent-secondary/5 text-accent-secondary",
          onClick: () => onNavigateToView("payment_settings"),
        },
      ]
    : [];

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Title */}
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // SYS_DASHBOARD CORE
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block">
          Tinjauan statistik transaksi penjualan instan dan monitoring pembayaran Midtrans
        </p>
      </div>

      {/* Payment Monitoring (Midtrans) */}
      {paymentCards.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-accent-primary" />
            <span className="font-orbitron font-bold text-xs text-accent-primary uppercase tracking-widest">
              // MIDTRANS PAYMENT MONITOR — HARI INI
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentCards.map((c) => (
              <div
                key={c.title}
                onClick={c.onClick}
                className={`border p-5 relative rounded-xs flex justify-between items-start cursor-pointer hover:brightness-110 transition-all ${c.color}`}
              >
                <span className="w-1 h-1 bg-current absolute top-0 left-0" />
                <span className="w-1 h-1 bg-current absolute bottom-0 right-0" />
                <div>
                  <span className="text-[9px] font-orbitron tracking-widest font-bold opacity-80 block">{c.title}</span>
                  <span className="text-xl font-orbitron font-black block mt-1.5 text-white">{c.value}</span>
                  <span className="text-[9px] font-mono tracking-widest block mt-1.5 font-semibold uppercase opacity-65">// {c.desc}</span>
                </div>
                <div className="p-2 border border-current bg-[#000]/15 shrink-0 rounded-xs">{c.icon}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-4 h-4 text-accent-secondary" />
          <span className="font-orbitron font-bold text-xs text-accent-secondary uppercase tracking-widest">
            // STATISTIK ORDER KESELURUHAN
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {orderCards.map((c) => (
            <div
              key={c.title}
              className={`border p-6 relative rounded-xs shadow-inner flex justify-between items-start ${c.color}`}
            >
              <span className="w-1 h-1 bg-current absolute top-0 left-0" />
              <span className="w-1 h-1 bg-current absolute bottom-0 right-0" />
              <div>
                <span className="text-[10px] font-orbitron tracking-widest font-bold opacity-80 block truncate">{c.title}</span>
                <span className="text-xl sm:text-2xl font-orbitron font-black block mt-2 text-white">{c.value}</span>
                <span className="text-[9px] font-mono tracking-widest block mt-2 font-semibold uppercase opacity-65">// {c.desc}</span>
              </div>
              <div className="p-2 border border-current bg-[#000]/15 shrink-0 rounded-xs">{c.icon}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Warning */}
      {stats.lowStockWarnings && stats.lowStockWarnings.length > 0 && (
        <div className="border border-red-500/30 bg-red-950/15 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h3 className="font-orbitron font-bold text-xs text-red-400 uppercase tracking-widest">
                PERINGATAN STOK AKUN MENIPIS ATAU KOSONG!
              </h3>
              <p className="text-xs text-cyber-muted font-sans mt-0.5">
                Terdapat {stats.lowStockWarnings.length} Paket dengan persediaan kurang dari 4 stok. Segera isi ulang!
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToView("stocks")}
            className="text-[10px] font-mono text-red-400 hover:text-white border border-red-500/40 px-3 py-1.5 hover:bg-red-500/10 transition-colors uppercase font-bold shrink-0 cursor-pointer"
          >
            ISI ULANG SEKARANG &gt;
          </button>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="border border-accent-primary/20 bg-[#0F0F1A] p-6 rounded-xs relative">
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent-primary" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent-secondary" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-accent-primary" />
            <span>// 10 ORDER TERBARU MASUK</span>
          </h2>
          <button
            onClick={() => onNavigateToView("orders")}
            className="text-[10px] font-mono text-accent-primary hover:text-white flex items-center gap-1 cursor-pointer hover:underline uppercase tracking-wider"
          >
            <span>Semua Order</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-accent-primary/10 text-cyber-muted font-orbitron uppercase tracking-widest text-[9px]">
                <th className="py-3 px-4 font-bold">REF CODE</th>
                <th className="py-3 px-4 font-bold">PEMBELI</th>
                <th className="py-3 px-4 font-bold">PRODUK</th>
                <th className="py-3 px-4 font-bold">PAKET</th>
                <th className="py-3 px-4 font-bold">HARGA</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-muted/5 font-sans">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-cyber-surface/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-accent-secondary select-all">{ord.refCode}</td>
                    <td className="py-3.5 px-4">
                      <span className="block font-semibold text-white">{ord.buyerName}</span>
                      <span className="block text-[10px] text-cyber-muted font-mono">{ord.buyerWa}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-accent-primary">{ord.productName}</td>
                    <td className="py-3.5 px-4 text-cyber-text truncate max-w-xs">{ord.packageName}</td>
                    <td className="py-3.5 px-4 font-orbitron font-bold text-white whitespace-nowrap">{formatPrice(ord.price)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 font-mono text-[9px] uppercase border inline-block rounded-xs font-bold ${
                        ord.status === "PENDING"
                          ? "border-yellow-500/40 text-yellow-500 bg-yellow-500/5 animate-pulse"
                          : ord.status === "CONFIRMED"
                          ? "border-accent-secondary/40 text-accent-secondary bg-accent-secondary/5"
                          : ord.status === "SENT"
                          ? "border-[#25D366]/40 text-[#25D366] bg-[#25D366]/5"
                          : "border-red-500/40 text-red-500 bg-red-500/5"
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-cyber-muted italic font-mono">
                    Belum ada transaksi terekam dalam sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
