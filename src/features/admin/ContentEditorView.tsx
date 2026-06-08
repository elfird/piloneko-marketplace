import React, { useState, useEffect } from "react";
import { Sliders, Save, FileText, Image, LayoutGrid, Heart, Phone } from "lucide-react";

interface ContentEditorProps {
  token: string;
}

export const ContentEditorView: React.FC<ContentEditorProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState("hero");
  const [siteContents, setSiteContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields map state
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchContent();
  }, [token]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/site-content", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data CMS");
      const list = await res.json();
      setSiteContents(list);

      // Map to key-value record
      const mapped: Record<string, string> = {};
      list.forEach((item: any) => {
        mapped[item.key] = item.value;
      });
      setFormData(mapped);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates = Object.keys(formData).map((k) => ({
        key: k,
        value: formData[k],
      }));

      const res = await fetch("/api/admin/site-content/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan CMS");
      alert("Konten halaman / CMS berhasil diperbarui!");
      fetchContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-cyber-muted animate-pulse">
        ACCUMULATING DEEP CMS INDEXES...
      </div>
    );
  }

  // Tabs navigation schema
  const tabs = [
    { id: "hero", label: "Hero Banner", icon: <FileText className="w-4 h-4" /> },
    { id: "store", label: "Toko & Sosmed", icon: <Phone className="w-4 h-4" /> },
    { id: "payments", label: "BCA & QRIS", icon: <Image className="w-4 h-4" /> },
    { id: "steps", label: "Diagram Beli", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "stats", label: "Stats Counter", icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 text-left font-sans">
      {/* View Header */}
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // SITE CONFIG CMS
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Kelola deskripsi landing page, kontak email toko, langkah pembelian digital, nomor rekening transfer
        </p>
      </div>

      {/* Internal Tabs Nav row */}
      <div className="flex flex-wrap gap-2 border-b border-cyber-muted/15 pb-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setActiveTab(tb.id)}
            className={`px-4 py-2 text-xs font-orbitron tracking-wider uppercase cursor-pointer rounded-xs transition-all border ${
              activeTab === tb.id
                ? "border-accent-primary text-accent-primary bg-accent-primary/10 shadow-[0_0_8px_rgba(0,245,255,0.15)]"
                : "border-transparent text-cyber-muted hover:text-white"
            } flex items-center gap-1.5`}
          >
            {tb.icon}
            <span>{tb.label}</span>
          </button>
        ))}
      </div>

      {/* Main CMS Editor Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-cyber-card border border-accent-primary/20 space-y-6">
        {/* TAB 1: HERO CONFIG */}
        {activeTab === "hero" && (
          <div className="space-y-4">
            <span className="block text-[10px] font-orbitron font-bold text-accent-primary uppercase tracking-widest leading-none mb-3">
              // HERO DISPLAY TEXT CONFIG
            </span>

            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Hero Headline Title</label>
              <input
                type="text"
                value={formData.hero_headline || ""}
                onChange={(e) => handleFieldChange("hero_headline", e.target.value)}
                placeholder="Contoh: PILONEKO & Top Up Game"
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Hero Subtitle Text</label>
              <textarea
                rows={3}
                value={formData.hero_subtext || ""}
                onChange={(e) => handleFieldChange("hero_subtext", e.target.value)}
                placeholder="Deskripsi penjelas toko premium Anda..."
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Tagline Garansi (Badge 1)</label>
                <input
                  type="text"
                  value={formData.hero_badge1 || ""}
                  onChange={(e) => handleFieldChange("hero_badge1", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Tagline SLA (Badge 2)</label>
                <input
                  type="text"
                  value={formData.hero_badge2 || ""}
                  onChange={(e) => handleFieldChange("hero_badge2", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Tagline Delivery (Badge 3)</label>
                <input
                  type="text"
                  value={formData.hero_badge3 || ""}
                  onChange={(e) => handleFieldChange("hero_badge3", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Label Tombol Utama Hero</label>
                <input
                  type="text"
                  value={formData.hero_cta_primary || ""}
                  onChange={(e) => handleFieldChange("hero_cta_primary", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Label Tombol Sekunder Hero</label>
                <input
                  type="text"
                  value={formData.hero_cta_secondary || ""}
                  onChange={(e) => handleFieldChange("hero_cta_secondary", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STORE INFO */}
        {activeTab === "store" && (
          <div className="space-y-4 font-sans">
            <span className="block text-[10px] font-orbitron font-bold text-accent-primary uppercase tracking-widest leading-none mb-3">
              // STORE & SOCIAL MEDIA CONFIG
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Nama Toko *</label>
                <input
                  type="text"
                  required
                  value={formData.store_name || ""}
                  onChange={(e) => handleFieldChange("store_name", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Email Toko *</label>
                <input
                  type="email"
                  required
                  value={formData.store_email || ""}
                  onChange={(e) => handleFieldChange("store_email", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">WhatsApp CS (62....) *</label>
                <input
                  type="text"
                  required
                  value={formData.store_wa || ""}
                  onChange={(e) => handleFieldChange("store_wa", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-mono"
                />
                <span className="block text-[8px] text-cyber-muted mt-1 uppercase">Tanpa karakter "+" atau spasi</span>
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Slogan / Footer Deskripsi</label>
                <input
                  type="text"
                  value={formData.footer_desc || ""}
                  onChange={(e) => handleFieldChange("footer_desc", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="block text-cyber-muted text-[10px] font-sans uppercase mb-1.5">Instagram URL</label>
                <input
                  type="text"
                  value={formData.ig_url || ""}
                  onChange={(e) => handleFieldChange("ig_url", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-sans uppercase mb-1.5">TikTok URL</label>
                <input
                  type="text"
                  value={formData.tiktok_url || ""}
                  onChange={(e) => handleFieldChange("tiktok_url", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-sans uppercase mb-1.5">Facebook URL</label>
                <input
                  type="text"
                  value={formData.fb_url || ""}
                  onChange={(e) => handleFieldChange("fb_url", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS CARD CREDENTIALS */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <span className="block text-[10px] font-orbitron font-bold text-accent-primary uppercase tracking-widest leading-none mb-3">
              // BANK ACCOUNTS & DIGITAL QRIS CONFIG
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Nama Bank Pembayaran</label>
                <input
                  type="text"
                  value={formData.bank_name || ""}
                  onChange={(e) => handleFieldChange("bank_name", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Nomor Rekening Bank</label>
                <input
                  type="text"
                  value={formData.bank_number || ""}
                  onChange={(e) => handleFieldChange("bank_number", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Atas Nama Pemilik</label>
                <input
                  type="text"
                  value={formData.bank_holder || ""}
                  onChange={(e) => handleFieldChange("bank_holder", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">QRIS Image URL</label>
              <input
                type="text"
                value={formData.qris_url || ""}
                onChange={(e) => handleFieldChange("qris_url", e.target.value)}
                placeholder="https://example.com/qris.jpg"
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-mono"
              />
              <span className="block text-[8px] text-cyber-muted mt-1 uppercase">Link gambar QRIS yang bisa di-scan e-wallet pembeli</span>
            </div>
          </div>
        )}

        {/* TAB 4: STEPS SCHEMAS */}
        {activeTab === "steps" && (
          <div className="space-y-4">
            <span className="block text-[10px] font-orbitron font-bold text-accent-primary uppercase tracking-widest leading-none mb-3">
              // 3-STEP INSTRUCTIONAL DIAGRAM
            </span>

            {/* Step 1 */}
            <div className="border-b border-cyber-muted/10 pb-4">
              <span className="block text-[10px] font-orbitron font-bold text-accent-secondary uppercase mb-2">Step 1</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyber-muted text-[10px] font-mono mb-1">Judul Langkah 1</label>
                  <input
                    type="text"
                    value={formData.how_step1_title || ""}
                    onChange={(e) => handleFieldChange("how_step1_title", e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted text-[10px] font-mono mb-1">Deskripsi Langkah 1</label>
                  <input
                    type="text"
                    value={formData.how_step1_desc || ""}
                    onChange={(e) => handleFieldChange("how_step1_desc", e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border-b border-cyber-muted/10 pb-4 font-sans">
              <span className="block text-[10px] font-orbitron font-bold text-accent-secondary uppercase mb-2">Step 2</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyber-muted text-[10px] font-mono mb-1">Judul Langkah 2</label>
                  <input
                    type="text"
                    value={formData.how_step2_title || ""}
                    onChange={(e) => handleFieldChange("how_step2_title", e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted text-[10px] font-mono mb-1">Deskripsi Langkah 2</label>
                  <input
                    type="text"
                    value={formData.how_step2_desc || ""}
                    onChange={(e) => handleFieldChange("how_step2_desc", e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <span className="block text-[10px] font-orbitron font-bold text-accent-secondary uppercase mb-2">Step 3</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyber-muted text-[10px] font-mono mb-1">Judul Langkah 3</label>
                  <input
                    type="text"
                    value={formData.how_step3_title || ""}
                    onChange={(e) => handleFieldChange("how_step3_title", e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-cyber-muted text-[10px] font-mono mb-1">Deskripsi Langkah 3</label>
                  <input
                    type="text"
                    value={formData.how_step3_desc || ""}
                    onChange={(e) => handleFieldChange("how_step3_desc", e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STATS COUNTER BAR */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <span className="block text-[10px] font-orbitron font-bold text-accent-primary uppercase tracking-widest leading-none mb-3">
              // HERO STATS COUNTER BAR CONFIG
            </span>
            <p className="text-[11px] text-cyber-muted font-sans">
              Isi angka-angka statistik yang tampil di bawah hero section landing page Anda. Gunakan format singkat seperti "4.5K", "99.2%", "3 YRS".
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Total Pembeli Terlayani</label>
                <input
                  type="text"
                  placeholder="Contoh: 4.5K"
                  value={formData.stats_buyers_count || ""}
                  onChange={(e) => handleFieldChange("stats_buyers_count", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-mono"
                />
                <span className="block text-[8px] text-cyber-muted mt-1 uppercase">Ditampilkan sebagai angka pembeli aktif di bar</span>
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Total Produk Tersedia</label>
                <input
                  type="text"
                  placeholder="Contoh: 48+"
                  value={formData.stats_products_count || ""}
                  onChange={(e) => handleFieldChange("stats_products_count", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-mono"
                />
                <span className="block text-[8px] text-cyber-muted mt-1 uppercase">Jumlah varian produk sewa aktif</span>
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Tingkat Kepuasan Pelanggan (%)</label>
                <input
                  type="text"
                  placeholder="Contoh: 99.2%"
                  value={formData.stats_satisfaction_percent || ""}
                  onChange={(e) => handleFieldChange("stats_satisfaction_percent", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-mono"
                />
                <span className="block text-[8px] text-cyber-muted mt-1 uppercase">Rating kepuasan berdasarkan ulasan masuk</span>
              </div>

              <div>
                <label className="block text-cyber-muted text-[10px] font-mono uppercase mb-1.5">Tahun Operasional Toko</label>
                <input
                  type="text"
                  placeholder="Contoh: 3 YRS"
                  value={formData.stats_years_establishing || ""}
                  onChange={(e) => handleFieldChange("stats_years_establishing", e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 text-xs text-white font-mono"
                />
                <span className="block text-[8px] text-cyber-muted mt-1 uppercase">Lama toko beroperasi melayani pelanggan</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="pt-4 border-t border-cyber-muted/15 text-right">
          <button
            type="submit"
            className="px-5 py-2.5 bg-accent-primary text-black hover:bg-white transition-all text-sm font-orbitron font-black tracking-widest cursor-pointer rounded-xs flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>APPLY CMS CHANGES</span>
          </button>
        </div>
      </form>
    </div>
  );
};
