export const createTransaction = async (payload: any) => {
  const res = await fetch("/api/payment/create-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    let errorMsg = errorData.message || "Gagal memproses pesanan. Harap coba lagi.";
    
    if (errorData.error) {
      if (Array.isArray(errorData.error)) {
        errorMsg = errorData.error.map((e: any) => e.message).join(", ");
      } else if (typeof errorData.error === 'string') {
        errorMsg = errorData.error;
      }
    }
    
    throw new Error(errorMsg);
  }
  return await res.json();
};
