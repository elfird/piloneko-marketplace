import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Save, RotateCcw, ImageIcon, Upload, X } from "lucide-react";

interface ThemeSettingsViewProps {
  token: string;
  onThemeSaved: () => void;
}

export const ThemeSettingsView: React.FC<ThemeSettingsViewProps> = ({
  token,
  onThemeSaved,
}) => {
  const [accentPrimary, setAccentPrimary] = useState("#00F5FF");
  const [accentSecondary, setAccentSecondary] = useState("#BF00FF");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const presets = [
    { name: "Neon Cyan (Default)", primary: "#00F5FF", secondary: "#BF00FF" },
    { name: "Toxic Matrix Green", primary: "#39FF14", secondary: "#14FF3C" },
    { name: "Blood Ruby Red", primary: "#FF007F", secondary: "#800020" },
    { name: "Gold Hacker", primary: "#FFD700", secondary: "#DAA520" },
    { name: "Frostbite Blue", primary: "#00E5FF", secondary: "#0040FF" },
  ];

  useEffect(() => {
    fetchThemeConfig();
  }, [token]);

  const fetchThemeConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/site-content", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal memuat warna tema");
      const list = await res.json();
      
      const prim = list.find((l: any) => l.key === "theme_accent_primary");
      const sec = list.find((l: any) => l.key === "theme_accent_secondary");
      const logo = list.find((l: any) => l.key === "store_logo_url");

      if (prim) setAccentPrimary(prim.value);
      if (sec) setAccentSecondary(sec.value);
      if (logo) setLogoUrl(logo.value);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (prim: string, sec: string) => {
    setAccentPrimary(prim);
    setAccentSecondary(sec);
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
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
            { key: "theme_accent_primary", value: accentPrimary },
            { key: "theme_accent_secondary", value: accentSecondary },
          ],
        }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate tema");

      alert("Skema Warna Tema Cyberpunk berhasil disimpan!");
      onThemeSaved();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUploadLogo = (file: File) => {
    if (!file) return;
    setUploadError("");

    // Validasi tipe file
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!allowed.includes(file.type)) {
      setUploadError("Format tidak didukung. Gunakan JPG, PNG, WEBP, SVG, atau GIF.");
      return;
    }

    // Validasi ukuran (maks 5MB file asli)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setLogoUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const originalDataUrl = e.target?.result as string;

      // Compress via Canvas — resize max 500x200, quality 85% JPEG
      const img = new Image();
      img.onload = async () => {
        const MAX_W = 500;
        const MAX_H = 200;
        let { width, height } = img;

        // Scale down jika terlalu besar
        if (width > MAX_W || height > MAX_H) {
          const ratio = Math.min(MAX_W / width, MAX_H / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // Export sebagai JPEG terkompresi (PNG bisa besar)
        const compressed = canvas.toDataURL("image/png");

        try {
          const res = await fetch("/api/admin/site-content/batch", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              updates: [{ key: "store_logo_url", value: compressed, type: "IMAGE" }],
            }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Gagal menyimpan logo ke database");
          }
          setLogoUrl(compressed);
          setLogoSaved(true);
          setTimeout(() => setLogoSaved(false), 3000);
        } catch (err: any) {
          setUploadError(err.message);
        } finally {
          setLogoUploading(false);
        }
      };
      img.onerror = () => {
        setUploadError("Gagal memuat gambar. Pastikan file valid.");
        setLogoUploading(false);
      };
      img.src = originalDataUrl;
    };
    reader.onerror = () => {
      setUploadError("Gagal membaca file. Coba lagi.");
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    try {
      await fetch("/api/admin/site-content/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updates: [{ key: "store_logo_url", value: "" }] }),
      });
      setLogoUrl("");
      setUploadError("");
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-cyber-muted animate-pulse">
        CALIBRATING LASER SPECTRUM INTERFACES...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-sans">
      {/* View Header */}
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // CYBER THEME RE-MAPPER
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Sesuaikan skema warna aksen neon utama, pendar kecerahan (glow), dan tombol pemicu visual web
        </p>
      </div>

      {/* ===== LOGO SECTION ===== */}
      <div className="border border-accent-primary/20 bg-cyber-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-accent-primary" />
          <span className="font-orbitron font-bold text-xs text-accent-primary uppercase tracking-widest">
            LOGO TOKO
          </span>
        </div>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
          Upload file logo. Akan tampil di Navbar web. Maks 5MB · PNG/JPG/SVG/WEBP/GIF
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Upload Zone */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadLogo(file);
                e.target.value = "";
              }}
            />

            {/* Drag & Drop Zone */}
            <div
              onClick={() => !logoUploading && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleUploadLogo(file);
              }}
              className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xs p-8 cursor-pointer transition-all select-none ${
                dragOver
                  ? "border-accent-primary bg-accent-primary/10"
                  : "border-accent-primary/30 bg-cyber-bg hover:border-accent-primary/60 hover:bg-accent-primary/5"
              }`}
            >
              {logoUploading ? (
                <>
                  <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-accent-primary animate-pulse">MEMPROSES GAMBAR...</span>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-accent-primary/50" />
                  <div className="text-center">
                    <p className="text-xs font-orbitron font-bold text-white">Klik atau drag file ke sini</p>
                    <p className="text-[10px] text-cyber-muted font-mono mt-1">PNG · JPG · SVG · WEBP · GIF · maks 5MB (otomatis dikompres)</p>
                  </div>
                </>
              )}
            </div>

            {/* Error message */}
            {uploadError && (
              <p className="text-[10px] text-red-400 font-mono bg-red-500/10 border border-red-500/20 px-3 py-2">
                ⚠ {uploadError}
              </p>
            )}

            {/* Success badge */}
            {logoSaved && (
              <p className="text-[10px] text-green-400 font-mono bg-green-500/10 border border-green-500/20 px-3 py-2">
                ✓ Logo berhasil diupload dan disimpan!
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="border border-cyber-muted/15 bg-cyber-bg p-4 flex flex-col items-center justify-center gap-3 min-h-[180px]">
            <span className="text-[9px] font-mono text-cyber-muted uppercase tracking-widest block text-center">
              // PREVIEW NAVBAR
            </span>

            {/* Simulasi Navbar */}
            <div className="w-full bg-[#0A0A0F]/90 border border-accent-primary/20 px-4 py-2.5 flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-9 max-w-[140px] object-contain"
                />
              ) : (
                <span className="font-orbitron font-black text-sm text-accent-primary tracking-widest">
                  [PILONEKO]
                </span>
              )}
              <div className="h-[1px] flex-1 bg-accent-primary/20" />
              <span className="text-[9px] font-mono text-cyber-muted">NAVBAR</span>
            </div>

            {logoUrl ? (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/40 text-red-400 text-[10px] font-orbitron font-bold hover:bg-red-500/10 transition-all cursor-pointer rounded-xs"
              >
                <X className="w-3 h-3" /> HAPUS LOGO
              </button>
            ) : (
              <span className="text-[9px] text-cyber-muted font-mono text-center">
                Belum ada logo — teks nama toko digunakan
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Color picker form panel */}
        <form onSubmit={handleSaveTheme} className="md:col-span-5 bg-cyber-card border border-accent-secondary/20 p-6 space-y-6">
          <span className="block text-xs font-orbitron font-bold text-accent-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent-secondary animate-pulse" />
            <span>CUSTOM SPECTRUM</span>
          </span>

          <div className="space-y-4">
            {/* Primary Accent */}
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xs border border-cyber-muted/20 overflow-hidden relative shadow-inner shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={accentPrimary}
                  onChange={(e) => setAccentPrimary(e.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 scale-125 cursor-pointer bg-transparent"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-orbitron text-white uppercase tracking-wider font-semibold mb-1">
                  Accent Primary (Ex: Neon Cyan)
                </label>
                <input
                  type="text"
                  value={accentPrimary}
                  onChange={(e) => setAccentPrimary(e.target.value)}
                  placeholder="#00F5FF"
                  className="w-full px-3 py-1.5 bg-cyber-bg border border-accent-primary/20 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Secondary Accent */}
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xs border border-cyber-muted/20 overflow-hidden relative shadow-inner shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={accentSecondary}
                  onChange={(e) => setAccentSecondary(e.target.value)}
                  className="absolute inset-0 w-full h-full p-0 border-0 scale-125 cursor-pointer bg-transparent"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-orbitron text-white uppercase tracking-wider font-semibold mb-1">
                  Accent Secondary (Ex: Violet)
                </label>
                <input
                  type="text"
                  value={accentSecondary}
                  onChange={(e) => setAccentSecondary(e.target.value)}
                  placeholder="#BF00FF"
                  className="w-full px-3 py-1.5 bg-cyber-bg border border-accent-secondary/20 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-accent-secondary/15 text-accent-secondary border border-accent-secondary hover:bg-accent-secondary hover:text-white transition-all text-xs font-orbitron font-bold cursor-pointer rounded-xs flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>SAVE THEME COLOR</span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("#00F5FF", "#BF00FF")}
              className="p-2 border border-cyber-muted/20 bg-cyber-bg text-cyber-muted hover:text-white transition-all cursor-pointer rounded-xs"
              title="Reset ke Default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Presets and real-time simulator cards */}
        <div className="md:col-span-7 space-y-6">
          {/* Presets selection */}
          <div className="border border-cyber-muted/10 bg-[#0F0F1A] p-5 rounded-xs text-left">
            <span className="block text-[10px] font-orbitron font-bold text-cyber-muted uppercase tracking-widest mb-3.5">
              // READY-TO-USE PRESETS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {presets.map((pre) => (
                <button
                  key={pre.name}
                  type="button"
                  onClick={() => applyPreset(pre.primary, pre.secondary)}
                  className="px-4 py-3 bg-cyber-surface/60 border border-cyber-muted/15 text-xs text-left flex items-center justify-between cursor-pointer hover:border-accent-primary transition-all rounded-xs"
                >
                  <span className="font-orbitron font-bold text-white tracking-wide">{pre.name}</span>
                  <div className="flex gap-1">
                    <span className="w-4.5 h-4.5 rounded-full inline-block" style={{ backgroundColor: pre.primary }} />
                    <span className="w-4.5 h-4.5 rounded-full inline-block" style={{ backgroundColor: pre.secondary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Dashboard box */}
          <div className="border border-cyber-muted/10 bg-cyber-bg p-5 rounded-xs text-left space-y-4">
            <span className="block text-[10px] font-orbitron font-bold text-cyber-muted uppercase tracking-widest leading-none">
              // SPECTRAL SIMULATION PREVIEW
            </span>

            <div className="grid grid-cols-2 gap-4">
              {/* Primary mockup button */}
              <div className="border border-cyber-muted/10 p-4 bg-cyber-surface/40 flex flex-col justify-content-center items-center">
                <span className="text-[8px] text-cyber-muted block uppercase font-mono mb-2">Primary Glow Button</span>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="px-4 py-1.5 text-[9px] font-mono tracking-widest border font-bold pointer-events-none rounded-xs select-none"
                  style={{
                    borderColor: accentPrimary,
                    color: accentPrimary,
                    boxShadow: `0 0 10px ${accentPrimary}40`,
                  }}
                >
                  BUY INSTANT
                </button>
              </div>

              {/* Secondary mockup button */}
              <div className="border border-cyber-muted/10 p-4 bg-cyber-surface/40 flex flex-col justify-content-center items-center">
                <span className="text-[8px] text-cyber-muted block uppercase font-mono mb-2">Secondary Glow Button</span>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="px-4 py-1.5 text-[9px] font-mono tracking-widest border font-bold pointer-events-none rounded-xs select-none"
                  style={{
                    borderColor: accentSecondary,
                    color: accentSecondary,
                    boxShadow: `0 0 10px ${accentSecondary}40`,
                  }}
                >
                  FLASH SALE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
