import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Clock, XCircle, FileText, Smartphone } from "lucide-react";
import { CyberButton } from "../../components/ui/CyberButton";
import { CyberCard } from "../../components/ui/CyberCard";
import { formatPrice } from "../../lib/utils";

interface InvoiceViewProps {
  orderId: string;
  onBack: () => void;
  storeWa: string;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ orderId, onBack, storeWa }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/payment/status/${orderId}`);
      if (!res.ok) throw new Error("Invoice tidak ditemukan");
      const data = await res.json();
      setInvoice(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    
    // Polling every 5 seconds if pending
    const interval = setInterval(() => {
      if (invoice && invoice.transactionStatus === "pending") {
        fetchInvoice();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [orderId, invoice?.transactionStatus]);

  const handlePayNow = () => {
    if (invoice?.snapToken && (window as any).snap) {
      (window as any).snap.pay(invoice.snapToken, {
        onSuccess: function () {
          fetchInvoice();
        },
        onPending: function () {
          fetchInvoice();
        },
        onError: function () {
          fetchInvoice();
        },
        onClose: function () {
          fetchInvoice();
        }
      });
    }
  };

  if (loading && !invoice) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-orbitron text-cyber-muted text-xs uppercase tracking-widest animate-pulse">MENYIAPKAN DATA INVOICE...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-6 font-mono">{error}</p>
        <CyberButton variant="primary" onClick={onBack}>KEMBALI KE BERANDA</CyberButton>
      </div>
    );
  }

  const isPending = invoice.transactionStatus === "pending";
  const isSuccess = invoice.transactionStatus === "settlement" || invoice.transactionStatus === "capture";
  const isFailed = invoice.transactionStatus === "expire" || invoice.transactionStatus === "cancel" || invoice.transactionStatus === "deny";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 relative z-10 font-sans">
      <button onClick={onBack} className="flex items-center gap-1.5 font-orbitron text-xs tracking-wider text-accent-primary hover:text-white transition-colors mb-6 group cursor-pointer">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>KEMBALI KE BERANDA</span>
      </button>

      <CyberCard accent={isSuccess ? "secondary" : (isFailed ? "neutral" : "primary")} className="p-0 overflow-hidden bg-cyber-surface/90">
        <div className="p-8 border-b border-cyber-muted/20 text-center">
          {isSuccess && (
            <div className="w-16 h-16 bg-accent-wa/10 text-accent-wa border-2 border-accent-wa rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}
          {isPending && (
            <div className="w-16 h-16 bg-yellow-400/10 text-yellow-400 border-2 border-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
          )}
          {isFailed && (
            <div className="w-16 h-16 bg-red-500/10 text-red-500 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h1 className="font-orbitron font-black text-2xl uppercase tracking-widest text-white mb-2">
            {isSuccess ? "PEMBAYARAN BERHASIL" : isPending ? "MENUNGGU PEMBAYARAN" : "PEMBAYARAN GAGAL"}
          </h1>
          <p className="text-xs text-cyber-muted font-mono tracking-wider">ORDER ID : {invoice.orderId}</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-orbitron text-cyber-muted uppercase tracking-wider mb-1">PRODUK</span>
                <span className="font-semibold text-white text-sm">{invoice.productName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-orbitron text-cyber-muted uppercase tracking-wider mb-1">METODE</span>
                <span className="font-semibold text-white text-sm uppercase">{invoice.paymentMethod || "Midtrans Gate"}</span>
              </div>
            </div>
            
            <div className="space-y-4 md:text-right">
              <div>
                <span className="block text-[10px] font-orbitron text-cyber-muted uppercase tracking-wider mb-1">TOTAL TAGIHAN</span>
                <span className="font-orbitron font-bold text-xl text-accent-primary">{formatPrice(invoice.amount)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-orbitron text-cyber-muted uppercase tracking-wider mb-1">TANGGAL TRANSAKSI</span>
                <span className="font-mono text-white text-xs">{new Date(invoice.createdAt).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div className="bg-cyber-bg border border-accent-primary/20 p-4 rounded-sm mt-6">
            <h3 className="font-orbitron font-bold text-xs text-white uppercase mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-primary" />
              Status Sistem
            </h3>
            <p className="text-xs text-cyber-muted leading-relaxed">
              Status Midtrans: <span className={`font-bold uppercase ${isSuccess ? "text-accent-wa" : isFailed ? "text-red-400" : "text-yellow-400"}`}>{invoice.transactionStatus}</span><br />
              Status Internal: <span className="font-bold text-white">{invoice.orderStatus}</span>
            </p>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            {isPending && invoice.snapToken && (
              <CyberButton onClick={handlePayNow} variant="primary" className="flex-1 font-bold">
                BAYAR SEKARANG
              </CyberButton>
            )}
            
            <CyberButton 
              onClick={() => {
                // Format nomor WA agar selalu berawalan 62 dan tanpa spasi/simbol
                let finalWa = storeWa.replace(/\D/g, "");
                if (finalWa.startsWith("0")) {
                  finalWa = "62" + finalWa.substring(1);
                } else if (!finalWa.startsWith("62")) {
                  finalWa = "62" + finalWa;
                }
                
                const waText = `*💬 BANTUAN INVOICE / PESANAN - PILONEKO*

Halo Admin, saya ingin menanyakan status pesanan saya dengan detail berikut:

*📝 KODE TRANSAKSI:* 
${invoice.orderId}

*📦 DETAIL PRODUK:*
• Produk: ${invoice.productName}
• Total Tagihan: ${formatPrice(invoice.amount)}

Mohon bantuannya untuk mengecek status pesanan ini ya min. Terima kasih! 🙏`;
                window.open(`https://api.whatsapp.com/send/?phone=${finalWa}&text=${encodeURIComponent(waText)}`, "_blank");
              }} 
              variant="wa" 
              className="flex-1 justify-center"
            >
              <Smartphone className="w-4 h-4" />
              HUBUNGI ADMIN WA
            </CyberButton>
          </div>

        </div>
      </CyberCard>
    </div>
  );
};
