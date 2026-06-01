import React, { useState, useEffect } from "react";
import { HelpCircle, Star, Plus, Trash2, Check, X, ShieldAlert, AlertCircle } from "lucide-react";
import { FaqItem, Review } from "../../types";

interface FaqAndReviewsViewProps {
  token: string;
}

export const FaqAndReviewsView: React.FC<FaqAndReviewsViewProps> = ({ token }) => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // FAQ Modal form states
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  useEffect(() => {
    fetchMainData();
  }, [token]);

  const fetchMainData = async () => {
    try {
      setLoading(true);
      const [resFaq, resRev] = await Promise.all([
        fetch("/api/admin/faqs", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/reviews/pending", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!resFaq.ok || !resRev.ok) throw new Error("Gagal menyinkronkan data moderasi");
      const listFaq = await resFaq.json();
      const listRev = await resRev.json();
      setFaqs(listFaq);
      setPendingReviews(listRev);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: faqQuestion, answer: faqAnswer }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan FAQ");
      setFaqQuestion("");
      setFaqAnswer("");
      setShowAddFaq(false);
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!window.confirm("Hapus item FAQ pilihan?")) return;
    try {
      const res = await fetch(`/api/admin/faqs/${faqId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus FAQ");
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Review status moderations
  const handleApproveReview = async (revId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${revId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal meng-approve ulasan");
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteReview = async (revId: string) => {
    if (!window.confirm("Menolak & menghapus ulasan pembeli terpilih?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${revId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mendelete ulasan");
      fetchMainData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 text-left font-sans">
      {/* View Header */}
      <div>
        <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
          // FAQS & VISITOR REVIEWS CONTROL
        </h1>
        <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
          Tambahkan daftar tanya-jawab umum (FAQ) dan moderasi persetujuan rating produk yang di-submit pembeli
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* REVIEWS MODERATION: Left column (8 grid) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-accent-secondary/25 bg-cyber-card/75 p-5 relative rounded-xs">
            <span className="block text-xs font-orbitron font-bold text-accent-secondary uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-accent-secondary shrink-0 animate-pulse" />
              <span>// PERSUASIVE REVIEWS QUEUE ({pendingReviews.length})</span>
            </span>

            {loading ? (
              <p className="py-6 text-center text-xs text-cyber-muted font-mono">LOADING QUEUE INDEXES...</p>
            ) : pendingReviews.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {pendingReviews.map((rev) => (
                  <div key={rev.id} className="border border-cyber-muted/15 p-4 bg-cyber-surface/40 rounded-xs flex items-center justify-between gap-4">
                    <div className="text-left font-sans text-xs flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-orbitron font-bold text-white uppercase">{rev.buyerName}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-cyber-muted/25"}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-cyber-text italic mt-1 leading-relaxed">"{rev.comment}"</p>
                      
                      <span className="block text-[9px] text-[#00F5FF] font-mono uppercase tracking-wider mt-2.5">
                        📂 TARGET PRODUK: {(rev as any).product?.name || "Premium Item"}
                      </span>
                    </div>

                    {/* Moderation approves actions button toggles */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveReview(rev.id)}
                        className="p-1 px-1.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 rounded-xs cursor-pointer transition-colors"
                        title="Approve / Loloskan"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1 px-1.5 bg-red-950/15 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xs cursor-pointer transition-colors"
                        title="Tolak / Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-cyber-muted/15 bg-cyber-card/10 rounded-xs text-xs text-cyber-muted italic">
                <AlertCircle className="w-8 h-8 text-cyber-muted mx-auto mb-2" />
                Semua ulasan bintang pembeli telah bersih ter-moderasi. Tidak ada antrian pending.
              </div>
            )}
          </div>
        </div>

        {/* FAQ LISTS: Right column (4 grid) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-accent-primary/20 bg-cyber-card p-5 relative">
            <div className="flex justify-between items-center mb-4">
              <span className="block text-xs font-orbitron font-bold text-accent-primary uppercase tracking-widest">
                // ACTIVE FAQ BOARD ({faqs.length})
              </span>

              <button
                onClick={() => setShowAddFaq(true)}
                className="p-1 bg-accent-primary/10 text-accent-primary border border-accent-primary/25 hover:bg-accent-primary hover:text-white transition-all rounded-xs text-[10px] font-orbitron font-bold cursor-pointer"
              >
                + ADD FAQ
              </button>
            </div>

            {loading ? (
              <p className="py-6 text-center text-xs text-cyber-muted font-mono">LOADING INDEXES...</p>
            ) : faqs.length > 0 ? (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 text-xs">
                {faqs.map((f) => (
                  <div key={f.id} className="border border-cyber-muted/10 p-3 bg-cyber-surface/30 rounded-xs flex items-start justify-between gap-3.5">
                    <div className="text-left font-sans">
                      <p className="text-white font-bold font-orbitron text-xs tracking-wider">Q: {f.question.toUpperCase()}</p>
                      <p className="text-cyber-muted mt-1 leading-relaxed">{f.answer}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="text-red-500 hover:text-white p-1 hover:bg-red-950/20 rounded-xs cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-cyber-muted italic p-2 rounded-xs">Belum ada item FAQ. Silakan tambahkan lewat tombol di atas.</p>
            )}
          </div>
        </div>
      </div>

      {/* ADD FAQ MODAL */}
      {showAddFaq && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F1A] border border-accent-primary p-6 relative rounded-xs text-left">
            <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-cyber-muted hover:text-white cursor-pointer" onClick={() => setShowAddFaq(false)}>
              <X className="w-5 h-5" />
            </span>

            <h3 className="font-orbitron font-bold text-base text-white mb-5 uppercase tracking-widest text-[#00F5FF]">
              // INPUT FAQ BARU
            </h3>

            <form onSubmit={handleCreateFaq} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Pertanyaan FAQ *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Apakah akun premium Netflixnya garansi anti hold?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Jawaban Solusi *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ketik jawaban penjelasan solusi secara lengkap..."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary text-xs text-white leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white transition-all text-xs font-orbitron font-semibold cursor-pointer rounded-xs"
                >
                  SAVE FAQ ITEM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
