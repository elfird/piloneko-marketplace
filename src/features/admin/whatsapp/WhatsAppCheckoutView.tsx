import React, { useState, useEffect } from "react";
import { CreditCard, Save } from "lucide-react";

export const WhatsAppCheckoutView: React.FC<{ token: string }> = ({ token }) => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/settings", { headers: { Authorization: `Bearer ${token}` } });
      setSettings(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleChange = (field: string, value: any) => setSettings(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/admin/whatsapp/settings", {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          enableWhatsAppCheckout: settings.enableWhatsAppCheckout,
          enableMidtransCheckout: settings.enableMidtransCheckout,
          defaultCheckoutMethod: settings.defaultCheckoutMethod
        })
      });
      alert("Checkout Settings Saved!");
    } finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <div className="space-y-8 font-sans text-left">
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // CHECKOUT CONFIGURATION
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Prioritas gateway pembayaran untuk pengguna
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-cyber-card border border-accent-primary/20 p-6 rounded-xs space-y-6">
        <div className="flex items-center justify-between p-4 bg-cyber-bg/50 border border-cyber-muted/10">
          <div>
            <h3 className="text-white font-bold text-sm uppercase font-orbitron">Enable WhatsApp Checkout</h3>
            <p className="text-[10px] text-cyber-muted mt-1">Izinkan pembeli memesan via manual WhatsApp.</p>
          </div>
          <input type="checkbox" checked={settings.enableWhatsAppCheckout} onChange={e => handleChange("enableWhatsAppCheckout", e.target.checked)} className="w-5 h-5 accent-accent-primary" />
        </div>

        <div className="flex items-center justify-between p-4 bg-cyber-bg/50 border border-cyber-muted/10">
          <div>
            <h3 className="text-white font-bold text-sm uppercase font-orbitron">Enable Midtrans Checkout</h3>
            <p className="text-[10px] text-cyber-muted mt-1">Izinkan pembeli menggunakan Auto-payment Midtrans.</p>
          </div>
          <input type="checkbox" checked={settings.enableMidtransCheckout} onChange={e => handleChange("enableMidtransCheckout", e.target.checked)} className="w-5 h-5 accent-accent-primary" />
        </div>

        <div className="p-4 bg-cyber-bg/50 border border-cyber-muted/10">
          <h3 className="text-white font-bold text-sm uppercase font-orbitron mb-3">Default Checkout Method</h3>
          <select value={settings.defaultCheckoutMethod} onChange={e => handleChange("defaultCheckoutMethod", e.target.value)} className="w-full px-3 py-2 bg-cyber-surface border border-accent-primary/25 text-white text-xs">
            <option value="MIDTRANS">Auto Payment (Midtrans)</option>
            <option value="WHATSAPP">Manual WhatsApp</option>
          </select>
        </div>

        <div className="text-right">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-accent-primary text-black hover:bg-white text-sm font-orbitron font-black tracking-widest rounded-xs inline-flex gap-2 items-center">
            <Save className="w-4 h-4" /> {saving ? "SAVING..." : "SAVE CONFIGURATION"}
          </button>
        </div>
      </form>
    </div>
  );
};
