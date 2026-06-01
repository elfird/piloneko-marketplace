// WhatsApp Templates for the marketplace

export interface WaTemplate1Data {
  nama_toko: string;
  nama_produk: string;
  nama_paket: string;
  harga: string | number;
  kode_ref: string;
  nama_pembeli: string;
  no_wa_pembeli: string;
}

export interface WaTemplate2Data {
  kode_ref: string;
  nama_produk: string;
  harga: string | number;
  metode_bayar: string;
  waktu: string;
  nama_pembeli: string;
}

export interface WaTemplate3Data {
  nama_pembeli: string;
  nama_toko: string;
  nama_produk: string;
  nama_paket: string;
  tanggal_expired: string;
  durasi_garansi: string;
  email_akun: string;
  password_akun: string;
  maks_device: string | number;
}

export interface WaTemplate4Data {
  kode_ref: string;
  nama_produk: string;
  deskripsi_masalah: string;
  nama_pembeli: string;
}

export interface WaTemplate5Data {
  nama_toko: string;
  nama_produk: string;
}

// 1. Order Baru (pembeli -> admin)
export const getTemplate1 = (data: WaTemplate1Data): string => {
  return `Halo Admin ${data.nama_toko}! Saya ingin memesan:

🛒 *PESANAN BARU*
━━━━━━━━━━━━━━━
📦 Produk  : ${data.nama_produk}
📋 Paket   : ${data.nama_paket}
💰 Harga   : Rp ${Number(data.harga).toLocaleString("id-ID")}
🆔 Ref     : ${data.kode_ref}

👤 *DATA SAYA*
━━━━━━━━━━━━━━━
Nama       : ${data.nama_pembeli}
No. WA     : ${data.no_wa_pembeli}

Mohon info rekening/QRIS untuk pembayaran. Terima kasih!`;
};

// 2. Konfirmasi bayar (pembeli -> admin)
export const getTemplate2 = (data: WaTemplate2Data): string => {
  return `Halo Admin, saya sudah transfer:

✅ *KONFIRMASI PEMBAYARAN*
━━━━━━━━━━━━━━━
🆔 Ref     : ${data.kode_ref}
📦 Produk  : ${data.nama_produk}
💵 Total   : Rp ${Number(data.harga).toLocaleString("id-ID")}
🏦 Via     : ${data.metode_bayar}
🕐 Jam     : ${data.waktu}
Nama       : ${data.nama_pembeli}

Mohon segera diverifikasi. Terima kasih!`;
};

// 3. Kirim akun (admin -> pembeli)
export const getTemplate3 = (data: WaTemplate3Data): string => {
  return `Halo ${data.nama_pembeli}!

✅ *PEMBAYARAN DIKONFIRMASI*
Terima kasih sudah berbelanja di ${data.nama_toko}!

🎉 *AKUN KAMU SUDAH SIAP:*
━━━━━━━━━━━━━━━
📦 Produk       : ${data.nama_produk}
📋 Paket        : ${data.nama_paket}
📅 Aktif hingga : ${data.tanggal_expired}
🛡️ Garansi      : ${data.durasi_garansi}

🔐 *DETAIL AKUN:*
━━━━━━━━━━━━━━━
📧 Email    : ${data.email_akun}
🔑 Password : ${data.password_akun}

⚠️ PENTING:
• Jangan ganti password
• Maks ${data.maks_device} perangkat aktif
• Hubungi kami jika ada kendala

Terima kasih! 🙏 — *${data.nama_toko}*`;
};

// 4. Klaim garansi (pembeli -> admin)
export const getTemplate4 = (data: WaTemplate4Data): string => {
  return `Halo Admin, saya ingin klaim garansi:

🛡️ *KLAIM GARANSI*
━━━━━━━━━━━━━━━
🆔 Ref     : ${data.kode_ref}
📦 Produk  : ${data.nama_produk}
❗ Masalah : ${data.deskripsi_masalah}
Nama       : ${data.nama_pembeli}

Mohon bantuannya. Terima kasih!`;
};

// 5. Tanya stok (pembeli -> admin)
export const getTemplate5 = (data: WaTemplate5Data): string => {
  return `Halo Admin ${data.nama_toko}!

Saya ingin tanya stok untuk:
📦 Produk : ${data.nama_produk}

Apakah masih tersedia? Terima kasih!`;
};

export function getWAUrl(phone: string, text: string): string {
  // Normalize phone number to start with country code without + or spaces
  let formattedPhone = phone.replace(/[^0-9]/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.slice(1);
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}
