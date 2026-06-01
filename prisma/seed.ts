import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const DEFAULT_SITE_CONTENT = {
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
  flash_sale_ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  seo_title: "PILONEKO - Jual Akun Premium & Top Up Game Murah Bergaransi",
  seo_description: "Beli akun premium Canva, Netflix, CapCut, Spotify, ChatGPT, dan top up game Mobile Legends, Free Fire, PUBG murah bergaransi 100%.",
  seo_og_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
};

async function main() {
  console.log("Seeding database...");

  // Delete existing records to avoid conflicts on re-runs
  try {
    await prisma.accountStock.deleteMany({});
    await prisma.productPackage.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.flashSaleItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.waTemplate.deleteMany({});
    await prisma.testimonial.deleteMany({});
    await prisma.faqItem.deleteMany({});
    await prisma.siteContent.deleteMany({});
  } catch (err) {
    console.log("Clean up failed, probably first-time running. Proceeding...");
  }

  // 1. Admin setup
  await prisma.admin.create({
    data: {
      email: "admin@premiumku.com",
      passwordHash: hashPassword("admin123"),
      name: "Super Admin PremiumKu",
    },
  });

  // 2. Categories
  const catPremium = await prisma.category.create({
    data: {
      name: "Akun Premium",
      slug: "akun-premium",
      icon: "Tv",
      type: "PREMIUM_ACCOUNT",
      sortOrder: 1,
    },
  });

  const catGame = await prisma.category.create({
    data: {
      name: "Top Up Game",
      slug: "top-up-game",
      icon: "Gamepad",
      type: "GAME_TOPUP",
      sortOrder: 2,
    },
  });

  const catLicense = await prisma.category.create({
    data: {
      name: "Lisensi Software",
      slug: "lisensi-software",
      icon: "Key",
      type: "LICENSE",
      sortOrder: 3,
    },
  });

  // 3. Products
  // Netflix (Akun Premium)
  const pNetflix = await prisma.product.create({
    data: {
      categoryId: catPremium.id,
      name: "Netflix Premium Ultra HD",
      slug: "netflix-premium",
      description: "Nonton film dan serial TV kualitas Ultra HD 4K terbaik tanpa gangguan iklan. Tersedia paket Shared (1 Profil) dan Private (Full 5 Profil). Garansi penuh sesuai durasi sewa.",
      thumbnail: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80",
      isActive: true,
      isFeatured: true,
      totalSold: 421,
    }
  });

  // ChatGPT Plus (Akun Premium)
  const pChatGpt = await prisma.product.create({
    data: {
      categoryId: catPremium.id,
      name: "ChatGPT Plus & GPT-4o",
      slug: "chatgpt-plus",
      description: "Akses model kecerdasan buatan terkuat GPT-4o tanpa limits. Sangat cepat, bisa analisis gambar, pencarian web, coding bantuan cerdas, dan file analyst.",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400&q=80",
      isActive: true,
      isFeatured: true,
      totalSold: 289,
    }
  });

  // Spotify (Akun Premium)
  const pSpotify = await prisma.product.create({
    data: {
      categoryId: catPremium.id,
      name: "Spotify Premium",
      slug: "spotify-premium",
      description: "Dengarkan musik tanpa jeda iklan, download sepuasnya offline, kualitas audio ultra jernih. Legal 100% menggunakan akun Anda sendiri atau akun dari kami.",
      thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80",
      isActive: true,
      isFeatured: true,
      totalSold: 512,
    }
  });

  // Canva Pro
  const pCanva = await prisma.product.create({
    data: {
      categoryId: catPremium.id,
      name: "Canva Pro Premium",
      slug: "canva-pro",
      description: "Desain grafis profesional dengan jutaan aset premium, templates, background remover, brand kits, dan export video/gambar resolusi tinggi.",
      thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80",
      isActive: true,
      isFeatured: false,
      totalSold: 311,
    }
  });

  // Mobile Legends (Top Up)
  const pML = await prisma.product.create({
    data: {
      categoryId: catGame.id,
      name: "Mobile Legends Diamonds",
      slug: "mobile-legends",
      description: "Top Up Diamond Mobile Legends murah dan super instant 24 Jam. Masukkan ID, Zone ID, pilih nominal Diamond dan segera bayar via WhatsApp.",
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80",
      isActive: true,
      isFeatured: true,
      totalSold: 1209,
    }
  });

  // Free Fire (Top Up)
  const pFF = await prisma.product.create({
    data: {
      categoryId: catGame.id,
      name: "Free Fire Diamonds",
      slug: "free-fire",
      description: "Isi ulang diamond Free Fire instant aman legal 100%. Hanya butuh User ID game Anda.",
      thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80",
      isActive: true,
      isFeatured: false,
      totalSold: 742,
    }
  });

  // Windows 11 Lisensi
  const pWindows = await prisma.product.create({
    data: {
      categoryId: catLicense.id,
      name: "Windows 11 Pro Retail License",
      slug: "windows-11-pro",
      description: "Lisensi Windows 11 Pro original retail key. Aktif permanen seumur hidup (Lifetime), bisa update resmi, bind email/hardware Microsoft.",
      thumbnail: "https://images.unsplash.com/photo-1625014020903-e329f586c990?w=400&q=80",
      isActive: true,
      isFeatured: true,
      totalSold: 154,
    }
  });

  // 4. Packages and Account Stocks
  // Package for Netflix
  const pkNetflixShared = await prisma.productPackage.create({
    data: {
      productId: pNetflix.id,
      label: "1 Bulan (Shared - 1 Profil 1 Device)",
      price: 25000,
      originalPrice: 45000,
      durationDays: 30,
      warrantyDays: 30,
      maxDevices: 1,
      stockCount: 5,
    }
  });

  const pkNetflixPrivate = await prisma.productPackage.create({
    data: {
      productId: pNetflix.id,
      label: "1 Bulan (Private - 5 Profil)",
      price: 110000,
      originalPrice: 150000,
      durationDays: 30,
      warrantyDays: 30,
      maxDevices: 5,
      stockCount: 1,
    }
  });

  // ChatGPT plus packages
  const pkChat1 = await prisma.productPackage.create({
    data: {
      productId: pChatGpt.id,
      label: "1 Bulan Shared (GPT-4o)",
      price: 49000,
      originalPrice: 75000,
      durationDays: 30,
      warrantyDays: 30,
      maxDevices: 1,
      stockCount: 3,
    }
  });

  // Spotify Packages
  const pkSpotFam = await prisma.productPackage.create({
    data: {
      productId: pSpotify.id,
      label: "3 Bulan Premium (Family Invite)",
      price: 35000,
      originalPrice: 90000,
      durationDays: 90,
      warrantyDays: 90,
      maxDevices: 1,
      stockCount: 12,
    }
  });

  // Canva Pro
  const pkCanvaTeam = await prisma.productPackage.create({
    data: {
      productId: pCanva.id,
      label: "1 Tahun Pro (Invite Link)",
      price: 20000,
      originalPrice: 150000,
      durationDays: 365,
      warrantyDays: 365,
      maxDevices: 3,
      stockCount: 20,
    }
  });

  // Game ML top up packages
  const pkML86 = await prisma.productPackage.create({
    data: {
      productId: pML.id,
      label: "86 Diamonds MLBB",
      price: 20000,
      originalPrice: 24000,
      durationDays: 0,
      warrantyDays: 0,
      maxDevices: 0,
      stockCount: 999,
    }
  });

  const pkML257 = await prisma.productPackage.create({
    data: {
      productId: pML.id,
      label: "257 Diamonds MLBB",
      price: 58000,
      originalPrice: 65000,
      durationDays: 0,
      warrantyDays: 0,
      maxDevices: 0,
      stockCount: 999,
    }
  });

  const pkWindowsKey = await prisma.productPackage.create({
    data: {
      productId: pWindows.id,
      label: "Retail Key Lifetime (Aktif Online)",
      price: 45000,
      originalPrice: 150000,
      durationDays: 9999,
      warrantyDays: 365,
      maxDevices: 1,
      stockCount: 2,
    }
  });

  // 5. Account Stocks (Dummy stocks)
  for (let i = 1; i <= 5; i++) {
    await prisma.accountStock.create({
      data: {
        packageId: pkNetflixShared.id,
        emailAkun: `netsh_acc${i}@gmail.com`,
        passwordAkun: `netflixshared123_pass_${i}`,
        infoTambahan: `Shared Profile No. ${i} - Dilarang keras mengganti password atau mengedit profil lain.`,
        status: "AVAILABLE"
      }
    });
  }

  await prisma.accountStock.create({
    data: {
      packageId: pkNetflixPrivate.id,
      emailAkun: "netflixprivate_v1@gmail.com",
      passwordAkun: "netpriv_391039",
      infoTambahan: "Profil Private milik pribadi. Bisa ganti nama profil & PIN profil sesuka hati.",
      status: "AVAILABLE"
    }
  });

  for (let i = 1; i <= 3; i++) {
    await prisma.accountStock.create({
      data: {
        packageId: pkChat1.id,
        emailAkun: `gptshared_${i}@openai-premium.org`,
        passwordAkun: `gptpass_secure_${i*79}`,
        infoTambahan: "Gunakan web chat.openai.com. Jangan hapus history chat lain.",
        status: "AVAILABLE"
      }
    });
  }

  await prisma.accountStock.create({
    data: {
      packageId: pkWindowsKey.id,
      emailAkun: "WINDOWS_KEY_RETAIL",
      passwordAkun: "W269N-WFGWX-YVC9B-4J6C9-T83GX",
      infoTambahan: "Buka Settings -> Update & Security -> Activation -> Change Product Key. Lalu paste key di atas.",
      status: "AVAILABLE"
    }
  });

  // 6. WA Templates
  await prisma.waTemplate.createMany({
    data: [
      {
        key: "order_baru",
        label: "Pemesanan Baru (Pembeli ke Admin)",
        templateText: `Halo Admin {nama_toko}! Saya ingin memesan:\n\n🛒 *PESANAN BARU*\n━━━━━━━━━━━━━━━\n📦 Produk  : {nama_produk}\n📋 Paket   : {nama_paket}\n💰 Harga   : Rp {harga}\n🆔 Ref     : {kode_ref}\n\n👤 *DATA SAYA*\n━━━━━━━━━━━━━━━\nNama       : {nama_pembeli}\nNo. WA     : {no_wa_pembeli}\n\nMohon info rekening/QRIS untuk pembayaran. Terima kasih!`
      },
      {
        key: "konfirmasi_bayar",
        label: "Konfirmasi Transfer Pembayaran",
        templateText: `Halo Admin, saya sudah transfer:\n\n✅ *KONFIRMASI PEMBAYARAN*\n━━━━━━━━━━━━━━━\n🆔 Ref     : {kode_ref}\n📦 Produk  : {nama_produk}\n💵 Total   : Rp {harga}\n🏦 Via     : {metode_bayar}\n🕐 Jam     : {waktu}\nNama       : {nama_pembeli}\n\nMohon segera diverifikasi. Terima kasih!`
      },
      {
        key: "kirim_akun",
        label: "Kirim Detail Akun Premium (Admin ke Pembeli)",
        templateText: "Halo {nama_pembeli}!\n\n✅ *PEMBAYARAN DIKONFIRMASI*\nTerima kasih sudah berbelanja di {nama_toko}!\n\n🎉 *AKUN KAMU SUDAH SIAP:*\n━━━━━━━━━━━━━━━\n📦 Produk       : {nama_produk}\n📋 Paket        : {nama_paket}\n📅 Aktif hingga : {tanggal_expired}\n🛡️ Garansi      : {durasi_garansi}\n\n🔐 *DETAIL AKUN:*\n━━━━━━━━━━━━━━━\n📧 Email    : {email_akun}\n🔑 Password : {password_akun}\n\n⚠️ PENTING:\n• Jangan ganti password\n• Maks {maks_device} perangkat aktif\n• Hubungi kami jika ada kendala\n\nTerima kasih! 🙏 — *{nama_toko}*"
      },
      {
        key: "klaim_garansi",
        label: "Klaim Garansi (Pembeli ke Admin)",
        templateText: `Halo Admin, saya ingin klaim garansi:\n\n🛡️ *KLAIM GARANSI*\n━━━━━━━━━━━━━━━\n🆔 Ref     : {kode_ref}\n📦 Produk  : {nama_produk}\n❗ Masalah : {deskripsi_masalah}\nNama       : {nama_pembeli}\n\nMohon bantuannya. Terima kasih!`
      },
      {
        key: "tanya_stok",
        label: "Tanya Ketersediaan Stok (Pembeli ke Admin)",
        templateText: `Halo Admin {nama_toko}!\n\nSaya ingin tanya stok untuk:\n📦 Produk : {nama_produk}\n\nApakah masih tersedia? Terima kasih!`
      }
    ]
  });

  // 7. Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        buyerName: "Rian CyberX",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
        rating: 5,
        comment: "Beli Netflix premium lgsg diarahin ke WA. QRIS scan 2 detik lgsg dikasi email & pass. Gilak, adminnya fast respon kyk bot cyberpunk!",
        productName: "Netflix Premium Ultra HD",
        sortOrder: 1,
      },
      {
        buyerName: "Nadia Lumina",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        rating: 5,
        comment: "Gak ribet ga usah login/register web. Tinggal klik-klik trs WA lgsg dpt Canva Pro setahun. Canva sy aman ga ke-kick dr team.",
        productName: "Canva Pro Premium",
        sortOrder: 2,
      },
      {
        buyerName: "GamerHacker99",
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
        rating: 5,
        comment: "Top Up Diamond ML lgsg msk dlm 1 menit stlh chat WA kirim bukti transfer. Harga jauh lbh murah dr in-game. RECOMMENDED!",
        productName: "Mobile Legends Diamonds",
        sortOrder: 3,
      },
      {
        buyerName: "Kadek Dev",
        avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80",
        rating: 5,
        comment: "Awalnya skeptis beli ChatGPT Plus murah, tp dipandu pke akun shared premium. Bekerja super lancar, hemat ratusan ribu tiap bulan.",
        productName: "ChatGPT Plus & GPT-4o",
        sortOrder: 4,
      },
      {
        buyerName: "Santi Neon",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        rating: 4,
        comment: "Key retail Windows 11 aktif online dg mulus. Garansi setahun. Sukses terus PremiumKu jaya selalu di jagat cyber!",
        productName: "Windows 11 Pro Retail License",
        sortOrder: 5,
      }
    ]
  });

  // 8. FAQ Items
  await prisma.faqItem.createMany({
    data: [
      {
        question: "Apakah pembeli wajib login atau mendaftar?",
        answer: "TIDAK PERLU. Demi efisiensi dan kerahasiaan data Anda, kami menyediakan sistem instan tanpa registrasi robotik. Cukup pilih paket, isi identitas singkat, dan selesaikan transaksi via WhatsApp manual bergaransi.",
        sortOrder: 1,
      },
      {
        question: "Bagaimana cara melakukan pembayaran?",
        answer: "Setelah tombol pemesanan diklik, Anda akan diarahkan otomatis ke WhatsApp Admin dengan draf pesanan rapi. Admin akan menyodorkan rincian transfer Bank (BCA) atau file gambar QRIS digital instan (GoPay, OVO, Dana, LinkAja, ShopeePay).",
        sortOrder: 2,
      },
      {
        question: "Berapa lama proses akun premium dikirim?",
        answer: "Rata-rata 2 hingga 10 menit setelah Anda mengirimkan bukti transfer sukses ke admin WA. Semua diproses manual untuk memastikan validitas akun sewa Anda.",
        sortOrder: 3,
      },
      {
        question: "Apakah ada garansi produk?",
        answer: "Semua produk akun premium dan lisensi kami dilindungi GARANSI PENUH. Jika akun terkena limit, down, atau password error, hubungi admin dan kirimkan ref code Anda, kami ganti akun baru seketika.",
        sortOrder: 4,
      },
      {
        question: "Apa perbedaan Akun Shared dan Private?",
        answer: "Akun Shared adalah akun premium bersama dalam bentuk profil (Anda diberi jatah 1 profil khusus). Sedangkan Akun Private adalah akun eksklusif milik Anda pribadi secara keseluruhan tanpa gangguan orang lain.",
        sortOrder: 5,
      },
      {
        question: "Bagaimana untuk sistem Top Up Game?",
        answer: "Masukkan ID dan Zone ID Anda di form pemesanan kami. Diamond atau kristal game akan disuntik langsung oleh admin ke ID akun game Anda setelah proses transfer lunas berhasil.",
        sortOrder: 6,
      }
    ]
  });

  // 9. SiteContent (Default setup)
  const defaultKeys = Object.keys(DEFAULT_SITE_CONTENT);
  for (const k of defaultKeys) {
    const val = (DEFAULT_SITE_CONTENT as any)[k];
    let type = "TEXT";
    if (k.includes("color") || k.includes("theme")) {
      type = "COLOR";
    } else if (k.includes("active")) {
      type = "BOOLEAN";
    } else if (k.includes("ends_at")) {
      type = "TEXT";
    }

    await prisma.siteContent.create({
      data: {
        key: k,
        value: typeof val === "string" ? val : JSON.stringify(val),
        type: type
      }
    });
  }

  // Flash Sale
  await prisma.flashSaleItem.create({
    data: {
      productId: pNetflix.id,
      packageId: pkNetflixShared.id,
      salePrice: 19000,
      isActive: true,
    }
  });

  await prisma.flashSaleItem.create({
    data: {
      productId: pSpotify.id,
      packageId: pkSpotFam.id,
      salePrice: 29000,
      isActive: true,
    }
  });

  // Client reviews
  await prisma.review.create({
    data: {
      productId: pNetflix.id,
      buyerName: "Andi Gamer",
      rating: 5,
      comment: "Lancar jaya no screen limit gokil bgt",
      isApproved: true,
    }
  });

  // Add order samples
  await prisma.order.create({
    data: {
      refCode: "REF-NETFLIX-99",
      productId: pNetflix.id,
      packageId: pkNetflixShared.id,
      buyerName: "Budi Cyber",
      buyerWa: "081299887766",
      productName: "Netflix Premium Ultra HD",
      packageName: "1 Bulan (Shared - 1 Profil 1 Device)",
      price: 25000,
      status: "SENT",
      adminNote: "Lunas. Akun dikirim netsh_acc1@gmail.com",
    }
  });

  await prisma.order.create({
    data: {
      refCode: "REF-ML-88",
      productId: pML.id,
      packageId: pkML257.id,
      buyerName: "Jane Doe ML",
      buyerWa: "08998812345",
      productName: "Mobile Legends Diamonds",
      packageName: "257 Diamonds MLBB - ID: 1219381 (2034)",
      price: 58000,
      status: "PENDING",
      adminNote: "Menunggu transfer pembeli...",
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
