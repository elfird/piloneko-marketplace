import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Calendar, Zap, AlertCircle } from "lucide-react";
import { Product, ProductPackage } from "../../types";
import { formatPrice } from "../../lib/utils";

interface FlashSaleViewProps {
  token: string;
}

export const FlashSaleView: React.FC<FlashSaleViewProps> = ({ token }) => {
  const [isActive, setIsActive] = useState(false);
  const [endsAt, setEndsAt] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New item form states
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [packages, setPackages] = useState<ProductPackage[]>([]);

  useEffect(() => {
    fetchMainData();
  }, [token]);

  const fetchMainData = async () => {
    try {
      setLoading(true);
      const [resConfig, resItems, resProd] = await Promise.all([
        fetch("/api/admin/site-content", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/flash-sales", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!resConfig.ok || !resItems.ok || !resProd.ok) throw new Error("Gagal mengambil data flash sale");

      const listConf = await resConfig.json();
      const listItems = await resItems.json();
      const listProd = await resProd.json();

      setItems(listItems);
      setProducts(listProd);

      // Find active configurations from SiteContent array
      const activeItem = listConf.find((l: any) => l.key === "flash_sale_active");
      const endsAtItem = listConf.find((l: any) => l.key === "flash_sale_ends_at");

      setIsActive(activeItem?.value === "true");
      setEndsAt(endsAtItem?.value || "");

      if (listProd.length > 0) {
        setSelectedProduct(listProd[0].id);
        setPackages(listProd[0].packages || []);
        if (listProd[0].packages && listProd[0].packages.length > 0) {
          setSelectedPackage(listProd[0].packages[0].id);
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/site-content/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          updates: [
            { key: "flash_sale_active", value: isActive ? "true" : "false" },
            { key: "flash_sale_ends_at", value: endsAt },
          ],
        }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate konfigurasi utama");
      alert("Konfigurasi Flash Sale Utama berhasil diperbarui!");
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleProductChange = (prodId: string) => {
    setSelectedProduct(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.packages && prod.packages.length > 0) {
      setPackages(prod.packages);
      setSelectedPackage(prod.packages[0].id);
    } else {
      setPackages([]);
      setSelectedPackage("");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !salePrice) return;
    try {
      const res = await fetch("/api/admin/flash-sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct,
          packageId: selectedPackage,
          salePrice: Number(salePrice),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memasukkan produk ke Flash Sale");
      }

      setSalePrice("");
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Hapus diskon flash sale untuk produk ini?")) return;
    try {
      const res = await fetch(`/api/admin/flash-sales/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus diskon");
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Title Header */}
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // FLASH SALE CHRONOMETER
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Aktifkan countdown FOMO, tentukan waktu kadaluarsa, dan atur promo diskon khusus paket produk sewa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side Config Toggle */}
        <div className="md:col-span-4 bg-cyber-card border border-accent-primary/20 p-6 space-y-4">
          <span className="block text-xs font-orbitron font-bold text-accent-primary uppercase tracking-widest mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4 animate-spin-slow" />
            <span>// CLOCK CONFIGURATION</span>
          </span>

          <form onSubmit={updateGlobalStatus} className="space-y-4">
            {/* Status Switcher checkbox */}
            <div className="flex items-center justify-between p-3.5 bg-cyber-surface/60 border border-cyber-muted/10 rounded-xs">
              <div>
                <span className="block text-xs text-white font-bold font-orbitron">FLASH SALE STATUS</span>
                <span className="text-[9px] text-cyber-muted uppercase mt-0.5">Aktifkan banner & counter</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-cyber-surface border border-cyber-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-cyber-muted peer-checked:after:bg-accent-primary after:border-cyber-muted after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-primary/10 peer-checked:border-accent-primary" />
              </label>
            </div>

            {/* Ends At Timepicker */}
            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>WAKTU BERAKHIR (DEADLINE) *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={endsAt ? endsAt.substring(0, 16) : ""}
                onChange={(e) => {
                  // Convert datetime-local format to ISO string
                  const d = new Date(e.target.value);
                  setEndsAt(isNaN(d.getTime()) ? e.target.value : d.toISOString().substring(0, 19));
                }}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary text-xs font-mono text-white"
              />
              <span className="block text-[8px] text-cyber-muted font-mono uppercase mt-1">
                Pilih tanggal dan jam berakhirnya flash sale
              </span>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white transition-all text-xs font-orbitron font-bold cursor-pointer rounded-xs"
            >
              SAVE UTILITY SETTINGS
            </button>
          </form>
        </div>

        {/* Right Side Discount list and Form items adder */}
        <div className="md:col-span-8 space-y-6">
          {/* Add Item Form inline */}
          <form onSubmit={handleAddItem} className="p-5 border border-accent-secondary/20 bg-cyber-surface/40 flex flex-col sm:flex-row gap-4 items-end justify-between">
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div>
                <label className="block text-cyber-muted text-[9px] font-mono uppercase mb-1">Pilih Produk</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-cyber-bg border border-cyber-muted/20 text-xs text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cyber-muted text-[9px] font-mono uppercase mb-1">Pilih Paket</label>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-cyber-bg border border-cyber-muted/20 text-xs text-white"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cyber-muted text-[9px] font-mono uppercase mb-1">Harga Flash Promo *</label>
                <input
                  type="number"
                  required
                  placeholder="30000"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-cyber-bg border border-cyber-muted/20 text-xs font-mono text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedPackage}
              className="px-4 py-2.5 bg-accent-secondary text-white hover:bg-white hover:text-black transition-all text-xs font-orbitron font-bold shrink-0 cursor-pointer rounded-xs flex items-center justify-center gap-1 uppercase"
            >
              <Plus className="w-3.5 h-3.5" /> ADD
            </button>
          </form>

          {/* Table display item list */}
          <div className="border border-cyber-muted/10 bg-[#0F0F1A] p-5">
            <span className="block text-xs font-orbitron font-bold text-accent-secondary uppercase tracking-widest mb-4">
              // ITEM FLASH SALE YANG TERDAFTAR ({items.length})
            </span>

            {loading ? (
              <p className="py-8 text-center text-xs text-cyber-muted animate-pulse uppercase">TRANSLATING FLASH SALE CODES...</p>
            ) : items.length > 0 ? (
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="border border-cyber-muted/15 p-3 flex justify-between items-center bg-cyber-card/70 gap-3 text-xs">
                    <div className="text-left font-sans">
                      <span className="block font-semibold text-white">
                        {it.product?.name} (PAKET: {it.package?.label})
                      </span>
                      <span className="block text-[10px] text-accent-primary font-mono mt-1">
                        Harga Sale: <strong className="text-accent-secondary font-bold font-orbitron text-xs">{formatPrice(it.salePrice)}</strong>
                        <span className="line-through text-cyber-muted ml-2 font-mono">Normal: {formatPrice(it.package?.price || 0)}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(it.id)}
                      className="p-1 px-1.5 bg-red-950/10 text-red-500 border border-red-500/15 hover:border-red-500 transition-colors rounded-xs shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-cyber-muted/10 bg-cyber-bg/20 rounded-xs">
                <AlertCircle className="w-8 h-8 text-cyber-muted mx-auto mb-2" />
                <p className="text-xs text-cyber-muted font-thin">Belum ada promo diskon khusus di atas. Silakan tambahkan lewat form adder.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
