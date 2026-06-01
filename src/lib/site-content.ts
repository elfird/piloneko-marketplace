export interface SiteContentMap {
  hero_headline: string;
  hero_subtext: string;
  hero_badge_1: string;
  hero_badge_2: string;
  hero_badge_3: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  stats_buyers: string;
  stats_products: string;
  stats_rating: string;
  stats_years: string;
  how_step1_title: string;
  how_step1_desc: string;
  how_step2_title: string;
  how_step2_desc: string;
  how_step3_title: string;
  how_step3_desc: string;
  footer_description: string;
  footer_ig: string;
  footer_tiktok: string;
  footer_fb: string;
  theme_accent_primary: string;
  theme_accent_secondary: string;
  store_name: string;
  store_wa: string;
  store_email: string;
  bank_name: string;
  bank_number: string;
  bank_holder: string;
  qris_image_url: string;
  flash_sale_active: string; // 'true' | 'false'
  flash_sale_ends_at: string;
  seo_title: string;
  seo_description: string;
  seo_og_image: string;
}

export const DEFAULT_SITE_CONTENT: SiteContentMap = {
  hero_headline: "RESTU PREMIUM & TOP UP GAME BERGARANSI",
  hero_subtext: "Cyber Marketplace akun premium terlengkap, lisensi software, & top up game instant. Transaksi super aman kilat langsung via WhatsApp.",
  hero_badge_1: "⚡ KILAT INSTANT",
  hero_badge_2: "🛡️ GARANSI AMAN",
  hero_badge_3: "💎 HARGA TERMURAH",
  hero_cta_primary: "MULAI BELANJA",
  hero_cta_secondary: "KONSULTASI WA",
  stats_buyers: "15,420+",
  stats_products: "120+",
  stats_rating: "4.9/5",
  stats_years: "3 Tahun",
  how_step1_title: "1. Pilih Produk & Paket",
  how_step1_desc: "Telusuri katalog akun premium, software, atau item game kami. Pilih paket durasi atau nominal yang Anda inginkan.",
  how_step2_title: "2. Isi Data Penerima",
  how_step2_desc: "Masukkan Nama Lengkap dan No. WhatsApp aktif Anda di form pemesanan instant kami.",
  how_step3_title: "3. Selesaikan via WhatsApp",
  how_step3_desc: "Sistem akan mengarahkan Anda ke WhatsApp Admin. Lakukan pembayaran dan detail pesanan Anda akan dikirim seketika itu juga!",
  footer_description: "PILONEKO adalah penyedia akun premium bergaransi (Canva, Netflix, Spotify, ChatGPT) dan top up game termurah tercepat dengan transaksi WhatsApp online 24 jam.",
  footer_ig: "https://instagram.com/piloneko",
  footer_tiktok: "https://tiktok.com/@piloneko",
  footer_fb: "https://facebook.com/piloneko",
  theme_accent_primary: "#00F5FF",
  theme_accent_secondary: "#BF00FF",
  store_name: "PILONEKO",
  store_wa: "085174488804",
  store_email: "support@piloneko.com",
  bank_name: "Bank BCA",
  bank_number: "8720491823",
  bank_holder: "PT PILONEKO GLOBAL JAYA",
  qris_image_url: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop",
  flash_sale_active: "true",
  flash_sale_ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
  seo_title: "PILONEKO - Jual Akun Premium & Top Up Game Murah Bergaransi",
  seo_description: "Beli akun premium Canva, Netflix, CapCut, Spotify, ChatGPT, dan top up game Mobile Legends, Free Fire, PUBG murah bergaransi 100%.",
  seo_og_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
};

export function parseSiteContents(rows: { key: string; value: string }[]): SiteContentMap {
  const content = { ...DEFAULT_SITE_CONTENT };
  for (const row of rows) {
    if (row.key in content) {
      (content as any)[row.key] = row.value;
    }
  }
  return content;
}
