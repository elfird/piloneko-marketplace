import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Activity, 
  Award, 
  Layers, 
  Download, 
  Calendar,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { formatPrice } from "../../lib/utils";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberButton } from "../../components/ui/CyberButton";

interface AnalyticsViewProps {
  token: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ token }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState<"earnings" | "count">("earnings");

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      // Ambil token dari localStorage sebagai fallback jika prop kosong
      const effectiveToken = token || localStorage.getItem("token") || "";
      if (!effectiveToken) {
        setError("Token admin tidak ditemukan. Silakan login ulang.");
        return;
      }
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${effectiveToken}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Safe Export to CSV helper
  const handleExportCSV = () => {
    if (!data) return;
    
    // Prepare daily sales rows
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tanggal,Jumlah Order Sukses,Pendapatan Terbayar\n";
    
    data.dailySales.forEach((row: any) => {
      csvContent += `${row.date},${row.count},${row.earnings}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_penjualan_piloneko_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-xs text-cyber-muted uppercase">GENERATING DATA ANALYTICS GRAPH...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center max-w-sm mx-auto">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
        <p className="text-red-400 font-bold mb-4">Error: {error}</p>
        <CyberButton onClick={fetchAnalytics} variant="primary">RETRY CONNECTION</CyberButton>
      </div>
    );
  }

  // Calculate SVG Chart metrics
  const sales = data.dailySales || [];
  const maxEarnings = sales.length > 0 ? Math.max(...sales.map((s: any) => s.earnings), 100000) : 100000;
  const maxCount = sales.length > 0 ? Math.max(...sales.map((s: any) => s.count), 5) : 5;

  const chartHeight = 220;
  const chartWidth = 600;
  const padding = 40;

  // Render SVG path nodes for trend graph
  const getPoints = () => {
    if (sales.length === 0) return "";
    const points: string[] = [];
    sales.forEach((s: any, idx: number) => {
      const x = padding + (idx * (chartWidth - padding * 2)) / Math.max(sales.length - 1, 1);
      const val = chartType === "earnings" ? s.earnings : s.count;
      const maxVal = chartType === "earnings" ? maxEarnings : maxCount;
      const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / maxVal;
      points.push(`${x},${y}`);
    });
    return points.join(" ");
  };

  return (
    <div className="space-y-6 text-left font-sans print:bg-white print:text-black">
      {/* Title Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent-primary animate-pulse" />
            ANALYTICS CENTRAL //
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
            Visualisasi performa bisnis, penjualan terlaris, dan segmentasi kategori
          </p>
        </div>
        <div className="flex gap-2">
          <CyberButton onClick={handleExportCSV} variant="secondary" size="sm" className="flex items-center gap-1.5 font-mono text-[10px]">
            <Download className="w-3.5 h-3.5" /> EXPORT CSV
          </CyberButton>
          <CyberButton onClick={handlePrintPDF} variant="primary" size="sm" className="flex items-center gap-1.5 font-mono text-[10px]">
            <Calendar className="w-3.5 h-3.5" /> PRINT PDF
          </CyberButton>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CyberCard accent="primary" className="p-5 bg-cyber-card/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyber-muted tracking-widest font-mono uppercase">OMSET PENJUALAN</span>
            <span className="p-1.5 bg-accent-primary/10 text-accent-primary rounded-xs border border-accent-primary/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="block text-2xl font-black text-white font-mono tracking-tight leading-none">
              {formatPrice(data.totalEarning)}
            </span>
            <span className="text-[9px] text-[#25D366] font-mono tracking-widest mt-1 block uppercase">
              // SLA LUNAS TERVERIFIKASI
            </span>
          </div>
        </CyberCard>

        <CyberCard accent="secondary" className="p-5 bg-cyber-card/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyber-muted tracking-widest font-mono uppercase">TOTAL TRANSAKSI</span>
            <span className="p-1.5 bg-accent-secondary/10 text-accent-secondary rounded-xs border border-accent-secondary/20">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="block text-2xl font-black text-white font-mono tracking-tight leading-none">
              {data.totalOrders} <span className="text-xs text-cyber-muted font-normal">Order</span>
            </span>
            <span className="text-[9px] text-accent-secondary font-mono tracking-widest mt-1 block uppercase">
              {data.successOrders} Sukses / {data.pendingOrders} Pending
            </span>
          </div>
        </CyberCard>

        <CyberCard accent="primary" className="p-5 bg-cyber-card/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyber-muted tracking-widest font-mono uppercase">CONVERSION RATE</span>
            <span className="p-1.5 bg-accent-primary/10 text-accent-primary rounded-xs border border-accent-primary/20">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="block text-2xl font-black text-white font-mono tracking-tight leading-none">
              {data.totalOrders > 0 ? ((data.successOrders / data.totalOrders) * 100).toFixed(1) : 0}%
            </span>
            <span className="text-[9px] text-accent-primary font-mono tracking-widest mt-1 block uppercase">
              // PAYMENT COMPLETION RATIO
            </span>
          </div>
        </CyberCard>

        <CyberCard accent="secondary" className="p-5 bg-cyber-card/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyber-muted tracking-widest font-mono uppercase">RATA-RATA TIKET</span>
            <span className="p-1.5 bg-accent-secondary/10 text-accent-secondary rounded-xs border border-accent-secondary/20">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="block text-2xl font-black text-white font-mono tracking-tight leading-none">
              {formatPrice(data.successOrders > 0 ? data.totalEarning / data.successOrders : 0)}
            </span>
            <span className="text-[9px] text-cyber-muted font-mono tracking-widest mt-1 block uppercase">
              AVERAGE BASKET SIZE
            </span>
          </div>
        </CyberCard>
      </div>

      {/* SVG Neon Sales Chart */}
      <CyberCard accent="primary" className="p-6 bg-cyber-card/80 print:shadow-none print:border-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase">
              // TREN HISTORI PENJUALAN HARIAN
            </h3>
            <p className="text-[9px] text-cyber-muted font-mono uppercase">
              Data transaksi dalam sirkulasi 30 hari terakhir
            </p>
          </div>
          <div className="flex bg-[#0A0A0F] border border-cyber-muted/20 rounded-xs p-0.5 print:hidden">
            <button
              onClick={() => setChartType("earnings")}
              className={`px-3 py-1 text-[9px] font-mono tracking-widest uppercase transition-all duration-200 ${
                chartType === "earnings"
                  ? "bg-accent-primary text-black font-bold"
                  : "text-cyber-muted hover:text-white"
              }`}
            >
              OMSET (IDR)
            </button>
            <button
              onClick={() => setChartType("count")}
              className={`px-3 py-1 text-[9px] font-mono tracking-widest uppercase transition-all duration-200 ${
                chartType === "count"
                  ? "bg-accent-primary text-black font-bold"
                  : "text-cyber-muted hover:text-white"
              }`}
            >
              QTY ORDER
            </button>
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center border border-dashed border-cyber-muted/20 font-mono text-xs text-cyber-muted uppercase">
            [BELUM ADA DATA TRANSAKSI TERCATAT UNTUK DITAMPILKAN]
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-none">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[500px] h-[220px]">
              {/* Grids */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = padding + (i * (chartHeight - padding * 2)) / 4;
                const val = chartType === "earnings" 
                  ? maxEarnings - (i * maxEarnings) / 4 
                  : maxCount - (i * maxCount) / 4;
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                    />
                    <text
                      x={padding - 5}
                      y={y + 3}
                      fill="rgba(255, 255, 255, 0.3)"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {chartType === "earnings" ? `Rp ${Math.round(val / 1000)}k` : Math.round(val)}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Date labels */}
              {sales.map((s: any, idx: number) => {
                if (sales.length > 8 && idx % Math.ceil(sales.length / 8) !== 0) return null;
                const x = padding + (idx * (chartWidth - padding * 2)) / Math.max(sales.length - 1, 1);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={chartHeight - 12}
                    fill="rgba(255, 255, 255, 0.4)"
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {s.date.slice(5)}
                  </text>
                );
              })}

              {/* Glowing trend lines */}
              <polyline
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="2.5"
                points={getPoints()}
                className="filter drop-shadow-[0_0_4px_var(--accent-primary)]"
              />

              {/* Data points */}
              {sales.map((s: any, idx: number) => {
                const x = padding + (idx * (chartWidth - padding * 2)) / Math.max(sales.length - 1, 1);
                const val = chartType === "earnings" ? s.earnings : s.count;
                const maxVal = chartType === "earnings" ? maxEarnings : maxCount;
                const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / maxVal;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#0A0A0F"
                      stroke="var(--accent-primary)"
                      strokeWidth="2"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="var(--accent-primary)"
                      opacity="0"
                      className="hover:opacity-20 transition-opacity"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </CyberCard>

      {/* Grid: Top 10 Best Sellers & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <CyberCard accent="secondary" className="p-6 bg-cyber-card/85">
          <div className="mb-4">
            <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-accent-secondary" />
              TOP 10 TERLARIS & PRODUKTIF //
            </h3>
            <p className="text-[9px] text-cyber-muted font-mono uppercase">
              Rangking produk dengan penjualan kuantitas tertinggi
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-cyber-muted/20 text-cyber-muted uppercase font-mono text-[9px] text-left">
                  <th className="py-2.5 pb-2">PRODUK</th>
                  <th className="py-2.5 pb-2 text-center">KUANTITAS</th>
                  <th className="py-2.5 pb-2 text-right">OMSET BRUTO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-muted/10">
                {data.topProductsBySold.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-cyber-muted font-mono text-[10px] uppercase">
                      [BELUM ADA DATA RANGKING TERSEDIA]
                    </td>
                  </tr>
                ) : (
                  data.topProductsBySold.map((p: any, idx: number) => (
                    <tr key={p.id} className="hover:bg-cyber-surface/30 transition-colors">
                      <td className="py-2.5 flex items-center gap-2.5">
                        <span className="w-5 h-5 font-mono font-bold text-xs bg-cyber-bg border border-cyber-muted/20 flex items-center justify-center text-accent-secondary">
                          {idx + 1}
                        </span>
                        {p.thumbnail && (
                          <img src={p.thumbnail} alt="" className="w-6.5 h-6.5 rounded-xs object-cover border border-cyber-muted/10 shrink-0" />
                        )}
                        <span className="font-bold text-white tracking-wide truncate max-w-[150px]">{p.name}</span>
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold text-accent-primary">
                        {p.totalSold} Pcs
                      </td>
                      <td className="py-2.5 text-right font-mono text-white">
                        {formatPrice(p.earnings)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CyberCard>

        {/* Top Categories */}
        <CyberCard accent="primary" className="p-6 bg-cyber-card/85">
          <div className="mb-4">
            <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-accent-primary" />
              SEGMENTASI KATEGORI //
            </h3>
            <p className="text-[9px] text-cyber-muted font-mono uppercase">
              Distribusi perolehan omset per kategori akun/topup
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-cyber-muted/20 text-cyber-muted uppercase font-mono text-[9px] text-left">
                  <th className="py-2.5 pb-2">KATEGORI</th>
                  <th className="py-2.5 pb-2">TIPE</th>
                  <th className="py-2.5 pb-2 text-center">KUANTITAS</th>
                  <th className="py-2.5 pb-2 text-right">TOTAL PENDAPATAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-muted/10">
                {data.topCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-cyber-muted font-mono text-[10px] uppercase">
                      [BELUM ADA DATA KATEGORI TERSEDIA]
                    </td>
                  </tr>
                ) : (
                  data.topCategories.map((c: any) => (
                    <tr key={c.id} className="hover:bg-cyber-surface/30 transition-colors">
                      <td className="py-2.5 font-bold text-white">
                        {c.name}
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-cyber-muted uppercase">
                        {c.type === "PREMIUM_ACCOUNT" ? "SEWA AKUN" : c.type === "GAME_TOPUP" ? "TOP UP GAME" : "LISENSI"}
                      </td>
                      <td className="py-2.5 text-center font-mono text-accent-primary font-bold">
                        {c.totalSold} Pcs
                      </td>
                      <td className="py-2.5 text-right font-mono text-white">
                        {formatPrice(c.earnings)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};
