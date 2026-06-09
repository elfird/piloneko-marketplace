import React, { useState, useEffect } from "react";
import { formatPrice } from "../../../lib/utils";

interface Props { token: string; }

export const TopupOrdersView: React.FC<Props> = ({ token }) => {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/topup/orders", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchOrders(); }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="font-orbitron font-black text-2xl text-white tracking-widest text-[#BF00FF] mb-1 uppercase">
        // TOPUP ORDERS
      </h1>
      <p className="text-cyber-muted text-xs font-mono">Riwayat transaksi otomatis Digiflazz.</p>
      
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-cyber-surface/50 border-b border-[#BF00FF]/30 text-[#BF00FF] font-mono">
            <th className="p-3">INVOICE</th>
            <th className="p-3">CUSTOMER</th>
            <th className="p-3">GAME & PRODUCT</th>
            <th className="p-3">AMOUNT</th>
            <th className="p-3">STATUS</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id} className="border-b border-cyber-muted/10">
              <td className="p-3 font-mono text-accent-primary">{o.invoice}</td>
              <td className="p-3">{o.customerName}<br/><span className="text-cyber-muted">{o.customerWa}</span></td>
              <td className="p-3 font-bold">{o.gameId?.name}<br/><span className="font-normal text-cyber-muted">{o.productId?.productName}</span></td>
              <td className="p-3 font-mono">{formatPrice(o.amount)}</td>
              <td className="p-3">
                <span className={`px-2 py-1 border rounded-xs ${o.status === 'SUCCESS' ? 'text-green-400 border-green-500/30' : o.status === 'FAILED' ? 'text-red-400 border-red-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={5} className="p-4 text-center text-cyber-muted">No topup orders yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
