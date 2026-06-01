import React, { useState, useEffect } from "react";
import { 
  DownloadCloud, 
  Database, 
  Play, 
  Trash, 
  RefreshCw, 
  AlertTriangle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles
} from "lucide-react";
import { CyberCard } from "../ui/CyberCard";
import { CyberButton } from "../ui/CyberButton";

interface Backup {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

interface BackupCenterViewProps {
  token: string;
}

export const BackupCenterView: React.FC<BackupCenterViewProps> = ({ token }) => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [creating, setCreating] = useState(false);
  const [restoringName, setRestoringName] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    fetchBackups();
  }, [token]);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/backups", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menyambung server backups");
      const list = await res.json();
      setBackups(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      setFeedbackMsg("");
      const res = await fetch("/api/admin/backups/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengeksekusi dump database local");
      const json = await res.json();
      setFeedbackMsg(`Backup "${json.filename}" berhasil dicadangkan!`);
      fetchBackups();
    } catch (err: any) {
      setFeedbackMsg(`Error: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`PERINGATAN KRITIKAL: Apakah Anda yakin ingin memulihkan database dari file "${filename}"?\n\nProsedur ini akan MENGGANTI seluruh isi database saat ini dengan isi file backup ini!`)) {
      return;
    }

    try {
      setRestoringName(filename);
      setFeedbackMsg("");
      const res = await fetch(`/api/admin/backups/restore/${filename}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengeksekusi restorasi SQL");
      const json = await res.json();
      setFeedbackMsg(json.message || "Restorasi database sukses dikerjakan!");
    } catch (err: any) {
      setFeedbackMsg(`Error: ${err.message}`);
    } finally {
      setRestoringName(null);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const res = await fetch(`/api/admin/backups/download/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengunduh file backup");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Unduhan gagal: ${err.message}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-accent-primary animate-pulse" />
            BACKUP CENTER //
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
            Pusat administrasi backup database MySQL, buat cadangan SQL dump lokal, pulihkan sirkulasi data
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-accent-primary/10 border border-accent-primary/30 p-3 text-accent-primary text-xs font-mono flex gap-2">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Backups List */}
        <div className="lg:col-span-2">
          <CyberCard accent="primary" className="p-6 bg-cyber-card/85">
            <div className="flex items-center justify-between border-b border-cyber-muted/20 pb-3 mb-5">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">// ARSIP CADANGAN DATA LOCAL (.SQL)</span>
              <button
                onClick={fetchBackups}
                className="p-1.5 bg-cyber-surface/50 border border-cyber-muted/20 text-cyber-muted hover:text-white rounded-xs transition-colors cursor-pointer"
                title="Refresh Backups"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-mono text-[10px] text-cyber-muted uppercase">READING MYSQL DUMP STORAGE...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-cyber-muted/20 font-mono text-xs text-cyber-muted uppercase">
                [BELUM ADA FILE SQL BACKUP TERSEDIA]
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-cyber-muted/25 text-cyber-muted uppercase font-mono text-[9px] text-left">
                      <th className="py-3 px-4">NAMA FILE CADANGAN</th>
                      <th className="py-3 px-4">UKURAN FILE</th>
                      <th className="py-3 px-4">TANGGAL BACKUP</th>
                      <th className="py-3 px-4 text-center">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-muted/10 font-mono text-[11px]">
                    {backups.map((b) => {
                      const isRestoring = restoringName === b.filename;
                      return (
                        <tr key={b.filename} className="hover:bg-cyber-surface/30 transition-colors">
                          <td className="py-3 px-4 text-white font-bold tracking-wide">
                            {b.filename}
                          </td>
                          <td className="py-3 px-4 text-accent-secondary font-bold">
                            {formatBytes(b.sizeBytes)}
                          </td>
                          <td className="py-3 px-4 text-cyber-muted text-[10px]">
                            {new Date(b.createdAt).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() => handleDownload(b.filename)}
                                className="text-accent-primary hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-mono text-[10px]"
                                title="Download File"
                              >
                                <ArrowDownToLine className="w-3.5 h-3.5" /> UNDUH
                              </button>
                              <button
                                onClick={() => handleRestoreBackup(b.filename)}
                                disabled={!!restoringName}
                                className="text-yellow-400 hover:text-white transition-colors disabled:opacity-30 flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                                title="Restore Database"
                              >
                                <ArrowUpFromLine className="w-3.5 h-3.5" /> {isRestoring ? "RESTORING..." : "RESTORE"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CyberCard>
        </div>

        {/* Right Col: Operations */}
        <div className="space-y-6">
          <CyberCard accent="secondary" className="p-5 bg-cyber-card/90">
            <div className="border-b border-cyber-muted/20 pb-3 mb-4">
              <span className="text-[8px] text-cyber-muted font-mono tracking-widest uppercase block">// TERMINAL MANUAL</span>
              <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase">
                CADANGKAN SEKARANG
              </h3>
            </div>

            <p className="text-xs text-cyber-muted leading-relaxed mb-4">
              Tekan tombol di bawah untuk mengeksekusi dumping instan seluruh data database (Laragon MySQL) ke local path folder <code className="text-accent-primary bg-[#0A0A0F] px-1 border border-cyber-muted/10">./backups/</code>.
            </p>

            <CyberButton
              onClick={handleCreateBackup}
              disabled={creating}
              variant="primary"
              className="w-full font-bold font-mono tracking-wider text-xs"
            >
              {creating ? "MEMBUAT DUMP FILE..." : "JALANKAN MYSQLDUMP CADANGAN"}
            </CyberButton>
          </CyberCard>

          <CyberCard accent="primary" className="p-5 bg-cyber-bg border border-red-500/20 text-left">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 animate-pulse mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">WARNING RULES CENTRAL:</h4>
                <p className="text-[10px] text-cyber-muted mt-1 leading-relaxed">
                  Menjalankan pemulihan (restore) database akan menghapus seluruh data transaksi, stock voucher, dan ulasan yang ditambahkan setelah file cadangan dibuat. Prosedur ini tidak dapat dibatalkan (non-reversible).
                </p>
              </div>
            </div>
          </CyberCard>
        </div>
      </div>
    </div>
  );
};
