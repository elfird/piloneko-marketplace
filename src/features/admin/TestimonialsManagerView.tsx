import React, { useState, useEffect } from "react";
import { Star, Plus, Trash2, ShieldCheck, X, Heart } from "lucide-react";
import { Testimonial } from "../../types";

interface TestimonialsManagerProps {
  token: string;
}

export const TestimonialsManagerView: React.FC<TestimonialsManagerProps> = ({
  token,
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetchTestimonials();
  }, [token]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/testimonials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal memuat daftar testimoni");
      const list = await res.json();
      setTestimonials(list);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !productName.trim() || !comment.trim()) {
      alert("Harap lengkapi semua data wajib");
      return;
    }

    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buyerName,
          productName,
          rating: Number(rating),
          comment,
          avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan testimoni");

      setBuyerName("");
      setProductName("");
      setComment("");
      setAvatarUrl("");
      setRating(5);
      setShowAddModal(false);
      fetchTestimonials();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTestimonial = async (testId: string) => {
    if (!await window.confirm("Hapus testimoni terpilih?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${testId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus testimoni");
      fetchTestimonials();
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
            // REVIEWS MODERATION HUB
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
            Kelola ulasan pembeli, upload testimoni manual dari WA, pasang bintang rating di beranda utama
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white transition-all text-xs font-orbitron font-semibold cursor-pointer flex items-center justify-center gap-1.5 rounded-xs"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>TAMBAH TESTIMONI BARU</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-cyber-muted animate-pulse">
          REFLECTING FEEDBACK LAYOUTS...
        </div>
      ) : testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((test) => (
            <div key={test.id} className="border border-accent-primary/10 bg-cyber-card/85 p-5 relative rounded-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  {/* Stars list */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < test.rating ? "text-yellow-400 fill-yellow-400" : "text-cyber-muted/20"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteTestimonial(test.id)}
                    className="p-1 text-red-500 hover:text-white bg-red-950/20 hover:bg-red-950 border border-red-500/10 rounded-xs shrink-0 cursor-pointer"
                    title="Hapus Ulasan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-cyber-text italic font-sans leading-relaxed mb-4">
                  "{test.comment}"
                </p>
              </div>

              {/* Identity Footer */}
              <div className="border-t border-accent-primary/5 pt-4 mt-2 flex items-center gap-3">
                <div className="w-9 h-9 border border-accent-secondary/50 rounded-xs overflow-hidden bg-[#0A0A0F] shrink-0 p-0.5">
                  <img src={test.avatarUrl} alt={test.buyerName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="text-left font-sans text-xs">
                  <span className="font-bold text-white uppercase flex items-center gap-1 leading-none font-orbitron">
                    {test.buyerName}
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  </span>
                  <span className="text-[10px] text-accent-secondary font-semibold font-mono block mt-1 uppercase truncate max-w-xs">
                    📦 {test.productName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-accent-primary/15 bg-cyber-card/10 rounded-xs">
          <Heart className="w-12 h-12 text-cyber-muted mx-auto mb-4" />
          <h3 className="font-orbitron font-semibold text-lg text-white uppercase mb-1">TESTIMONI KOSONG</h3>
          <p className="text-xs text-cyber-muted">Klik tombol TAMBAH TESTIMONI BARU di atas untuk memajang ulasan promosi akun premium.</p>
        </div>
      )}

      {/* ADD TESTIMONIAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F1A] border border-accent-primary p-6 relative rounded-xs text-left">
            <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-cyber-muted hover:text-white cursor-pointer" onClick={() => setShowAddModal(false)}>
              <X className="w-5 h-5" />
            </span>

            <h3 className="font-orbitron font-bold text-base text-white mb-5 uppercase tracking-widest text-neon">
              // TAMBAH TESTIMONIAL MANUAL
            </h3>

            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Nama Pembeli *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andi Pratama"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary text-xs text-white text-left"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Produk yang Dibeli *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Netflix Premium"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Rating Bintang *</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary text-xs text-white font-mono"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ - 5 Bintang</option>
                    <option value="4">⭐⭐⭐⭐ - 4 Bintang</option>
                    <option value="3">⭐⭐⭐ - 3 Bintang</option>
                    <option value="2">⭐⭐ - 2 Bintang</option>
                    <option value="1">⭐ - 1 Bintang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyber-muted mb-1 font-mono uppercase text-[9px]">Komentar Testimoni *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ketik isi komentar kepuasan pelanggan..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary text-xs text-white font-sans"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary/15 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-black transition-all text-xs font-orbitron font-semibold cursor-pointer rounded-xs"
                >
                  SAVE TESTIMONI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
