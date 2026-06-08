import React, { useState, useEffect } from "react";
import { Settings, Save, Bell } from "lucide-react";

export const WhatsAppAutomationView: React.FC<{ token: string }> = ({ token }) => {
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
          autoOrderCreated: settings.autoOrderCreated,
          autoPaymentSuccess: settings.autoPaymentSuccess,
          autoOrderCompleted: settings.autoOrderCompleted,
          autoWarrantyUpdate: settings.autoWarrantyUpdate,
          autoSupportTicketReply: settings.autoSupportTicketReply,
          autoPaymentReminder: settings.autoPaymentReminder,
          paymentReminderDelayHours: settings.paymentReminderDelayHours
        })
      });
      alert("Automation Settings Saved!");
    } finally { setSaving(false); }
  };

  if (loading) return null;

  const toggles = [
    { key: "autoOrderCreated", label: "Order Created", desc: "Kirim pesan saat order baru berhasil dibuat." },
    { key: "autoPaymentSuccess", label: "Payment Success", desc: "Kirim pesan saat pembayaran terkonfirmasi." },
    { key: "autoOrderCompleted", label: "Order Completed", desc: "Kirim pesan saat produk telah dikirimkan." },
    { key: "autoWarrantyUpdate", label: "Warranty Update", desc: "Kirim pesan saat status garansi diubah." },
    { key: "autoSupportTicketReply", label: "Support Ticket Reply", desc: "Kirim pesan saat admin membalas tiket." },
  ];

  return (
    <div className="space-y-8 font-sans text-left">
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // AUTO-RESPONDER ENGINE
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Aktifkan pemicu notifikasi WhatsApp otomatis ke pengguna
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-cyber-card border border-accent-primary/20 p-6 rounded-xs space-y-4">
        
        {toggles.map(t => (
          <div key={t.key} className="flex items-center justify-between p-4 bg-cyber-bg/50 border border-cyber-muted/10">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-accent-secondary" />
              <div>
                <h3 className="text-white font-bold text-sm uppercase font-orbitron">{t.label}</h3>
                <p className="text-[10px] text-cyber-muted mt-0.5">{t.desc}</p>
              </div>
            </div>
            <input type="checkbox" checked={settings[t.key] || false} onChange={e => handleChange(t.key, e.target.checked)} className="w-5 h-5 accent-accent-primary cursor-pointer" />
          </div>
        ))}

        <div className="p-4 bg-cyber-bg/50 border border-cyber-muted/10 mt-6 border-t-2 border-t-accent-secondary/50">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-accent-secondary font-bold text-sm uppercase font-orbitron flex items-center gap-2">
                  Payment Reminder
                </h3>
                <p className="text-[10px] text-cyber-muted mt-0.5">Kirim pengingat jika belum dibayar.</p>
              </div>
              <input type="checkbox" checked={settings.autoPaymentReminder || false} onChange={e => handleChange("autoPaymentReminder", e.target.checked)} className="w-5 h-5 accent-accent-primary cursor-pointer" />
          </div>
          
          {settings.autoPaymentReminder && (
            <div className="mt-3">
              <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1.5">Reminder Delay Configuration</label>
              <select value={settings.paymentReminderDelayHours || 1} onChange={e => handleChange("paymentReminderDelayHours", parseFloat(e.target.value))} className="w-full px-3 py-2 bg-cyber-surface border border-accent-secondary/25 text-white text-xs">
                <option value={0.25}>15 Menit</option>
                <option value={0.5}>30 Menit</option>
                <option value={1}>1 Jam</option>
                <option value={6}>6 Jam</option>
                <option value={24}>24 Jam</option>
              </select>
            </div>
          )}
        </div>

        <div className="text-right pt-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-accent-primary text-black hover:bg-white text-sm font-orbitron font-black tracking-widest rounded-xs inline-flex gap-2 items-center">
            <Save className="w-4 h-4" /> {saving ? "SAVING..." : "SAVE AUTOMATIONS"}
          </button>
        </div>
      </form>
    </div>
  );
};
