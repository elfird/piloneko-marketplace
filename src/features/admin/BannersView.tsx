import React, { useState, useEffect } from "react";
import { 
  Image, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Search,
  Sparkles,
  Link,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { CyberCard } from "../../components/ui/CyberCard";
import { CyberButton } from "../../components/ui/CyberButton";
import { Banner } from "../../types";

interface BannersViewProps {
  token: string;
}

export const BannersView: React.FC<BannersViewProps> = ({ token }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [position, setPosition] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchBanners();
  }, [token]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/banners", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengambil data banner");
      const list = await res.json();
      setBanners(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewForm = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setImage("");
    setLink("");
    setPosition(banners.length);
    
    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);
    
    setStartDate(now.toISOString().split("T")[0]);
    setEndDate(nextYear.toISOString().split("T")[0]);
    setIsActive(true);
    setFormError("");
    setShowForm(true);
  };

  const handleEditClick = (b: Banner) => {
    setEditingId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setImage(b.image);
    setLink(b.link || "");
    setPosition(b.position);
    setStartDate(new Date(b.startDate).toISOString().split("T")[0]);
    setEndDate(new Date(b.endDate).toISOString().split("T")[0]);
    setIsActive(b.isActive);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Judul banner wajib diisi");
      return;
    }
    if (!image.trim()) {
      setFormError("Link url gambar banner wajib diisi");
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      image: image.trim(),
      link: link.trim() || null,
      position: Number(position),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive
    };

    try {
      const url = editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
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
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memproses slider banner");
      }

      setShowForm(false);
      fetchBanners();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!await window.confirm(`Apakah Anda yakin ingin menghapus banner "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menghapus banner");
      fetchBanners();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <Image className="w-6 h-6 text-accent-primary animate-pulse" />
            HOMEPAGE BANNERS //
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
            Kelola banner promosi sirkulasi slider yang muncul di halaman beranda PILONEKO
          </p>
        </div>
        {!showForm && (
          <CyberButton onClick={handleOpenNewForm} variant="primary" size="sm" className="flex items-center gap-1.5 font-mono text-xs">
            <Plus className="w-4 h-4" /> TAMBAH BANNER SLIDER
          </CyberButton>
        )}
      </div>

      {showForm ? (
        /* Form component */
        <CyberCard accent={editingId ? "secondary" : "primary"} className="p-6 bg-cyber-card/90">
          <div className="flex items-center justify-between border-b border-cyber-muted/20 pb-3 mb-5">
            <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-accent-primary" />
              {editingId ? `PROTOTIPE EDIT SLIDER [${title}]` : "KREASI BANNER SLIDER BARU"}
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
                  JUDUL BANNER *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Judul utama banner promosi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  SUB-JUDUL BANNER (OPSIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Keterangan / diskon khusus"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  URL GAMBAR BANNER *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Link gambar web (1200x450 direkomendasikan)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1 flex items-center gap-1">
                  <Link className="w-3 h-3 text-accent-primary" /> LINK REDIRECT TOMBOL
                </label>
                <input
                  type="text"
                  placeholder="Contoh: /product/netflix-premium"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                  URUTAN POSITION / INDEX
                </label>
                <input
                  type="number"
                  min="0"
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
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
                TAMPILKAN BANNER DI HOMEPAGE SEKARANG
              </label>
            </div>

            <div className="pt-3 border-t border-cyber-muted/10 flex justify-end gap-3">
              <CyberButton type="button" onClick={() => setShowForm(false)} variant="secondary" size="sm">
                BATALKAN
              </CyberButton>
              <CyberButton type="submit" variant="primary" size="sm" className="font-bold">
                SIMPAN SLIDER
              </CyberButton>
            </div>
          </form>
        </CyberCard>
      ) : (
        /* List grid */
        <CyberCard accent="primary" className="p-6 bg-cyber-card/85">
          <div className="flex items-center justify-between border-b border-cyber-muted/20 pb-3 mb-5">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">// SLIDES MANAGER REGISTRY</span>
            <button
              onClick={fetchBanners}
              className="p-1.5 bg-cyber-surface/50 border border-cyber-muted/20 text-cyber-muted hover:text-white rounded-xs transition-colors cursor-pointer"
              title="Refresh Banners"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-mono text-[10px] text-cyber-muted uppercase">LOADING BANNERS...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-cyber-muted/20 font-mono text-xs text-cyber-muted uppercase">
              [BELUM ADA DATA BANNER PROMOSI TERSEDIA]
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {banners.map((b) => {
                const isExpired = new Date() > new Date(b.endDate);
                return (
                  <div key={b.id} className="bg-cyber-surface/20 border border-cyber-muted/20 hover:border-accent-primary/30 rounded-xs overflow-hidden flex flex-col justify-between transition-all duration-200">
                    <div className="relative aspect-[16/6] bg-[#0A0A0F] overflow-hidden border-b border-cyber-muted/20">
                      {b.image ? (
                        <img src={b.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-cyber-muted">
                          [TIDAK ADA GAMBAR PREVIEW]
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <span className="font-mono text-[8px] bg-[#0A0A0F]/80 text-white font-bold px-2 py-0.5 border border-cyber-muted/30">
                          INDEX #{b.position}
                        </span>
                        {b.isActive && !isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30">
                            LIVE
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-red-500/20 text-red-500 border border-red-500/30">
                            EXPIRED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                            INACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="text-left mb-4">
                        <h4 className="text-xs font-bold text-white tracking-wide">{b.title}</h4>
                        {b.subtitle && (
                          <p className="text-[10px] text-cyber-muted truncate mt-0.5">{b.subtitle}</p>
                        )}
                        {b.link && (
                          <span className="text-[9px] text-accent-primary font-mono inline-block mt-1 flex items-center gap-1">
                            <Link className="w-2.5 h-2.5" />
                            {b.link}
                          </span>
                        )}
                        <div className="text-[9px] text-cyber-muted font-mono mt-2.5 pt-2 border-t border-cyber-muted/10">
                          Jangka Waktu: {new Date(b.startDate).toLocaleDateString("id-ID")} - {new Date(b.endDate).toLocaleDateString("id-ID")}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3.5 border-t border-cyber-muted/10 pt-3">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="text-accent-primary hover:text-white transition-colors cursor-pointer text-xs font-mono flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.title)}
                          className="text-red-500 hover:text-white transition-colors cursor-pointer text-xs font-mono flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> HAPUS
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CyberCard>
      )}
    </div>
  );
};
