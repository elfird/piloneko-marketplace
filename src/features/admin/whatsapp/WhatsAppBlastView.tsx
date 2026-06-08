import React, { useState, useEffect } from "react";
import { Send, Plus, Users, Clock, History } from "lucide-react";

export const WhatsAppBlastView: React.FC<{ token: string }> = ({ token }) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: "",
    targetCustomer: "ALL",
    specificNumbers: "",
    customMessage: ""
  });

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/campaigns", { headers: { Authorization: `Bearer ${token}` } });
      setCampaigns(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specificNumbers = formData.specificNumbers.split(',').map(n => n.trim()).filter(n => n);
      await fetch("/api/admin/whatsapp/campaigns", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, specificNumbers })
      });
      setShowModal(false);
      fetchCampaigns();
    } catch (err) { alert("Failed to create campaign"); }
  };

  const handleSend = async (id: string) => {
    if (!confirm("Start sending this campaign?")) return;
    try {
      await fetch(`/api/admin/whatsapp/campaigns/${id}/send`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      fetchCampaigns();
    } catch (err) { alert("Failed to send campaign"); }
  };

  if (loading) return null;

  return (
    <div className="space-y-8 font-sans text-left">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
            // CAMPAIGN BLAST
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
            Kirim promosi massal ke pengguna
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-accent-secondary text-white font-orbitron text-xs tracking-wider rounded-xs flex items-center gap-2 hover:bg-white hover:text-black transition-all">
          <Plus className="w-4 h-4" /> NEW CAMPAIGN
        </button>
      </div>

      <div className="bg-cyber-card border border-accent-primary/20 rounded-xs overflow-hidden">
        <table className="w-full text-left text-xs text-cyber-muted font-mono">
          <thead className="bg-cyber-bg border-b border-accent-primary/20 text-white">
            <tr>
              <th className="py-3 px-4 uppercase font-bold tracking-wider">Campaign</th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider">Target</th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider">Status</th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider">Success</th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider">Failed</th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} className="border-b border-cyber-muted/10 hover:bg-cyber-surface/30">
                <td className="py-3 px-4 text-white font-sans">{c.campaignName}</td>
                <td className="py-3 px-4">{c.targetCustomer}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-sm text-[9px] ${c.status === 'COMPLETED' ? 'bg-[#25D366]/20 text-[#25D366]' : c.status === 'DRAFT' ? 'bg-cyber-muted/20 text-cyber-muted' : 'bg-accent-primary/20 text-accent-primary'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#25D366]">{c.successCount}</td>
                <td className="py-3 px-4 text-red-500">{c.failedCount}</td>
                <td className="py-3 px-4 text-right">
                  {c.status === "DRAFT" && (
                    <button onClick={() => handleSend(c.id)} className="px-3 py-1 bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-black rounded-xs transition-colors flex items-center gap-1 ml-auto">
                      <Send className="w-3 h-3" /> SEND NOW
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center">No campaigns found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-[#0F0F1A] border border-accent-secondary/50 rounded-xs p-6 max-w-lg w-full space-y-4">
            <h2 className="text-lg font-orbitron text-white uppercase tracking-widest">Create Campaign</h2>
            
            <div>
              <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1">Campaign Name</label>
              <input required value={formData.campaignName} onChange={e => setFormData(p => ({ ...p, campaignName: e.target.value }))} className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/30 text-white text-xs" />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1">Target Customer</label>
              <select value={formData.targetCustomer} onChange={e => setFormData(p => ({ ...p, targetCustomer: e.target.value }))} className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/30 text-white text-xs">
                <option value="ALL">All Customers</option>
                <option value="HAS_ORDER">Has Order</option>
                <option value="SPECIFIC">Specific Numbers</option>
              </select>
            </div>

            {formData.targetCustomer === "SPECIFIC" && (
              <div>
                <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1">Specific Numbers (Comma Separated)</label>
                <input required value={formData.specificNumbers} onChange={e => setFormData(p => ({ ...p, specificNumbers: e.target.value }))} className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/30 text-white text-xs" />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1">Message Template</label>
              <textarea required rows={4} value={formData.customMessage} onChange={e => setFormData(p => ({ ...p, customMessage: e.target.value }))} className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/30 text-white text-xs" />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-cyber-muted hover:text-white text-xs font-mono uppercase">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-accent-secondary text-white hover:bg-white hover:text-black text-xs font-orbitron font-bold uppercase rounded-xs">Save Draft</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
