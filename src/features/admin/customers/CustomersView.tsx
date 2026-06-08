import React, { useState, useEffect } from "react";
import { Users, Search, Download, Trash, Eye, DollarSign, Calendar, TrendingUp } from "lucide-react";

export const CustomersView: React.FC<{ token: string }> = ({ token }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, statsRes] = await Promise.all([
        fetch("/api/admin/customers", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/customers/stats", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCustomers(await custRes.json());
      setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data pelanggan ini secara permanen?")) return;
    try {
      await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Gagal menghapus pelanggan");
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return alert("Tidak ada data untuk diekspor");
    
    const headers = ["Nama", "WhatsApp", "Email", "Total Order", "Total Belanja (Rp)", "Tgl Terakhir Order", "Terdaftar Pada"];
    const rows = customers.map(c => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || '-'}"`,
      c.totalOrders,
      c.totalSpent,
      `"${new Date(c.lastOrderDate).toLocaleString('id-ID')}"`,
      `"${new Date(c.createdAt).toLocaleString('id-ID')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  if (loading) return null;

  return (
    <div className="space-y-8 font-sans text-left pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
            // CUSTOMER DATABASE
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
            Manajemen CRM dan Riwayat Pelanggan
          </p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-5 py-2 bg-accent-secondary text-white font-orbitron font-bold text-xs tracking-wider rounded-xs flex items-center gap-2 hover:bg-white hover:text-black transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" /> EXPORT CSV
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: stats.totalCustomers, icon: Users, color: "text-accent-primary", border: "border-accent-primary" },
          { label: "New This Month", value: stats.newCustomersThisMonth, icon: TrendingUp, color: "text-[#25D366]", border: "border-[#25D366]" },
          { label: "Active Customers", value: stats.activeCustomers, icon: Calendar, color: "text-accent-secondary", border: "border-accent-secondary" },
          { label: "Top Spender Value", value: `Rp ${(stats.topSpenders?.[0]?.totalSpent || 0).toLocaleString('id-ID')}`, icon: DollarSign, color: "text-yellow-400", border: "border-yellow-400" },
        ].map((s, idx) => (
          <div key={idx} className={`bg-cyber-card border border-cyber-muted/20 border-l-4 ${s.border} p-4 rounded-xs`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-mono text-cyber-muted uppercase tracking-widest">{s.label}</p>
                <p className={`text-xl font-orbitron font-black mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`w-5 h-5 ${s.color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-cyber-card border border-accent-primary/20 p-6 rounded-xs space-y-4">
        <div className="flex items-center bg-cyber-bg border border-accent-primary/30 px-3 py-2 w-full max-w-sm rounded-xs">
          <Search className="w-4 h-4 text-cyber-muted mr-2" />
          <input 
            type="text" 
            placeholder="Cari nama atau nomor WhatsApp..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-mono text-white w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-cyber-muted bg-cyber-bg border-b border-accent-primary/20">
              <tr>
                <th className="py-3 px-4 uppercase">Customer</th>
                <th className="py-3 px-4 uppercase">WhatsApp</th>
                <th className="py-3 px-4 uppercase">Orders</th>
                <th className="py-3 px-4 uppercase">Total Spent</th>
                <th className="py-3 px-4 uppercase">Last Order</th>
                <th className="py-3 px-4 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id} className="border-b border-cyber-muted/10 hover:bg-cyber-surface/30">
                  <td className="py-3 px-4">
                    <div className="text-white font-sans font-bold">{c.name}</div>
                    <div className="text-[10px] text-cyber-muted">{c.email || '-'}</div>
                  </td>
                  <td className="py-3 px-4 text-accent-primary">{c.phone}</td>
                  <td className="py-3 px-4">{c.totalOrders}x</td>
                  <td className="py-3 px-4 text-[#25D366]">Rp {c.totalSpent.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 text-[10px]">{new Date(c.lastOrderDate).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelectedCustomer(c)} className="p-1.5 bg-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary hover:text-white rounded-xs">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xs">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-cyber-muted">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0F1A] border border-accent-secondary p-6 rounded-xs max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-orbitron font-bold text-white uppercase mb-4 tracking-widest border-b border-cyber-muted/20 pb-2">
              Customer Detail // {selectedCustomer.name}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-cyber-bg p-3 border border-cyber-muted/20">
                <p className="text-[10px] font-mono text-cyber-muted uppercase">Phone</p>
                <p className="text-sm font-bold text-accent-primary">{selectedCustomer.phone}</p>
              </div>
              <div className="bg-cyber-bg p-3 border border-cyber-muted/20">
                <p className="text-[10px] font-mono text-cyber-muted uppercase">Total Spent</p>
                <p className="text-sm font-bold text-[#25D366]">Rp {selectedCustomer.totalSpent.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <h3 className="text-xs font-orbitron text-accent-secondary uppercase mb-3 font-bold">Order History</h3>
            <div className="space-y-2">
              {selectedCustomer.orderHistory?.map((oh: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-cyber-bg/50 border border-cyber-muted/10">
                  <div>
                    <p className="text-xs font-mono text-white">{oh.refCode}</p>
                    <p className="text-[10px] text-cyber-muted">{new Date(oh.date).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-sm font-bold text-[#25D366]">
                    Rp {oh.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-right">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-cyber-surface hover:bg-white hover:text-black text-white text-xs font-orbitron font-bold uppercase transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
