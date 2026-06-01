import React, { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, ShieldCheck, Heart, Star, Send, ShoppingCart, MessageSquare, AlertCircle } from "lucide-react";
import { Product, ProductPackage, Review } from "../../types";
import { CyberButton } from "../ui/CyberButton";
import { CyberCard } from "../ui/CyberCard";
import { CyberBadge } from "../ui/CyberBadge";
import { formatPrice } from "../../lib/utils";

interface ProductDetailViewProps {
  productSlug: string;
  storeName: string;
  storeWa: string;
  bankName: string;
  bankNumber: string;
  bankHolder: string;
  qrisImageUrl: string;
  onBack: () => void;
  flashPriceOverride?: number;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productSlug,
  storeName,
  storeWa,
  bankName,
  bankNumber,
  bankHolder,
  qrisImageUrl,
  onBack,
  flashPriceOverride,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state
  const [selectedPackage, setSelectedPackage] = useState<ProductPackage | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerWa, setBuyerWa] = useState("");
  const [gameDetails, setGameDetails] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Voucher checkout states
  const [voucherCode, setVoucherCode] = useState("");
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState("");

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revSuccessMsg, setRevSuccessMsg] = useState("");

  // Fetch product detail on mount
  useEffect(() => {
    fetchProduct();
  }, [productSlug]);

  useEffect(() => {
    setVoucherCode("");
    setAppliedVoucher(null);
    setVoucherError("");
  }, [selectedPackage]);

  const handleApplyVoucher = async () => {
    if (!selectedPackage || !voucherCode.trim()) return;
    try {
      setValidatingVoucher(true);
      setVoucherError("");
      const res = await fetch("/api/vouchers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucherCode.trim().toUpperCase(),
          purchaseValue: selectedPackage.price
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kupon tidak valid");
      }
      const json = await res.json();
      setAppliedVoucher(json);
    } catch (err: any) {
      setVoucherError(err.message);
      setAppliedVoucher(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedVoucher(null);
    setVoucherError("");
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/products/${productSlug}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil detail produk");
      }
      const data = await res.json();
      setProduct(data);
      setReviews(data.reviews || []);
      // Default select first available package
      if (data.packages && data.packages.length > 0) {
        setSelectedPackage(data.packages[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !selectedPackage) return;
    if (!buyerName.trim() || !buyerWa.trim()) {
      alert("Harap lengkapi nama dan nomor WhatsApp Anda");
      return;
    }

    try {
      setSubmittingOrder(true);
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          packageId: selectedPackage.id,
          buyerName,
          buyerWa,
          gameDetails: gameDetails, // Passes ML/FF Server game identities
          voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memproses pesanan. Harap coba lagi.");
      }

      const result = await res.json();
      if (result.success) {
        let finalWaUrl = result.waUrl;
        if (appliedVoucher) {
          const originalWaText = decodeURIComponent(result.waUrl.split("?text=")[1] || "");
          const addedVoucherInfo = `\n🎫 *KUPON VOUCHER* : ${appliedVoucher.code}\n📉 Potongan     : -Rp ${Number(appliedVoucher.discountAmount).toLocaleString("id-ID")}\n💰 Akhir Total   : Rp ${Number(appliedVoucher.finalPrice).toLocaleString("id-ID")}`;
          const modifiedWaText = originalWaText + addedVoucherInfo;
          const cleanStoreWa = result.waUrl.split("wa.me/")[1].split("?")[0];
          finalWaUrl = `https://wa.me/${cleanStoreWa}?text=${encodeURIComponent(modifiedWaText)}`;
        }

        setOrderSuccess({
          ...result,
          waUrl: finalWaUrl,
          refCode: result.refCode,
        });

        // Automatically open the WhatsApp redirect url
        setTimeout(() => {
          window.open(finalWaUrl, "_blank");
        }, 100);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!revName.trim() || !revComment.trim()) {
      alert("Nama dan Komentar ulasan wajib diisi");
      return;
    }

    try {
      setRevSubmitting(true);
      setRevSuccessMsg("");
      const res = await fetch(`/api/products/${product.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: revName,
          rating: Number(revRating),
          comment: revComment,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengirim ulasan");

      setRevSuccessMsg("Ulasan Anda berhasil dikirim! Menunggu persetujuan moderasi Admin.");
      setRevName("");
      setRevComment("");
      setRevRating(5);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRevSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center relative z-10">
        <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="font-orbitron font-semibold tracking-widest text-accent-primary text-neon animate-pulse">
          INITIALIZING SECURE PROTOCOL...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center relative z-10">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h3 className="font-orbitron font-bold text-xl text-white mb-2 uppercase">
          ERROR DETECTED
        </h3>
        <p className="text-sm text-cyber-muted mb-6">{error || "Produk tidak ditemukan."}</p>
        <CyberButton variant="primary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> KEMBALI
        </CyberButton>
      </div>
    );
  }

  const isGameTopUp = product.category?.type === "GAME_TOPUP" || product.slug.includes("game");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 font-sans">
      {/* Breadcrumb line navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 font-orbitron text-xs tracking-wider text-accent-primary hover:text-white transition-colors mb-8 cursor-pointer select-none group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>KEMBALI KE CATALOG</span>
      </button>

      {orderSuccess ? (
        // RENDER ORDER SUCCESS / PAYMENT PROTOCOL SCREEN
        <div className="max-w-3xl mx-auto mt-2">
          <CyberCard accent="primary" className="p-8 text-center bg-cyber-surface/90 shadow-lg">
            <span className="w-12 h-12 bg-accent-wa/10 text-accent-wa border border-accent-wa rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <ShieldCheck className="w-6 h-6 shrink-0" />
            </span>

            <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-accent-primary text-neon mb-2 uppercase">
              PESANAN DIDRAFT SUKSES
            </h2>
            <p className="text-xs text-cyber-muted uppercase tracking-widest mb-6">
              Silakan selesaikan pembayaran agar akun / top up diproses admin
            </p>

            {/* Ref Code Box container */}
            <div className="bg-cyber-bg border border-accent-primary/30 p-4 mb-8 flex flex-col items-center max-w-md mx-auto">
              <span className="text-[10px] text-cyber-muted uppercase tracking-wide">
                KODE TRANSAKSI (SALIN KE ADMIN WA):
              </span>
              <span className="font-mono font-bold text-xl text-white mt-1 select-all tracking-wider">
                {orderSuccess.refCode}
              </span>
            </div>

            {/* Payment visual details steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-y border-accent-primary/10 py-8 mb-8">
              {/* Manual BCA */}
              <div className="bg-cyber-bg/40 border border-accent-primary/5 p-5 relative">
                <span className="absolute top-2.5 right-3 text-[9px] font-mono text-accent-primary">
                  [MANUAL TRANSFER]
                </span>
                <span className="block font-orbitron font-semibold text-xs text-cyber-muted uppercase mb-3">
                  Transfer Bank BCA
                </span>
                <div className="space-y-1.5 text-sm">
                  <p className="text-cyber-muted text-xs">Nama Bank : <span className="text-white font-semibold">{bankName}</span></p>
                  <p className="text-cyber-muted text-xs">No. Rekening : <span className="text-accent-secondary font-bold font-mono tracking-wide">{bankNumber}</span></p>
                  <p className="text-cyber-muted text-xs">Atas Nama : <span className="text-white font-semibold">{bankHolder}</span></p>
                </div>
              </div>

              {/* QRIS Graphic Display image placeholder */}
              <div className="bg-cyber-bg/40 border border-accent-primary/5 p-5 flex gap-4 items-center justify-between">
                <div className="space-y-1">
                  <span className="bg-accent-secondary/25 text-accent-secondary text-[8px] font-mono border border-accent-secondary/40 px-1 py-0.5 rounded-sm inline-block uppercase">
                    E-WALLET INSTANT
                  </span>
                  <span className="block font-orbitron font-semibold text-xs text-cyber-muted uppercase mt-2">
                    QRIS Digital
                  </span>
                  <p className="text-[11px] text-cyber-muted">
                    Scan via GoPay, OVO, Dana, Shopee, LinkAja.
                  </p>
                </div>

                <div className="w-20 h-20 bg-white p-1 rounded-xs flex items-center justify-center shrink-0 border border-accent-primary">
                  <img
                    src={qrisImageUrl}
                    alt="QRIS Merchant Payment"
                    className="w-full h-full object-cover filter contrast-125"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* CTA action routes back to WA redirect helper */}
            <div className="space-y-4">
              <CyberButton
                variant="wa"
                size="lg"
                className="w-full font-bold shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.6)]"
                onClick={() => window.open(orderSuccess.waUrl, "_blank")}
              >
                <Send className="w-5 h-5" />
                KIRIM BUKTI TRANSFER KE WA
              </CyberButton>

              <button
                onClick={() => {
                  setOrderSuccess(null);
                  onBack();
                }}
                className="text-xs text-cyber-muted hover:text-white underline cursor-pointer font-mono"
              >
                KEMBALI KE BERANDA SELESAI
              </button>
            </div>
          </CyberCard>
        </div>
      ) : (
        // CORE DETAIL AND BOOKING FORM LAYOUT
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT CONTAINER: Visual Preview and Description context */}
          <div className="lg:col-span-7 space-y-6">
            <CyberCard accent="neutral" className="p-0 bg-cyber-card/75 overflow-hidden">
              <div className="w-full h-64 sm:h-96 relative overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-card via-transparent to-transparent" />
                <span className="absolute bottom-4 left-6 bg-accent-primary/20 text-accent-primary font-orbitron text-xs font-semibold px-2.5 py-1 border border-accent-primary/30 uppercase">
                  ACTIVE PACKAGES : {product.packages?.length || 0}
                </span>
              </div>
            </CyberCard>

            {/* Text details description */}
            <CyberCard accent="neutral" className="bg-cyber-card/40">
              <h2 className="font-orbitron font-bold text-lg text-white mb-4 uppercase tracking-wider flex items-center gap-1.5 border-b border-accent-primary/10 pb-3">
                <span>[DETAIL PRODUK PROTOCOL]</span>
              </h2>
              <div className="text-xs sm:text-sm text-cyber-text leading-relaxed whitespace-pre-line space-y-4 font-sans">
                {product.description}
              </div>
            </CyberCard>

            {/* Moderated Reviews Listing */}
            <CyberCard accent="neutral" className="bg-cyber-card/40">
              <h2 className="font-orbitron font-bold text-lg text-white mb-4 uppercase tracking-wider border-b border-accent-primary/10 pb-3">
                🔊 ULASAN PEMBELI ({reviews.length})
              </h2>

              {reviews.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-cyber-muted/10 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="font-orbitron font-bold text-xs text-white uppercase tracking-wide">
                          {rev.buyerName}
                        </span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-cyber-muted/30"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-cyber-text opacity-90 italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-cyber-muted italic py-2">
                  Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
                </p>
              )}

              {/* Submission of review */}
              <form onSubmit={handleReviewSubmit} className="mt-8 pt-6 border-t border-accent-primary/10 text-left space-y-4">
                <span className="block font-orbitron font-bold text-xs text-accent-secondary uppercase tracking-widest mb-1">
                  // KIRIM ULASAN ANDA
                </span>

                {revSuccessMsg && (
                  <div className="bg-accent-primary/5 border border-accent-primary/30 p-3 text-xs text-accent-primary font-medium animate-pulse">
                    {revSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      placeholder="Budi Setiawan"
                      className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
                      Rating Bintang
                    </label>
                    <select
                      value={revRating}
                      onChange={(e) => setRevRating(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ - Premium Mantap (5)</option>
                      <option value="4">⭐⭐⭐⭐ - Bagus Cepat (4)</option>
                      <option value="3">⭐⭐⭐ - Cukup Oke (3)</option>
                      <option value="2">⭐⭐ - Kurang Puas (2)</option>
                      <option value="1">⭐ - Bermasalah (1)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
                    Komentar Ulasan
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    placeholder="Contoh: Sangat puas beli sewa Netflix disini, direspon cepet lgsg nonton HD..."
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans"
                  />
                </div>

                <CyberButton type="submit" variant="secondary" size="sm" glowing={false} disabled={revSubmitting}>
                  <Send className="w-3.5 h-3.5" />
                  {revSubmitting ? "MENGIRIM..." : "SUBMIT REVIEW"}
                </CyberButton>
              </form>
            </CyberCard>
          </div>

          {/* RIGHT CONTAINER: Booking Checkout process Panel */}
          <div className="lg:col-span-5 relative">
            <CyberCard accent="primary" className="sticky top-26 bg-cyber-card/95 border-accent-primary/30 p-6 md:p-8 rounded-none">
              <h3 className="font-orbitron font-black text-lg text-white mb-4 uppercase tracking-widest border-b border-accent-primary/10 pb-3 flex items-center gap-1.5">
                <ShoppingCart className="w-5 h-5 text-accent-primary animate-pulse" />
                <span>[CHECKOUT CORE]</span>
              </h3>

              {/* Package Select widgets */}
              <div className="mb-6">
                <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-3 uppercase">
                  1. Pilih Paket Produk
                </label>

                {product.packages && product.packages.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {product.packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      const hasStock = isGameTopUp || (pkg.stockCount || 0) > 0;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            if (hasStock) setSelectedPackage(pkg);
                          }}
                          className={`border p-3 flex justify-between items-center gap-3 transition-all duration-200 ${
                            !hasStock
                              ? "border-cyber-muted/10 opacity-45 cursor-not-allowed"
                              : isSelected
                              ? "border-accent-primary bg-accent-primary/5 cursor-pointer shadow-[0_0_8px_rgba(0,245,255,0.1)]"
                              : "border-cyber-muted/20 hover:border-accent-primary/30 bg-cyber-surface/40 cursor-pointer"
                          }`}
                        >
                          <div className="text-left">
                            <span className={`block font-orbitron font-bold text-xs tracking-wider ${isSelected ? "text-accent-primary" : "text-white"}`}>
                              {pkg.label}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {pkg.warrantyDays > 0 && (
                                <span className="text-[9px] font-mono text-cyber-muted">
                                  🛡️ Garansi {pkg.warrantyDays} Hari
                                </span>
                              )}
                              {pkg.maxDevices > 0 && (
                                <span className="text-[9px] font-mono text-cyber-muted">
                                  ● {pkg.maxDevices} Device
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="block font-orbitron font-bold text-xs text-accent-secondary">
                              {formatPrice(pkg.price)}
                            </span>
                            {pkg.originalPrice > pkg.price && (
                              <span className="text-[9px] line-through text-cyber-muted font-mono block">
                                {formatPrice(pkg.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-red-400 italic">
                    Paket produk tidak dikonfigurasi admin mas. Hubungi cs.
                  </p>
                )}
              </div>

              {/* Data entry fields */}
              {selectedPackage && (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div className="border-t border-accent-primary/10 pt-4">
                    <label className="block text-[10px] font-orbitron tracking-wider text-cyber-muted mb-1.5 uppercase">
                      2. Kelola Data Diri Anda
                    </label>

                    {/* Game Identifications prompt if ML/FF category */}
                    {isGameTopUp && (
                      <div className="mb-3.5">
                        <label className="block text-[9px] font-orbitron tracking-wider text-accent-primary uppercase mb-1">
                          Masukkan User ID Game & Server *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: ML ID 12938128 (2034)"
                          value={gameDetails}
                          onChange={(e) => setGameDetails(e.target.value)}
                          className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-xs font-mono tracking-widest placeholder-cyber-muted"
                        />
                        <span className="block text-[8px] text-cyber-muted mt-1 uppercase italic">
                          ID top up game Anda dikredit langsung 24 Jam
                        </span>
                      </div>
                    )}

                    {/* Name */}
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

                    {/* Phone WA */}
                    <div>
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
                      <span className="block text-[8px] text-cyber-muted mt-1.5 uppercase">
                        Sistem bypass otomatis redirect ke nomor WA Admin
                      </span>
                    </div>
                  </div>

                  {/* Voucher Input */}
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

                  {/* Summary bill */}
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

                  {/* Submit checkout CTA triggers redirect to template 1 */}
                  <div className="pt-2">
                    <CyberButton
                      type="submit"
                      variant="wa"
                      size="lg"
                      className="w-full font-bold shadow-[0_0_12px_rgba(37,211,102,0.2)]"
                      disabled={submittingOrder}
                    >
                      <img
                        className="w-5 h-5 shrink-0"
                        src="https://img.icons8.com/?size=48&id=16713&format=png"
                        alt="WhatsApp Icon"
                        referrerPolicy="no-referrer"
                      />
                      {submittingOrder ? "MENGIRIM PROTOCOL..." : "PROSES ORDER VIA WA"}
                    </CyberButton>
                  </div>
                </form>
              )}
            </CyberCard>
          </div>
        </div>
      )}
    </div>
  );
};
