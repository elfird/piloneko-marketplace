import React, { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Calendar, 
  RefreshCw, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  FileText
} from "lucide-react";
import { CyberCard } from "../ui/CyberCard";
import { CyberButton } from "../ui/CyberButton";
import { ActivityLog } from "../../types";

interface ActivityLogsViewProps {
  token: string;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ token }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering and pagination states
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 15;

  useEffect(() => {
    fetchLogs();
  }, [token, page, action]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      let url = `/api/admin/activity-logs?page=${page}&limit=${limit}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (action !== "ALL") url += `&action=${action}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal mengambil data log aktivitas");
      const json = await res.json();
      
      setLogs(json.logs || []);
      setTotalPages(json.totalPages || 1);
      setTotalItems(json.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch("");
    setAction("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const getActionColor = (actionStr: string) => {
    if (actionStr.startsWith("CREATE")) return "text-green-400 border-green-500/20 bg-green-500/5";
    if (actionStr.startsWith("EDIT") || actionStr.startsWith("UPDATE")) return "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
    if (actionStr.startsWith("DELETE") || actionStr.startsWith("REMOVE")) return "text-red-400 border-red-500/20 bg-red-500/5";
    if (actionStr === "LOGIN") return "text-accent-primary border-accent-primary/20 bg-accent-primary/5";
    if (actionStr === "LOGOUT") return "text-cyber-muted border-cyber-muted/20 bg-cyber-surface/50";
    return "text-white border-cyber-muted/20 bg-cyber-surface/30";
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase flex items-center gap-2">
            <History className="w-6 h-6 text-accent-primary animate-pulse" />
            ACTIVITY LOGS //
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
            Audit trail kronologis sirkulasi mutasi data, login sesi, perubahan harga, dan backup database
          </p>
        </div>
      </div>

      {/* Advanced Filter Card */}
      <CyberCard accent="primary" className="p-5 bg-cyber-card/60">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                KATA KUNCI PENCARIAN
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-cyber-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari deskripsi, entitas ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#0A0A0F] border border-cyber-muted/30 focus:border-accent-primary focus:outline-none text-xs text-white placeholder-cyber-muted/50 rounded-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1">
                TINDAKAN MUTASI
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0A0A0F] border border-cyber-muted/30 text-xs text-white focus:outline-none focus:border-accent-primary font-mono uppercase"
              >
                <option value="ALL">SEMUA ACTION</option>
                <option value="LOGIN">LOGIN</option>
                <option value="CREATE_PRODUCT">CREATE_PRODUCT</option>
                <option value="EDIT_PRODUCT">EDIT_PRODUCT</option>
                <option value="DELETE_PRODUCT">DELETE_PRODUCT</option>
                <option value="CREATE_CATEGORY">CREATE_CATEGORY</option>
                <option value="EDIT_CATEGORY">EDIT_CATEGORY</option>
                <option value="DELETE_CATEGORY">DELETE_CATEGORY</option>
                <option value="CREATE_VOUCHER">CREATE_VOUCHER</option>
                <option value="EDIT_VOUCHER">EDIT_VOUCHER</option>
                <option value="DELETE_VOUCHER">DELETE_VOUCHER</option>
                <option value="BACKUP_DATABASE">BACKUP_DATABASE</option>
                <option value="RESTORE_DATABASE">RESTORE_DATABASE</option>
              </select>
            </div>

            <div>
              <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> DARI TANGGAL
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0A0A0F] border border-cyber-muted/30 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-cyber-muted font-mono uppercase text-[9px] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> SAMPAI TANGGAL
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0A0A0F] border border-cyber-muted/30 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-cyber-muted/10 pt-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-1.5 border border-cyber-muted/20 hover:border-cyber-muted/50 text-cyber-muted hover:text-white text-xs font-mono transition-colors cursor-pointer rounded-xs"
            >
              RESET FILTER
            </button>
            <CyberButton type="submit" variant="primary" size="sm" className="font-mono text-xs flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> JALANKAN QUERY
            </CyberButton>
          </div>
        </form>
      </CyberCard>

      {/* Logs Table Card */}
      <CyberCard accent="primary" className="p-6 bg-cyber-card/80">
        <div className="flex items-center justify-between border-b border-cyber-muted/20 pb-3 mb-5">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            // DUMP QUERY LOGS ({totalItems} ITEMS)
          </span>
          <button
            onClick={fetchLogs}
            className="p-1.5 bg-cyber-surface/50 border border-cyber-muted/20 text-cyber-muted hover:text-white rounded-xs transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-[10px] text-cyber-muted uppercase">FILTERING AUDIT TRAILS RECORDS...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-cyber-muted/20 font-mono text-xs text-cyber-muted uppercase">
            [TIDAK ADA DATA LOG MUTASI YANG COCOK DENGAN FILTER]
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-cyber-muted/25 text-cyber-muted uppercase font-mono text-[9px] text-left">
                    <th className="py-3 px-4">TANGGAL & HARI</th>
                    <th className="py-3 px-4">TINDAKAN</th>
                    <th className="py-3 px-4">DESKRIPSI OPERASI</th>
                    <th className="py-3 px-4">ENTITAS ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-muted/10 font-mono text-[11px]">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-cyber-surface/30 transition-colors">
                      <td className="py-3 px-4 text-cyber-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <Clock className="w-3 h-3 text-cyber-muted shrink-0" />
                          {new Date(l.createdAt).toLocaleString("id-ID")}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 border text-[9px] font-bold ${getActionColor(l.action)}`}>
                          {l.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-sans text-xs max-w-xs md:max-w-md break-words">
                        {l.description}
                      </td>
                      <td className="py-3 px-4 text-cyber-muted text-[10px] whitespace-nowrap">
                        {l.entityType ? (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-cyber-muted shrink-0" />
                            {l.entityType} [{l.entityId || "N/A"}]
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-cyber-muted/10 pt-4 font-mono select-none">
                <span className="text-[10px] text-cyber-muted">
                  HALAMAN <span className="text-white font-bold">{page}</span> DARI <span className="text-white font-bold">{totalPages}</span>
                </span>
                
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-1.5 border border-cyber-muted/20 hover:border-accent-primary bg-cyber-surface/40 hover:text-white rounded-xs transition-all disabled:opacity-30 disabled:hover:border-cyber-muted/20 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="p-1.5 border border-cyber-muted/20 hover:border-accent-primary bg-cyber-surface/40 hover:text-white rounded-xs transition-all disabled:opacity-30 disabled:hover:border-cyber-muted/20 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </CyberCard>
    </div>
  );
};
