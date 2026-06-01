import React, { useState, useEffect } from "react";
import { Database, Plus, Trash2, Key, ShieldCheck, X, Layers, AlertCircle, RefreshCw } from "lucide-react";
import { Product, ProductPackage } from "../../types";

interface StocksProps {
  token: string;
}

export const StocksView: React.FC<StocksProps> = ({ token }) => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter conditions
  const [selectedProductFilter, setSelectedProductFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form states
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [bulkUsernames, setBulkUsernames] = useState("");
  const [bulkPassword, setBulkPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMainData();
  }, [token]);

  const fetchMainData = async () => {
    try {
      setLoading(true);
      const [resStock, resProd] = await Promise.all([
        fetch("/api/admin/stocks", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!resStock.ok || !resProd.ok) throw new Error("Gagal menyinkronkan data stok");
      const listStocks = await resStock.json();
      const listProducts = await resProd.json();
      
      setStocks(listStocks);
      setProducts(listProducts);
      
      if (listProducts.length > 0) {
        setSelectedProduct(listProducts[0].id);
        setPackages(listProducts[0].packages || []);
        if (listProducts[0].packages && listProducts[0].packages.length > 0) {
          setSelectedPackage(listProducts[0].packages[0].id);
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
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

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) {
      alert("Harap buat paket produk terlebih dahulu");
      return;
    }
    if (!bulkUsernames.trim() || !bulkPassword.trim()) {
      alert("Harap isi username / email dan password akun");
      return;
    }

    try {
      setIsSubmitting(true);
      const lines = bulkUsernames.split("\n").map(l => l.trim()).filter(l => l !== "");
      
      const res = await fetch("/api/admin/stocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          usernames: lines,
          password: bulkPassword,
        }),
      });

      if (!res.ok) throw new Error("Gagal menambah stok baru");

      setBulkUsernames("");
      setBulkPassword("");
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = async (stockId: string) => {
    if (!window.confirm("Hapus akun stok terpilih?")) return;
    try {
      const res = await fetch(`/api/admin/stocks/${stockId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal meremove stok");
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter application
  const filteredStocks = stocks.filter((st) => {
    const matchesProduct =
      selectedProductFilter === "ALL" || st.package?.productId === selectedProductFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "AVAILABLE" && !st.isSold) ||
      (statusFilter === "SOLD" && st.isSold);
    return matchesProduct && matchesStatus;
  });

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
            // STOCK DATABASE REGISTRY
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
            Tambahkan username dan password akun Netflix / Spotify / Canvam, sirkulasi stok lunas otomatis dialokasi
          </p>
        </div>
        <button
          onClick={fetchMainData}
          className="p-1 px-3 text-xs bg-cyber-card border border-accent-secondary text-accent-secondary rounded-xs flex items-center gap-1 cursor-pointer font-mono uppercase font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" /> RE-CALIBRATE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Bulk Insert Form Column */}
        <div className="lg:col-span-5">
          <form onSubmit={handleAddStock} className="p-6 bg-cyber-card border border-accent-primary/20 space-y-4">
            <span className="block text-xs font-orbitron font-bold text-accent-primary uppercase tracking-widest mb-1">
              // BULK CARRIER ADD STOCK
            </span>

            {/* Select Product */}
            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">1. Target Produk</label>
              <select
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Package */}
            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">2. Target Level Paket</label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Usernames */}
            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5 flex justify-between">
                <span>3. Username / Email</span>
                <span className="text-accent-secondary font-sans leading-none font-semibold">[Satu baris = satu akun]</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Contoh:&#10;netflix_pembeli1@gmail.com&#10;netflix_pembeli2@gmail.com"
                value={bulkUsernames}
                onChange={(e) => setBulkUsernames(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
            </div>

            {/* Shared Password */}
            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">4. Password Akun</label>
              <input
                type="text"
                required
                placeholder="Contoh: premiumhacker2026@"
                value={bulkPassword}
                onChange={(e) => setBulkPassword(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={isSubmitting || !selectedPackage}
                className="w-full px-4 py-2.5 bg-accent-primary text-black hover:bg-white transition-all text-xs font-orbitron font-bold cursor-pointer rounded-xs"
              >
                {isSubmitting ? "STORING CRITICAL KEY..." : "INJECT ACCOUNTS STOCK"}
              </button>
            </div>
          </form>
        </div>

        {/* Stock List Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* List Toolbar */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            <div>
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-card border border-accent-primary/10 text-white text-xs font-sans rounded-xs"
              >
                <option value="ALL">FILTER PRODUK</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-card border border-accent-primary/10 text-white text-xs font-mono rounded-xs"
              >
                <option value="ALL">FILTER STATUS</option>
                <option value="AVAILABLE">READY STOCK</option>
                <option value="SOLD">SOLD OUT</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-cyber-muted animate-pulse uppercase">RETRIEVING ENCRYPTED STOCKS FROM CONTAINER...</div>
          ) : filteredStocks.length > 0 ? (
            <div className="border border-accent-primary/20 bg-[#0F0F1A] rounded-xs divide-y divide-cyber-muted/5 max-h-[500px] overflow-y-auto pr-1">
              {filteredStocks.map((st) => (
                <div key={st.id} className="p-4 flex items-center justify-between gap-4 text-xs font-mono hover:bg-cyber-surface/30 transition-colors">
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-[10px] text-accent-secondary font-orbitron font-semibold block leading-none mb-1">
                      {st.package?.product?.name} (PAKET: {st.package?.label})
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-bold select-all truncate block md:max-w-xs">U: {st.username}</span>
                      <span className="text-cyber-muted">|</span>
                      <span className="text-white font-bold select-all truncate block">P: {st.password}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {st.isSold ? (
                      <span className="px-1.5 py-0.5 text-[8px] border border-red-500/40 text-red-400 bg-red-900/10 font-bold uppercase rounded-xs">
                        SOLD CODES
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[8px] border border-[#25D366]/40 text-[#25D366] bg-[#25D366]/10 font-bold uppercase rounded-xs">
                        AVAILABLE
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteStock(st.id)}
                      className="p-1.5 text-red-400 hover:text-white bg-red-950/20 hover:bg-red-950 border border-red-500/10 rounded-xs cursor-pointer"
                      title="Hapus Stok"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-accent-primary/15 bg-cyber-card/10 rounded-xs">
              <Database className="w-10 h-10 text-cyber-muted mx-auto mb-3" />
              <h3 className="font-orbitron font-semibold text-sm text-cyber-muted uppercase">STOK KOSONG</h3>
              <p className="text-[11px] text-cyber-muted font-sans mt-0.5">Mulai isi data akun Netflix / Spotify lewat panel carrier kiri.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
