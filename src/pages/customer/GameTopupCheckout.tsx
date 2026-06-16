import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../features/store/Navbar";
import { Footer } from "../../features/store/Footer";
import { useStore } from "../../store/useStore";
import { Gamepad2, AlertCircle } from "lucide-react";
import { formatPrice } from "../../lib/utils";

export default function GameTopupCheckout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { siteContent, midtransActive } = useStore();

  const [game, setGame] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [accountData, setAccountData] = useState<Record<string, string>>({});
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerWa, setBuyerWa] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getSiteText = (key: string, defVal: string) => siteContent[key] || defVal;

  useEffect(() => {
    // Inject Midtrans Snap script if not present
    fetch("/api/payment/config")
      .then(res => res.json())
      .then(config => {
        if (!document.getElementById("midtrans-script")) {
          const script = document.createElement("script");
          script.id = "midtrans-script";
          script.src = config.isProduction
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute("data-client-key", config.clientKey);
          document.body.appendChild(script);
        }
      });
  }, []);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const gameRes = await fetch(`/api/topup-games/${slug}`);
        if (!gameRes.ok) throw new Error("Game not found");
        const gameData = await gameRes.json();
        setGame(gameData);

        const [fieldsRes, prodsRes] = await Promise.all([
          fetch(`/api/topup-games/${gameData._id}/fields`),
          fetch(`/api/topup-games/${gameData._id}/products`)
        ]);
        
        setFields(await fieldsRes.json());
        setProducts(await prodsRes.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (slug) loadGameData();
  }, [slug]);

  const handleFieldChange = (fieldName: string, val: string) => {
    setAccountData(prev => ({ ...prev, [fieldName]: val }));
  };

  const handleCheckout = async (e: React.FormEvent, method: "MIDTRANS" | "WHATSAPP" = "MIDTRANS") => {
    e.preventDefault();
    if (!selectedProductId) return setError("Silakan pilih produk topup.");
    
    // Validate required fields
    for (const f of fields) {
      if (f.required && !accountData[f.fieldName]) {
        return setError(`Field ${f.fieldLabel} wajib diisi.`);
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/topup-orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game._id,
          productId: selectedProductId,
          accountData,
          buyerName,
          buyerWa,
          buyerEmail,
          paymentMethod: method
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal checkout");

      if (method === "WHATSAPP" && data.waUrl) {
        // Open WhatsApp link in new tab, redirect user to invoice or home
        window.open(data.waUrl, "_blank");
        navigate(`/invoice/${data.invoice}?type=topup`);
        return;
      }

      // Open Snap
      if ((window as any).snap) {
        (window as any).snap.pay(data.snapToken, {
          onSuccess: function (result: any) {
            navigate(`/invoice/${data.invoice}?type=topup`);
          },
          onPending: function (result: any) {
            navigate(`/invoice/${data.invoice}?type=topup`);
          },
          onError: function (result: any) {
            setError("Pembayaran gagal atau dibatalkan.");
          },
          onClose: function () {
            setError("Anda menutup popup pembayaran sebelum menyelesaikannya.");
          }
        });
      } else {
        window.location.href = data.redirectUrl;
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-cyber-bg flex items-center justify-center text-accent-primary font-mono animate-pulse">LOADING TOPUP DATA...</div>;
  if (error && !game) return <div className="min-h-screen bg-cyber-bg flex items-center justify-center text-red-500 font-mono">{error}</div>;

  return (
    <>
      <Navbar storeName={getSiteText("store_name", "PILONEKO")} storeWa={getSiteText("store_wa", "0812")} onNavigate={(v) => navigate(`/${v}`)} currentView="product" />
      
      <main className="min-h-screen bg-cyber-bg pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-accent-primary/50">
              {game.logo ? <img src={game.logo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-cyber-card" />}
            </div>
            <div>
              <h1 className="text-3xl font-orbitron font-black text-white uppercase">{game.name}</h1>
              <p className="text-cyber-muted font-mono text-xs">Otomatis diproses 24 Jam Non-Stop</p>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 text-sm font-mono">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Step 1: Account Data */}
            <div className="bg-cyber-surface/40 border border-cyber-muted/20 p-6 rounded-xl">
              <h2 className="text-xl font-orbitron font-bold text-accent-primary mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-accent-primary/20 text-accent-primary flex items-center justify-center text-sm">1</span> 
                DATA AKUN
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(f => (
                  <div key={f._id}>
                    <label className="block text-cyber-muted text-xs font-mono mb-2">{f.fieldLabel} {f.required && <span className="text-red-500">*</span>}</label>
                    <input 
                      type="text" 
                      required={f.required}
                      placeholder={f.placeholder}
                      value={accountData[f.fieldName] || ""}
                      onChange={e => handleFieldChange(f.fieldName, e.target.value)}
                      className="w-full bg-cyber-bg border border-cyber-muted/30 focus:border-accent-primary text-white p-3 outline-none rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-cyber-muted italic font-sans">{game.description}</p>
            </div>

            {/* Step 2: Select Product */}
            <div className="bg-cyber-surface/40 border border-cyber-muted/20 p-6 rounded-xl">
              <h2 className="text-xl font-orbitron font-bold text-accent-primary mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-accent-primary/20 text-accent-primary flex items-center justify-center text-sm">2</span> 
                PILIH NOMINAL
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map(p => (
                  <div 
                    key={p._id}
                    onClick={() => setSelectedProductId(p._id)}
                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedProductId === p._id ? 'border-accent-primary bg-accent-primary/10 shadow-[0_0_15px_rgba(0,245,255,0.2)]' : 'border-cyber-muted/20 hover:border-accent-primary/50'}`}
                  >
                    <div className="font-bold text-white text-sm mb-1">{p.productName}</div>
                    <div className="font-mono text-accent-primary font-bold">{formatPrice(p.sellingPrice)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Details */}
            <div className="bg-cyber-surface/40 border border-cyber-muted/20 p-6 rounded-xl">
              <h2 className="text-xl font-orbitron font-bold text-accent-primary mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-accent-primary/20 text-accent-primary flex items-center justify-center text-sm">3</span> 
                DETAIL PEMBELI
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyber-muted text-xs font-mono mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input type="text" required value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full bg-cyber-bg border border-cyber-muted/30 focus:border-accent-primary text-white p-3 outline-none rounded-lg" />
                </div>
                <div>
                  <label className="block text-cyber-muted text-xs font-mono mb-2">Nomor WhatsApp <span className="text-red-500">*</span></label>
                  <input type="text" required value={buyerWa} onChange={e => setBuyerWa(e.target.value)} className="w-full bg-cyber-bg border border-cyber-muted/30 focus:border-accent-primary text-white p-3 outline-none rounded-lg" placeholder="Contoh: 08123456789" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-cyber-muted text-xs font-mono mb-2">Email (Opsional)</label>
                  <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className="w-full bg-cyber-bg border border-cyber-muted/30 focus:border-accent-primary text-white p-3 outline-none rounded-lg" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {midtransActive && (
                <button 
                  type="button"
                  onClick={(e) => handleCheckout(e, "MIDTRANS")}
                  disabled={submitting}
                  className={`w-full py-4 rounded-xl font-orbitron font-black text-lg tracking-wider transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)] ${submitting ? 'bg-cyber-muted text-gray-500 cursor-not-allowed' : 'bg-accent-primary text-cyber-bg hover:scale-[1.02] active:scale-95'}`}
                >
                  {submitting ? 'MEMPROSES...' : 'BAYAR OTOMATIS (MIDTRANS)'}
                </button>
              )}

              <button 
                type="button"
                onClick={(e) => handleCheckout(e, "WHATSAPP")}
                disabled={submitting}
                className={`w-full py-4 rounded-xl font-orbitron font-black text-lg tracking-wider transition-all border-2 border-[#25D366] bg-[#25D366]/10 text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.2)] ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#25D366] hover:text-white hover:scale-[1.02] active:scale-95'}`}
              >
                {submitting ? 'MEMPROSES...' : 'BAYAR MANUAL (WHATSAPP)'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer storeName={getSiteText("store_name", "PILONEKO")} storeEmail="-" storeWa="-" footerDesc="-" onNavigate={() => {}} />
    </>
  );
}
