export const getProductBySlug = async (slug: string) => {
  const res = await fetch(`/api/products/${slug}`);
  if (!res.ok) throw new Error("Gagal mengambil detail produk");
  return await res.json();
};

export const submitProductReview = async (productId: string, payload: { buyerName: string; rating: number; comment: string }) => {
  const res = await fetch(`/api/products/${productId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal mengirim ulasan");
  return await res.json();
};
