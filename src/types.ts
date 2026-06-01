// Shared types and interfaces for the PremiumKu Cyber Marketplace

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  type: "PREMIUM_ACCOUNT" | "GAME_TOPUP" | "LICENSE";
  isActive: boolean;
  sortOrder: number;
}

export interface AccountStock {
  id: string;
  packageId: string;
  emailAkun: string;
  passwordAkun: string;
  infoTambahan?: string;
  status: "AVAILABLE" | "SOLD" | "REPLACED";
  soldAt?: string;
}

export interface ProductPackage {
  id: string;
  productId: string;
  label: string;
  price: number;
  originalPrice: number;
  durationDays: number;
  warrantyDays: number;
  maxDevices: number;
  stockCount: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: number;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  isActive: boolean;
  isFeatured: boolean;
  totalSold: number;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  packages?: ProductPackage[];
  reviews?: Review[];
}

export interface Order {
  id: string;
  refCode: string;
  productId: string;
  packageId: string;
  accountStockId?: string;
  buyerName: string;
  buyerWa: string;
  productName: string;
  packageName: string;
  price: number;
  status: "PENDING" | "CONFIRMED" | "SENT" | "CANCELLED";
  adminNote?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  buyerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  buyerName: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  productName: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

export interface WaTemplate {
  id: string;
  key: string;
  label: string;
  templateText: string;
  isActive: boolean;
  updatedAt: string;
}

export interface FlashSaleItem {
  id: string;
  productId: string;
  product?: Product;
  packageId: string;
  package?: ProductPackage;
  salePrice: number;
  isActive: boolean;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: "TEXT" | "RICHTEXT" | "IMAGE" | "COLOR" | "NUMBER" | "BOOLEAN";
}

export interface ActivityLog {
  id: number;
  adminId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  description: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase: number;
  maxUsage: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
}

export interface WarrantyTicket {
  id: string;
  refCode: string;
  orderId: string;
  buyerName: string;
  buyerWa: string;
  problem: string;
  status: "OPEN" | "PROCESSING" | "RESOLVED" | "REJECTED";
  adminResponse?: string | null;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
  position: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  refCode: string;
  buyerName: string;
  buyerWa: string;
  subject: string;
  message: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  adminReply?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "WARRANTY" | "STOCK" | "REVIEW" | string;
  isRead: boolean;
  createdAt: string;
}
