import React from "react";
import { CreditCard, MessageSquare } from "lucide-react";
import { Product, ProductPackage } from "../../types";
import { CyberButton } from "../../components/ui/CyberButton";
import { formatPrice } from "../../lib/utils";

interface CheckoutFormProps {
  product: Product;
  selectedPackage: ProductPackage;
  isGameTopUp: boolean;
  buyerName: string;
  setBuyerName: (v: string) => void;
  buyerEmail: string;
  setBuyerEmail: (v: string) => void;
  buyerWa: string;
  setBuyerWa: (v: string) => void;
  gameUserId: string;
  setGameUserId: (v: string) => void;
  gameServerId: string;
  setGameServerId: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  voucherCode: string;
  setVoucherCode: (v: string) => void;
  appliedVoucher: any;
  handleApplyVoucher: () => void;
  handleRemoveVoucher: () => void;
  validatingVoucher: boolean;
  voucherError: string;
  submittingOrder: boolean;
  handleOrderSubmit: (e: React.FormEvent) => void;
  handleWaCheckout: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  product,
  selectedPackage,
  isGameTopUp,
  buyerName,
  setBuyerName,
  buyerEmail,
  setBuyerEmail,
  buyerWa,
  setBuyerWa,
  gameUserId,
  setGameUserId,
  gameServerId,
  setGameServerId,
  notes,
  setNotes,
  voucherCode,
  setVoucherCode,
  appliedVoucher,
  handleApplyVoucher,
  handleRemoveVoucher,
  validatingVoucher,
  voucherError,
  submittingOrder,
  handleOrderSubmit,
  handleWaCheckout,
}) => {
  return (
    <form onSubmit={handleOrderSubmit} className="space-y-4">
      <div className="border-t border-accent-primary/10 pt-4">
        <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
          2. Kelola Data Diri Anda
        </label>

        {isGameTopUp && (
          <div className="mb-3.5 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-orbitron tracking-wider text-accent-primary uppercase mb-1">
                User ID Game *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 12938128"
                value={gameUserId}
                onChange={(e) => setGameUserId(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono tracking-widest placeholder-cyber-muted"
              />
            </div>
            <div>
              <label className="block text-[9px] font-orbitron tracking-wider text-accent-primary uppercase mb-1">
                Server ID *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 2034"
                value={gameServerId}
                onChange={(e) => setGameServerId(e.target.value)}
                className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono tracking-widest placeholder-cyber-muted"
              />
            </div>
            <span className="col-span-2 block text-[8px] text-cyber-muted uppercase italic mt-0.5">
              ID top up game Anda dikredit langsung 24 Jam
            </span>
          </div>
        )}

        <div className="mb-3">
          <label className="block text-[9px] font-orbitron tracking-wider text-white uppercase mb-1">
            Nama Lengkap Pembeli *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Rian Pratama"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="w-full px-4 py-2 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-xs placeholder-cyber-muted"
          />
        </div>

        <div className="mb-3">
          <label className="block text-[9px] font-orbitron tracking-wider text-white uppercase mb-1">
            Alamat Email Aktif *
          </label>
          <input
            type="email"
            required
            placeholder="Contoh: rian@email.com"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            className="w-full px-4 py-2 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-xs placeholder-cyber-muted"
          />
        </div>

        <div className="mb-3">
          <label className="block text-[9px] font-orbitron tracking-wider text-white uppercase mb-1">
            Nomor WhatsApp Aktif *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: 08123456789"
            value={buyerWa}
            onChange={(e) => setBuyerWa(e.target.value)}
            className="w-full px-4 py-2 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono placeholder-cyber-muted"
          />
        </div>
        
        <div>
          <label className="block text-[9px] font-orbitron tracking-wider text-white uppercase mb-1">
            Catatan Pesanan (Opsional)
          </label>
          <textarea
            rows={2}
            placeholder="Catatan tambahan untuk admin..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-xs placeholder-cyber-muted"
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-cyber-muted/10">
        <label className="block text-[9px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
          KUPON VOUCHER (OPSIONAL)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="KODE KUPON (MISAL: NEON20)"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            className="flex-1 px-3 py-1.5 bg-cyber-bg border border-accent-primary/20 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono uppercase placeholder-cyber-muted"
            disabled={!!appliedVoucher}
          />
          {appliedVoucher ? (
            <button
              type="button"
              onClick={handleRemoveVoucher}
              className="px-3 py-1.5 border border-red-500/35 text-red-500 hover:bg-red-500/10 text-xs font-mono transition-colors cursor-pointer rounded-xs"
            >
              BATAL
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyVoucher}
              className="px-3 py-1.5 border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10 text-xs font-mono transition-colors cursor-pointer rounded-xs"
              disabled={validatingVoucher || !voucherCode.trim()}
            >
              {validatingVoucher ? "CEK..." : "GUNAKAN"}
            </button>
          )}
        </div>
        {voucherError && (
          <p className="text-[10px] text-red-500 mt-1 font-mono">{voucherError}</p>
        )}
        {appliedVoucher && (
          <p className="text-[10px] text-[#25D366] mt-1 font-mono">
            ✓ Kupon berhasil diterapkan! Diskon {formatPrice(appliedVoucher.discountAmount)}
          </p>
        )}
      </div>

      <div className="bg-cyber-surface border border-accent-primary/10 p-4 font-mono text-[11px] text-cyber-muted space-y-1.5">
        <div className="flex justify-between">
          <span>PRODUK:</span>
          <span className="text-white font-semibold">{product.name}</span>
        </div>
        <div className="flex justify-between">
          <span>PAKET:</span>
          <span className="text-white font-semibold line-clamp-1">{selectedPackage.label}</span>
        </div>
        {appliedVoucher && (
          <>
            <div className="flex justify-between text-cyber-muted">
              <span>HARGA ASLI:</span>
              <span>{formatPrice(selectedPackage.price)}</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>DISKON KUPON:</span>
              <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between border-t border-accent-primary/15 pt-2 mt-2 font-bold text-accent-primary text-xs font-orbitron">
          <span>TOTAL BAYAR:</span>
          <span className="text-neon">
            {formatPrice(appliedVoucher ? appliedVoucher.finalPrice : selectedPackage.price)}
          </span>
        </div>
      </div>

      <div className="pt-2 space-y-3">
        <CyberButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold shadow-[0_0_16px_rgba(0,245,255,0.25)] hover:shadow-[0_0_25px_rgba(0,245,255,0.5)]"
          disabled={submittingOrder}
        >
          <CreditCard className="w-5 h-5 shrink-0" />
          {submittingOrder ? "MEMPROSES..." : "BAYAR OTOMATIS (MIDTRANS)"}
        </CyberButton>

        <CyberButton
          type="button"
          variant="wa"
          size="lg"
          className="w-full font-bold shadow-[0_0_16px_rgba(37,211,102,0.25)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)]"
          disabled={submittingOrder}
          onClick={handleWaCheckout}
        >
          <MessageSquare className="w-5 h-5 shrink-0" />
          BELI VIA WHATSAPP (MANUAL)
        </CyberButton>
      </div>
    </form>
  );
};
