import React, { useState, useEffect } from "react";
import { Sparkles, Save, RotateCcw } from "lucide-react";

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

      if (prim) setAccentPrimary(prim.value);
      if (sec) setAccentSecondary(sec.value);
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
