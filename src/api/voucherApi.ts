export const applyVoucher = async (code: string, purchaseValue: number) => {
  const res = await fetch("/api/vouchers/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: code.trim().toUpperCase(), purchaseValue })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Kupon tidak valid");
  }
  return await res.json();
};
