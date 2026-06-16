import React, { useState, useEffect } from "react";
import { RefreshCw, Save } from "lucide-react";

interface Props { token: string; }

export const DigiflazzSyncView: React.FC<Props> = ({ token }) => {
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/admin/topup/digiflazz/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setUsername(d.username || "");
        setApiKey(d.apiKey || "");
        setIsActive(d.isActive !== false);
      });
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/topup/digiflazz/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username, apiKey, isActive })
    });
    alert("Settings saved!");
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/topup/digiflazz/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal sinkronisasi");
      alert(`Sync Complete! Synced: ${data.syncedCount}`);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-orbitron font-black text-2xl text-white tracking-widest text-[#BF00FF] mb-1 uppercase">
        // DIGIFLAZZ INTEGRATION
      </h1>

      <form onSubmit={handleSave} className="space-y-4 max-w-md bg-cyber-card p-6 border border-cyber-muted/20">
        <div className="flex items-center justify-between p-4 border border-cyber-muted/20 bg-cyber-surface/30 mb-4">
          <div>
            <span className="block text-xs font-orbitron font-bold text-white uppercase tracking-widest">
              Status Fitur Game Topup
            </span>
            <span className="text-[10px] text-cyber-muted font-mono">
              {isActive ? "✅ AKTIF — Fitur Topup Game berjalan normal" : "⏸️ NONAKTIF — Fitur disembunyikan sepenuhnya"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(prev => !prev)}
            className="cursor-pointer"
            title="Toggle Fitur"
          >
            {isActive ? (
              <svg className="w-8 h-8 text-[#BF00FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            ) : (
              <svg className="w-8 h-8 text-cyber-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            )}
          </button>
        </div>

        <div>
          <label className="block text-xs font-mono text-[#BF00FF] mb-1">Digiflazz Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-cyber-bg border border-[#BF00FF]/30 p-2 text-white" />
        </div>
        <div>
          <label className="block text-xs font-mono text-[#BF00FF] mb-1">Digiflazz Production API Key</label>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-cyber-bg border border-[#BF00FF]/30 p-2 text-white" />
        </div>
        <button type="submit" className="px-4 py-2 bg-[#BF00FF]/20 text-[#BF00FF] border border-[#BF00FF] flex items-center gap-2">
          <Save className="w-4 h-4"/> SAVE SETTINGS
        </button>
      </form>

      <div className="p-6 bg-cyber-surface/30 border border-[#BF00FF]/20 mt-8 max-w-md">
        <h3 className="text-white font-bold mb-2">Sync Catalog Database</h3>
        <p className="text-xs text-cyber-muted mb-4">Fetches all prepaid products from Digiflazz and maps them to your active Games.</p>
        <button onClick={handleSync} disabled={syncing} className="px-4 py-2 bg-[#BF00FF] text-white font-bold flex items-center gap-2 w-full justify-center">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> {syncing ? 'SYNCING...' : 'SYNC PRODUCTS NOW'}
        </button>
      </div>
    </div>
  );
};
