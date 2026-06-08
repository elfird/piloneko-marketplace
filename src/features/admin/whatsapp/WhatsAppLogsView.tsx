import React, { useState, useEffect } from "react";
import { History, CheckCircle, XCircle, Clock } from "lucide-react";

export const WhatsAppLogsView: React.FC<{ token: string }> = ({ token }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/logs", { headers: { Authorization: `Bearer ${token}` } });
      setLogs(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return null;

  return (
    <div className="space-y-8 font-sans text-left">
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // DELIVERY LOGS
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Riwayat pengiriman pesan WhatsApp Fonte API
        </p>
      </div>

      <div className="bg-cyber-card border border-accent-primary/20 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-cyber-muted font-mono whitespace-nowrap">
            <thead className="bg-cyber-bg border-b border-accent-primary/20 text-white">
              <tr>
                <th className="py-3 px-4 uppercase font-bold tracking-wider w-32">Timestamp</th>
                <th className="py-3 px-4 uppercase font-bold tracking-wider w-32">Phone</th>
                <th className="py-3 px-4 uppercase font-bold tracking-wider max-w-[200px]">Message Preview</th>
                <th className="py-3 px-4 uppercase font-bold tracking-wider w-24">Status</th>
                <th className="py-3 px-4 uppercase font-bold tracking-wider">Response</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-cyber-muted/10 hover:bg-cyber-surface/30">
                  <td className="py-3 px-4">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-white font-sans">{log.phone}</td>
                  <td className="py-3 px-4 truncate max-w-[200px]" title={log.message}>{log.message}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 ${log.status === 'SUCCESS' ? 'text-[#25D366]' : log.status === 'FAILED' ? 'text-red-500' : 'text-accent-primary'}`}>
                      {log.status === 'SUCCESS' ? <CheckCircle className="w-3 h-3" /> : log.status === 'FAILED' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 truncate max-w-[150px] text-[9px]" title={log.response}>{log.response}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center">No logs recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
