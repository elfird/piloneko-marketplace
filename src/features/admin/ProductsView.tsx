import React, { useState, useEffect } from "react";
import { Layers, Plus, Edit2, Trash2, FolderPlus, Save, X, Eye, EyeOff } from "lucide-react";
import { Category, Product, ProductPackage } from "../../types";
import { formatPrice } from "../../lib/utils";

interface ProductsViewProps {
  token: string;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ token }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Add Product form state
  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodThumb, setProdThumb] = useState("");
  const [prodCatId, setProdCatId] = useState("");

  // Package editing state
  const [showPackagesModal, setShowPackagesModal] = useState<Product | null>(null);
  const [pkgs, setPkgs] = useState<ProductPackage[]>([]);
  const [newPkgLabel, setNewPkgLabel] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("");
  const [newPkgOrigPrice, setNewPkgOrigPrice] = useState("");
  const [newPkgWarranty, setNewPkgWarranty] = useState("");
  const [newPkgDevices, setNewPkgDevices] = useState("");

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/categories", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!resProd.ok || !resCat.ok) throw new Error("Gagal mengambil data katalog");
      const listProd = await resProd.json();
      const listCat = await resCat.json();
      setProducts(listProd);
      setCategories(listCat);
      if (listCat.length > 0) setProdCatId(listCat[0].id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodSlug.trim()) {
      alert("Nama dan Slug wajib diisi");
      return;
    }
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: prodName,
          slug: prodSlug,
          description: prodDesc,
          thumbnail: prodThumb || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
          categoryId: prodCatId,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan produk baru");
      
      // Clean states
      setProdName("");
      setProdSlug("");
      setProdDesc("");
      setProdThumb("");
      setShowAddProductModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingProduct.name,
          slug: editingProduct.slug,
          description: editingProduct.description,
          thumbnail: editingProduct.thumbnail,
          categoryId: editingProduct.categoryId,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate produk");
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!await window.confirm("Apakah Anda yakin ingin menghapus produk ini? Semua paket sewa terkait juga akan terhapus.")) return;
    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus produk");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Manage Packages
  const handleOpenPackages = (prod: Product) => {
    setShowPackagesModal(prod);
    setPkgs(prod.packages || []);
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPackagesModal || !newPkgLabel.trim() || !newPkgPrice) return;
    try {
      const res = await fetch(`/api/admin/products/${showPackagesModal.id}/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: newPkgLabel,
          price: Number(newPkgPrice),
          originalPrice: Number(newPkgOrigPrice) || Number(newPkgPrice),
          warrantyDays: Number(newPkgWarranty) || 0,
          maxDevices: Number(newPkgDevices) || 1,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan Paket baru");
      
      // Clean form states
      setNewPkgLabel("");
      setNewPkgPrice("");
      setNewPkgOrigPrice("");
      setNewPkgWarranty("");
      setNewPkgDevices("");
      
      // Refresh product data and update package list
      await fetchData();
      // Update packages in modal from refreshed data
      const updatedProd = (await (await fetch(`/api/admin/products`, { headers: { Authorization: `Bearer ${token}` } })).json())
        .find((p: any) => p.id === showPackagesModal?.id);
      if (updatedProd) setPkgs(updatedProd.packages || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!showPackagesModal) return;
    if (!await window.confirm("Hapus paket pilihan?")) return;
    try {
      const res = await fetch(`/api/admin/products/${showPackagesModal.id}/packages/${pkgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus paket");
      const listPacNew = await res.json();
      setPkgs(listPacNew);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 text-left font-sans">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
            // PRODUCTS & PACKAGE INVENTORY
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
            Tambahkan produk sewa akun premium baru, tentukan kategori, dan buat pilihan level paket harga
          </p>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="px-4 py-2 bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white transition-all text-xs font-orbitron font-semibold cursor-pointer flex items-center justify-center gap-1.5 rounded-xs"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>TAMBAH PRODUK BARU</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-[10px] text-cyber-muted uppercase">SYNCHRONIZING ITEMS...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="border border-accent-primary/10 bg-cyber-card/90 rounded-xs flex flex-col justify-between overflow-hidden relative">
              {/* Image banner */}
              <div className="w-full h-36 relative overflow-hidden bg-cyber-bg">
                <img src={prod.thumbnail} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-card to-transparent" />
                <span className="absolute top-2.5 left-2.5 bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/50 text-[10px] font-mono px-2 py-0.5 uppercase tracking-widest rounded-sm">
                  {prod.category?.name || "Kategori"}
                </span>
              </div>

              {/* Text content details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-orbitron font-semibold text-white tracking-wider mb-1 uppercase">
                    {prod.name}
                  </h3>
                  <code className="text-[#00F5FF] text-[10px] select-all block mb-3 font-mono">
                    /{prod.slug}
                  </code>
                  <p className="text-xs text-cyber-muted line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                {/* Lower billing & package counter info */}
                <div className="border-t border-accent-primary/10 pt-4 mt-5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-cyber-muted uppercase block text-[9px] font-mono">Total Pilihan</span>
                    <span className="font-orbitron font-bold text-white text-xs">{prod.packages?.length || 0} Paket</span>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {/* Packages configuration button */}
                    <button
                      onClick={() => handleOpenPackages(prod)}
                      className="p-1.5 bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 hover:border-accent-secondary hover:bg-accent-secondary/20 transition-all rounded-xs text-[10px] uppercase font-bold cursor-pointer"
                      title="Manage Packages"
                    >
                      Atur Paket ({prod.packages?.length || 0})
                    </button>

                    {/* Edit info button */}
                    <button
                      onClick={() => setEditingProduct(prod)}
                      className="p-1.5 text-accent-primary bg-accent-primary/5 hover:bg-accent-primary/15 border border-accent-primary/20 hover:border-accent-primary transition-all rounded-xs cursor-pointer"
                      title="Edit Produk"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 text-red-500 hover:text-white bg-red-950/5 hover:bg-red-950 border border-red-500/10 hover:border-red-500 transition-all rounded-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-accent-primary/15 bg-cyber-card/10 rounded-xs">
          <Layers className="w-12 h-12 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-orbitron font-semibold text-lg text-white uppercase mb-1">PRODUK KOSONG</h3>
          <p className="text-xs text-cyber-muted">Mulai tambahkan produk premium perdana Anda dengan tombol TAMBAH PRODUK BARU di atas.</p>
        </div>
      )}

      {/* MODAL 1: ADD PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F0F1A] border border-accent-primary p-6 relative rounded-xs text-left">
            <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-cyber-muted hover:text-white cursor-pointer" onClick={() => setShowAddProductModal(false)}>
              <X className="w-5 h-5" />
            </span>

            <h3 className="font-orbitron font-bold text-lg text-white mb-5 uppercase tracking-widest text-neon">
              // INPUT DATA PRODUK BARU
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Netflix Premium 4K UHD"
                    value={prodName}
                    onChange={(e) => {
                      setProdName(e.target.value);
                      // Auto-slugify
                      setProdSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">SEO Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: netflix-premium-uhd"
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Pilihan Kategori *</label>
                <select
                  value={prodCatId}
                  onChange={(e) => setProdCatId(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.toUpperCase()} (Tipe: {c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Image URL Thumbnail</label>
                <input
                  type="text"
                  placeholder="Contoh: https://example.com/logo.png"
                  value={prodThumb}
                  onChange={(e) => setProdThumb(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Deskripsi Lengkap Produk *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Contoh: Syarat ketentuan dan keunggulan akun premium Netflix sewa Anda..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans whitespace-pre-line"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white transition-all text-xs font-orbitron font-semibold cursor-pointer rounded-xs"
                >
                  SAVE PRODUK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F0F1A] border border-accent-primary p-6 relative rounded-xs text-left">
            <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-cyber-muted hover:text-white cursor-pointer" onClick={() => setEditingProduct(null)}>
              <X className="w-5 h-5" />
            </span>

            <h3 className="font-orbitron font-bold text-lg text-white mb-5 uppercase tracking-widest text-neon">
              // UPDATE CONFIG PRODUK
            </h3>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Slug</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.slug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Pilihan Kategori</label>
                <select
                  value={editingProduct.categoryId}
                  onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.toUpperCase()} (Tipe: {c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Image URL Thumbnail</label>
                <input
                  type="text"
                  value={editingProduct.thumbnail}
                  onChange={(e) => setEditingProduct({ ...editingProduct, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Deskripsi Lengkap Produk</label>
                <textarea
                  required
                  rows={4}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans whitespace-pre-line"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white transition-all text-xs font-orbitron font-semibold cursor-pointer rounded-xs"
                >
                  UPDATE CONFIG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MANAGE PACKAGES LEVEL */}
      {showPackagesModal && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F0F1A] border border-accent-secondary p-6 relative rounded-xs text-left">
            <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-cyber-muted hover:text-white cursor-pointer" onClick={() => setShowPackagesModal(null)}>
              <X className="w-5 h-5" />
            </span>

            <h3 className="font-orbitron font-bold text-base text-white mb-1.5 uppercase tracking-widest text-[#BF00FF]">
              // MANAGE PACKAGE PLANS : {showPackagesModal.name.toUpperCase()}
            </h3>
            <p className="text-[10px] text-cyber-muted uppercase font-mono tracking-wider mb-6">
              Tambahkan penawaran durasi, garansi, harga normal, harga promo diskon, dan device limit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Form left side */}
              <form onSubmit={handleAddPackage} className="space-y-3 p-4 bg-cyber-surface/40 border border-cyber-muted/10">
                <span className="block text-[10px] font-orbitron font-semibold text-accent-secondary uppercase tracking-widest mb-1.5">
                  // TAMBAH PAKET BARU
                </span>

                <div>
                  <label className="block text-cyber-muted text-[9px] font-mono uppercase mb-0.5">Label Paket *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paket 1 Bulan Sharing"
                    value={newPkgLabel}
                    onChange={(e) => setNewPkgLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-cyber-bg border border-accent-primary/20 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-cyber-muted text-[9px] font-mono uppercase mb-0.5">Harga Promo *</label>
                    <input
                      type="number"
                      required
                      placeholder="35000"
                      value={newPkgPrice}
                      onChange={(e) => setNewPkgPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-cyber-bg border border-accent-primary/20 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-cyber-muted text-[9px] font-mono uppercase mb-0.5">Harga Coret (Original)</label>
                    <input
                      type="number"
                      placeholder="49000"
                      value={newPkgOrigPrice}
                      onChange={(e) => setNewPkgOrigPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-cyber-bg border border-accent-primary/20 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-cyber-muted text-[9px] font-mono uppercase mb-0.5">Waktu Garansi (Hari)</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={newPkgWarranty}
                      onChange={(e) => setNewPkgWarranty(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-cyber-bg border border-accent-primary/20 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-cyber-muted text-[9px] font-mono uppercase mb-0.5 font-sans">Maks Device / Screen</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={newPkgDevices}
                      onChange={(e) => setNewPkgDevices(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-cyber-bg border border-accent-primary/20 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-accent-secondary/15 text-accent-secondary border border-accent-secondary hover:bg-accent-secondary hover:text-white transition-all text-[11px] font-orbitron font-semibold cursor-pointer rounded-xs"
                  >
                    SAVE PAKET
                  </button>
                </div>
              </form>

              {/* Dynamic tables preview right side */}
              <div className="space-y-4">
                <span className="block text-[10px] font-orbitron font-semibold text-accent-primary uppercase tracking-widest leading-none">
                  // PAKET AKTIF SAAT INI ({pkgs.length})
                </span>

                {pkgs.length > 0 ? (
                  <div className="space-y-2 max-h-76 overflow-y-auto pr-1">
                    {pkgs.map((pkg) => (
                      <div key={pkg.id} className="border border-cyber-muted/20 p-3 bg-cyber-surface/20 flex items-center justify-between gap-3 text-xs">
                        <div className="text-left font-sans">
                          <span className="block font-semibold text-white">{pkg.label}</span>
                          <span className="block text-[10px] text-accent-secondary font-mono">
                            {formatPrice(pkg.price)} <span className="line-through text-cyber-muted ml-1">{formatPrice(pkg.originalPrice)}</span>
                          </span>
                          <span className="block text-[9px] text-cyber-muted font-mono mt-0.5">
                            Garansi: {pkg.warrantyDays} Hari | Dev: {pkg.maxDevices} | Stok: {(pkg as any).stockCount || 0} Ready
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-1 px-1.5 text-red-500 hover:text-white hover:bg-red-950/20 border border-red-500/15 rounded-xs shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-cyber-muted italic p-2 bg-cyber-surface/10 border border-dashed border-cyber-muted/15">
                    Produk ini belum memiliki paket harga aktif. Pembeli tidak dapat mengcheckout sebelum Anda mengisinya!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
