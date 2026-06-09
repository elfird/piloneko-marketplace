import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Key, X, Save } from "lucide-react";

interface Props { token: string; }

export const ManageGamesView: React.FC<Props> = ({ token }) => {
  const [games, setGames] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  
  const [editingGame, setEditingGame] = useState<any>(null);
  const [selectedGameForFields, setSelectedGameForFields] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");

  const [fieldName, setFieldName] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isRequired, setIsRequired] = useState(true);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/admin/topup/games", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setGames(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFields = async (gameId: string) => {
    try {
      const res = await fetch(`/api/admin/topup/games/${gameId}/fields`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFields(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchGames(); }, [token]);

  const openAddModal = () => {
    setEditingGame(null);
    setName("");
    setSlug("");
    setLogo("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (g: any) => {
    setEditingGame(g);
    setName(g.name);
    setSlug(g.slug);
    setLogo(g.logo || "");
    setDescription(g.description || "");
    setIsModalOpen(true);
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingGame ? `/api/admin/topup/games/${editingGame._id}` : "/api/admin/topup/games";
    const method = editingGame ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, slug, logo, description, status: true })
    });
    
    setIsModalOpen(false);
    fetchGames();
  };

  const handleDeleteGame = async (id: string) => {
    if (!window.confirm("Hapus game ini beserta field & produknya?")) return;
    await fetch(`/api/admin/topup/games/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchGames();
  };

  // --- FIELDS MANAGEMENT ---
  const openFieldsModal = (g: any) => {
    setSelectedGameForFields(g);
    fetchFields(g._id);
    setFieldName("");
    setFieldLabel("");
    setPlaceholder("");
    setIsRequired(true);
    setIsFieldModalOpen(true);
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameForFields) return;

    await fetch(`/api/admin/topup/games/${selectedGameForFields._id}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fieldName, fieldLabel, placeholder, required: isRequired })
    });
    
    setFieldName("");
    setFieldLabel("");
    setPlaceholder("");
    fetchFields(selectedGameForFields._id);
  };

  const handleDeleteField = async (id: string) => {
    await fetch(`/api/admin/topup/fields/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (selectedGameForFields) fetchFields(selectedGameForFields._id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-orbitron font-black text-2xl text-white tracking-widest text-[#BF00FF] mb-1 uppercase">
          // MANAGE GAMES
        </h1>
        <button onClick={openAddModal} className="px-4 py-2 bg-[#BF00FF]/10 text-[#BF00FF] border border-[#BF00FF] hover:bg-[#BF00FF] hover:text-white transition-all text-xs font-orbitron font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> TAMBAH GAME
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map(g => (
          <div key={g._id} className="p-4 bg-cyber-card border border-cyber-muted/20 rounded-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {g.logo && <img src={g.logo} alt="" className="w-10 h-10 rounded border border-[#BF00FF]/50" />}
                <div>
                  <h3 className="text-white font-bold">{g.name}</h3>
                  <code className="text-xs text-cyber-muted block">/{g.slug}</code>
                </div>
              </div>
              <p className="text-xs text-cyber-muted mt-2">{g.description}</p>
            </div>
            <div className="mt-4 flex gap-2 pt-4 border-t border-cyber-muted/10">
              <button onClick={() => openEditModal(g)} className="p-1.5 text-blue-400 border border-blue-400/20 hover:bg-blue-400/10" title="Edit Game"><Edit2 className="w-4 h-4"/></button>
              <button onClick={() => openFieldsModal(g)} className="p-1.5 text-accent-secondary border border-accent-secondary/20 hover:bg-accent-secondary/10" title="Manage Form Inputs"><Key className="w-4 h-4"/></button>
              <button onClick={() => handleDeleteGame(g._id)} className="p-1.5 text-red-500 border border-red-500/20 hover:bg-red-500/10" title="Delete Game"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
        {games.length === 0 && <p className="text-cyber-muted italic">Belum ada game yang dikonfigurasi.</p>}
      </div>

      {/* MODAL GAME */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-cyber-card border border-[#BF00FF]/50 w-full max-w-md p-6 rounded-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-cyber-muted hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-orbitron font-bold text-white mb-4">{editingGame ? "Edit Game" : "Tambah Game"}</h2>
            
            <form onSubmit={handleSaveGame} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cyber-muted mb-1">Nama Game</label>
                <input required type="text" value={name} onChange={e => { setName(e.target.value); if (!editingGame) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')); }} className="w-full bg-cyber-bg border border-cyber-muted/30 p-2 text-white" placeholder="Contoh: Mobile Legends" />
              </div>
              <div>
                <label className="block text-xs font-mono text-cyber-muted mb-1">Slug (URL)</label>
                <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-cyber-bg border border-cyber-muted/30 p-2 text-white" placeholder="contoh: mobile-legends" />
              </div>
              <div>
                <label className="block text-xs font-mono text-cyber-muted mb-1">URL Logo Game (Opsional)</label>
                <input type="text" value={logo} onChange={e => setLogo(e.target.value)} className="w-full bg-cyber-bg border border-cyber-muted/30 p-2 text-white" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-mono text-cyber-muted mb-1">Deskripsi Singkat (Opsional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-cyber-bg border border-cyber-muted/30 p-2 text-white" placeholder="Cara menemukan User ID..."></textarea>
              </div>
              
              <button type="submit" className="w-full py-2 bg-[#BF00FF] text-white font-bold flex items-center justify-center gap-2 mt-4">
                <Save className="w-4 h-4"/> SIMPAN GAME
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FIELDS */}
      {isFieldModalOpen && selectedGameForFields && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-cyber-card border border-accent-secondary/50 w-full max-w-lg p-6 rounded-xl relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsFieldModalOpen(false)} className="absolute top-4 right-4 text-cyber-muted hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-orbitron font-bold text-accent-secondary mb-1">Manage Input Fields</h2>
            <p className="text-xs text-cyber-muted mb-4 font-mono">Untuk Game: {selectedGameForFields.name}</p>
            
            <div className="flex-1 overflow-y-auto mb-4 pr-2">
              <div className="space-y-2 mb-6">
                {fields.map(f => (
                  <div key={f._id} className="p-3 border border-cyber-muted/20 bg-cyber-bg rounded flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-white">{f.fieldLabel} {f.required && <span className="text-red-500">*</span>}</div>
                      <code className="text-[10px] text-accent-primary">name="{f.fieldName}"</code>
                    </div>
                    <button onClick={() => handleDeleteField(f._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
                {fields.length === 0 && <p className="text-xs text-cyber-muted italic">Belum ada field input. Tambahkan di bawah.</p>}
              </div>

              <div className="border-t border-cyber-muted/20 pt-4">
                <h3 className="text-sm font-bold text-white mb-3">Tambah Field Baru</h3>
                <form onSubmit={handleAddField} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-cyber-muted mb-1">Field Label</label>
                      <input required type="text" value={fieldLabel} onChange={e => { setFieldLabel(e.target.value); setFieldName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')); }} className="w-full bg-cyber-bg border border-cyber-muted/30 p-2 text-white text-xs" placeholder="Misal: User ID" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-cyber-muted mb-1">Field Name (Variabel API)</label>
                      <input required type="text" value={fieldName} onChange={e => setFieldName(e.target.value)} className="w-full bg-cyber-bg border border-cyber-muted/30 p-2 text-white text-xs" placeholder="Misal: userid" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-cyber-muted mb-1">Placeholder (Opsional)</label>
                    <input type="text" value={placeholder} onChange={e => setPlaceholder(e.target.value)} className="w-full bg-cyber-bg border border-cyber-muted/30 p-2 text-white text-xs" placeholder="Masukkan 10 digit ID..." />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-white">
                    <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
                    Wajib Diisi (Required)
                  </label>
                  <button type="submit" className="w-full py-2 bg-accent-secondary/20 text-accent-secondary border border-accent-secondary hover:bg-accent-secondary hover:text-white transition-colors text-xs font-bold">
                    + TAMBAH FIELD
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
