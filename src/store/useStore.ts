import { create } from 'zustand';
import { Category, Product, Testimonial, FaqItem } from '../types';

interface GlobalState {
  siteContent: Record<string, string>;
  categories: Category[];
  products: Product[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  banners: any[];
  flashSaleActive: boolean;
  flashSaleEndsAt: string;
  flashSaleItems: any[];
  isLoading: boolean;
  midtransActive: boolean;
  digiflazzActive: boolean;
  
  // Actions
  setSiteContent: (content: Record<string, string>) => void;
  setCategories: (cats: Category[]) => void;
  setProducts: (prods: Product[]) => void;
  setTestimonials: (tests: Testimonial[]) => void;
  setFaqs: (faqs: FaqItem[]) => void;
  setBanners: (banners: any[]) => void;
  setFlashSale: (active: boolean, endsAt: string, items: any[]) => void;
  setLoading: (loading: boolean) => void;
  setMidtransActive: (active: boolean) => void;
  setDigiflazzActive: (active: boolean) => void;
}

export const useStore = create<GlobalState>((set) => ({
  siteContent: {},
  categories: [],
  products: [],
  testimonials: [],
  faqs: [],
  banners: [],
  flashSaleActive: false,
  flashSaleEndsAt: '',
  flashSaleItems: [],
  isLoading: true,
  midtransActive: true,
  digiflazzActive: true,
  
  setSiteContent: (content) => set({ siteContent: content }),
  setCategories: (cats) => set({ categories: cats }),
  setProducts: (prods) => set({ products: prods }),
  setTestimonials: (tests) => set({ testimonials: tests }),
  setFaqs: (faqs) => set({ faqs: faqs }),
  setBanners: (banners) => set({ banners: banners }),
  setFlashSale: (active, endsAt, items) => set({ flashSaleActive: active, flashSaleEndsAt: endsAt, flashSaleItems: items }),
  setLoading: (loading) => set({ isLoading: loading }),
  setMidtransActive: (active) => set({ midtransActive: active }),
  setDigiflazzActive: (active) => set({ digiflazzActive: active }),
}));
