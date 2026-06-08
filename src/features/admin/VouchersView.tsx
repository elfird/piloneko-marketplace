import React, { useState, useEffect } from "react";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Search,
  Sparkles
} from "lucide-react";
import { formatPrice } from "../../lib/utils";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberButton } from "../../components/ui/CyberButton";
import { Voucher } from "../../types";

interface VouchersViewProps {
  token: string;
}

export const VouchersView: React.FC<VouchersViewProps> = ({ token }) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(0);
  const [minPurchase, setMinPurchase] = useState(0);
  const [maxUsage, setMaxUsage] = useState(100);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, [token]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/vouchers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal memuat daftar voucher");
      const list = await res.json();
      setVouchers(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewForm = () => {
    setEditingId(null);
    setCode("");
    setDescription("");
    setDiscountType("PERCENTAGE");
    setDiscountValue(0);
    setMinPurchase(0);
    setMaxUsage(100);
    
    // Set default dates
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);
    
    setStartDate(now.toISOString().split("T")[0]);
    setEndDate(nextMonth.toISOString().split("T")[0]);
    setIsActive(true);
    setFormError("");
    setShowForm(true);
  };

  const handleEditClick = (v: Voucher) => {
    setEditingId(v.id);
    setCode(v.code);
    setDescription(v.description);
    setDiscountType(v.discountType);
    setDiscountValue(v.discountValue);
    setMinPurchase(v.minPurchase);
    setMaxUsage(v.maxUsage);
    setStartDate(new Date(v.startDate).toISOString().split("T")[0]);
    setEndDate(new Date(v.endDate).toISOString().split("T")[0]);
    setIsActive(v.isActive);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!code.trim()) {
      setFormError("Kode voucher wajib diisi");
      return;
    }
    if (discountValue <= 0) {
      setFormError("Nilai diskon wajib lebih besar dari 0");
      return;
    }
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      setFormError("Diskon persentase maksimal adalah 100%");
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase),
      maxUsage: Number(maxUsage),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive
    };

    try {
      const url = editingId ? `/api/admin/vouchers/${editingId}` : "/api/admin/vouchers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memproses voucher");
      }

      setShowForm(false);
      fetchVouchers();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!await window.confirm(`Apakah Anda yakin ingin menghapus voucher "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menghapus voucher");
      fetchVouchers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredVouchers = vouchers.filter(v =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <Ticket className="w-6 h-6 text-accent-primary animate-pulse" />
            VOUCHER MANAGER //
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
            Kelola kode diskon promosi belanja, potongan nominal, persentase, dan masa kedaluwarsa kupon
          </p>
        </div>
        {!showForm && (
          <CyberButton onClick={handleOpenNewForm} variant="primary" size="sm" className="flex items-center gap-1.5 font-mono text-xs">
            <Plus className="w-4 h-4" /> KREASI VOUCHER BARU
          </CyberButton>
        )}
      </div>

      {showForm ? (
        /* Voucher Add/Edit Form */
        <CyberCard accent={editingId ? "secondary" : "primary"} className="p-6 bg-cyber-card/90">
          <div className="flex items-center justify-between border-b border-cyber-muted/20 pb-3 mb-5">
            <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-accent-primary" />
              {editingId ? `PROTOTIPE EDIT VOUCHER [${code}]` : "KREASI VOUCHER PROMO BARU"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-cyber-muted hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-500 text-xs font-semibold mb-4 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  KODE VOUCHER *
                </label>
                <input
                  type="text"
                  required
                  placeholder="KODE PROMO (misal: NEON20)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!!editingId}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  KETERANGAN VOUCHER
                </label>
                <input
                  type="text"
                  placeholder="Deskripsi singkat promo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  JENIS DISKON *
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs"
                >
                  <option value="PERCENTAGE">PERSENTASE (%)</option>
                  <option value="FIXED">POTONGAN LANGSUNG (IDR)</option>
                </select>
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  NILAI DISKON *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  MIN BELANJA (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  BATAS MAKS KLAIM (KALI)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-accent-primary" /> MULAI BERLAKU
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-accent-secondary" /> MASA EXPIRED
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-accent-primary bg-cyber-bg border border-cyber-muted"
              />
              <label htmlFor="isActive" className="text-xs text-white font-mono uppercase select-none cursor-pointer">
                AKTIFKAN KODE PROMO DI CHECKOUT SEKARANG
              </label>
            </div>

            <div className="pt-3 border-t border-cyber-muted/10 flex justify-end gap-3">
              <CyberButton type="button" onClick={() => setShowForm(false)} variant="secondary" size="sm">
                BATALKAN
              </CyberButton>
              <CyberButton type="submit" variant="primary" size="sm" className="font-bold">
                SIMPAN VOUCHER
              </CyberButton>
            </div>
          </form>
        </CyberCard>
      ) : (
        /* Voucher Table View */
        <CyberCard accent="primary" className="p-6 bg-cyber-card/80">
          {/* Filters and search bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-cyber-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode promo atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#0A0A0F] border border-cyber-muted/30 focus:border-accent-primary focus:outline-none text-xs text-white placeholder-cyber-muted/60 rounded-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchVouchers}
                className="p-2 bg-cyber-surface/60 border border-cyber-muted/20 text-cyber-muted hover:text-white rounded-xs transition-colors cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-mono text-[10px] text-cyber-muted uppercase">SYNCHRONIZING VOUCHERS REGISTRY...</p>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-cyber-muted/20 font-mono text-xs text-cyber-muted uppercase">
              [BELUM ADA DATA KUPON VOUCHER TERCATAT]
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-cyber-muted/25 text-cyber-muted uppercase font-mono text-[9px] text-left">
                    <th className="py-3 px-4">KODE VOUCHER</th>
                    <th className="py-3 px-4">POTONGAN</th>
                    <th className="py-3 px-4">MINIMAL ORDER</th>
                    <th className="py-3 px-4 text-center">KLAIM (PAKAI/MAX)</th>
                    <th className="py-3 px-4">MASA BERLAKU</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-center">TINDAKAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-muted/10">
                  {filteredVouchers.map((v) => {
                    const isExpired = new Date() > new Date(v.endDate);
                    return (
                      <tr key={v.id} className="hover:bg-cyber-surface/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-accent-primary text-xs uppercase tracking-wider">
                            {v.code}
                          </div>
                          <div className="text-[9px] text-cyber-muted truncate max-w-[160px] mt-0.5">{v.description || "-"}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white text-xs">
                          {v.discountType === "PERCENTAGE" ? (
                            <span className="text-accent-secondary">{v.discountValue}%</span>
                          ) : (
                            <span className="text-[#25D366]">{formatPrice(v.discountValue)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-cyber-muted">
                          {v.minPurchase > 0 ? formatPrice(v.minPurchase) : "Tanpa minimal"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className="text-white">{v.usageCount}</span>
                          <span className="text-cyber-muted"> / {v.maxUsage}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-cyber-muted">
                          <div className="flex items-center gap-1">
                            <span>{new Date(v.startDate).toLocaleDateString("id-ID")}</span>
                            <span>s/d</span>
                            <span className={isExpired ? "text-red-500 font-bold" : ""}>
                              {new Date(v.endDate).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {v.isActive && !isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
                              ACTIVE
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                              EXPIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                              INACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              onClick={() => handleEditClick(v)}
                              className="text-accent-primary hover:text-white transition-colors cursor-pointer"
                              title="Edit Voucher"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id, v.code)}
                              className="text-red-500 hover:text-white transition-colors cursor-pointer"
                              title="Hapus Voucher"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CyberCard>
      )}
    </div>
  );
};
