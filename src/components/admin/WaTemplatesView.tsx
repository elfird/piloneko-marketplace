import React, { useState, useEffect } from "react";
import { MessageSquare, Save, AlertCircle } from "lucide-react";

interface WaTemplatesProps {
  token: string;
}

export const WaTemplatesView: React.FC<WaTemplatesProps> = ({ token }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [token]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/wa-templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil template pesan WA");
      const list = await res.json();
      setTemplates(list);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, text: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, textTemplate: text } : t))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const res = await fetch("/api/admin/wa-templates/batch", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ templates }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan update template");
      alert("Seluruh Template Pesan WhatsApp Berhasil Disimpan!");
      fetchTemplates();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-cyber-muted animate-pulse">
        CALIBRATING WHATSAPP ROUTING TEMPLATES...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Title Header */}
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // MESSAGING TEMPLATE ENGINE
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Modifikasi template pesan keluar WhatsApp pelunasan, pengiriman, dan tanya-tanya cs
        </p>
      </div>

      <div className="bg-cyber-surface/60 border border-cyber-muted/10 p-5 rounded-xs flex gap-3 text-xs items-start">
        <AlertCircle className="w-5 h-5 text-accent-primary shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1 text-cyber-muted">
          <p className="font-orbitron font-bold text-white uppercase text-[10px]">Pemberitahuan Syntax Placeholders:</p>
          <p className="font-sans leading-relaxed">
            Anda dapat menyisipkan kode dynamic berikut untuk diganti otomatis di sistem:
          </p>
          <div className="flex flex-wrap gap-2.5 mt-1.5 font-mono text-[9px] text-[#00F5FF]">
            <span>{"{buyerName}"} = Nama Pembeli</span>
            <span>{"{refCode}"} = Kode Transaksi</span>
            <span>{"{productName}"} = Judul Produk</span>
            <span>{"{packageName}"} = Nama Paket</span>
            <span>{"{price}"} = Nominal Tagihan</span>
            <span>{"{gameDetails}"} = Kredensial User ID game</span>
          </div>
        </div>
      </div>

      {/* Main Form list */}
      <form onSubmit={handleSave} className="space-y-6">
        {templates.map((tmpl) => (
          <div key={tmpl.id} className="p-5 bg-cyber-card border border-accent-primary/10 rounded-xs flex flex-col md:flex-row gap-5">
            <div className="md:w-1/4 shrink-0 font-sans text-xs">
              <span className="block text-accent-secondary font-orbitron font-extrabold text-[10px] tracking-widest uppercase mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-accent-secondary animate-pulse" />
                <span>[{tmpl.code}]</span>
              </span>
              <p className="text-white font-bold mb-1 mt-2.5 uppercase">{tmpl.label}</p>
              <p className="text-cyber-muted leading-tight mt-1 text-[11px] font-sans">
                Digunakan saat pembeli klik aksi pemicu di web.
              </p>
            </div>

            <div className="flex-1">
              <textarea
                required
                rows={5}
                value={tmpl.textTemplate}
                onChange={(e) => handleChange(tmpl.id, e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
            </div>
          </div>
        ))}

        {/* Global form actions */}
        <div className="text-right pt-2 pb-10">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-accent-primary text-black hover:bg-white transition-all text-sm font-orbitron font-black tracking-widest cursor-pointer rounded-xs flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{submitting ? "STORING SCRIPT..." : "SAVE WHATSAPP SCRIPTS"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
