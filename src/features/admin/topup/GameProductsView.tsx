import React, { useState, useEffect } from "react";
import { formatPrice } from "../../../lib/utils";

interface Props { token: string; }

export const GameProductsView: React.FC<Props> = ({ token }) => {
  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/topup/products", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchProducts(); }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="font-orbitron font-black text-2xl text-white tracking-widest text-[#BF00FF] mb-1 uppercase">
        // GAME PRODUCTS
      </h1>
      <p className="text-cyber-muted text-xs font-mono">List produk yang disinkronisasi dari Digiflazz.</p>
      
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-cyber-surface/50 border-b border-[#BF00FF]/30 text-[#BF00FF] font-mono">
            <th className="p-3">GAME</th>
            <th className="p-3">PRODUCT</th>
            <th className="p-3">COST PRICE</th>
            <th className="p-3">SELL PRICE</th>
            <th className="p-3">STATUS</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id} className="border-b border-cyber-muted/10">
              <td className="p-3 font-bold text-white">{p.gameId?.name || "Unknown"}</td>
              <td className="p-3">{p.productName}</td>
              <td className="p-3 text-red-400">{formatPrice(p.costPrice)}</td>
              <td className="p-3 text-[#25D366] font-bold">{formatPrice(p.sellingPrice)}</td>
              <td className="p-3">{p.status ? "ACTIVE" : "INACTIVE"}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={5} className="p-4 text-center text-cyber-muted">No products synced.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
